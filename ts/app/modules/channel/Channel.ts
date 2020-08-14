import { Column, DataType, IBuildOptions, Table } from "sequelize-typescript";
import { FilteredModelAttributes } from "sequelize-typescript/lib/models/Model";
import { LayerEntity } from "./../../layers_template/LayerEntity";
import { IChannel } from "salesfy-shared";

@Table({
	tableName: "channel",
})
export class Channel extends LayerEntity<Channel> implements IChannel {

	public id = "idChannel"

	@Column({ type: DataType.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true, field: 'idchannel' })
	public idChannel: number
	@Column({ type: DataType.TEXT, allowNull: false, field: 'nmchannel' })
	public nmChannel: string
	@Column({ type: DataType.TEXT, allowNull: true, field: 'pichannel' })
	public piChannel: string
	@Column({ type: DataType.TEXT, allowNull: true, field: 'dschannel' })
	public dsChannel: string
	@Column({ type: DataType.INTEGER, allowNull: true, field: 'vlsort' })
	public vlSort: number
	@Column({ type: DataType.BOOLEAN, allowNull: true, field: 'isplaybook' })
	public isPlaybook: boolean
	@Column({ type: DataType.TEXT, allowNull: true, field: 'piicon' })
	public piIcon: string
	@Column({
		type: DataType.INTEGER, allowNull: true,
		references: {
			model: 'usr',
			key: 'iduser'
		},
		field: 'idpublisher'
	})
	public idPublisher: string
	@Column({ type: DataType.BOOLEAN, allowNull: true, field: 'isactive' })
	public isActive: boolean
	@Column({ type: DataType.INTEGER, allowNull: true, field: 'idctchannelview' })
	public idCtChannelView: number
	@Column({ type: DataType.DATE, allowNull: true, field: 'dhpublish' })
	public dhPublish: Date

	constructor(values?: FilteredModelAttributes<Channel>, options?: IBuildOptions) {
		super(values, options);
	}
}
