import { LayerDao } from "app/layers_template/LayerDao";
import { Transaction } from "sequelize";
import { IGroup } from "salesfy-shared";
import { Group } from "app/modules/group/Group";
import { DaoUtil } from "app/util/DaoUtil";
import { UserGroup } from "app/modules/user_group/UserGroup";

export class GroupDao extends LayerDao<Group, IGroup> {

	constructor(t: Transaction) {
		super(t);
	}

	public async get(joParam: {
		nmGroup?: string, idGroup?: number, arIdGroup?: number[], qtLimit?: number, idWorkspace?:number,
		qtOffset?: number, idUserScope?: number, idCtUserGroupAccess?: number, isFavorite?:boolean
	}): Promise<IGroup[]> {
		joParam = DaoUtil.escapeStrings(joParam)
		const nmGroupFilter = joParam.nmGroup == undefined ? "" : ` and nmGroup like ${joParam.nmGroup} `
		const idGroupFilter = joParam.idGroup == undefined ? "" : ` and idGroup = ${joParam.idGroup} `
		const arIdGroupFilter = joParam.arIdGroup == undefined ? "" : ` and idGroup in (${joParam.arIdGroup}) `
		const idCtUserGroupAccessFilter = joParam.idCtUserGroupAccess == undefined ?
			"" : ` and idCtUserGroupAccess = ${joParam.idCtUserGroupAccess} `
		const qtLimitQtOffsetFilter = DaoUtil.qtLimitQtOffsetFilter(joParam)
		const idUserSelect = joParam.idUserScope == undefined ? "" :
			`, ${DaoUtil.getCsNmField(UserGroup.getArNmField(), "ug", true)} `
		const idUserJoin = joParam.idUserScope == undefined ? "" : ` join userGroup ug using(idGroup) `
		const idUserFilter = joParam.idUserScope == undefined ? "" : ` and idUser = ${joParam.idUserScope} `
		const isFavoriteFilter = joParam.isFavorite ? ` and ug.isFavorite = ${joParam.isFavorite}` : ""
		const idWorkspaceFilter = joParam.idWorkspace ? ` and w.idWorkspace = ${joParam.idWorkspace}` : ""
		const query = `select ${DaoUtil.getCsNmField(Group.getArNmField(), "g", true)} ${idUserSelect}
			from grp g
			join workspace w on w.idWorkspace = g.idWorkspace
			${idUserJoin}
			where true
			and g.isActive
			and w.isActive
			${nmGroupFilter}
			${idGroupFilter}
			${arIdGroupFilter}
			${idUserFilter}
			${idCtUserGroupAccessFilter}
			${isFavoriteFilter}
			${idWorkspaceFilter}
			order by nmGroup
			${qtLimitQtOffsetFilter}`
		const result = await this.query(query)
		return result
	}

	public async post(joParam: any | Group): Promise<IGroup> {
		const result: any = await Group.create(joParam, { transaction: this.t, returning: true })
			.catch((err:any) => this.defaultCatchError(err))
		const group: IGroup = result.dataValues
		return group
	}

	public async put(joParam: any): Promise<IGroup> {
		const result: any = await Group.update(joParam,
			{ transaction: this.t, returning: true, where: { idGroup: joParam.idGroup } })
			.catch((err:any) => this.defaultCatchError(err))
		const group: IGroup = result[1][0].dataValues
		return group
	}

	public async delete(joParam: any): Promise<void> {
		joParam.isActive = false
		const result: any = await Group.update(joParam,
			{ transaction: this.t, returning: true, where: { idGroup: joParam.idGroup } })
			.catch((err:any) => this.defaultCatchError(err))
		const group: IGroup = result[1][0].dataValues
	}
}
