import { LayerService } from "./../../layers_template/LayerService";
import { AuthBsn } from "./AuthBsn";
import { Request, Response } from "express";
import { IAuth, KeyEnum, SConst, ValJoiUtil, StringUtil, CtExcep, CtWarn, CtError, CtLocale, JsonUtil } from "salesfy-shared";
import { ValUtil } from "app/util/ValUtil";
import { HStatus } from "../../util/status/HStatus";
import * as Joi from 'joi'
import { AuthEmailBsn } from "app/modules/auth/AuthEmailBsn";
import { AuthTokenBsn } from "app/modules/auth/AuthTokenBsn";
import { HExcep } from "app/util/status/HExcep";
import { HPlusStatus } from "app/util/status/HPlusStatus";
import { BackendUtil } from "app/util/BackendUtil";
import { HError } from "app/util/status/HError";
import { IStatus } from "app/util/HBTypes";
import { AuthFbBsn } from "app/modules/auth/AuthFbBsn";
import { AuthGmailBsn } from "app/modules/auth/AuthGmailBsn";
import { AuthIntegrationAbstractBsn } from "app/modules/auth/AuthIntegrationAbstractBsn";
import { UserBsn } from "app/modules/user/UserBsn";
import { FileSvc } from "app/modules/file/FileSvc";
import { getEnvelopedHtml } from "app/util/ServerRenderingUtil";

export class AuthSvc extends LayerService {

	private authBsn: AuthBsn
	private userBsn: UserBsn
	private authTokenBsn: AuthTokenBsn
	private authEmailBsn: AuthEmailBsn

	constructor(req?: Request, res?: Response) {
		super(req, res)
	}

	public newLayerBusiness(): void {
		this.authBsn = new AuthBsn(this.t)
		this.authTokenBsn = new AuthTokenBsn(this.t)
		this.authEmailBsn = new AuthEmailBsn(this.t)
		this.userBsn = new UserBsn(this.t)
	}

	public async loginFacebook(joParam: any): Promise<IStatus> {
		const authFbBsn = new AuthFbBsn(this.t)
		const me = await this.loginIntegrated(joParam, authFbBsn);
		return new HStatus({ joResult: me })
	}

	public async loginGmail(joParam: any): Promise<IStatus> {
		const authGmailBsn = new AuthGmailBsn(this.t)
		const me = await this.loginIntegrated(joParam, authGmailBsn)
		return new HStatus({ joResult: me })
	}

