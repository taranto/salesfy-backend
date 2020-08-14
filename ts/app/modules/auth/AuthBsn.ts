import { Transaction } from "sequelize";
import { LayerBusiness } from "./../../layers_template/LayerBusiness";
import { AuthDao } from "./AuthDao";
import * as bcrypt from "bcryptjs"
import { Log } from '../../structure/Log';
import { IAuth, SConst, KeyEnum, IUser, CtWarn, CtExcep, CtError } from "salesfy-shared";
import { ValUtil } from "app/util/ValUtil";
import { Env } from "../../structure/Env";
import { Request, Response } from "express";
import { AuthTokenBsn } from "app/modules/auth/AuthTokenBsn";
import { HExcep } from "app/util/status/HExcep";
import { HError } from "app/util/status/HError";

export class AuthBsn extends LayerBusiness {

	constructor(t: Transaction) {
		super(t);
	}

	public async register(joParam: any): Promise<IAuth> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "emUser")
		if (!joParam.nmUser) {
			joParam.nmUser = (joParam.emUser + "").split("@")[0].toLowerCase()
		}
		if (joParam.unKeyPassword!=undefined) {
			joParam.crKeyPassword = await AuthBsn.encrypt(joParam.unKeyPassword)
			delete joParam.unKeyPassword
		}
		joParam.emUser = joParam.emUser.toLowerCase()
		const authDao = new AuthDao(this.t)
		const sameUserEmailInDB = await authDao.getBySpecificParam("emUser", joParam.emUser)
		if (sameUserEmailInDB[0]) {
			throw new HExcep({ ctStatus:CtExcep.nmKeyAlreadyExists, joExtraContent: { nmKey:KeyEnum.email } })
		}
		const auth = await authDao.create(joParam)
		if (!auth) {
			throw new HError({ ctStatus:CtError.dbInsertProblem, dsConsole: "Unexpected error on user registering" })
		}
		return auth
	}

	// public static isAdmin(idUser: number): boolean {
	// 	return Env.getAdminIdUsers().split(",").indexOf(idUser + "") != -1
	// }

	// public async isAdminLogged(req: Request, res: Response, shValidade = false): Promise<boolean> {
	// 	let idUser
	// 	try {
	// 		idUser = await this.getIdUser(req, res, true)
	// 		if (!idUser) {
	// 			return false
	// 		}
	// 	} catch (err) {
	// 		return false
	// 	}
	// 	const isAdmin = AuthBsn.isAdmin(idUser)
	// 	return isAdmin
	// }

	public async setValues2(idUser: number, vlSet: Array<{ nmKey: string, dsValue: any }>): Promise<IAuth> {
		const authDao = new AuthDao(this.t);
		const auth = await authDao.setValues2(idUser, vlSet);
		return auth
	}

	// private async setValues(idUser: number, nmKeys: string[], dsValues: any[]): Promise<IAuth> {
	// 	const authDao = new AuthDao(this.t);
	// 	const auth = await authDao.setValues(idUser, nmKeys, dsValues);
	// 	return auth
	// }

	public async setValue(idUser: number, nmKey: string, dsValue: any): Promise<IAuth> {
		const authDao = new AuthDao(this.t);
		const auth = await authDao.setValue(idUser, nmKey, dsValue);
		return auth
	}

	public async get(idUser: number): Promise<IAuth> {
		const authDao = new AuthDao(this.t);
		const auth = await authDao.getUserLogin("idUser", idUser + "")
		return auth
	}

	public async put(joParamUser: any): Promise<IAuth> {
		const authDao = new AuthDao(this.t);
		const auth = await authDao.update(joParamUser)
		return auth
	}

	public async setUserPassword(idUser: number, crKeyPasswordNew: string): Promise<IAuth> {
		return this.setValue(idUser, "crKeyPassword", crKeyPasswordNew)
	}

	public async getUserLogin(nmKey: string, dsValue: string): Promise<IAuth> {
		const authDao = new AuthDao(this.t);
		const auth = await authDao.getUserLogin(nmKey, dsValue);
		return auth
	}

	public async getUserLoginByEmUser(joParam: any): Promise<IAuth> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "emUser")
		const auth = await this.getUserLogin("emUser", joParam.emUser)
		return auth
	}

	public async getUserById(joParam: any): Promise<IAuth> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idUser")
		const auth = await this.getUserLogin("idUser", joParam.idUser)
		return auth
	}

	public async authenticate(joParam: any, user: IAuth): Promise<boolean> {
		const unKeyPasswordSent = joParam.unKeyPassword
		const isAuthentic = await AuthBsn.isEncryptionMatch(unKeyPasswordSent, user.crKeyPassword)
		return isAuthentic
	}

	public static isEncryptionMatch(unString: string, crString: string): boolean {
		const isSamePw = bcrypt.compareSync(unString, crString)
		if (isSamePw) {
			Log.silly('Matched encryption')
		} else {
			Log.silly('Unmatched encryption')
		}
		return isSamePw
	}

	public static async encrypt(pwUnencrypted: string): Promise<string> {
		const salt = bcrypt.genSaltSync(Env.getEncryptionSaltRounds())
		const hash = bcrypt.hashSync(pwUnencrypted, salt)
		Log.silly('something got encrypted correctly')
		return hash
	}
}
