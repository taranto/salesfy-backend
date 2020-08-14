import { Transaction } from "sequelize";
import * as rp from "request-promise";
import { Log } from "app/structure/Log";
import { Env } from "app/structure/Env";
import { CtLocale, KeyEnum, IAuth, CtExcep, CtWarn } from "salesfy-shared";
import { AuthIntegrationAbstractBsn } from "app/modules/auth/AuthIntegrationAbstractBsn";

export class AuthFbBsn extends AuthIntegrationAbstractBsn {

	constructor(t: Transaction) {
		super(t);
	}

	public async getAuthTokenData(joParam: any): Promise<any> {
		let joFbParam: any = {}
		try {
			joFbParam = await rp.get({ uri: Env.getLoginLkFbVal(), qs: { access_token: joParam.dsToken }, json: true })

			if (joFbParam.name != Env.getLoginArNmClientFB()) {
				joFbParam.ctWarn = CtExcep.authenticationProblem
				return joFbParam
			}
			const arNmWantedFields = 'name,email,picture,link'
			const joQsOptions = { access_token: joParam.dsToken, fields: arNmWantedFields }
			const joFbUserData = await rp.get({ uri: Env.getLoginLkFbUserData(), qs: joQsOptions, json: true })

			joFbParam = AuthFbBsn.normalizeAuthToken(joFbUserData)

			if (!joFbParam.emUser) {
				joFbParam.ctWarn = CtWarn.nmKeyRequired
				joFbParam.joExtraContent = { nmKey: KeyEnum.email }
				return joFbParam
			}
		} catch (err) {
			// Log.warn("Facebook login problem: " + err.message)
			joFbParam.ctWarn = CtExcep.authenticationProblem
			joFbParam.dsConsole = "Facebook login problem: " + err.message
		}
		return joFbParam
	}

	public static normalizeAuthToken(joParam: any): any {
		const joParamNormalized: any = {
			keyFacebook: joParam.id,
			nmUser: joParam.name,
			emUser: joParam.email,
			lkFacebook: joParam.link,
			nrLanguage: CtLocale.portuguese.keyCtLocale, //TODO um dia achar o locale nao deprecated.
			isEmailConfirmed: true
		}
		// if (joParam.picture && !joParam.picture.data.is_silhouette) {
			joParamNormalized.piAvatar = joParam.picture.data.url
		// }
		return joParamNormalized
	}

	public async userDataToMerge(joParamToMerge: any, auth: IAuth): Promise<any> {
		const joMerged = { ...auth }
		if (!auth.keyFacebook) {
			joMerged.keyFacebook = joParamToMerge.keyFacebook
		}
		if (!auth.nmUser) {
			joMerged.nmUser = joParamToMerge.nmUser
		}
		if (!auth.lkFacebook) {
			joMerged.lkFacebook = joParamToMerge.lkFacebook
		}
		// if (!auth.piAvatar) { //will always update
		joMerged.piAvatar = joParamToMerge.piAvatar
		// }
		return joMerged
	}

	public isMergeMade(auth: IAuth): boolean {
		const isMergeMade = auth.keyFacebook != undefined
		return isMergeMade
	}
}
