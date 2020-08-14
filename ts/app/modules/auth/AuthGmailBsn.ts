import { Transaction } from "sequelize";
import { Log } from "app/structure/Log";
import { Env } from "app/structure/Env";
import { CtLocale, IAuth, KeyEnum, CtExcep } from "salesfy-shared";
import { OAuth2Client } from "google-auth-library";
import { AuthIntegrationAbstractBsn } from "app/modules/auth/AuthIntegrationAbstractBsn";

export class AuthGmailBsn extends AuthIntegrationAbstractBsn {

	constructor(t: Transaction) {
		super(t);
	}

	public async getAuthTokenData(joParam: any): Promise<any> {
		let joGmailParam: any = {}
		try {
			//https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=XYZ123
			const client = new OAuth2Client();
			const joGmailUserData = await client.verifyIdToken({
				idToken: joParam.dsToken,
				audience: Env.getLoginArNmClientGmail().split(",")
			})
			const joGmailUserDataPayload = joGmailUserData.getPayload()
			joGmailParam = AuthGmailBsn.normalizeAuthToken(joGmailUserDataPayload)
		} catch (err) {
			joGmailParam.joExtraContent = err.message
			// Log.warn("Gmail login problem: " + err.message)
			joGmailParam.ctWarn = CtExcep.authenticationProblem
			joGmailParam.dsConsole = "Gmail login problem: " + err.message
		}
		return joGmailParam
	}

	public static normalizeAuthToken(joParam: any): any {
		return {
			nmUser: joParam.name,
			emUser: joParam.email,
			piAvatar: joParam.picture,
			nrLanguage: CtLocale.getByName(joParam.locale).keyCtLocale,
			isEmailConfirmed: true
		}
	}

	public async userDataToMerge(joParam:any, auth:IAuth) : Promise<any>{
		const joMerged = { ...auth }
		if (!auth.keyGoogle) {
			joMerged.keyGoogle = joParam.keyGoogle
		}
		if (!auth.nmUser) {
			joMerged.nmUser = joParam.nmUser
		}
		// if (!auth.piAvatar) { //will always update
			joMerged.piAvatar = joParam.piAvatar
		// }
		return joMerged
	}

	public isMergeMade(auth:IAuth) : boolean {
		const isMergeMade = auth.keyGoogle!=undefined
		return isMergeMade
	}
}
