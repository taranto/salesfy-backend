import { LayerBusiness } from "../../layers_template/LayerBusiness";
import { ContentDao } from "./ContentDao";
import { IContent, CtError, CtUserGroupAccess } from "salesfy-shared";
import { BackendUtil } from "app/util/BackendUtil";
import { ValUtil } from "app/util/ValUtil";
import { HError } from "app/util/status/HError";
import { IStatus } from "app/util/HBTypes";

export class ContentBsn extends LayerBusiness {

	public async addFavorite(joParam: any): Promise<IContent> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idContent")
		const contentDao = new ContentDao(this.t)
		const content = await contentDao.addFavorite(joParam.idContent)
		return content
	}

	public async addLike(joParam: any): Promise<IContent> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idContent")
		const contentDao = new ContentDao(this.t)
		const content = await contentDao.addLike(joParam.idContent)
		return content
	}

	public async addViews(joParam: any): Promise<IContent[]> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "arIdContent")
		if (joParam.arIdContent == 0) {
			return []
		}
		const contentDao = new ContentDao(this.t)
		const content = await contentDao.addViews(joParam.arIdContent)
		return content
	}

	public async addConversion(joParam: any): Promise<IContent> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idContent")
		const contentDao = new ContentDao(this.t)
		const content = await contentDao.addConversion(joParam.idContent)
		joParam.hasLink = true
		const contentWithLink = await contentDao.get(joParam)
		return contentWithLink[0]
	}

	public async subtractFavorite(joParam: any): Promise<IContent> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idContent")
		const contentDao = new ContentDao(this.t)
		const content = await contentDao.subtractFavorite(joParam.idContent)
		return content
	}

	public async subtractLike(joParam: any): Promise<IContent> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idContent")
		const contentDao = new ContentDao(this.t)
		const content = await contentDao.subtractLike(joParam.idContent)
		return content
	}

	public async evaluationInteraction(idContent: number): Promise<IContent> {
		const joParam = { idContent: idContent }
		const content = this.recalculateEvaluation(joParam)
		return content
	}

	public async recalculateEvaluation(joParam: any): Promise<IContent> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idContent")
		const contentDao = new ContentDao(this.t)
		const content = await contentDao.updateTotalEvaluation(joParam.idContent)
		return content
	}

	public favoriteInteraction(wasFavorited: boolean, idContent: number): Promise<IContent> {
		const joParam = { idContent: idContent }
		if (wasFavorited) {
			return this.addFavorite(joParam)
		} else {
			return this.subtractFavorite(joParam)
		}
	}

	public likeInteraction(wasLiked: boolean, idContent: number): Promise<IContent> {
		const joParam = { idContent: idContent }
		if (wasLiked) {
			return this.addLike(joParam)
		} else {
			return this.subtractLike(joParam)
		}
	}

	public async get(joParam: any): Promise<IContent[]> {
		joParam = BackendUtil.defaultDaoListParam(joParam)
		const contentDao = new ContentDao(this.t)
		const contents = await contentDao.get(joParam)
		return contents
	}

	public async get1(idContent: number, idUserScope?: number, hasLink = false): Promise<IContent> {
		const arContent = await this.get({ idContent: idContent, idUserScope: idUserScope, hasLink: hasLink })
		if (arContent.length > 1) {
			throw new HError({ ctStatus: CtError.parametersAreMissing })
		}
		return arContent[0]
	}

	public async upsert(joParam: any): Promise<IContent> {
		const contentDao = new ContentDao(this.t)
		const content = await contentDao.upsert(joParam)
		return content
	}

	public async create(joParam: any): Promise<IContent> {
		const contentDao = new ContentDao(this.t)
		const content = await contentDao.create(joParam)
		return content
	}

	public async copy(content: IContent | any, joParam?: { joParamOverride?: any, arNmFieldDelete?: any }) {
		delete content.idContent
		if (joParam) {
			content = {
				...content,
				...joParam.joParamOverride
			}
			if (joParam.arNmFieldDelete) {
				joParam.arNmFieldDelete.forEach((nmFieldDelete: string) => {
					delete content[nmFieldDelete]
				})
			}
		}
		const contentCopy = await this.create(content)
		return contentCopy
	}

	public isContentAdmin(content: any, idUser: number, canPostSeContent?: boolean): boolean {
		if (!content) {
			return false
		}
		if (!content.isPlaybook) {
			return !!canPostSeContent
		}
		const isContentAdmin = (
			content.idPublisher == idUser ||
			CtUserGroupAccess.isUserGroupAdmin(content.idCtUserGroupAccess)
		)
		return isContentAdmin
	}

	public async isContentAdminAsync(idContent: number, idUser: number): Promise<boolean> {
		const content: any = await this.get1(idContent, idUser, true)
		const isContentAdmin = this.isContentAdmin(content, idUser)
		return isContentAdmin
	}

	public getDhUpdate(joParam: { shNotifyUpdate: boolean, dhUpdate: Date }): Date {
		if (joParam.shNotifyUpdate) {
			return new Date()
		}
		return joParam.dhUpdate
	}

	public turnPreviewIntoContent(iStatusP: IStatus, joParam: any): any {
		if (iStatusP.joResult) {
			joParam = {
				nmContent: iStatusP.joResult.nmPreview,
				dsContent: iStatusP.joResult.dsPreview,
				lkFile: iStatusP.joResult.piPreview,
				lkContent: iStatusP.joResult.lkPreview,
				...joParam
			}
		}
		return joParam
	}
}
