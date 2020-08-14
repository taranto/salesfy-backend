import { Column, DataType, IBuildOptions, Table } from "sequelize-typescript";
import { FilteredModelAttributes } from "sequelize-typescript/lib/models/Model";
import { IEmailFailure } from "salesfy-shared"
import { LayerEntity } from "../../layers_template/LayerEntity";

@Table({
	tableName: "emailfailure",
})
export class EmailFailure extends LayerEntity<EmailFailure> implements IEmailFailure {

	public id = "idEmailFailure"
	@Column({ field: "idemailfailure", type: DataType.INTEGER, allowNull: false,
	primaryKey: true, autoIncrement: true, unique: true })
	public idEmailFailure: number;
	@Column({ field: "emto", type: DataType.STRING, allowNull: false })
	public emTo: string;
	@Column({ field: "emfrom", type: DataType.STRING, allowNull: false })
	public emFrom: string;
	@Column({ field: "dshtml", type: DataType.TEXT, allowNull: false })
	public dsHtml: string;
	@Column({ field: "dssubject", type: DataType.TEXT, allowNull: false })
	public dsSubject: string;
	@Column({ field: "cderrorresponse", type: DataType.INTEGER, allowNull: true })
	public cdErrorResponse: number;
	@Column({ field: "dserrorstack", type: DataType.TEXT, allowNull: false })
	public dsErrorStack: string;
	@Column({ field: "dhfailure", type: DataType.DATE, allowNull: false })
	public dhFailure: Date;
	@Column({ field: "qtretry", type: DataType.INTEGER, allowNull: false })
	public qtRetry: number;
	@Column({ field: "issent", type: DataType.BOOLEAN, allowNull: false })
	public isSent: boolean;
	@Column({ field: "dhlastretry", type: DataType.DATE })
	public dhLastRetry: Date;

	constructor(values?: FilteredModelAttributes<EmailFailure>, options?: IBuildOptions) {
		super(values, options);
	}
}
