import { Column, DataType, IBuildOptions, Table } from "sequelize-typescript";
import { FilteredModelAttributes } from "sequelize-typescript/lib/models/Model";
import { LayerEntity } from "./../../layers_template/LayerEntity";
import { IUser } from "salesfy-shared"
import { EntityUtil } from "app/util/EntityUtil";

@Table({
	tableName: "usr",
})
export class User extends LayerEntity<User> implements IUser {

	public id = "idUser"
	@Column({ field: "iduser", type: DataType.INTEGER, allowNull: false,
	primaryKey: true, autoIncrement: true, unique: true })
	public idUser: number;
	@Column({ field: "crkeypassword", type: DataType.STRING, allowNull: true })
	public crKeyPassword: string;
	@Column({ field: "emuser", type: DataType.STRING, allowNull: false })
	public emUser: string;
	@Column({ field: "nmuser", type: DataType.STRING })
	public nmUser: string
	@Column({ field: "dhregister", type: DataType.DATE, allowNull: false, defaultValue: new Date() })
	public dhRegister: Date;
	@Column({ field: "sntelephone", type: DataType.STRING })
	public snTelephone: string;
	@Column({ field: "snwhatsapp", type: DataType.STRING })
	public snWhatsapp: string;
	@Column({ field: "piavatar", type: DataType.TEXT })
	public piAvatar: string;
	@Column({ field: "nmcompany", type: DataType.STRING })
	public nmCompany: string;
	@Column({ field: "nmcargo", type: DataType.STRING })
	public nmCargo: string;
	@Column({ field: "lkfacebook", type: DataType.TEXT })
	public lkFacebook: string;
	@Column({ field: "lklinkedin", type: DataType.TEXT })
	public lkLinkedin: string;
	@Column({ field: "dstestimony", type: DataType.TEXT })
	public dsTestimony: string;
	@Column({ field: "lkwebsite", type: DataType.TEXT })
	public lkWebsite: string;
	@Column({ field: "crkeyrefreshtoken", type: DataType.TEXT })
	public crKeyRefreshToken: string;
	@Column({ field: "crkeyresetpassword", type: DataType.TEXT })
	public crKeyResetPassword: string;
	@Column({ field: "dhkeyresetpasswordexpiration", type: DataType.DATE })
	public dhKeyResetPasswordExpiration: Date;
	@Column({ field: "crkeyemailconfirmation", type: DataType.TEXT })
	public crKeyEmailConfirmation: string;
	@Column({ field: "isemailconfirmed", type: DataType.BOOLEAN })
	public isEmailConfirmed: boolean;
	@Column({ field: "nrlanguage", type: DataType.STRING })
	public nrLanguage: number;
	@Column({ field: "dhlastaccess", type: DataType.DATE })
	public dhLastAccess: Date
	@Column({ field: "keyfacebook", type: DataType.STRING })
	public keyFacebook : string
	@Column({ field: "keygoogle", type: DataType.STRING })
	public keyGoogle : string
	@Column({ field: "idworkspacedefault", type: DataType.INTEGER, allowNull: true })
	public idWorkspaceDefault: number;

	constructor(values?: FilteredModelAttributes<User>, options?: IBuildOptions) {
		super(values, options);
	}

	public static getArNmFieldPublic(): string[] {
		const arNmField = ["idUser", "nmUser", "piAvatar", "nmCompany", "nmCargo", "dsTestimony", "lkWebsite", "lkLinkedin",
			"idWorkspaceDefault"]
		return arNmField
	}

	public static getArNmFieldAuth(): string[] {
		const arNmField = ["crKeyPassword", "keyFacebook", "keyGoogle", "crKeyResetPassword",
			"dhKeyResetPasswordExpiration", "crKeyEmailConfirmation", "crKeyRefreshToken"]
		arNmField.push(...User.getArNmFieldPrivate())
		return arNmField
	}

	public static getArNmFieldPrivate(): string[] {
		const arNmField = ["emUser", "dhRegister", "isEmailConfirmed", "nrLanguage", "snTelephone",
			"snWhatsapp", "lkFacebook", "dhLastAccess"]
		arNmField.push(...User.getArNmFieldPublic())
		return arNmField
	}
}
