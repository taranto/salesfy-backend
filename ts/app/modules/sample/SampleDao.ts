import { LayerDao } from "app/layers_template/LayerDao";
import { Transaction } from "sequelize";
import { DaoUtil } from "app/util/DaoUtil";
import { IWorkspace } from "salesfy-shared";
import { Workspace } from "app/modules/workspace/Workspace";

export class SampleDao extends LayerDao<Workspace, IWorkspace> {

	constructor(t: Transaction) {
		super(t);
	}

	public async get(joParam: {
		idWorkspace?: number, nmWorkspace?: string,
		qtLimit?: number, qtOffset?: number, idUserScope?: number
	}): Promise<IWorkspace[]> {
		const query = ``
		const result = await this.query(query)
		return result
	}

	public async upsert(joParam: any): Promise<IWorkspace> {
		const result = await super.upsert(Workspace, joParam)
		return result
	}

	public async create(joParam: any): Promise<IWorkspace> {
		const result = await super.create(Workspace, joParam)
		return result
	}
}
