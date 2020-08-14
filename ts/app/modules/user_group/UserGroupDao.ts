import { LayerDao } from "app/layers_template/LayerDao";
import { Transaction } from "app/structure/DbConn";
import { IUserGroup, CtUserGroupAccess } from "salesfy-shared";
import { UserGroup } from "app/modules/user_group/UserGroup";
import { DaoUtil } from "app/util/DaoUtil";

export class UserGroupDao extends LayerDao<UserGroup, IUserGroup> {

	constructor(t: Transaction) {
		super(t);
	}

	public async get(joParam: {
		idUser?: number, idGroup?: number, idUserGroup?: number, idCtUserGroupAccess?: number, idWorkspace?:number,
		idUserScope?: number, arIdGroup?: number[], isFavorite?: boolean, qtOffset?: number, qtLimit?: number
	})
		: Promise<IUserGroup[]> {
		const idUserFilter = joParam.idUser ? ` and usr.idUser = ${joParam.idUser}` : ""
		const idGroupFilter = joParam.idGroup ? ` and grp.idGroup = ${joParam.idGroup}` : ""
		const idUserGroupFilter = joParam.idUserGroup ? ` and ug.idUserGroup = ${joParam.idUserGroup}` : ""
		const arIdUserGroupFilter = joParam.arIdGroup && joParam.arIdGroup.length ?
			` and grp.idGroup in (${joParam.arIdGroup})` : ""
		const idCtUserGroupAccessFilter = joParam.idCtUserGroupAccess != undefined ?
			` and ug.idCtUserGroupAccess = ${joParam.idCtUserGroupAccess}` : ""
		const idUserScopeJoin = joParam.idUserScope ?
			` join userGroup as userGroupScope on userGroupScope.idGroup = grp.idGroup` : ""
		const idUserScopeFilter = joParam.idUserScope ? ` and userGroupScope.idUser = ${joParam.idUserScope}` : ""
		const idUserScopeSelect = joParam.idUserScope ? ` ${DaoUtil.toSelect("usr", "emUser")}, ` : ""
		const isFavoriteFilter = joParam.isFavorite ? ` and ug.isFavorite = ${joParam.isFavorite}` : ""
		const idWorkspaceFilter = joParam.idWorkspace ? ` and w.idWorkspace = ${joParam.idWorkspace}` : ""
		const qtLimitQtOffsetFilter = DaoUtil.qtLimitQtOffsetFilter(joParam)
		const userReaderCanOnlySeeHimselfInGroupFilter = joParam.idUserScope ? `and (
			userGroupScope.idCtUserGroupAccess != ${CtUserGroupAccess.reader.key} or (
				userGroupScope.idCtUserGroupAccess = ${CtUserGroupAccess.reader.key} and ug.idUser = ${joParam.idUserScope}
			)
		)` : ""

		const query = `select ${DaoUtil.getCsNmField(UserGroup.getArNmField(), "ug", true)}, ${idUserScopeSelect}
			${DaoUtil.toSelect("usr", "nmUser", "piAvatar")},
			${DaoUtil.toSelect("grp", "nmGroup")}
			from userGroup ug
			join grp on ug.idGroup = grp.idGroup
			join usr on usr.idUser = ug.idUser
			join workspace w on w.idWorkspace = grp.idWorkspace
			${idUserScopeJoin}
			where true
			and grp.isActive
			and w.isActive
			${userReaderCanOnlySeeHimselfInGroupFilter}
			${idUserFilter}
			${idGroupFilter}
			${idUserGroupFilter}
			${idCtUserGroupAccessFilter}
			${arIdUserGroupFilter}
			${idUserScopeFilter}
			${isFavoriteFilter}
			${idWorkspaceFilter}
			order by usr.nmUser
			${qtLimitQtOffsetFilter}`
		const userGroups = await this.query(query)
		return userGroups
	}

	public async delete(idUserGroup: number): Promise<void> {
		const result: any = await UserGroup.destroy({ transaction: this.t, where: { idUserGroup: idUserGroup } })
			.catch((err:any) => this.defaultCatchError(err))
		return
	}

	public async post(joParam: any | IUserGroup): Promise<IUserGroup> {
		const result = await super.create(UserGroup, joParam)
		return result
	}

	public async put(joParam: any): Promise<IUserGroup> {
		const result = await super.update(UserGroup, joParam, { idUserGroup: joParam.idUserGroup })
		return result
	}
}
