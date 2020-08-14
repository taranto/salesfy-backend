import { LayerEntity } from "app/layers_template/LayerEntity";
import { IUserTag } from "salesfy-shared";
import { FilteredModelAttributes } from "sequelize-typescript/lib/models/Model";
import { IBuildOptions, Column, DataType, Table, Unique } from "sequelize-typescript";

@Table({
	tableName: "usertag",
})
export class UserTag extends LayerEntity<UserTag> implements IUserTag {

	public id = "idUserTag"
	@Column({ type: DataType.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true, field: 'idusertag' })
	public idUserTag: number
	@Column({
		type: DataType.INTEGER, allowNull: true,
		references: { model: 'usr', key: 'iduser' }, field: 'iduser',
		unique: 'uniqueTag'
	})
	public idUser: number
	@Column({
		type: DataType.INTEGER, allowNull: true,
		references: { model: 'tag', key: 'idtag' }, field: 'idtag',
		unique: 'uniqueTag'
	})
	public idTag: number
	@Column({ type: DataType.DATE, allowNull: true, field: 'dhregister' })
	public dhRegister: Date

	constructor(values?: FilteredModelAttributes<UserTag>, options?: IBuildOptions) {
		super(values, options);
	}
}
