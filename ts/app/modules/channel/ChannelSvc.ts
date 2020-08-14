import { LayerService } from "app/layers_template/LayerService";
import { Request, Response } from "express";
import { HStatus } from "app/util/status/HStatus";
import { ChannelBsn } from "app/modules/channel/ChannelBsn";
import { ValUtil } from "app/util/ValUtil";
import { ChannelEmailBsn } from "app/modules/channel/ChannelEmailBsn";
import { UserBsn } from "app/modules/user/UserBsn";
import { HExcep } from "app/util/status/HExcep";
import { KeyEnum, JsonUtil, IContent, IChannel, GeneralUtil, CtExcep } from "salesfy-shared";
import { ContentBsn } from "app/modules/content/ContentBsn";
import { ContentChannelBsn } from "app/modules/content_channel/ContentChannelBsn";
import { Log } from "app/structure/Log";
import { AuthGDriveBsn } from "app/modules/auth/AuthGDriveBsn";
import { ContentSvc } from "app/modules/content/ContentSvc";
import { ContentChannelSvc } from "app/modules/content_channel/ContentChannelSvc";
import { ChannelGroupSvc } from "app/modules/channel_group/ChannelGroupSvc";

export class ChannelSvc extends LayerService {

	constructor(req?: Request, res?: Response) {
		super(req, res)
	}

	public async get(joParam: any): Promise<HStatus> {
		if (joParam.dsSearch != undefined && joParam.nmChannel == undefined) { //apiquickfix 20190723
			joParam.nmChannel = joParam.dsSearch
		}
		const channelBsn = new ChannelBsn(this.t)
		const channels = await channelBsn.get(joParam)
		return new HStatus({ joResult: channels })
	}

	public async stories(joParam: any): Promise<HStatus> {
		const channelBsn = new ChannelBsn(this.t)
		const channels = await channelBsn.stories(joParam)
		return new HStatus({ joResult: channels })
	}

	public async import(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idChannel", "arJoFile")
		const channelBsn = new ChannelBsn(this.t)
		const channel = await channelBsn.get1(joParam.idChannel, joParam.idUserScope)
		if (!channel) {
			throw new HExcep({ ctStatus:CtExcep.userNotAuthorized })
		}
		const userBsn = new UserBsn(this.t)
		const canPostSeChannel = await userBsn.canPostSeChannel(joParam.idUserScope, undefined, channel.isPlaybook)
		const isChannelAdmin = await channelBsn.isChannelAdmin2(channel, joParam.idUserScope, canPostSeChannel)
		if (!isChannelAdmin) {
			throw new HExcep({ ctStatus:CtExcep.userNotAuthorized })
		}

		const sfyDrive = new AuthGDriveBsn(this.t)
		const arJoFileNormalized = sfyDrive.normalizeArJoFileData(joParam.arJoFile)
		const joToMerge = {
			idUserLogged : joParam.idUserLogged,
			idUserScope : joParam.idUserScope,
			isPlaybook : true
		}
		const arJoFileBsnIncremented = JsonUtil.mergeToAll(arJoFileNormalized, joToMerge)

		const contentSvc = new ContentSvc(this.req, this.res, this.t)
		const contentChannelSvc = new ContentChannelSvc(this.req, this.res, this.t)
		await Promise.all(arJoFileBsnIncremented.map(async (joFile: any) => {
			const hStatusDriveContent = await contentSvc.post(joFile)
			const driveContent = hStatusDriveContent.joResult
			const joParamContentChannel = {
				idChannel: joParam.idChannel,
				idContent: driveContent.idContent,
				idUserLogged : joParam.idUserLogged,
				idUserScope : joParam.idUserScope
			}
			const contentChannel = await contentChannelSvc.post(joParamContentChannel)
		}))

		return new HStatus({})
	}

	public async copy(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idChannel")
		const channelBsn = new ChannelBsn(this.t)
		const channel = await channelBsn.get1(joParam.idChannel, joParam.idUserScope)
		if (!channel) {
			throw new HExcep({ ctStatus:CtExcep.userNotAuthorized })
		}
		const joParamPostChannel = {
			...channel,
			...joParam,
			idPublisher: joParam.idUserScope,
			isPlaybook: true
		}
		const hStatus = await this.post(joParamPostChannel)
		const channelCopy: IChannel = hStatus.joResult

		const joParamGetContent = JsonUtil.filterJoKeys(joParam, "idUserScope", "idUserLogged", "idChannel")
		const contentBsn = new ContentBsn(this.t)
		const arContent = await contentBsn.get(joParamGetContent)

		const joContentOverrideValues = {
			qtLike: 0,
			qtFavorite: 0,
			qtView: 0,
			qtConversion: 0,
			isPlaybook: true,
			idPublisher: joParam.idUserScope
		}

		const joParamContentCopy = {
			joParamOverride: joContentOverrideValues
		}

		const contentChannelBsn = new ContentChannelBsn(this.t)

		await Promise.all(arContent.map(async (content) => {
			const contentCopy = await contentBsn.copy(content, joParamContentCopy)
			const joParamContentChannel = {
				idChannel: channelCopy.idChannel,
				idContent: contentCopy.idContent
			}
			const contentChannel = await contentChannelBsn.post(joParamContentChannel)
		}))

		return hStatus
	}

