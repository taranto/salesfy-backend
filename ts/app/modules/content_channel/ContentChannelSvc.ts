import { LayerService } from "app/layers_template/LayerService";
import { Request, Response } from "express";
import { HStatus } from "app/util/status/HStatus";
import { ValUtil } from "app/util/ValUtil";
import { UserGroupBsn } from "app/modules/user_group/UserGroupBsn";
import { HExcep } from "app/util/status/HExcep";
import { KeyEnum, CtWarn, CtExcep, IContentChannel, CtUserGroupAccess } from "salesfy-shared";
import { ContentChannelBsn } from "app/modules/content_channel/ContentChannelBsn";
import { ContentBsn } from "app/modules/content/ContentBsn";
import { ChannelBsn } from "app/modules/channel/ChannelBsn";
import { UserBsn } from "app/modules/user/UserBsn";

export class ContentChannelSvc extends LayerService {

	public async post(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idUserScope", "idChannel", "idContent")
		const contentBsn = new ContentBsn(this.t)
		const content = await contentBsn.get1(joParam.idContent, joParam.idUserScope)
		if (!content) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}
		const channelBsn = new ChannelBsn(this.t)
		const channel : any = await channelBsn.get1(joParam.idChannel, joParam.idUserScope)
		if (!channel) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}
		const userBsn = new UserBsn(this.t)
		if (channel.isPlaybook == false || content.isPlaybook == false) {
			const canPostSeChannel = await userBsn.canPostSeChannel(joParam.idUserScope, undefined, channel.isPlaybook)
			const isChannelAdmin = await channelBsn.isChannelAdmin2(channel, joParam.idUserScope, canPostSeChannel)
			if (!isChannelAdmin) {
				throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
			}
		}
		if (channel.idCtUserGroupAccess == CtUserGroupAccess.reader.key && channel.idPublisher != joParam.idUserScope) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}
		const contentChannelBsn = new ContentChannelBsn(this.t)
		let arContentChannel = await contentChannelBsn.get({ idChannel: joParam.idChannel, idContent: joParam.idContent })
		if (arContentChannel && arContentChannel.length > 0) {
			throw new HExcep({ ctStatus: CtExcep.nmKeyAlreadyExists, joExtraContent: { nmKey: KeyEnum.bond } })
		}
		let contentChannel = await contentChannelBsn.post(joParam)
		arContentChannel = await contentChannelBsn.get({ idChannel: joParam.idChannel, idContent: joParam.idContent })
		contentChannel = arContentChannel[0]
		return new HStatus({ joResult: contentChannel })
	}

	public async put(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idUserScope", "idContentChannel", "vlSort")
		const contentChannelBsn = new ContentChannelBsn(this.t)
		let contentChannel = await contentChannelBsn.get1(joParam.idContentChannel, joParam.idUserScope)
		if (!contentChannel) {
			throw new HExcep({ ctStatus: CtExcep.nmKeyNotFound, joExtraContent: { nmKey: KeyEnum.bond } })
		}
		const contentBsn = new ContentBsn(this.t)
		const content = await contentBsn.get1(contentChannel.idContent, joParam.idUserScope)
		if (!content) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}
		const channelBsn = new ChannelBsn(this.t)
		const channel : any = await channelBsn.get1(contentChannel.idChannel, joParam.idUserScope)
		if (!channel) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}
		const userBsn = new UserBsn(this.t)
		if (channel.isPlaybook == false || content.isPlaybook == false) {
			const canPostSeChannel = await userBsn.canPostSeChannel(joParam.idUserScope, undefined, channel.isPlaybook)
			const isChannelAdmin = await channelBsn.isChannelAdmin2(channel, joParam.idUserScope, canPostSeChannel)
			if (!isChannelAdmin) {
				throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
			}
		}
		if (channel.idCtUserGroupAccess == CtUserGroupAccess.reader.key && channel.idPublisher != joParam.idUserScope) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}
		contentChannel = await contentChannelBsn.put(joParam)
		contentChannel = await contentChannelBsn.get1(joParam.idContentChannel, joParam.idUserScope)
		return new HStatus({ joResult: contentChannel })
	}

	public async delete(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idUserScope", "idContentChannel")
		const contentChannelBsn = new ContentChannelBsn(this.t)
		const contentChannel = await contentChannelBsn.get1(joParam.idContentChannel, joParam.idUserScope)
		if (!contentChannel) {
			throw new HExcep({ ctStatus: CtExcep.nmKeyNotFound, joExtraContent: { nmKey: KeyEnum.bond } })
		}
		const contentBsn = new ContentBsn(this.t)
		const content = await contentBsn.get1(contentChannel.idContent, joParam.idUserScope)
		if (!content) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}
		const channelBsn = new ChannelBsn(this.t)
		const channel : any = await channelBsn.get1(contentChannel.idChannel, joParam.idUserScope)
		if (!channel) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}
		const userBsn = new UserBsn(this.t)
		if (channel.isPlaybook == false || content.isPlaybook == false) {
			const canPostSeChannel = await userBsn.canPostSeChannel(joParam.idUserScope, undefined, channel.isPlaybook)
			const isChannelAdmin = await channelBsn.isChannelAdmin2(channel, joParam.idUserScope, canPostSeChannel)
			if (!isChannelAdmin) {
				throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
			}
		}
		if (channel.idCtUserGroupAccess == CtUserGroupAccess.reader.key && channel.idPublisher != joParam.idUserScope) {
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}
		await contentChannelBsn.delete(contentChannel)
		return new HStatus({})
	}

	public async relink(joParam: any): Promise<HStatus> {
		const contentChannelBsn = new ContentChannelBsn(this.t)
		contentChannelBsn.relinkJoParamValKeys(joParam)
		const arIdChannel: any = []
		const arIdContent: any = []
		if (joParam.arIdChannel) arIdChannel.push(...joParam.arIdChannel)
		if (joParam.idChannel) arIdChannel.push(joParam.idChannel)
		if (joParam.arIdContent) arIdContent.push(...joParam.arIdContent)
		if (joParam.idContent) arIdContent.push(joParam.idContent)
		const arJoParamAdd = contentChannelBsn.relinkToAdd(
			joParam.idUserScope, arIdContent, arIdChannel, joParam.arContentChannel)
		const arJoParamDel = contentChannelBsn.relinkToDelete(
			joParam.idUserScope, arIdContent, arIdChannel, joParam.arContentChannel)
		const joResult: any[] = []
		if (arJoParamAdd && arJoParamAdd.length > 0) {
			await Promise.all(arJoParamAdd.map(async (joParamAdd: any) => {
				const joParamContentChannel = {
					idUserScope: joParam.idUserScope,
					idChannel: joParamAdd.idChannel,
					idContent: joParamAdd.idContent
				}
				const iStatusCCh = await this.post(joParamContentChannel)
				joResult.push(iStatusCCh.joResult)
			}))
		}
		if (arJoParamDel && arJoParamDel.length > 0) {
			await Promise.all(arJoParamDel.map(async (joParamDel: any) => {
				const joParamContentChannel = {
					idUserScope: joParam.idUserScope,
					idContentChannel: joParamDel.idContentChannel,
				}
				const iStatusCCh = await this.delete(joParamContentChannel)
			}))
		}
		return new HStatus({ joResult: joResult })
	}

	public async relinkContent(joParam: any): Promise<HStatus> {
		const contentChannelBsn = new ContentChannelBsn(this.t)
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idUserScope", "idContent", "arIdChannel")
		const iStatusC = await this.get({ idUserScope: joParam.idUserScope, idContent: joParam.idContent })
		const arContentChannel = iStatusC.joResult
		const joParamRelink = {
			idUserScope: joParam.idUserScope,
			idContent: joParam.idContent,
			arIdChannel: joParam.arIdChannel,
			arContentChannel: arContentChannel
		}
		const iStatus = this.relink(joParamRelink)
		return iStatus
	}

	public async get(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idUserScope")
		const contentChannelBsn = new ContentChannelBsn(this.t)
		const arContentChannel = await contentChannelBsn.get(joParam)
		return new HStatus({ joResult: arContentChannel })
	}
}
