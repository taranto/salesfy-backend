import { Column, DataType, IBuildOptions, Table } from "sequelize-typescript";
import { FilteredModelAttributes } from "sequelize-typescript/lib/models/Model";
import { LayerEntity } from "./../../layers_template/LayerEntity";
import { EntityUtil } from "app/util/EntityUtil";
import { IWorkspace } from "salesfy-shared";
@Table({
	tableName: "workspace",
})
export class Workspace extends LayerEntity<Workspace> implements IWorkspace {
	public nmAlias = "w"
	public id = "idWorkspace"

	@Column({ type: DataType.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true, field: 'idworkspace' })
	public idWorkspace: number
	@Column({ type: DataType.STRING, allowNull: false, field: 'nmworkspace' })
	public nmWorkspace: string
	@Column({ type: DataType.TEXT, allowNull: false, field: 'piworkspace' })
	public piWorkspace: string
	@Column({
		type: DataType.INTEGER, allowNull: false,
		references: {
			model: 'usr',
			key: 'iduser'
		},
		field: 'iduserresponsible'
	})
	public idUserResponsible: number
	@Column({ type: DataType.BOOLEAN, allowNull: false, field: 'isactive' })
	public isActive: boolean

	constructor(values?: FilteredModelAttributes<Workspace>, options?: IBuildOptions) {
		super(values, options);
	}
}
