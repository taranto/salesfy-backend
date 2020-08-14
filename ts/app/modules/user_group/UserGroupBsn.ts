import { LayerBusiness } from "app/layers_template/LayerBusiness"
import { UserGroupDao } from "app/modules/user_group/UserGroupDao"
import { IUserGroup, KeyEnum, CtError, CtUserGroupAccess } from "salesfy-shared"
import { ValUtil } from "app/util/ValUtil"
import { HError } from "app/util/status/HError"

export class UserGroupBsn extends LayerBusiness {

	public async post(joParam: any): Promise<IUserGroup> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idUser", "idGroup", "idCtUserGroupAccess")
		delete joParam.idUserGroup
		const userGroupDao = new UserGroupDao(this.t)
		const userGroup = await userGroupDao.post(joParam)
		return userGroup
	}

	public async delete(joParam: any): Promise<void> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idUserGroup")
		const userGroupDao = new UserGroupDao(this.t)
		await userGroupDao.delete(joParam.idUserGroup)
		return
	}

	public async get(joParam: any): Promise<IUserGroup[]> {
		const userGroupDao = new UserGroupDao(this.t)
		const userGroups = await userGroupDao.get(joParam)
		return userGroups
	}

	public async get1(idUserGroup: number, idUserScope?: number): Promise<IUserGroup> {
		const arUserGroup = await this.get({ idUserGroup: idUserGroup, idUserScope: idUserScope })
		if (arUserGroup.length > 1) {
			throw new HError({ ctStatus: CtError.parametersAreMissing })
		}
		return arUserGroup[0]
	}

	public async put(joParam: any): Promise<IUserGroup> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idUserGroup")
		const joParamPut: any = { idUserGroup: joParam.idUserGroup }
		if (joParam.idCtUserGroupAccess != undefined) {
			joParamPut.idCtUserGroupAccess = joParam.idCtUserGroupAccess
		}
		if (joParam.isFavorite != undefined) {
			joParamPut.isFavorite = joParam.isFavorite
		}
		const userGroupDao = new UserGroupDao(this.t)
		const userGroup = await userGroupDao.put(joParamPut)
		return userGroup
	}

	public async isUserGroupAdmin(idGroup?: number, idUser?: number, idUserGroup?: number): Promise<boolean> {
		const joParamUserGroup = this.getJoMxMKeys(idUserGroup, idGroup, idUser)
		const userGroupDao = new UserGroupDao(this.t)
		const arUserGroup = await userGroupDao.get(joParamUserGroup)
		const isUserGroupAdmin = arUserGroup[0] && arUserGroup[0].idCtUserGroupAccess == CtUserGroupAccess.admin.key
		return isUserGroupAdmin
	}

	public getJoMxMKeys(idUserGroup?: number, idGroup?: number, idUser?: number): any {
		if (idUserGroup) {
			return { idUserGroup: idUserGroup }
		} else {
			return { idGroup: idGroup, idUser: idUser }
		}
	}

	public async isUserLastGroupAdmin(idGroup: number, idUser: number): Promise<boolean> {
		const joAllAdminUsersFromGroup = {
			idGroup: idGroup,
			idCtUserGroupAccess: CtUserGroupAccess.admin.key
		}
		const allAdminUsersFromGroup = await this.get(joAllAdminUsersFromGroup)
		const isUserLastGroupAdmin = allAdminUsersFromGroup.length == 0 ||
			(allAdminUsersFromGroup.length == 1 && +allAdminUsersFromGroup[0].idUser == idUser)
		return isUserLastGroupAdmin
	}
}
