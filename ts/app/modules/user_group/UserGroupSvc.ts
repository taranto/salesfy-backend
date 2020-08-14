import { LayerService } from "app/layers_template/LayerService";
import { Request, Response } from "express";
import { HStatus } from "app/util/status/HStatus";
import { ValUtil } from "app/util/ValUtil";
import { UserGroupBsn } from "app/modules/user_group/UserGroupBsn";
import { HExcep } from "app/util/status/HExcep";
import { KeyEnum, CtWarn, CtError, CtExcep, JsonUtil, CtUserGroupAccess } from "salesfy-shared";
import { Transaction } from "sequelize";

export class UserGroupSvc extends LayerService {

	constructor(req?: Request, res?: Response, t?: Transaction) {
		super(req, res, t)
	}

	public async post(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idUserScope", "idUser", "idGroup")
		if (joParam.idCtUserGroupAccess == undefined) {
			joParam.idCtUserGroupAccess = CtUserGroupAccess.reader.key
		}
		if (joParam.idUserScope == joParam.idUser) {
			throw new HExcep({ ctStatus: CtExcep.operationNotPermitted })
		}
		const userGroupBsn = new UserGroupBsn(this.t)
		const isUserGroupAdmin = await userGroupBsn.isUserGroupAdmin(joParam.idGroup, joParam.idUserScope)
		if (!isUserGroupAdmin) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}
		const joExistentUserGroup = {
			idUser: joParam.idUser,
			idGroup: joParam.idGroup
		}
		const arUserGroup = await userGroupBsn.get(joExistentUserGroup)
		if (arUserGroup.length > 0) {
			throw new HExcep({ ctStatus: CtExcep.nmKeyAlreadyExists, joExtraContent: { nmKey: KeyEnum.bond } })
		}
		let userGroup = await userGroupBsn.post(joParam)
		userGroup = await userGroupBsn.get1(userGroup.idUserGroup, joParam.idUserScope)
		return new HStatus({ joResult: userGroup })
	}

	public async put(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idUserScope", "idUserGroup")
		joParam = JsonUtil.removeParams(joParam, "idUser")
		const userGroupBsn = new UserGroupBsn(this.t)
		let userGroup = await userGroupBsn.get1(joParam.idUserGroup, joParam.idUserScope)
		if (!userGroup) {
			throw new HExcep({ ctStatus: CtExcep.nmKeyNotFound, joExtraContent: { nmKey: KeyEnum.bond } })
		}
		const isFavoriteChange = joParam.isFavorite != undefined && userGroup.isFavorite != joParam.isFavorite
		const isUserChangingHimself = joParam.idUserScope == userGroup.idUser
		if (isFavoriteChange && !isUserChangingHimself) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}
		if (isFavoriteChange && isUserChangingHimself) {
			const joParamSimplePut = {
				idUserGroup : userGroup.idUserGroup,
				isFavorite : joParam.isFavorite
			}
			userGroup = await userGroupBsn.put(joParamSimplePut)
			userGroup = await userGroupBsn.get1(joParam.idUserGroup, joParam.idUserScope)
			return new HStatus({ joResult: userGroup })
		}
		const isUpgrading = CtUserGroupAccess.isUpgrading(userGroup.idCtUserGroupAccess, joParam.idCtUserGroupAccess)
		if (isUserChangingHimself && isUpgrading) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}
		const isUserGroupAdmin = await userGroupBsn.isUserGroupAdmin(userGroup.idGroup, joParam.idUserScope)
		if (!isUserChangingHimself && !isUserGroupAdmin) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}
		if (isUserChangingHimself && joParam.idCtUserGroupAccess != CtUserGroupAccess.admin.key) {
			const isUserLastGroupAdmin = await userGroupBsn.isUserLastGroupAdmin(userGroup.idGroup, joParam.idUserScope)
			if (isUserLastGroupAdmin) {
				throw new HExcep({ ctStatus: CtWarn.cannotRevokeLastAuth })
			}
		}
		userGroup = await userGroupBsn.put(joParam)
		userGroup = await userGroupBsn.get1(joParam.idUserGroup, joParam.idUserScope)
		return new HStatus({ joResult: userGroup })
	}

	public async delete(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idUserScope", "idUserGroup")
		joParam.idUser = joParam.idUserScope
		const userGroupBsn = new UserGroupBsn(this.t)
		const userGroup = await userGroupBsn.get1(joParam.idUserGroup, joParam.idUserScope)
		if (!userGroup) {
			throw new HExcep({ ctStatus: CtExcep.nmKeyNotFound, joExtraContent: { nmKey: KeyEnum.bond } })
		}
		if (!CtUserGroupAccess.isUserGroupAdmin(userGroup.idCtUserGroupAccess) && userGroup.idUser == joParam.idUserScope) {
			await userGroupBsn.delete(joParam)
			return new HStatus({})
		}
		const isUserGroupAdmin = await userGroupBsn.isUserGroupAdmin(+userGroup.idGroup, joParam.idUserScope)
		if (!isUserGroupAdmin) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}
		if (joParam.idCtUserGroupAccess != CtUserGroupAccess.admin.key) {
			const isUserLastGroupAdmin = await userGroupBsn.isUserLastGroupAdmin(userGroup.idGroup, userGroup.idUser)
			if (isUserLastGroupAdmin) {
				throw new HExcep({ ctStatus: CtWarn.cannotRevokeLastAuth })
			}
		}
		await userGroupBsn.delete(joParam)
		return new HStatus({})
	}

	public async get(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idUserScope")
		joParam.idUserScope = joParam.idUserScope
		const userGroupBsn = new UserGroupBsn(this.t)
		const arUserGroup = await userGroupBsn.get(joParam)
		return new HStatus({ joResult: arUserGroup })
	}
}
