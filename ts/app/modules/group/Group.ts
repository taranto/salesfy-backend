import { Column, DataType, IBuildOptions, Table } from "sequelize-typescript";
import { FilteredModelAttributes } from "sequelize-typescript/lib/models/Model";
import { LayerEntity } from "./../../layers_template/LayerEntity";
import { IChannel, IGroup } from "salesfy-shared";

@Table({
	tableName: "grp",
})
export class Group extends LayerEntity<Group> implements IGroup {

	public id = "idGroup"

	@Column({ type: DataType.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true, field: 'idgroup'})
	public idGroup: number
	@Column({ type: DataType.TEXT, allowNull: false, field: 'nmgroup'})
	public nmGroup: string
	@Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true, field: 'isactive'})
	public isActive: boolean
	@Column({ type: DataType.INTEGER, allowNull: false,
		references: {
			model: 'workspace',
			key: 'idworkspace'
		},
		field: 'idworkspace'})
	public idWorkspace: number

	constructor(values?: FilteredModelAttributes<Group>, options?: IBuildOptions) {
		super(values, options);
	}
}
