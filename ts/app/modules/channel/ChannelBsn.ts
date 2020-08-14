import { LayerBusiness } from "app/layers_template/LayerBusiness";
import { IChannel, CtError, CtUserGroupAccess } from "salesfy-shared";
import { ChannelDao } from "app/modules/channel/ChannelDao";
import { BackendUtil } from "app/util/BackendUtil";
import { ValUtil } from "app/util/ValUtil";
import { ChannelGroupDao } from "app/modules/channel_group/ChannelGroupDao";
import { HError } from "app/util/status/HError";

export class ChannelBsn extends LayerBusiness {

	public async get(joParam: any): Promise<IChannel[]> {
		joParam = BackendUtil.defaultDaoListParam(joParam)
		const channelDao = new ChannelDao(this.t)
		const channels = await channelDao.get(joParam)
		return channels
	}

	public async stories(joParam: any): Promise<IChannel[]> {
		const joParamStories = BackendUtil.defaultDaoListParam(joParam)
		const channelDao = new ChannelDao(this.t)
		const channels = await channelDao.getStories(joParam)
		return channels
	}

	public async post(joParam: any): Promise<IChannel> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "nmChannel", "idPublisher")
		const channelDao = new ChannelDao(this.t)
		const channel = await channelDao.post(joParam)
		return channel
	}

	public async put(joParam: any): Promise<IChannel> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idChannel")
		const channelDao = new ChannelDao(this.t)
		const channel = await channelDao.put(joParam)
		return channel
	}

	public async delete(joParam: any): Promise<void> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idChannel")
		const channelDao = new ChannelDao(this.t)
		const joParamDelete = {
			idChannel : joParam.idChannel,
			isActive : false
		}
		await channelDao.put(joParamDelete)
	}

	public isChannelAdmin2(channel: any, idUser: number, canPostSeChannel: boolean): boolean {
		if (!channel) {
			return false
		}
		if (!channel.isPlaybook) {
			return !!canPostSeChannel
		}
		const isChannelPublisher = this.isChannelPublisher2(channel, idUser)
		if (isChannelPublisher) {
			return true
		}
		const isChannelAdmin = CtUserGroupAccess.isUserGroupAdmin(channel.idCtUserGroupAccess)
		return isChannelAdmin
	}

	public isChannelPublisher2(channel: any, idUser: number): boolean {
		const isChannelPublisher = channel.idPublisher == idUser
		return isChannelPublisher
	}

	// /**
	//  * @deprecated
	//  */
	// public async isChannelAdmin(idChannel: number, idUser: number): Promise<boolean> {
	// 	const isChannelOwner = await this.isChannelPublisher(idChannel, idUser)
	// 	if (isChannelOwner) {
	// 		return true
	// 	}
	// 	const channelGroupDao = new ChannelGroupDao(this.t)
	// 	const joParamUserGroupAdmin = {
	// 		idChannel: idChannel,
	// 		idCtUserGroupAccess: CtUserGroupAccess.admin.key,
	// 		idUser: idUser
	// 	}
	// 	const arThisUserChannelAdmin = await channelGroupDao.get(joParamUserGroupAdmin)
	// 	if (arThisUserChannelAdmin.length == 0) {
	// 		return false
	// 	}
	// 	return true
	// }

	// /**
	//  * @deprecated
	//  */
	// public async isChannelPublisher(idChannel: number, idUser: number): Promise<boolean> {
	// 	const channel = await this.get1(idChannel, idUser)
	// 	if (channel == undefined || +channel.idPublisher != idUser) {
	// 		return false
	// 	}
	// 	return true
	// }

	public async get1(idChannel: number, idUserScope?: number): Promise<IChannel> {
		const arContent = await this.get({ idChannel: idChannel, idUserScope: idUserScope})
		if (arContent.length > 1) {
			throw new HError({ ctStatus:CtError.parametersAreMissing })
		}
		return arContent[0]
	}
}
