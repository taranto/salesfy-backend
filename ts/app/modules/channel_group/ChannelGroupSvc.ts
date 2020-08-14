import { LayerService } from "app/layers_template/LayerService";
import { Request, Response } from "express";
import { HStatus } from "app/util/status/HStatus";
import { ValUtil } from "app/util/ValUtil";
import { HExcep } from "app/util/status/HExcep";
import { KeyEnum, CtExcep } from "salesfy-shared";
import { ChannelGroupBsn } from "app/modules/channel_group/ChannelGroupBsn";
import { ChannelBsn } from "app/modules/channel/ChannelBsn";
import { UserGroupBsn } from "app/modules/user_group/UserGroupBsn";
import { UserBsn } from "app/modules/user/UserBsn";

export class ChannelGroupSvc extends LayerService {

	public async post(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idUserScope", "idGroup", "idChannel")
		delete joParam.idChannelGroup
		const channelBsn = new ChannelBsn(this.t)
		const channel = await channelBsn.get1(joParam.idChannel, joParam.idUserScope)
		if (!channel) {
			throw new HExcep({ ctStatus:CtExcep.userNotAuthorized })
		}
		const userBsn = new UserBsn(this.t)
		const canPostSeChannel = await userBsn.canPostSeChannel(joParam.idUserScope, undefined, channel.isPlaybook)
		const isChannelAdmin = await channelBsn.isChannelAdmin2(channel, joParam.idUserScope, canPostSeChannel)
		const userGroupBsn = new UserGroupBsn(this.t)
		const isUserGroupAdmin = await userGroupBsn.isUserGroupAdmin(joParam.idGroup, joParam.idUserScope)
		if (!isUserGroupAdmin || !isChannelAdmin) {
			throw new HExcep({ ctStatus:CtExcep.userNotAuthorized })
		}
		const channelGroupBsn = new ChannelGroupBsn(this.t)
		const joParamToInsert = { idGroup: joParam.idGroup, idChannel: joParam.idChannel }
		const arChannelGroup = await channelGroupBsn.get(joParamToInsert)
		if (arChannelGroup.length > 0) {
			throw new HExcep({ ctStatus:CtExcep.nmKeyAlreadyExists, joExtraContent: { nmKey: KeyEnum.bond } })
		}
		let channelGroup = await channelGroupBsn.post(joParamToInsert)
		channelGroup = await channelGroupBsn.get1(+channelGroup.idChannelGroup, joParam.idUserScope)
		return new HStatus({ joResult:channelGroup })
	}

	public async get(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idUserScope")
		const channelGroupBsn = new ChannelGroupBsn(this.t)
		const arChannelGroup = await channelGroupBsn.get(joParam)
		return new HStatus({ joResult:arChannelGroup })
	}

	public async getChannelGroupAllGroups(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idUserScope", "idChannel")
		joParam.isAllGroups = true
		const channelGroupBsn = new ChannelGroupBsn(this.t)
		const arChannelGroup = await channelGroupBsn.get(joParam)
		return new HStatus({ joResult:arChannelGroup })
	}

	public async delete(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idUserScope", "idChannelGroup")
		const joParamToDelete = { idChannelGroup: joParam.idChannelGroup }
		const channelGroupBsn = new ChannelGroupBsn(this.t)
		const channelGroup = await channelGroupBsn.get1(joParam.idChannelGroup, joParam.idUserScope)
		if (!channelGroup) {
			throw new HExcep({ ctStatus:CtExcep.nmKeyNotFound, joExtraContent: { nmKey: KeyEnum.bond } })
		}
		const channelBsn = new ChannelBsn(this.t)
		const channel = await channelBsn.get1(channelGroup.idChannel, joParam.idUserScope)
		const userBsn = new UserBsn(this.t)
		const canPostSeChannel = await userBsn.canPostSeChannel(joParam.idUserScope, undefined, channel.isPlaybook)
		const isChannelAdmin = await channelBsn.isChannelAdmin2(channel, joParam.idUserScope, canPostSeChannel)
		const userGroupBsn = new UserGroupBsn(this.t)
		const isUserGroupAdmin = await userGroupBsn.isUserGroupAdmin(joParam.idGroup, joParam.idUserScope)
		if (!isUserGroupAdmin && !isChannelAdmin) {
			throw new HExcep({ ctStatus:CtExcep.userNotAuthorized })
		}
		await channelGroupBsn.delete(joParamToDelete)
		return new HStatus({ })
	}

	public async relink(joParam: any): Promise<HStatus> {
		const channelGroupBsn = new ChannelGroupBsn(this.t)
		channelGroupBsn.relinkJoParamValKeys(joParam)
		const arIdGroup: any = []
		const arIdChannel: any = []
		if (joParam.arIdGroup) arIdGroup.push(...joParam.arIdGroup)
		if (joParam.idGroup) arIdGroup.push(joParam.idGroup)
		if (joParam.arIdChannel) arIdChannel.push(...joParam.arIdChannel)
		if (joParam.idChannel) arIdChannel.push(joParam.idChannel)
		const arJoParamAdd = channelGroupBsn.relinkToAdd(
			joParam.idUserScope, arIdChannel, arIdGroup, joParam.arChannelGroup)
		const arJoParamDel = channelGroupBsn.relinkToDelete(
			joParam.idUserScope, arIdChannel, arIdGroup, joParam.arChannelGroup)
		const joResult: any[] = []
		if (arJoParamAdd && arJoParamAdd.length > 0) {
			await Promise.all(arJoParamAdd.map(async (joParamAdd: any) => {
				const joParamChannelGroup = {
					idUserScope: joParam.idUserScope,
					idGroup: joParamAdd.idGroup,
					idChannel: joParamAdd.idChannel
				}
				const iStatusChG = await this.post(joParamChannelGroup)
				joResult.push(iStatusChG.joResult)
			}))
		}
		if (arJoParamDel && arJoParamDel.length > 0) {
			await Promise.all(arJoParamDel.map(async (joParamDel: any) => {
				const joParamChannelGroup = {
					idUserScope: joParam.idUserScope,
					idChannelGroup: joParamDel.idChannelGroup,
				}
				const iStatusChG = await this.delete(joParamChannelGroup)
			}))
		}
		return new HStatus({ joResult: joResult })
	}

	public async relinkChannel(joParam: any): Promise<HStatus> {
		const channelGroupBsn = new ChannelGroupBsn(this.t)
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idUserScope", "idChannel", "arIdGroup")
		const iStatusC = await this.get({ idUserScope: joParam.idUserScope, idChannel: joParam.idChannel })
		const arChannelGroup = iStatusC.joResult
		const joParamRelink = {
			idUserScope: joParam.idUserScope,
			idChannel: joParam.idChannel,
			arIdGroup: joParam.arIdGroup,
			arChannelGroup: arChannelGroup
		}
		const iStatus = this.relink(joParamRelink)
		return iStatus
	}
}
