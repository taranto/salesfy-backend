import { Transaction } from "sequelize";
import { LayerBusiness } from "./../../layers_template/LayerBusiness";
import { UserDao } from "./UserDao";
import { ValUtil } from "app/util/ValUtil";
import { IUser, IAuth, CtError } from "salesfy-shared";
import { BConst } from "app/structure/BConst";
import { HError } from "app/util/status/HError";

export class UserBsn extends LayerBusiness {

	constructor(t: Transaction) {
		super(t);
	}

	public async get1(idUser: number): Promise<IUser> {
		const arUser = await this.get({ idUser: idUser })
		if (arUser.length > 1) {
			throw new HError({ ctStatus: CtError.parametersAreMissing })
		}
		return arUser[0]
	}

	public async put(joParam: any): Promise<IUser> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idUser")
		const userDao = new UserDao(this.t)
		const user = await userDao.update(joParam)
		return user
	}

	public async get(joParam: any, isPrivateInfoSelect = false, isPermissionInfoSelect = false): Promise<IUser[]> {
		const userDao = new UserDao(this.t)
		const users = await userDao.get(joParam, isPrivateInfoSelect, isPermissionInfoSelect)
		return users
	}

	public async getUserLogged(joParam: any, isPrivateInfoSelect = false, isPermissionInfoSelect = false)
		: Promise<IUser | IAuth> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idUserScope")
		const joParamMe = { idUser: joParam.idUserScope }
		const user = await this.get(joParamMe, isPrivateInfoSelect, isPermissionInfoSelect)
		return user[0]
	}

	public async getArUserNetwork(joParam:
		{ idUserScope: number, emUser?: string, isLimitFree?: boolean, idUserInNetworkSpecific?: number, hasMe?: boolean }): Promise<IUser[]> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idUserScope")
		const userDao = new UserDao(this.t)
		const joParamInUserNetwork = {
			idUserScope: joParam.idUserScope,
			isLimitFree: joParam.isLimitFree == undefined ? false : joParam.isLimitFree,
			emUser: joParam.emUser,
			idUserInNetworkSpecific: joParam.idUserInNetworkSpecific,
			hasMe: joParam.hasMe
		}
		const users = await userDao.getArUserNetwork(joParamInUserNetwork)
		return users
	}

	public async canInteractWithUser(idUserScope: number, idUserTarget: number): Promise<boolean> {
		if (idUserTarget == undefined) {
			return true
		}
		if (idUserTarget == idUserScope) {
			return true
		}
		const arUser = await this.getArUserNetwork({ idUserScope, idUserInNetworkSpecific: idUserTarget })
		if (!arUser || arUser.length == 0) {
			return false
		}
		return true
	}

	public async isPermitted(idUserScope: number, canHeDoWhat: string): Promise<boolean> {
		const user: any = await this.getUserLogged({ idUserScope }, true, true)
		if (!user[canHeDoWhat]) {
			return false
		}
		return true
	}

	public async canPostSeContent(idUserScope: number, isPlaybookBase?: boolean, isPlaybookTarget?: boolean)
		: Promise<boolean> {
		if (isPlaybookBase != false && isPlaybookTarget != false) {
			return true
		}
		const isPermitted = await this.isPermitted(idUserScope, BConst.NM_PERMISSION_CPSC)
		return isPermitted
	}

	public async canPostSeChannel(idUserScope: number, isPlaybookBase?: boolean, isPlaybookTarget?: boolean)
		: Promise<boolean> {
			if (isPlaybookBase != false && isPlaybookTarget != false) {
			return true
		}
		const isPermitted = await this.isPermitted(idUserScope, BConst.NM_PERMISSION_CPSCH)
		return isPermitted
	}

	public async canPostWorkspace(idUserScope: number): Promise<boolean> {
		const isPermitted = await this.isPermitted(idUserScope, BConst.NM_PERMISSION_CPW)
		return isPermitted
	}
}
