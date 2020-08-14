import { ContentBsn } from "./ContentBsn";
import { HPlusStatus } from "../../util/status/HPlusStatus";
import { GeneralUtil, StringUtil, RoutesEnum, KeyEnum, JsonUtil, CtExcep, CtWarn, CtError, CtContent } from "salesfy-shared";
import { LayerService } from "app/layers_template/LayerService";
import { HStatus } from "app/util/status/HStatus";
import { UserTagBsn } from "app/modules/user_tag/UserTagBsn";
import { UserChannelBsn } from "app/modules/user_channel/UserChannelBsn";
import { HExcep } from "app/util/status/HExcep";
import { UserBsn } from "app/modules/user/UserBsn";
import { BackendUtil } from "app/util/BackendUtil";
import { ContentPublishEmailBsn } from "app/modules/content/ContentPublishEmailBsn";
import { ChannelBsn } from "app/modules/channel/ChannelBsn";
import { Env } from "app/structure/Env";
import { ValUtil } from "app/util/ValUtil";
import { UserContentBsn } from "app/modules/user_content/UserContentBsn";
import { ContentChannelSvc } from "app/modules/content_channel/ContentChannelSvc";
import { PreviewSvc } from "app/modules/preview/PreviewSvc";
import { IStatus } from "app/util/HBTypes";
import { FileSvc } from "app/modules/file/FileSvc";

export class ContentSvc extends LayerService {

	public async get(joParam: any): Promise<HStatus> {
		joParam.hasLink = joParam.idUserScope != undefined
		if (joParam.idChannel != undefined) {
			const channelBsn = new ChannelBsn(this.t)
			const channel = await channelBsn.get1(joParam.idChannel, joParam.idUserScope)
			if (!channel) {
				throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
			}
			const userChannelBsn = new UserChannelBsn(this.t)
			const joParamViewedChannel = { idUser: joParam.idUserScope, idChannel: joParam.idChannel }
			const userChannel = await userChannelBsn.userConvertedChannel(joParamViewedChannel)
		}
		const contentBsn = new ContentBsn(this.t)
		let arContent = await contentBsn.get(joParam)
		const arIdContent = GeneralUtil.extractArrayValueFromJson(arContent, "idContent")
		const joAddViewParam = {
			arIdContent: arIdContent,
			idUser: joParam.idUserScope
		}
		if (joParam.idUserScope) {
			const userContentBsn = new UserContentBsn(this.t)
			await userContentBsn.getSerts(joAddViewParam)
			await userContentBsn.addViews(joAddViewParam)
		}
		await contentBsn.addViews(joAddViewParam)
		arContent = await contentBsn.get(joParam)
		return new HStatus({ joResult: arContent })
	}

	public async view(joParam: any): Promise<HStatus> {
		return new HStatus({})
	}

