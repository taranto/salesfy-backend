import { Transaction } from "../../structure/DbConn";
import { LayerDao } from "./../../layers_template/LayerDao";
import { User } from "./User";
import { IAuth, IUser, CtUserGroupAccess } from "salesfy-shared";
import { DaoUtil } from "app/util/DaoUtil";
import { UserPermission } from "app/modules/user/UserPermission";

export class UserDao extends LayerDao<User, IAuth> {

	constructor(t: Transaction) {
		super(t);
	}

	public async getBySpecificParam(nmColumn: string, vlColumn: string, isPrivateSelect?: boolean): Promise<IUser[]> {
		const query = `select ${UserDao.getSelect(isPrivateSelect)}
			from usr u where ${nmColumn} = ${DaoUtil.maybeEscape(vlColumn)}`
		const result = await this.query(query)
		return result
	}

	public async update(joParam: any): Promise<IAuth> {
		const result = await super.update(User, joParam, { idUser: joParam.idUser })
		return result
	}

	public async create(joParam: any): Promise<IAuth> {
		//TODO ver onde é usado o metodo (upsert) para evitar retornar coisas fora do autorizado (ispublicselect)
		if (!joParam.idUser) {
			joParam.dhRegister = new Date()
		}
		const result = await super.create(User, joParam)
		return result
	}

	public async get(joParam: {
		isActive?: boolean, idUser?: number, emUser?: string,
		qtLimit?: number, qtOffset?: number, isLimitFree?: boolean
	}
		, isPrivateInfoSelect = false, isPermissionInfoSelect = false): Promise<IAuth[]> {
		joParam = DaoUtil.escapeStrings(joParam)
		const qtLimitQtOffsetFilter = DaoUtil.qtLimitQtOffsetFilter(joParam, joParam.isLimitFree)
		const isActiveWhere = DaoUtil.isActiveWhere(joParam)
		const idUserWhere = joParam.idUser ? ` and idUser = ${joParam.idUser} ` : ""
		const emUserWhere = joParam.emUser ? ` and emUser like ${joParam.emUser} ` : ""
		const isPermissionInfoJoin = isPermissionInfoSelect ? `left join userPermission up using(idUser)` : ""
		const query = `select ${UserDao.getSelect(isPrivateInfoSelect, isPermissionInfoSelect)}
			from usr u
			${isPermissionInfoJoin}
			where true
			${idUserWhere}
			${emUserWhere}
			${isActiveWhere}
		${qtLimitQtOffsetFilter}`
		const result = await this.query(query)
		return result
	}

	public static getSelect(isPrivateInfoSelect?: boolean, isPermissionInfoSelect?: boolean): string {
		let dsPermissionSelect = ""
		if (isPermissionInfoSelect) {
			dsPermissionSelect = DaoUtil.getCsNmField(UserPermission.getArNmField(), "up", true) + ", "
		}
		if (isPrivateInfoSelect) {
			return dsPermissionSelect + DaoUtil.getCsNmField(User.getArNmFieldPrivate(), "u", true)
		}
		return dsPermissionSelect + DaoUtil.getCsNmField(User.getArNmFieldPublic(), "u", true)
	}

	public async getArUserNetwork(joParam: {
		emUser?: string, idUserScope: number, qtLimit?: number,
		qtOffset?: number, isLimitFree?: boolean, idUserInNetworkSpecific?: number, idWorkspace?: number,
		hasMe?: boolean
	})
		: Promise<IUser[]> {
		joParam = DaoUtil.asPartialString(joParam, "emUser")
		joParam = DaoUtil.escapeStrings(joParam)
		const qtLimitQtOffsetFilter = DaoUtil.qtLimitQtOffsetFilter(joParam, joParam.isLimitFree)
		const emUserWhere = joParam.emUser ? ` and emUser like ${joParam.emUser} ` : ""
		const idUserInNetworkSpecificWhere = joParam.idUserInNetworkSpecific ? ` and u.idUser = ${joParam.idUserInNetworkSpecific}` : ""
		const idWorkspaceFilter = joParam.idWorkspace ? ` and w.idWorkspace = ${joParam.idWorkspace}` : ""
		const hasMeWhere = joParam.hasMe != true ? `and u.idUser != ${joParam.idUserScope}` : ""

		const query = `select distinct ${UserDao.getSelect(false)}, ${DaoUtil.toSelect("u", "emUser")}
			from grp
			join userGroup ug using(idGroup)
			join usr u using(idUser)
			join (
				select idGroup, idWorkspace
				from grp g
				join userGroup ug using(idGroup)
				where
				idUser = ${joParam.idUserScope}
				and g.isActive
				and ug.idCtUserGroupAccess != ${CtUserGroupAccess.reader.key}
			) groupsUserIn on groupsUserIn.idGroup = grp.idGroup
			join workspace w on w.idWorkspace = groupsUserIn.idWorkspace
			and w.isActive
			where true
			and grp.isActive
			and u.isActive
			${hasMeWhere}
			${idUserInNetworkSpecificWhere}
			${idWorkspaceFilter}
			${emUserWhere}
			${qtLimitQtOffsetFilter}`


		const result = await this.query(query)
		return result
	}
}
