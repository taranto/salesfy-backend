import { LayerService } from "app/layers_template/LayerService";
import { Request, Response } from "express";
import { HStatus } from "app/util/status/HStatus";
import { GroupBsn } from "app/modules/group/GroupBsn";
import { ValUtil } from "app/util/ValUtil";
import { UserGroupBsn } from "app/modules/user_group/UserGroupBsn";
import { HExcep } from "app/util/status/HExcep";
import { KeyEnum, CtExcep, JsonUtil, CtUserGroupAccess } from "salesfy-shared";
import { WorkspaceSvc } from "app/modules/workspace/WorkspaceSvc";
import { UserSvc } from "app/modules/user/UserSvc";

export class GroupSvc extends LayerService {

	public async post(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "nmGroup", "idUserScope")
		if (!joParam.idWorkspace) { //TODO temporary
			joParam.idWorkspace = 1
		}
		// if (joParam.idWorkspace) {
			const workspaceSvc = new WorkspaceSvc(this.req, this.res, this.t)
			const joParamWorkspace = {
				idUserScope : joParam.idUserScope,
				idWorkspace : joParam.idWorkspace
			}
			const iStatusW = await workspaceSvc.get(joParamWorkspace)
			if (!iStatusW.joResult) {
				throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
			}
		// } else {
		// 	const userSvc = new UserSvc(this.req, this.res, this.t)
		// 	const iStatusU = await userSvc.getUserLogged(joParam)
		// }
		const groupBsn = new GroupBsn(this.t)
		let group = await groupBsn.post(joParam)
		const userGroupBsn = new UserGroupBsn(this.t)
		const joParamUserGroup = {
			idUser: joParam.idUserScope,
			idGroup: group.idGroup,
			idCtUserGroupAccess: CtUserGroupAccess.admin.key
		}
		const userGroup = await userGroupBsn.post(joParamUserGroup)
		group = await groupBsn.get1(group.idGroup, joParam.idUserScope)
		return new HStatus({ joResult: group })
	}

	public async get(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idUserScope")
		joParam.idUserScope = joParam.idUserScope
		const groupBsn = new GroupBsn(this.t)
		const group = await groupBsn.get(joParam)
		return new HStatus({ joResult: group })
	}

	public async put(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idGroup", "idUserScope")
		joParam = JsonUtil.removeParams(joParam, "idWorkspace")
		joParam.idUser = joParam.idUserScope
		const userGroupBsn = new UserGroupBsn(this.t)
		const isUserGroupAdmin = await userGroupBsn.isUserGroupAdmin(joParam.idGroup, joParam.idUser)
		if (!isUserGroupAdmin) {
			throw new HExcep({ ctStatus:CtExcep.userNotAuthorized })
		}
		const groupBsn = new GroupBsn(this.t)
		let group = await groupBsn.put(joParam)
		group = await groupBsn.get1(+group.idGroup, joParam.idUserScope)
		return new HStatus({ joResult: group })
	}

	public async delete(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idGroup", "idUserScope")
		const userGroupBsn = new UserGroupBsn(this.t)
		const isUserGroupAdmin = await userGroupBsn.isUserGroupAdmin(joParam.idGroup, joParam.idUserScope)
		if (!isUserGroupAdmin) {
			throw new HExcep({ ctStatus:CtExcep.userNotAuthorized })
		}
		const groupBsn = new GroupBsn(this.t)
		await groupBsn.delete(joParam)
		return new HStatus({})
	}

}