	public async conversion(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idContent")
		const contentBsn = new ContentBsn(this.t)
		let content = await contentBsn.get1(joParam.idContent, joParam.idUserScope)
		if (!content || (!joParam.idUserScope && content.isPlaybook)) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}
		if (joParam.idUserScope) {
			const userContentBsn = new UserContentBsn(this.t)
			const joUcParam = {
				idUser: joParam.idUserScope,
				idContent: joParam.idContent
			}
			await userContentBsn.getSert(joUcParam)
			await userContentBsn.addConversion(joUcParam)
		}
		content = await contentBsn.addConversion(joParam)
		content = await contentBsn.get1(joParam.idContent, joParam.idUserScope, true)
		return new HPlusStatus({ joResult: content })
	}

	public async post(joParam: any): Promise<HStatus> {
		const arNmKeyMissingInJoParam = JsonUtil.getArNmKeyMissingInJoParam(joParam, "lkPreview")
		const isLkPreviewMissing = arNmKeyMissingInJoParam.length > 0
		if (isLkPreviewMissing) {
			ValUtil.throwArNmKeyMissingInJoParam(joParam, "nmContent")
		}
		joParam = JsonUtil.removeParams(joParam, "qtLike", "qtFavorite", "qtConversion", "idContent", "qtView", "qtEval",
			"vlEval")

		if (joParam.isPlaybook == undefined) {
			joParam.isPlaybook = true
		}

		if (joParam.idCtContent == undefined) {
			joParam.idCtContent = CtContent.text.key
		}

		joParam.dhPublish = new Date()
		const userBsn = new UserBsn(this.t)
		joParam.idPublisher = joParam.idPublisher || joParam.idUserScope
		joParam.qtView = 1

		if (joParam.idPublisher != joParam.idUserScope) {
			joParam.idUserInNetworkSpecific = joParam.idPublisher
			const userPublisher = await userBsn.getArUserNetwork(joParam)
			if (!userPublisher || userPublisher.length == 0) {
				throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
			}
			joParam.idPublisher = userPublisher[0].idUser
		}

		const canPostSeContent = await userBsn.canPostSeContent(joParam.idUserScope, undefined, joParam.isPlaybook)
		if (!canPostSeContent) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}

		const contentBsn = new ContentBsn(this.t)
		joParam = await this.maybeOverrideFromLkPreview(joParam)

		joParam.piContent = await this.maybeOverridePiContent(joParam)

		let content: any = await contentBsn.upsert(joParam)
		if (!content) {
			throw new HExcep({ ctStatus: CtError.insertProblem, dsConsole: "It was not possible to insert: content" })
		}

		await this.relinkContentChannel(joParam, content)

		if (joParam.idUserScope) {
			const userContentBsn = new UserContentBsn(this.t)
			await userContentBsn.getSert({ idUser: joParam.idUserScope, idContent: content.idContent })
			await userContentBsn.addView({ idUser: joParam.idUserScope, idContent: content.idContent })
			await userContentBsn.addConversion({ idUser: joParam.idUserScope, idContent: content.idContent })
		}
		await contentBsn.addConversion(content)
		content = await contentBsn.get1(+content.idContent, joParam.idUserScope, true)
		return new HPlusStatus({ joResult: content })
	}

	private async maybeOverrideFromLkPreview(joParam: any) : Promise<any> {
		if (joParam.lkPreview) {
			const contentBsn = new ContentBsn(this.t)
			const previewSvc = new PreviewSvc(this.req, this.res, this.t);
			const iStatusP = await previewSvc.get(joParam);
			joParam = contentBsn.turnPreviewIntoContent(iStatusP, joParam);
			if (!joParam.nmContent) {
				throw new HExcep({ ctStatus: CtExcep.failedToRetrieveLinkData });
			}
		}
		return joParam;
	}

	private async maybeOverridePiContent(joParam: { piContent: string, lkFile: string }) : Promise<string> {
		if (joParam.piContent) {
			return joParam.piContent
		}
		let nmFile = Env.piContentDefault()
		if (!joParam.piContent && joParam.lkFile) {
			const fileSvc = new FileSvc(this.req, this.res, this.t)
			try {
				const iStatusF = await fileSvc.post(joParam)
				nmFile = iStatusF.joResult.nmFile
			} catch (e) {}
			return nmFile
		}
		return nmFile
	}

	public async relinkContentChannel(joParam: any, content: any): Promise<HStatus> {
		let iStatusCCh = new HStatus()
		if (joParam.arIdChannel) {
			const joParamContentChannel = {
				idUserScope: joParam.idUserScope,
				idContent: content.idContent,
				arIdChannel: joParam.arIdChannel
			}
			const contentChannelSvc = new ContentChannelSvc(this.req, this.res, this.t);
			iStatusCCh = await contentChannelSvc.relinkContent(joParamContentChannel);
		}
		return iStatusCCh
	}

	public async delete(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idContent")

		const contentBsn = new ContentBsn(this.t)
		let content: any = await contentBsn.get1(+joParam.idContent, joParam.idUserScope, true)
		if (!content) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}

		const userBsn = new UserBsn(this.t)
		const canPostSeContent = await userBsn.canPostSeContent(joParam.idUserScope, content.isPlaybook, joParam.isPlaybook)
		if (!canPostSeContent) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}

		const isContentAdmin = await contentBsn.isContentAdmin(content, joParam.idUserScope, canPostSeContent)
		if (!isContentAdmin) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}
		const joParamDelete = {
			idContent: joParam.idContent,
			isActive: false
		}
		content = await contentBsn.upsert(joParamDelete)

		return new HPlusStatus({})
	}

	public async put(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idContent")
		joParam = JsonUtil.removeParams(joParam, "qtLike", "qtFavorite", "qtConversion", "dhUpdate", "dhPublish", "qtEval",
			"vlEval")
		const userBsn = new UserBsn(this.t)
		const canInteract = userBsn.canInteractWithUser(joParam.idUserScope, joParam.idPublisher)
		if (!canInteract) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}
		joParam.idPublisher = joParam.idPublisher || joParam.idUserScope

		const contentBsn = new ContentBsn(this.t)
		let content: any = await contentBsn.get1(+joParam.idContent, joParam.idUserScope, true)
		if (!content) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}

		const canPostSeContent = await userBsn.canPostSeContent(joParam.idUserScope, content.isPlaybook, joParam.isPlaybook)
		if (!canPostSeContent) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}

		const isContentAdmin = await contentBsn.isContentAdmin(content, joParam.idUserScope, canPostSeContent)
		if (!isContentAdmin) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}

		const iStatusCCh = await this.relinkContentChannel(joParam, content)

		if (joParam.shNotifyUpdate) {
			joParam.dhUpdate = contentBsn.getDhUpdate({ shNotifyUpdate: joParam.shNotifyUpdate, dhUpdate: content.dhUpdate })
			joParam.dhLastConversion = joParam.dhUpdate
			const userContentBsn = new UserContentBsn(this.t)
			await userContentBsn.getSert({ idUser: joParam.idUserScope, idContent: content.idContent })
			await userContentBsn.addView({ idUser: joParam.idUserScope, idContent: content.idContent })
			await userContentBsn.addConversion({ idUser: joParam.idUserScope, idContent: content.idContent })
			await contentBsn.addConversion(content)
		}
		content = await contentBsn.upsert(joParam)
		return new HPlusStatus({ joResult: content })
	}

	public async publishPackage(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "lkPlatformProfile")
		const userBsn = new UserBsn(this.t)
		const user = await userBsn.getUserLogged(joParam, true)
		ContentPublishEmailBsn.sendToAdminNewPublishPackageEmail(user, joParam.lkPlatformProfile)
		return new HPlusStatus({})
	}
}
