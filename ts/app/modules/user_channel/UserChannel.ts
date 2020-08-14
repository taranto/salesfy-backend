import { Column, DataType, IBuildOptions, Table, Unique } from "sequelize-typescript";
import { FilteredModelAttributes } from "sequelize-typescript/lib/models/Model";
import { LayerEntity } from "./../../layers_template/LayerEntity";
import { IUserChannel } from "salesfy-shared";

@Table({
	tableName: "userchannel",
})
export class UserChannel extends LayerEntity<UserChannel> implements IUserChannel {

	public id = "idUserChannel"

	@Column({ type: DataType.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true, field: 'iduserchannel' })
	public idUserChannel: number
	@Column({ type: DataType.INTEGER, allowNull: false,
		references: {
			model: 'channel',
			key: 'idchannel'
		},
		field: 'idchannel',
		unique: 'uniqueTag'})
	public idChannel: number
	@Column({ type: DataType.INTEGER, allowNull: false,
		references: {
			model: 'usr',
			key: 'iduser'
		},
		field: 'iduser',
		unique: 'uniqueTag'})
	public idUser: number
	@Column({ type: DataType.DATE, allowNull: true, field: 'dhlastconversion' })
	public dhLastConversion: Date
	@Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0, field: 'qtconversion' })
	public qtConversion: number;

	constructor(values?: FilteredModelAttributes<UserChannel>, options?: IBuildOptions) {
		super(values, options);
	}
}