	public async post(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "nmChannel")
		joParam = JsonUtil.filterJoKeys(joParam, "nmChannel", "piChannel", "dsChannel", "piIcon", "isPlaybook",
			"idUserScope", "idUserLogged", "idPublisher", "idCtChannelView", "arIdGroup")

		const userBsn = new UserBsn(this.t)
		const canInteract = userBsn.canInteractWithUser(joParam.idUserScope, joParam.idPublisher)
		if (!canInteract) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}
		joParam.idPublisher = joParam.idPublisher || joParam.idUserScope

		const canPostSeChannel = await userBsn.canPostSeChannel(joParam.idUserScope, undefined, joParam.isPlaybook)
		if (!canPostSeChannel) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}

		const channelBsn = new ChannelBsn(this.t)
		let channel = await channelBsn.post(joParam)

		await this.relinkChannelGroup(joParam, channel)

		// ChannelEmailBsn.sendToAdminNewChannelEmail(channel, user)
		channel = await channelBsn.get1(+channel.idChannel, joParam.idUserScope)
		return new HStatus({ joResult: channel })
	}

	public async put(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idChannel")

		const userBsn = new UserBsn(this.t)

		if (joParam.idPublisher == undefined) {
			joParam.idPublisher = joParam.idUserScope
		}
		if (joParam.idPublisher != joParam.idUserScope) {
			joParam.idUserInNetworkSpecific = joParam.idPublisher
			const userPublisher = await userBsn.getArUserNetwork(joParam)
			if (!userPublisher || userPublisher.length == 0) {
				throw new HExcep({ ctStatus:CtExcep.userNotAuthorized })
			}
			joParam.idPublisher = userPublisher[0].idUser
		}

		const channelBsn = new ChannelBsn(this.t)
		let channel: any = await channelBsn.get1(+joParam.idChannel, joParam.idUserScope)
		if (!channel) {
			throw new HExcep({ ctStatus:CtExcep.userNotAuthorized })
		}

		const canPostSeChannel = await userBsn.canPostSeChannel(joParam.idUserScope, channel.isPlaybook, joParam.isPlaybook)
		if (!canPostSeChannel) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}

		const isChannelAdmin = await channelBsn.isChannelAdmin2(channel, joParam.idUserScope, canPostSeChannel)
		if (!isChannelAdmin) {
			throw new HExcep({ ctStatus:CtExcep.userNotAuthorized })
		}

		await this.relinkChannelGroup(joParam, channel)

		channel = await channelBsn.put(joParam)
		return new HStatus({ joResult: channel })
	}

	public async relinkChannelGroup(joParam: any, channel: any): Promise<HStatus> {
		let iStatusChG = new HStatus()
		if (joParam.arIdGroup != undefined) {
			const joParamChannelGroup = {
				idUserScope: joParam.idUserScope,
				idChannel: channel.idChannel,
				arIdGroup: joParam.arIdGroup
			}
			const channelGroupSvc = new ChannelGroupSvc(this.req, this.res, this.t);
			iStatusChG = await channelGroupSvc.relinkChannel(joParamChannelGroup);
		}
		return iStatusChG
	}

	public async delete(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idChannel")
		const channelBsn = new ChannelBsn(this.t)
		const channel: any = await channelBsn.get1(+joParam.idChannel, joParam.idUserScope)
		if (!channel) {
			throw new HExcep({ ctStatus:CtExcep.userNotAuthorized })
		}
		const userBsn = new UserBsn(this.t)
		const canPostSeChannel = await userBsn.canPostSeChannel(joParam.idUserScope, channel.isPlaybook, joParam.isPlaybook)
		if (!canPostSeChannel) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}
		const isChannelAdmin = await channelBsn.isChannelAdmin2(channel, joParam.idUserScope, canPostSeChannel)
		if (!isChannelAdmin) {
			throw new HExcep({ ctStatus:CtExcep.userNotAuthorized })
		}
		await channelBsn.delete(joParam)
		return new HStatus({})
	}
}
