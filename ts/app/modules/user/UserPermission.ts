import { Column, DataType, IBuildOptions, Table } from "sequelize-typescript";
import { FilteredModelAttributes } from "sequelize-typescript/lib/models/Model";
import { LayerEntity } from "./../../layers_template/LayerEntity";
import { IUserPermission } from "salesfy-shared"
import { EntityUtil } from "app/util/EntityUtil";

@Table({
	tableName: "usr",
})
export class UserPermission extends LayerEntity<UserPermission> implements IUserPermission {

	public id = "idUserPermission"
	@Column({ field: "iduserpermission", type: DataType.INTEGER, allowNull: false,
	primaryKey: true, autoIncrement: true, unique: true })
	public idUserPermission: number;
	@Column({ field: "iduser", type: DataType.INTEGER, allowNull: false, unique: true })
	public idUser: number;
	@Column({ field: "canpostsecontent", type: DataType.BOOLEAN, allowNull: false})
	public canPostSeContent: boolean;
	@Column({ field: "canpostsechannel", type: DataType.BOOLEAN, allowNull: false})
	public canPostSeChannel: boolean;
	@Column({ field: "cansimulatesomeone", type: DataType.BOOLEAN, allowNull: false})
	public canSimulateSomeone: boolean;
	@Column({ field: "canreloadenv", type: DataType.BOOLEAN, allowNull: false })
	public canReloadEnv: boolean;
	@Column({ field: "canpostworkspace", type: DataType.BOOLEAN, allowNull: false })
	public canPostWorkspace: boolean;

	constructor(values?: FilteredModelAttributes<UserPermission>, options?: IBuildOptions) {
		super(values, options);
	}

}
