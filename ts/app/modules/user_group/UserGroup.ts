import { LayerEntity } from "app/layers_template/LayerEntity";
import { IUserGroup } from "salesfy-shared";
import { FilteredModelAttributes } from "sequelize-typescript/lib/models/Model";
import { IBuildOptions, Column, DataType, Table, Unique } from "sequelize-typescript";

@Table({
	tableName: "usergroup",
})
export class UserGroup extends LayerEntity<UserGroup> implements IUserGroup {

	public id = "idUserGroup"
	@Column({ type: DataType.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true, field: 'idusergroup' })
	public idUserGroup: number
	@Column({
		type: DataType.INTEGER, allowNull: true,
		references: { model: 'usr', key: 'iduser' }, field: 'iduser',
		unique: 'uniqueTag'
	})
	public idUser: number
	@Column({
		type: DataType.INTEGER, allowNull: true,
		references: { model: 'grp', key: 'idgroup' }, field: 'idgroup',
		unique: 'uniqueTag'
	})
	public idGroup: number
	@Column({ type: DataType.INTEGER, allowNull: false, field: 'idctusergroupaccess' })
	public idCtUserGroupAccess: number
	@Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue:false, field: 'isfavorite'})
	public isFavorite: boolean

	constructor(values?: FilteredModelAttributes<UserGroup>, options?: IBuildOptions) {
		super(values, options);
	}
}
