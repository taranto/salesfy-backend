import { Column, DataType, IBuildOptions, Table } from "sequelize-typescript";
import { FilteredModelAttributes } from "sequelize-typescript/lib/models/Model";
import { LayerEntity } from "./../../layers_template/LayerEntity";
import { IContent } from "salesfy-shared";
import { EntityUtil } from "app/util/EntityUtil";
@Table({
	tableName: "content",
})
export class Content extends LayerEntity<Content> implements IContent {
	public nmAlias = "c"
	public id = "idContent"

	@Column({ type: DataType.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true, field: 'idcontent' })
	public idContent: number
	@Column({ type: DataType.STRING,allowNull: false,field: 'nmcontent'})
	public nmContent: string
	@Column({ type: DataType.TEXT, allowNull: false, field: 'picontent'})
	public piContent: string
	@Column({ type: DataType.TEXT, allowNull: true, field: 'dscontent'})
	public dsContent: string
	@Column({ type: DataType.TEXT, allowNull: true, field: 'lkcontent'})
	public lkContent: string
	@Column({ type: DataType.INTEGER, allowNull: true, field: 'qtlike'})
	public qtLike: number
	@Column({ type: DataType.INTEGER, allowNull: true, field: 'qtfavorite'})
	public qtFavorite: number
	@Column({ type: DataType.INTEGER, allowNull: true, field: 'qtview'})
	public qtView: number
	@Column({ type: DataType.INTEGER, allowNull: true, field: 'qtconversion'})
	public qtConversion: number
	@Column({ type: DataType.INTEGER, allowNull: false,
		references: {
			model: 'usr',
			key: 'iduser'
		},
		field: 'idpublisher'})
	public idPublisher: number
	@Column({ type: DataType.INTEGER, allowNull: false,
		references: {
			model: 'ctcontent',
			key: 'idctcontent'
		},
		field: 'idctcontent'})
	public idCtContent: string
	@Column({ type: DataType.INTEGER, allowNull: true, field: 'vlsort'})
	public vlSort: number
	@Column({ type: DataType.BOOLEAN, allowNull: true, field: 'shshowdescription'})
	public shShowDescription: boolean
	@Column({ type: DataType.BOOLEAN, allowNull: true, field: 'shshowtitle'})
	public shShowTitle: boolean
	@Column({ type: DataType.BOOLEAN, allowNull: true, field: 'shshowshortcard'})
	public shShowShortCard: boolean
	@Column({ type: DataType.BOOLEAN, allowNull: true, field: 'shshowpublisher'})
	public shShowPublisher: boolean
	@Column({ type: DataType.BOOLEAN, allowNull: true, field: 'shshowfullscreenimage'})
	public shShowFullscreenImage: boolean
	@Column({ type: DataType.BOOLEAN, allowNull: true, field: 'shshowactionbuttons'})
	public shShowActionButtons: boolean
	@Column({ type: DataType.BOOLEAN, allowNull: true, field: 'shshowsharebutton'})
	public shShowShareButton: boolean
	@Column({ type: DataType.DATE, allowNull: true, field: 'dhpublish'})
	public dhPublish: Date
	@Column({ type: DataType.INTEGER, allowNull: true, field: 'nrlanguage'})
	public nrLanguage: number
	@Column({ type: DataType.BOOLEAN, allowNull: false, field: 'isplaybook'})
	public isPlaybook: boolean
	@Column({ type: DataType.BOOLEAN, allowNull: false, field: 'isactive'})
	public isActive: boolean
	@Column({ type: DataType.DATE, allowNull: true, field: 'dhupdate'})
	public dhUpdate: Date
	@Column({ type: DataType.INTEGER, allowNull: false, field: 'qteval' })
	public qtEval: number;
	@Column({ type: DataType.REAL, allowNull: true, field: 'vleval' })
	public vlEval: number;

	constructor(values?: FilteredModelAttributes<Content>, options?: IBuildOptions) {
		super(values, options);
	}

	public static getArNmFieldPublic(): string[] {
		let arNmField = EntityUtil.getArNmField(this, true, true)
		arNmField = arNmField.filter((nmField) => {
			return!(nmField == "qtConversion" || nmField == "qtFavorite" || nmField == "lkContent")
		})
		return arNmField
	}
}
