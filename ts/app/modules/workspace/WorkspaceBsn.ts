import { LayerBusiness } from "app/layers_template/LayerBusiness";
import { BackendUtil } from "app/util/BackendUtil";
import { CtError, IWorkspace } from "salesfy-shared";
import { ValUtil } from "app/util/ValUtil";
import { HError } from "app/util/status/HError";
import { WorkspaceDao } from "app/modules/workspace/WorkspaceDao";

export class WorkspaceBsn extends LayerBusiness {

	public async post(joParam: any): Promise<IWorkspace> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "nmWorkspace")
		const workspaceDao = new WorkspaceDao(this.t)
		const workspace = await workspaceDao.create(joParam)
		return workspace
	}

	public async get(joParam: any): Promise<IWorkspace[]> {
		const workspaceDao = new WorkspaceDao(this.t)
		const workspace = await workspaceDao.get(joParam)
		return workspace
	}

	public async get1(idWorkspace: number, idUserScope?: number): Promise<IWorkspace> {
		const arWorkspace = await this.get({ idWorkspace: idWorkspace, idUserScope: idUserScope })
		if (arWorkspace.length > 1) {
			throw new HError({ ctStatus: CtError.parametersAreMissing })
		}
		return arWorkspace[0]
	}

	public async put(joParam: any): Promise<IWorkspace> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idWorkspace")
		const workspaceDao = new WorkspaceDao(this.t)
		const workspace = await workspaceDao.upsert(joParam)
		return workspace
	}

	public async delete(idWorkspace:number): Promise<void> {
		const workspaceDao = new WorkspaceDao(this.t)
		await workspaceDao.delete(idWorkspace)
	}

	public async isWorkspaceAdmin(idWorkspace: number, idUserScope: number, workspace?: IWorkspace): Promise<boolean> {
		if (!workspace) {
			workspace = await this.get1(idWorkspace, idUserScope)
		}
		if (workspace.idUserResponsible == idUserScope) {
			return true
		}
		return false
	}
}
