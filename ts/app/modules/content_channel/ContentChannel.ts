import { LayerEntity } from "app/layers_template/LayerEntity";
import { IContentChannel } from "salesfy-shared";
import { FilteredModelAttributes } from "sequelize-typescript/lib/models/Model";
import { IBuildOptions, Column, DataType, Table, Unique } from "sequelize-typescript";

@Table({
	tableName: "contentchannel",
})
export class ContentChannel extends LayerEntity<ContentChannel> implements IContentChannel {

	public id = "idContentChannel"
	@Column({ type: DataType.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true, field: 'idcontentchannel' })
	public idContentChannel: number
	@Column({
		type: DataType.INTEGER, allowNull: false,
		references: { model: 'content', key: 'idcontent' }, field: 'idcontent',
		unique: 'uniqueTag'
	})
	public idContent: number
	@Column({
		type: DataType.INTEGER, allowNull: false,
		references: { model: 'channel', key: 'idchannel' }, field: 'idchannel',
		unique: 'uniqueTag'
	})
	public idChannel: number
	@Column({ type: DataType.INTEGER, allowNull: true, field: 'vlsort' })
	public vlSort: number

	constructor(values?: FilteredModelAttributes<ContentChannel>, options?: IBuildOptions) {
		super(values, options);
	}
}
