import { LayerEntity } from "app/layers_template/LayerEntity";
import { FilteredModelAttributes } from "sequelize-typescript/lib/models/Model";
import { IBuildOptions, Column, DataType, Table, Unique } from "sequelize-typescript";
import { IChannelGroup } from "salesfy-shared";

@Table({
	tableName: "channelgroup",
})
export class ChannelGroup extends LayerEntity<ChannelGroup> implements IChannelGroup {

	public id = "idChannelGroup"
	@Column({ type: DataType.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true, field: 'idchannelgroup' })
	public idChannelGroup: number
	@Column({
		type: DataType.INTEGER, allowNull: true,
		references: { model: 'channel', key: 'idchannel' }, field: 'idchannel',
		unique: 'uniqueTag'
	})
	public idChannel: number
	@Column({
		type: DataType.INTEGER, allowNull: true,
		references: { model: 'grp', key: 'idgroup' }, field: 'idgroup',
		unique: 'uniqueTag'
	})
	public idGroup: number

	constructor(values?: FilteredModelAttributes<ChannelGroup>, options?: IBuildOptions) {
		super(values, options);
	}
}
