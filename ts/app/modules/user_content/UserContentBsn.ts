import { LayerBusiness } from "../../layers_template/LayerBusiness"
import { UserContentDao } from "./UserContentDao"
import { GeneralUtil, IUserContent, JsonUtil, CtError } from "salesfy-shared"
import { ValUtil } from "app/util/ValUtil"
import { HError } from "app/util/status/HError"

export class UserContentBsn extends LayerBusiness {

	public async addViews(joParam: any): Promise<IUserContent[]> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "arIdContent", "idUser")
		if (joParam.arIdContent.length == 0) {
			return []
		}
		const userContentDao = new UserContentDao(this.t)
		const dhLastView = new Date()
		const arUserContent = await userContentDao.addViews(joParam.arIdContent, joParam.idUser, dhLastView)
		return arUserContent
	}

	public async addView(joParam: any): Promise<IUserContent> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idContent", "idUser")
		const userContentDao = new UserContentDao(this.t)
		const dhLastView = new Date()
		const userContent = await userContentDao.addView(joParam.idContent, joParam.idUser, dhLastView)
		return userContent
	}

	public async addConversion(joParam: any): Promise<IUserContent> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idContent", "idUser")
		const userContentDao = new UserContentDao(this.t)
		const dhLastConversion = new Date()
		const userContent = await userContentDao.addConversion(joParam.idContent, joParam.idUser, dhLastConversion)
		return userContent
	}

	public async getRaw(joParam: any): Promise<IUserContent[]> {
		const userContentDao = new UserContentDao(this.t)
		const userContent = await userContentDao.getRaw(joParam)
		return userContent
	}

	public async get(joParam: any): Promise<IUserContent[]> {
		const userContentDao = new UserContentDao(this.t)
		const arUserContent = await userContentDao.get(joParam)
		return arUserContent
	}

	public async insert(joParam: any): Promise<IUserContent> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idContent", "idUser")
		let joUserContent = GeneralUtil.copy(joParam)
		joUserContent = JsonUtil.removeParams(joUserContent, "vlEval", "isFavorite", "isLike")
		joUserContent.dhLastView = new Date()
		const userContentDao = new UserContentDao(this.t)
		const userContent = await userContentDao.insert(joUserContent)
		return userContent
	}

	public async upsert(joParam: any): Promise<IUserContent> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idContent", "idUser")
		const userContentDao = new UserContentDao(this.t)
		joParam.dhLastView = new Date()
		const arUserContent = await userContentDao.upsert(joParam)
		return arUserContent
	}

	public async bulkUpsert(arParam: any): Promise<IUserContent[]> {
		ValUtil.throwArNmKeyMissingInArJoParam(arParam, "idContent", "idUser")
		const dhLastView = new Date()
		const arJoContent = GeneralUtil.distributeAttributeThroughJos(arParam, "dhLastView", dhLastView)
		const userContentDao = new UserContentDao(this.t)
		const arUserContent = await userContentDao.bulkUpsert(arJoContent)
		return arUserContent
	}

	public async getSerts(joParam: any): Promise<IUserContent[]> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "arIdContent", "idUser")
		if (joParam.arIdContent.length == 0) {
			return []
		}
		const arUserContent = await this.getRaw(joParam)
		if (arUserContent && arUserContent.length == joParam.arIdContent.length) {
			return arUserContent
		}
		const arIdContentDiff = GeneralUtil.idDifferenceInArJson(joParam.arIdContent, arUserContent, "idContent")
		const joArIdContent = GeneralUtil.vlArrayToJoArray(arIdContentDiff, "idContent")
		const arJoContent = GeneralUtil.distributeAttributeThroughJos(joArIdContent, "idUser", joParam.idUser)
		const userContentInserted = await this.bulkUpsert(arJoContent)
		if (userContentInserted) {
			arUserContent.push(...userContentInserted)
		}
		return arUserContent
	}

	public async getSert(joParam: any): Promise<IUserContent> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idContent", "idUser")
		const arUserContent = await this.getRaw(joParam)
		if (arUserContent == undefined || arUserContent.length == 0) {
			const userContent = await this.insert(joParam)
			return userContent
		}
		return arUserContent[0]
	}

	public async get1(idContent: number, idUser: number): Promise<IUserContent> {
		const userContentDao = new UserContentDao(this.t)
		const arContent = await userContentDao.get({ idContent: idContent, idUser: idUser })
		if (arContent.length > 1) {
			throw new HError({ ctStatus: CtError.parametersAreMissing })
		}
		return arContent[0]
	}

	public async getRaw1(idContent: number, idUser: number): Promise<IUserContent> {
		const userContentDao = new UserContentDao(this.t)
		const arContent = await userContentDao.getRaw({ idContent: idContent, idUser: idUser })
		if (arContent.length > 1) {
			throw new HError({ ctStatus: CtError.parametersAreMissing })
		}
		return arContent[0]
	}
}
