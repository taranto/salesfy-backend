import { LayerBusiness } from "app/layers_template/LayerBusiness";
import { Transaction } from "sequelize";
import { Env } from "app/structure/Env";
import { IAuth, StringUtil, RoutesEnum, KeyEnum, I18n } from "salesfy-shared";
import { AuthBsn } from "app/modules/auth/AuthBsn";
import { BackendUtil } from "app/util/BackendUtil";
import { Request } from "express";
import { HEmail } from "app/structure/HEmail";
import { HEmailBuilder } from "app/util/HEmailBuilder";
const path = require('path');

export class AuthEmailBsn extends LayerBusiness {

	constructor(t: Transaction) {
		super(t)
	}

	public static genPasswordRecoveryPlainKey(idUser: number, dsRandom: string): string {
		return dsRandom
	}

	public static genDtPasswordRecoveryKeyExpiration(idUser: number): Date {
		return new Date(new Date().getTime() + Env.getUserResetPwTimeWindow())
	}

	public static async genPasswordRecoverySettings(auth: IAuth):
		Promise<{
			dhKeyResetPasswordExpiration: Date, unKeyResetPassword: string,
			crKeyResetPassword: string, emUser: string
		}> {
		const dhKeyResetPasswordExpiration = AuthEmailBsn.genDtPasswordRecoveryKeyExpiration(+auth.idUser)
		const dsRandom = StringUtil.random()
		const unKeyResetPassword = AuthEmailBsn.genPasswordRecoveryPlainKey(+auth.idUser, dsRandom)
		const crKeyResetPassword = await AuthBsn.encrypt(unKeyResetPassword)
		const joRecSettings = {
			dhKeyResetPasswordExpiration: dhKeyResetPasswordExpiration,
			unKeyResetPassword: unKeyResetPassword,
			crKeyResetPassword: crKeyResetPassword,
			emUser: auth.emUser
		}
		return joRecSettings
	}

	public static genLkPasswordRecovery(req: Request,
		joRecSettings: { unKeyResetPassword: string, emUser: string }) {
		const joLinkSetting = {
			unKeyResetPassword: joRecSettings.unKeyResetPassword,
			emUser: joRecSettings.emUser
		}
		const lkParamSuffix = StringUtil.jsonToQueryString(joLinkSetting)
		return BackendUtil.lkServerBaseUrl(req) + path.join(RoutesEnum.userGeneratePassword) + lkParamSuffix
	}

	public async setGeneratePasswordSettings(
		idUser: number, crKeyResetPassword?: string, dhKeyResetPasswordExpiration?: Date): Promise<IAuth> {
		const authBsn = new AuthBsn(this.t)
		const auth = await authBsn.setValues2(idUser, [
			{ nmKey: "dhKeyResetPasswordExpiration", dsValue: dhKeyResetPasswordExpiration },
			{ nmKey: "crKeyResetPassword", dsValue: crKeyResetPassword }
		])
		return auth
	}

	public async setEmailConfirmed(idUser: number): Promise<IAuth> {
		const authBsn = new AuthBsn(this.t)
		const auth = await authBsn.setValues2(idUser, [
			{ nmKey: "isEmailConfirmed", dsValue: true },
			{ nmKey: "crKeyEmailConfirmation", dsValue: undefined }
		])
		return auth
	}

	public async setEmailConfirmationSettings(idUser: number, crKeyEmailConfirmation: string): Promise<IAuth> {
		const authBsn = new AuthBsn(this.t)
		const auth = await authBsn.setValue(idUser, "crKeyEmailConfirmation", crKeyEmailConfirmation)
		return auth
	}

	public static genEmailConfirmationKey(idUser: number, dsRandom: string): string {
		return dsRandom
	}

	public static async genEmailWelcomeSettings(idUser: number):
		Promise<{ unKeyEmailConfirmation: string, crKeyEmailConfirmation: string }> {
		const dsRandom = StringUtil.random()
		const unKeyEmailConfirmation = this.genEmailConfirmationKey(idUser, dsRandom)
		const crKeyEmailConfirmation = await AuthBsn.encrypt(unKeyEmailConfirmation)
		const joConfRequSettings = {
			unKeyEmailConfirmation: unKeyEmailConfirmation,
			crKeyEmailConfirmation: crKeyEmailConfirmation
		}
		return joConfRequSettings
	}

	public static sendEmailWelcomeEmail(auth: IAuth, lkEmailConfirmationRequest?: string) {
		const dsEmailHtml = HEmailBuilder.getDsEmailWelcomeHtml(auth.nrLanguage, lkEmailConfirmationRequest)
		const dsSubject = I18n.t(KeyEnum.emailWelcomeSubject, undefined, auth.nrLanguage)
		HEmail.toSendEmail({ to: auth.emUser, subject: dsSubject, html: dsEmailHtml })
	}

	public static genLkEmailConfirmationRequest(req: Request, unKeyEmailConfirmation: string, emUser: string) {
		const joLinkSetting = {
			emUser: emUser,
			unKeyEmailConfirmation: unKeyEmailConfirmation
		}
		const lkParamSuffix = StringUtil.jsonToQueryString(joLinkSetting)
		return BackendUtil.lkServerBaseUrl(req) + path.join(RoutesEnum.userEmailConfirmation) + lkParamSuffix
	}

	public static sendGeneratePasswordEmail(auth: IAuth, unKeyPassword: string) {
		const dsEmailHtml = HEmailBuilder.getDsGeneratePasswordEmailHtml(auth.nrLanguage, auth.emUser, unKeyPassword)
		const dsSubject = I18n.t(KeyEnum.emailGeneratePasswordSubject, undefined, auth.nrLanguage)
		HEmail.toSendEmail({ to: auth.emUser, subject: dsSubject, html: dsEmailHtml })
	}

	public static sendPasswordRecoveryEmail(auth: IAuth, lkPasswordRecovery: string) {
		const dsEmailHtml = HEmailBuilder.getDsPasswordRecoveryEmailHtml(auth.nrLanguage, lkPasswordRecovery)
		const subject = I18n.t(KeyEnum.emailPasswordRecoverySubject, undefined, auth.nrLanguage)
		HEmail.toSendEmail({ to: auth.emUser, subject: subject, html: dsEmailHtml })
	}

	public static sendAdminNewUserEmail(auth : IAuth, authInvitedBy?:IAuth) {
		const dsEmailHtml = HEmailBuilder.getDsAdminNewUserHtml(auth, authInvitedBy)
		let dsSubject = "Novo usuário cadastrado no sistema"
		if (authInvitedBy) {
			dsSubject = "Novo usuário convidado no sistema"
		}
		const emAdmin = Env.getEmailArEmAdmin()
		HEmail.toSendEmail({ to: emAdmin, subject: dsSubject, html: dsEmailHtml })
	}

	public static sendAdminLimiterProblemEmail(dsEmail:string) {
		const dsEmailHtml = dsEmail
		const dsSubject = "Limiter acionado"
		const emAdmin = Env.getEmailArEmAdmin()
		HEmail.toSendEmail({ to: emAdmin, subject: dsSubject, html: dsEmailHtml })
	}
}
