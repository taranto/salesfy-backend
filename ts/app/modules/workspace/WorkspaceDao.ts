import { LayerDao } from "app/layers_template/LayerDao";
import { Transaction } from "sequelize";
import { DaoUtil } from "app/util/DaoUtil";
import { IWorkspace } from "salesfy-shared";
import { Workspace } from "app/modules/workspace/Workspace";

export interface IWorkspaceDaoParam {
	idWorkspace?: number, idUserScope?: number, idUserResponsible?: number,
	isActive?: boolean
	qtOffset?: number, qtLimit?: number,
	nmWorkspace?: string, nmUserResponsible?: string,
	arIdWorkspace?: number[], arIdUserResponsible?: number[],
	isSelectQuoted?: boolean
}

export class WorkspaceDao extends LayerDao<Workspace, IWorkspace> {

	constructor(t: Transaction) {
		super(t);
	}

	public async delete(idWorkspace: number): Promise<void> {
		const result = await super.delete(Workspace, { where: { idWorkspace: idWorkspace } })
		return
	}

	public async upsert(joParam: any): Promise<IWorkspace> {
		const result = await super.upsert(Workspace, joParam)
		return result
	}

	public async create(joParam: any): Promise<IWorkspace> {
		const result = await super.create(Workspace, joParam)
		return result
	}

	public async get(joParam: IWorkspaceDaoParam): Promise<IWorkspace[]> {
		const query = this.getQuery(joParam)
		const qtLimitQtOffsetFilter = DaoUtil.qtLimitQtOffsetFilter(joParam)
		const dsQueryLimited = `${query} ${qtLimitQtOffsetFilter}`
		const result = await this.query(dsQueryLimited)
		return result
	}

	public getQuery(joParam: IWorkspaceDaoParam): string {
		const dsSelect = this.getSelect(joParam)
		const dsJoin = this.getJoin(joParam)
		const dsWhere = this.getWhere(joParam)

		const query = `
			select distinct ${dsSelect}
			from workspace w
			${dsJoin}
			where true
			${dsWhere}
		`
		return query
	}

	public getSelect(joParam: IWorkspaceDaoParam): string {
		const isSelectQuoted = LayerDao.isSelectQuoted(joParam)
		const dsSelect = `
			${DaoUtil.getCsNmField(Workspace.getArNmField(), "w", isSelectQuoted)},
			${DaoUtil.getCsNmField(["nmUser"], "uResponsible", isSelectQuoted, ["nmUserResponsible"])}`
		return dsSelect
	}

	public getJoin(joParam: IWorkspaceDaoParam): string {
		const dsJoin = `
			join usr uResponsible on w.idUserResponsible = uResponsible.idUser
			left join grp g on g.idWorkspace = w.idWorkspace
			left join userGroup ug on ug.idGroup = g.idGroup
			left join usr u on u.idUser = ug.idUser`
		return dsJoin
	}

	public getWhere(joParam: IWorkspaceDaoParam): string {
		const arNmPartial = ["nmWorkspace", "nmUserResponsible"]
		let joParamWhere = DaoUtil.asPartialStrings(joParam, arNmPartial, { isOpenPrefix: true, isOpenSuffix: true })
		joParamWhere = DaoUtil.escapeStrings(joParamWhere)

		const isActive = joParam.isActive != undefined ? `and w.isActive = ${joParam.isActive} ` : `and w.isActive `
		const idWorkspaceWhere = joParam.idWorkspace ? `and w.idWorkspace = ${joParam.idWorkspace} ` : ""
		const idUserRespWhere = joParam.idUserResponsible ? `and w.idUserResponsible = ${joParam.idUserResponsible} ` : ""
		const nmWorkspaceWhere = joParam.nmWorkspace ? `and w.nmWorkspace ilike ${joParamWhere.nmWorkspace} ` : ""
		const nmUserResponsibleWhere = joParam.nmUserResponsible ?
			`and uResponsible.nmUser ilike ${joParamWhere.nmUserResponsible} ` : ""
		const arIdWorkspaceWhere = joParam.arIdWorkspace ? `and w.idWorkspace in (${joParam.arIdWorkspace}) ` : ""
		const arIdUserResponsibleWhere = joParam.arIdUserResponsible ?
			`and w.idUserResponsible in (${joParam.arIdUserResponsible}) ` : ""
		const wAccessWhere = this.getWAccessWhere(joParam)

		const dsWhere = `
			${isActive}
			${idWorkspaceWhere}
			${idUserRespWhere}
			${nmWorkspaceWhere}
			${nmUserResponsibleWhere}
			${arIdWorkspaceWhere}
			${arIdUserResponsibleWhere}
			${wAccessWhere}
		`
		return dsWhere
	}

	public getWAccessWhere(joParam: IWorkspaceDaoParam): string {
		if (!joParam.idUserScope) {
			return `and true `
		}
		const cChAccessWhere = `
		and (
			uResponsible.idUser = ${joParam.idUserScope}
			or u.idUser = ${joParam.idUserScope}
		)`
		return cChAccessWhere
	}
}
