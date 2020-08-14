import { Column, DataType, IBuildOptions, Table } from "sequelize-typescript";
import { FilteredModelAttributes } from "sequelize-typescript/lib/models/Model";
import { INotifyMsg } from "salesfy-shared"
import { LayerEntity } from "../../layers_template/LayerEntity";

@Table({
	tableName: "notifymsg",
})
export class NotifyMsg extends LayerEntity<NotifyMsg> implements INotifyMsg {

	public id = "idNotifyMsg"
	@Column({ type: DataType.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true, field: 'idnotifymsg' })
	public idNotifyMsg: number;
	@Column({ field: "snversionmax", type: DataType.STRING, allowNull: false })
	public snVersionMax: string;
	@Column({ field: "snversionmin", type: DataType.STRING, allowNull: false })
	public snVersionMin: string;
	@Column({ field: "keymsg", type: DataType.TEXT, allowNull: true })
	public keyMsg: string;
	@Column({ field: "dsmsgrawen", type: DataType.TEXT, allowNull: true })
	public dsMsgRawEn: string;
	@Column({ field: "dsmsgrawpt", type: DataType.TEXT, allowNull: true })
	public dsMsgRawPt: string;
	@Column({ field: "isblockable", type: DataType.BOOLEAN, allowNull: false })
	public isBlockable: boolean;
	@Column({ field: "isupdatable", type: DataType.BOOLEAN, allowNull: false })
	public isUpdatable: boolean;
	@Column({ field: "dhstart", type: DataType.BOOLEAN, allowNull: true })
	public dhStart: Date;
	@Column({ field: "dhend", type: DataType.BOOLEAN, allowNull: true })
	public dhEnd: Date;
	@Column({ field: "ctsystem", type: DataType.INTEGER, allowNull: true })
	public ctSystem: number;

	constructor(values?: FilteredModelAttributes<NotifyMsg>, options?: IBuildOptions) {
		super(values, options);
	}
}
