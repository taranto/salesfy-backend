import { LayerEntity } from "app/layers_template/LayerEntity";
import { ITag } from "salesfy-shared";
import { FilteredModelAttributes } from "sequelize-typescript/lib/models/Model";
import { IBuildOptions, Column, DataType, Table } from "sequelize-typescript";

@Table({
	tableName: "tag",
})
export class Tag extends  LayerEntity<Tag> implements ITag {

	public id = "idTag"
	@Column({ type: DataType.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true, field: 'idtag' })
	public idTag: number
	@Column({ type: DataType.TEXT, allowNull: false, field: 'nmtag' })
	public nmTag: string
	@Column({ type: DataType.INTEGER, allowNull: false, field: 'idcttag' })
	public idCtTag: number
	@Column({ type: DataType.TEXT, allowNull: false, field: 'pitag' })
	public piTag: number

	constructor(values?: FilteredModelAttributes<Tag>, options?: IBuildOptions) {
		super(values, options);
	}
}
