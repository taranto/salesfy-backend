import { LayerBusiness } from "app/layers_template/LayerBusiness";
import { BackendUtil } from "app/util/BackendUtil";
import { GroupDao } from "app/modules/group/GroupDao";
import { IGroup, CtError } from "salesfy-shared";
import { ValUtil } from "app/util/ValUtil";
import { UserGroupDao } from "app/modules/user_group/UserGroupDao";
import { HError } from "app/util/status/HError";

export class GroupBsn extends LayerBusiness {

	public async post(joParam: any): Promise<IGroup> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "nmGroup", "idWorkspace")
		const groupDao = new GroupDao(this.t)
		const group = await groupDao.post(joParam)
		return group
	}

	public async get(joParam: any): Promise<IGroup[]> {
		const groupDao = new GroupDao(this.t)
		const group = await groupDao.get(joParam)
		return group
	}

	public async get1(idGroup: number, idUserScope?: number): Promise<IGroup> {
		const arGroup = await this.get({ idGroup: idGroup, idUserScope: idUserScope })
		if (arGroup.length > 1) {
			throw new HError({ ctStatus:CtError.parametersAreMissing })
		}
		return arGroup[0]
	}

	public async put(joParam: any): Promise<IGroup> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idGroup")
		const groupDao = new GroupDao(this.t)
		const group = await groupDao.put(joParam)
		return group
	}

	public async delete(joParam: any): Promise<void> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idGroup")
		const groupDao = new GroupDao(this.t)
		await groupDao.delete(joParam)
	}
}
