import { Column, DataType, IBuildOptions, Table, Unique } from "sequelize-typescript";
import { FilteredModelAttributes } from "sequelize-typescript/lib/models/Model";
import { LayerEntity } from "./../../layers_template/LayerEntity";
import { IUserContent } from "salesfy-shared"

@Table({
	tableName: "usercontent",
})
export class UserContent extends LayerEntity<UserContent> implements IUserContent {

	public id = "idUserContent"
	@Column({
		field: "idusercontent", type: DataType.INTEGER, allowNull: false,
		primaryKey: true, autoIncrement: true, unique: true
	})
	public idUserContent: number;
	@Column({
		type: DataType.INTEGER, allowNull: false,
		references: { model: 'usr', key: 'iduser' }, field: 'iduser',
		unique: 'uniqueTag'
	})
	public idUser: number;
	@Column({
		type: DataType.INTEGER, allowNull: false,
		references: { model: 'content', key: 'idcontent' }, field: 'idcontent',
		unique: 'uniqueTag'
	})
	public idContent: number;
	@Column({ type: DataType.BOOLEAN, allowNull: true, defaultValue: false, field: 'islike' })
	public isLike: boolean;
	@Column({ type: DataType.BOOLEAN, allowNull: true, defaultValue: false, field: 'isfavorite' })
	public isFavorite: boolean;
	@Column({ type: DataType.INTEGER, allowNull: true, defaultValue: 0, field: 'qtview' })
	public qtView: number;
	@Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0, field: 'qtconversion' })
	public qtConversion: number;
	@Column({ type: DataType.DATE, allowNull: true, field: 'dhlastview' })
	public dhLastView: Date
	@Column({ type: DataType.DATE, allowNull: true, field: 'dhlastconversion' })
	public dhLastConversion: Date
	@Column({ type: DataType.SMALLINT, allowNull: true, field: 'vleval' })
	public vlEval: number;

	constructor(values?: FilteredModelAttributes<UserContent>, options?: IBuildOptions) {
		super(values, options);
	}

}
