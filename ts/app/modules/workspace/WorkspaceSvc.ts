import { LayerService } from "app/layers_template/LayerService";
import { Request, Response } from "express";
import { HStatus } from "app/util/status/HStatus";
import { WorkspaceBsn } from "app/modules/workspace/WorkspaceBsn";
import { ValUtil } from "app/util/ValUtil";
import { JsonUtil, CtExcep, CtUserGroupAccess } from "salesfy-shared";
import { UserBsn } from "app/modules/user/UserBsn";
import { HExcep } from "app/util/status/HExcep";
import { FileSvc } from "app/modules/file/FileSvc";
import { GroupSvc } from "app/modules/group/GroupSvc";
import { UserGroupSvc } from "app/modules/user_group/UserGroupSvc";

export class WorkspaceSvc extends LayerService {

	public async get(joParam: any): Promise<HStatus> {
		const workspaceBsn = new WorkspaceBsn(this.t)
		const arWorkspace = await workspaceBsn.get(joParam)
		return new HStatus({ joResult: arWorkspace })
	}

	public async post(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "nmWorkspace", "b64PiWorkspace")
		joParam = JsonUtil.removeParams(joParam, "idWorkspace", "piWorkspace")

		const userBsn = new UserBsn(this.t)
		const canInteract = userBsn.canInteractWithUser(joParam.idUserScope, joParam.idUserResponsible)
		if (!canInteract) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}
		joParam.idUserResponsible = joParam.idUserResponsible || joParam.idUserScope

		const canPostWorkspace = await userBsn.canPostWorkspace(joParam.idUserScope)
		if (!canPostWorkspace) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}
		joParam.b64File = joParam.b64PiWorkspace
		const fileSvc = new FileSvc(this.req, this.res, this.t)
		const iStatusF = await fileSvc.post(joParam)
		joParam.piWorkspace = iStatusF.joResult.nmFile

		const workspaceBsn = new WorkspaceBsn(this.t)
		let workspace = await workspaceBsn.post(joParam)

		// const wuSvc = new WorkspaceUserSvc(this.req, this.res, this.t)
		// const joParamWUMe = {
		// 	idUser: joParam.idUserScope,
		// 	idWorkspace: workspace.idWorkspace
		// }
		// const wuMe = await wuSvc.post(joParamWUMe)
		// if (joParam.idUserResponsible != joParam.idUserScope) {
		// 	const joParamWUResponsible = {
		// 		idUser: joParam.idUserResponsible,
		// 		idWorkspace: workspace.idWorkspace
		// 	}
		// 	const wuResponsible = await wuSvc.post(joParamWUResponsible)
		// }

		const groupSvc = new GroupSvc(this.req, this.res, this.t)
		const joParamGroup = {
			nmGroup: joParam.nmWorkspace,
			idUserScope: joParam.idUserScope,
			idWorkspace: workspace.idWorkspace
		}
		const iStatusG = await groupSvc.post(joParamGroup)
		const group = iStatusG.joResult
		if (joParam.idUserResponsible != joParam.idUserScope) {
			const userGroupSvc = new UserGroupSvc(this.req, this.res, this.t)
			const joParamUserGroup = {
				idUserScope: joParam.idUserScope,
				idUser : joParam.idUserResponsible,
				idCtUserGroupAccess : CtUserGroupAccess.admin.key,
				idGroup: group.idGroup
			}
			const iStatusUG = await userGroupSvc.post(joParamUserGroup)
		}

		workspace = await workspaceBsn.get1(workspace.idWorkspace, joParam.idUserScope)
		return new HStatus({ joResult: workspace })
	}

	public async isWorkspaceAdmin(joParam: any): Promise<HStatus> {
		const workspaceBsn = new WorkspaceBsn(this.t)
		const isWorkspaceAdmin = await workspaceBsn.isWorkspaceAdmin(joParam.idWorkspace, joParam.idUserScope)
		const joResult = { isWorkspaceAdmin: isWorkspaceAdmin }
		return new HStatus({ joResult: joResult })
	}

	public async put(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idWorkspace")
		const workspaceBsn = new WorkspaceBsn(this.t)

		const userBsn = new UserBsn(this.t)
		const canInteract = userBsn.canInteractWithUser(joParam.idUserScope, joParam.idUserResponsible)
		if (!canInteract) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}
		let workspace = await workspaceBsn.get1(joParam.idWorkspace, joParam.idUserScope)
		if (!workspace) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}
		const joParamIsWorkspaceAdmin = {
			idWorkspace: joParam.idWorkspace,
			idUserScope: joParam.idUserScope,
			workspace: workspace
		}
		const iStatus = await this.isWorkspaceAdmin(joParamIsWorkspaceAdmin)
		const isWorkspaceAdmin = iStatus.joResult.isWorkspaceAdmin
		if (!isWorkspaceAdmin) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}
		if (joParam.b64PiWorkspace) {
			joParam.b64File = joParam.b64PiWorkspace
			const fileSvc = new FileSvc(this.req, this.res, this.t)
			const iStatusF = await fileSvc.post(joParam)
			joParam.piWorkspace = iStatusF.joResult.nmFile
		}
		joParam.idUserResponsible = joParam.idUserResponsible || workspace.idUserResponsible
		await workspaceBsn.put(joParam)
		workspace = await workspaceBsn.get1(joParam.idWorkspace, joParam.idUserScope)
		return new HStatus({ joResult: workspace })
	}

	public async delete(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idWorkspace")
		const workspaceBsn = new WorkspaceBsn(this.t)
		const workspace = await workspaceBsn.get1(joParam.idWorkspace, joParam.idUserScope)
		if (!workspace) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}
		const joParamIsWorkspaceAdmin = {
			idWorkspace: joParam.idWorkspace,
			idUserScope: joParam.idUserScope,
			workspace: workspace
		}
		const iStatus = await this.isWorkspaceAdmin(joParamIsWorkspaceAdmin)
		const isWorkspaceAdmin = iStatus.joResult.isWorkspaceAdmin
		if (!isWorkspaceAdmin) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}
		await workspaceBsn.delete(joParam.idWorkspace)
		return new HStatus({ })
	}
}