	private async loginIntegrated(joParam: any, authIntegrationBsn: AuthIntegrationAbstractBsn): Promise<IAuth> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "dsToken")
		const joAuthTokenParsed = await authIntegrationBsn.getAuthTokenData(joParam)
		if (joAuthTokenParsed.ctWarn) {
			const ctWarn: CtWarn = joAuthTokenParsed.ctWarn
			throw new HExcep({
				ctStatus: ctWarn, joExtraContent: joAuthTokenParsed.joExtraContent,
				dsConsole: joAuthTokenParsed.dsConsole
			})
		}
		const joUserParam = { emUser: joAuthTokenParsed.emUser }
		// let isNewUser
		let auth = await this.authBsn.getUserLoginByEmUser(joUserParam)
		if (!auth) {
			throw new HExcep({ ctStatus: CtExcep.nmKeyNotFound, joExtraContent: { nmKey: KeyEnum.user } })
			// auth = await this.authBsn.register(joAuthTokenParsed)
			// await this.toSendEmailWelcomeEmail(auth, false)
			// isNewUser = true
		} else {
			const fileSvc = new FileSvc(this.req, this.res, this.t)
			const iStatus = await fileSvc.post({ idUserScope: auth.idUser, lkFile: joAuthTokenParsed.piAvatar })
			joAuthTokenParsed.piAvatar = iStatus.joResult.nmFile
			auth = await authIntegrationBsn.mergeUserData(joAuthTokenParsed, auth)
			// isNewUser = false
		}
		await this.authTokenBsn.generateAndRegisterTokens(this.req, this.res, auth.idUser)
		const me: any = await this.userBsn.get({ idUser: auth.idUser }, true, true)
		me[0].isNewUser = !auth.dhLastAccess //isNewUser
		// if (isNewUser) {
		// 	AuthEmailBsn.sendAdminNewUserEmail(me)
		// }
		return me[0]
	}

	public async login(joParam: any): Promise<IStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "emUser", "unKeyPassword")
		const user = await this.authBsn.getUserLoginByEmUser(joParam)
		if (user == undefined) {
			throw new HExcep({ ctStatus: CtExcep.nmKeyNotFound, joExtraContent: { nmKey: KeyEnum.email } })
		}
		const isAuthentic = await this.authBsn.authenticate(joParam, user)
		if (!isAuthentic) {
			throw new HExcep({ ctStatus: CtExcep.incorrectPassword })
		}
		await this.authTokenBsn.generateAndRegisterTokens(this.req, this.res, user.idUser)
		const me: any = await this.userBsn.get({ idUser: user.idUser }, true, true)
		me[0].isNewUser = false
		return new HStatus({ joResult: me[0] })
	}

	public async register(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "unKeyPassword", "emUser")
		joParam = JsonUtil.removeParams(joParam, 'crKeyRefreshToken', 'crKeyResetPassword', 'isEmailConfirmed',
			'dhKeyResetPasswordExpiration', 'crKeyEmailConfirmation', 'keyFacebook', 'keyGoogle')
		const auth = await this.authBsn.register(joParam);
		await this.authTokenBsn.generateAndRegisterTokens(this.req, this.res, auth.idUser)
		await this.toSendEmailWelcomeEmail(auth, true);
		const me: any = await this.userBsn.get({ idUser: auth.idUser }, true, true)
		me[0].isNewUser = true
		AuthEmailBsn.sendAdminNewUserEmail(me)
		return new HPlusStatus({ joResult: me[0] })
	}

	private async toSendEmailWelcomeEmail(auth: IAuth, hasEmailConfirmation: boolean) {
		const joWelcomeSettings = await AuthEmailBsn.genEmailWelcomeSettings(+auth.idUser);
		let lkEmailConfirmationRequest
		if (hasEmailConfirmation) {
			await this.authEmailBsn.setEmailConfirmationSettings(+auth.idUser, joWelcomeSettings.crKeyEmailConfirmation);
			lkEmailConfirmationRequest =
				AuthEmailBsn.genLkEmailConfirmationRequest(this.req, joWelcomeSettings.unKeyEmailConfirmation, auth.emUser)
		}
		AuthEmailBsn.sendEmailWelcomeEmail(auth, lkEmailConfirmationRequest);
	}

	public async emailConfirmation(joParam: any): Promise<IStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "emUser", "unKeyEmailConfirmation")
		const auth = await this.authBsn.getUserLogin("emUser", joParam.emUser)
		if (!auth) {
			joParam.nmKey = KeyEnum.email
			const dsHtml1 = getEnvelopedHtml(KeyEnum.nmKeyNotFound, joParam, CtLocale.portuguese.keyCtLocale)
			throw new HExcep({ joResult: { dsMsg: KeyEnum.nmKeyNotFound }, dsHtmlResult: dsHtml1 })
		}
		if (auth.isEmailConfirmed) {
			const dsHtml1 = getEnvelopedHtml(KeyEnum.emailAlreadyValidated, {}, auth.nrLanguage)
			throw new HExcep({ joResult: { dsMsg: KeyEnum.emailAlreadyValidated }, dsHtmlResult: dsHtml1 })
		}
		if (!AuthBsn.isEncryptionMatch(joParam.unKeyEmailConfirmation, auth.crKeyEmailConfirmation)) {
			const dsHtml1 = getEnvelopedHtml(KeyEnum.incorrectUserEmailConfirmationKey, {}, auth.nrLanguage)
			throw new HExcep({ joResult: { dsMsg: KeyEnum.incorrectUserEmailConfirmationKey }, dsHtmlResult: dsHtml1 })
		}
		await this.authEmailBsn.setEmailConfirmed(+auth.idUser)
		const dsHtml = getEnvelopedHtml(KeyEnum.emailConfirmed, joParam, auth.nrLanguage)
		return new HPlusStatus({ joResult: { dsMsg: KeyEnum.emailConfirmed }, dsHtmlResult: dsHtml })
	}

	public async generatePassword(joParam: any): Promise<IStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "unKeyResetPassword", "emUser")
		let auth = await this.authBsn.getUserLogin("emUser", joParam.emUser)
		if (!auth) {
			joParam.nmKey = KeyEnum.email
			const dsHtml1 = getEnvelopedHtml(KeyEnum.nmKeyNotFound, joParam, CtLocale.portuguese.keyCtLocale)
			throw new HExcep({ joResult: { dsMsg: KeyEnum.nmKeyNotFound }, dsHtmlResult: dsHtml1 })
		}
		if (!auth.dhKeyResetPasswordExpiration) {
			const dsHtml1 = getEnvelopedHtml(KeyEnum.generatePasswordNotExpected, {}, auth.nrLanguage)
			throw new HExcep({ joResult: { dsMsg: KeyEnum.generatePasswordNotExpected }, dsHtmlResult: dsHtml1 })
		}
		const now = new Date()
		if (now.getTime() > auth.dhKeyResetPasswordExpiration.getTime()) {
			const dsHtml1 = getEnvelopedHtml(KeyEnum.generatePasswordExpired, {}, auth.nrLanguage)
			throw new HExcep({ joResult: { dsMsg: KeyEnum.generatePasswordExpired }, dsHtmlResult: dsHtml1 })
		}
		if (!AuthBsn.isEncryptionMatch(joParam.unKeyResetPassword, auth.crKeyResetPassword)) {
			const dsHtml1 = getEnvelopedHtml(KeyEnum.wrongPasswordGenerationCode, {}, auth.nrLanguage)
			throw new HExcep({ joResult: { dsMsg: KeyEnum.wrongPasswordGenerationCode }, dsHtmlResult: dsHtml1 })
		}
		const unKeyPasswordNew = StringUtil.random()
		const crKeyPasswordNew = await AuthBsn.encrypt(unKeyPasswordNew)
		await this.authBsn.setUserPassword(+auth.idUser, crKeyPasswordNew)
		await this.authEmailBsn.setEmailConfirmed(+auth.idUser)
		auth = await this.authEmailBsn.setGeneratePasswordSettings(+auth.idUser, undefined, undefined)
		AuthEmailBsn.sendGeneratePasswordEmail(auth, unKeyPasswordNew)
		const dsHtml = getEnvelopedHtml(KeyEnum.aNewPasswordWasGeneratedAndSent, joParam, auth.nrLanguage)
		return new HPlusStatus({ joResult: { dsMsg: KeyEnum.aNewPasswordWasGeneratedAndSent }, dsHtmlResult: dsHtml })
	}

	public async passwordRecovery(joParam: any): Promise<IStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "emUser")
		let auth = await this.authBsn.getUserLoginByEmUser(joParam)
		if (!auth) {
			throw new HExcep({ ctStatus: CtExcep.nmKeyNotFound, joExtraContent: { nmKey: KeyEnum.email } })
		}
		const joRecSettings = await AuthEmailBsn.genPasswordRecoverySettings(auth)
		auth = await this.authEmailBsn.setGeneratePasswordSettings(
			+auth.idUser, joRecSettings.crKeyResetPassword, joRecSettings.dhKeyResetPasswordExpiration)
		const lkPasswordRecovery = AuthEmailBsn.genLkPasswordRecovery(this.req, joRecSettings)
		AuthEmailBsn.sendPasswordRecoveryEmail(auth, lkPasswordRecovery);
		return new HPlusStatus({ dsStatus: KeyEnum.anEmailWasSentToAndRecover, joExtraContent: { emUser: auth.emUser } })
	}

	public async changePassword(joParam: any): Promise<IStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam,
			"emUser", "unKeyPasswordOld", "unKeyPasswordNew", "unKeyPasswordNewAgain")
		if (joParam.unKeyPasswordNew != joParam.unKeyPasswordNewAgain) {
			throw new HExcep({ ctStatus: CtWarn.passwordsWereNotTheSame })
		}
		if (Joi.validate(joParam.unKeyPasswordNew, ValJoiUtil.joiStringSchemaPassword()).error) {
			throw new HExcep({ ctStatus: CtWarn.nmKeyInWrongFormat, joExtraContent: { nmKey: KeyEnum.password } })
		}
		const auth = await this.authBsn.getUserLogin("emUser", joParam.emUser)
		if (!auth) {
			throw new HExcep({ ctStatus: CtExcep.nmKeyNotFound, joExtraContent: { nmKey: KeyEnum.user } })
		}
		const isSamePassword = await AuthBsn.isEncryptionMatch(joParam.unKeyPasswordOld, auth.crKeyPassword)
		if (!isSamePassword) {
			throw new HExcep({ ctStatus: CtExcep.incorrectPassword })
		}
		const crKeyPasswordNew = await AuthBsn.encrypt(joParam.unKeyPasswordNew)
		await this.authBsn.setUserPassword(+auth.idUser, crKeyPasswordNew)
		return new HPlusStatus()
	}

	public async logoff(joParam: any): Promise<IStatus> {
		const dsRefreshToken = this.req.headers[SConst.X_REFRESH_TOKEN]
		const idUser = AuthTokenBsn.getIdUserFromToken(dsRefreshToken + "")
		if (!idUser) {
			throw new HError({ ctStatus: CtError.wrongLogoff, joExtraContent: { idUser: idUser } })
		}
		this.authTokenBsn.storeRefreshToken(idUser, undefined)
		this.authTokenBsn.registerTokensInResponseHeader(this.req, this.res, { accessToken: "", refreshToken: "" }, idUser)
		return new HStatus()
	}

	public async logged(joParam: any): Promise<IStatus> {
		if (!joParam.idUserLogged) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}
		return new HStatus()
	}
}
