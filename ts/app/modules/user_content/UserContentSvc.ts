import { LayerService } from "../../layers_template/LayerService";
import { HPlusStatus } from "app/util/status/HPlusStatus";
import { HStatus } from "app/util/status/HStatus";
import { HExcep } from "app/util/status/HExcep";
import { KeyEnum, IUserContent, CtExcep, CtWarn } from "salesfy-shared";
import { ValUtil } from "app/util/ValUtil";
import { ContentBsn } from "app/modules/content/ContentBsn";
import { UserContentBsn } from "app/modules/user_content/UserContentBsn";

export class UserContentSvc extends LayerService {

	public async switchFavorite(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idContent")
		joParam.idUser = joParam.idUserLogged
		const uciBsn = new UserContentBsn(this.t)
		const uc = await uciBsn.getSert(joParam)
		joParam.isFavorite = !uc.isFavorite
		const hStatus = await this.put(joParam)
		return hStatus
	}

	public async switchLike(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idContent")
		joParam.idUser = joParam.idUserLogged
		const uciBsn = new UserContentBsn(this.t)
		const uc : IUserContent = await uciBsn.getSert(joParam)
		joParam.isLike = !uc.isLike
		const hStatus = await this.put(joParam)
		return hStatus
	}

	public async put(joParam:any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idContent")
		const contentBsn = new ContentBsn(this.t)
		let content = await contentBsn.get1(joParam.idContent, joParam.idUserScope)
		if (!content) {
			throw new HExcep({ ctStatus:CtExcep.userNotAuthorized })
		}
		joParam.idUser = joParam.idUserLogged
		const userContentBsn = new UserContentBsn(this.t)
		const userContent = await userContentBsn.getSert(joParam)
		if (!userContent) {
			throw new HExcep({ ctStatus:CtExcep.userNotAuthorized })
		}
		if (joParam.vlEval > 5 || joParam.vlEval == 0 || joParam.vlEval < 0) {
			throw new HExcep({ ctStatus:CtWarn.valueOutOfLimits })
		}
		if (joParam.vlEval != userContent.vlEval) {
			await userContentBsn.upsert(joParam)
			await contentBsn.evaluationInteraction(joParam.idContent)
		}
		if (joParam.isFavorite != undefined && userContent.isFavorite != joParam.isFavorite) {
			await userContentBsn.upsert(joParam)
			await contentBsn.favoriteInteraction(userContent.isFavorite, joParam.idContent)
		}
		if (joParam.isLike != undefined && userContent.isLike != joParam.isLike) {
			await userContentBsn.upsert(joParam)
			await contentBsn.likeInteraction(userContent.isLike, joParam.idContent)
		}
		content = await contentBsn.get1(joParam.idContent, joParam.idUserScope)
		return new HPlusStatus({ joResult: content })
	}

}
