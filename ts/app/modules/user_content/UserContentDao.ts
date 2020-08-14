import { UserContent } from "./UserContent";
import { Transaction } from "sequelize";
import { IUserContent } from "salesfy-shared";
import { DaoUtil } from "app/util/DaoUtil";
import { LayerDao } from "app/layers_template/LayerDao";
import { ContentDao } from "app/modules/content/ContentDao";

export class UserContentDao extends LayerDao<UserContent, IUserContent> {

	constructor(t: Transaction) {
		super(t);
	}

	public async addView(idContent: number, idUser: number, dhLastView: Date): Promise<IUserContent> {
		const result = await this.doOpCustom(UserContent,
			`qtView = qtView+1, dhLastView = ${DaoUtil.toPsqlDateMethod(dhLastView)}`,
			`idContent = ${idContent} and idUser = ${idUser}`)
		return result[0]
	}

	public async addViews(arIdContent: number[], idUser: number, dhLastView: Date): Promise<IUserContent[]> {
		const result = await this.doOpCustom(UserContent,
			`qtView = qtView+1, dhLastView = ${DaoUtil.toPsqlDateMethod(dhLastView)}`,
			`idContent in (${arIdContent}) and idUser = ${idUser}`)
		return result
	}

	public async addConversion(idContent: number, idUser: number, dhLastConversion: Date): Promise<IUserContent> {
		const result = await this.doOpCustom(UserContent,
			`qtConversion = qtConversion+1, dhLastConversion = ${DaoUtil.toPsqlDateMethod(dhLastConversion)}`,
			`idContent = ${idContent} and idUser = ${idUser}`)
		return result[0]
	}

	public async getRaw(joParam: { idContent?: number, arIdContent?: number[], idUser?: number })
		: Promise<IUserContent[]> {
		const arIdContentWhere = joParam.arIdContent != undefined && joParam.arIdContent.length > 0 ?
			` and uc.idContent in (${joParam.arIdContent}) ` : ""
		const idContentWhere = joParam.idContent ? ` and uc.idContent = ${joParam.idContent} ` : ""
		const idUserWhere = joParam.idUser ? ` and uc.idUser = ${joParam.idUser} ` : ""

		const query = `
			select ${DaoUtil.getCsNmField(UserContent.getArNmField(), "uc", true)}
			from userContent uc
			where true
			${arIdContentWhere}
			${idContentWhere}
			${idUserWhere}
		`
		const result = await this.query(query)
		return result
	}

	public async get(joParam: { idContent?: number, arIdContent?: number[], idUser?: number }): Promise<IUserContent[]> {
		const contentDao = new ContentDao(this.t)
		const joParamContent = {
			isSelectQuoted: false,
			idContent: joParam.idContent,
			arIdContent: joParam.arIdContent,
			idUserScope: joParam.idUser
		}
		const cBaseQuery = contentDao.getQuery(joParamContent)
		const arIdContentWhere = joParam.arIdContent != undefined && joParam.arIdContent.length > 0 ?
			` and c.idContent in (${joParam.arIdContent}) ` : ""
		const idContentWhere = joParam.idContent ? ` and c.idContent = ${joParam.idContent} ` : ""
		const arNmAttrFiltered = UserContent.getArNmField().filter((nmField: string) => {
			return !(nmField == "qtView" || nmField == "qtConversion")
		})

		const query = `
			select ${DaoUtil.toSelect("uc", ...arNmAttrFiltered)},
				${DaoUtil.toSelect("c", "idContent", "idCtContent", "nrLanguage", "idPublisher", "nmContent", "piContent",
				"dsContent", "shShowDescription", "shShowTitle", "shShowPublisher", "shShowFullscreenImage", "shShowActionButtons",
				"qtLike", "dhPublish")},
				${DaoUtil.as("up.nmUser", "nmPublisher")},
				${DaoUtil.as("ct.nmCtContent", "nmCtContent")}
			from ${cBaseQuery} c
			join usr up on up.idUser = c.idPublisher
			left join userContent uc on uc.idContent = c.idContent and uc.idUser = ${joParam.idUser}
			left join usr on uc.idUser = usr.idUser and usr.idUser = ${joParam.idUser}
			join ctContent ct on ct.idCtContent = c.idCtContent
			where true
			${idContentWhere}
			${arIdContentWhere}
		`
		const result = await this.query(query)
		return result
	}

	public async bulkUpsert(joParam: any): Promise<IUserContent[]> {
		const result = await super.bulkUpsert(UserContent, joParam)
		return result
	}

	public async insert(joParam: any): Promise<IUserContent> {
		const result = await super.create(UserContent, joParam)
		return result
	}

	public async upsert(joParam: any): Promise<IUserContent> {
		const result = await super.upsert(UserContent, joParam)
		return result
	}
}
