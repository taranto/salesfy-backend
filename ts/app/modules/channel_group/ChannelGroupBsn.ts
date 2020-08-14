import { LayerBusiness } from "app/layers_template/LayerBusiness";
import { UserGroupDao } from "app/modules/user_group/UserGroupDao";
import { IUserGroup, KeyEnum, IChannelGroup, CtError, CtWarn } from "salesfy-shared";
import { ValUtil } from "app/util/ValUtil";
import { ChannelGroupDao } from "app/modules/channel_group/ChannelGroupDao";
import { HError } from "app/util/status/HError";
import { HExcep } from "app/util/status/HExcep";

export class ChannelGroupBsn extends LayerBusiness {

	public async get(joParam: any): Promise<IChannelGroup[]> {
		const channelGroupDao = new ChannelGroupDao(this.t)
		const channelGroup = await channelGroupDao.get(joParam)
		return channelGroup
	}

	public async post(joParam: any): Promise<IChannelGroup> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idGroup", "idChannel")
		delete joParam.idChannelGroup
		const channelGroupDao = new ChannelGroupDao(this.t)
		const channelGroup = await channelGroupDao.post(joParam)
		return channelGroup
	}

	public async delete(joParam: any): Promise<void> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idChannelGroup")
		const channelGroupDao = new ChannelGroupDao(this.t)
		await channelGroupDao.delete(joParam)
	}

	public async get1(idChannelGroup: number, idUserScope?: number): Promise<IChannelGroup> {
		const arContent = await this.get({ idChannelGroup: idChannelGroup, idUserScope: idUserScope })
		if (arContent.length > 1) {
			throw new HError({ ctStatus:CtError.parametersAreMissing })
		}
		return arContent[0]
	}

	public relinkJoParamValKeys(joParam: any) : void {
		super.relinkJoParamValKeysGeneric(joParam,
			["idGroup", "arIdChannel"],
			["idChannel", "arIdGroup"],
			["arIdGroup", "arIdChannel"],
			["idChannel", "idGroup"]
		)
	}

	public relinkToDelete(idUserScope: number, arIdChannel: number[], arIdGroup: number[], arChannelGroup: any)
		: any[] {
		const arJoParamDel: any[] = []
		arChannelGroup.forEach((channelGroup: IChannelGroup) => {
			const isChannelFound = arIdChannel.indexOf(channelGroup.idChannel) != -1
			const isGroupFound = arIdGroup.indexOf(channelGroup.idGroup) != -1
			if (!isGroupFound || !isChannelFound) {
				arJoParamDel.push({ idUserScope: idUserScope, idChannelGroup: channelGroup.idChannelGroup })
			}
		})
		return arJoParamDel
	}

	public relinkToAdd(idUserScope: number, arIdChannel: number[], arIdGroup: number[], arChannelGroup: any)
		: any[] {
		const arJoParamAdd: any[] = []
		arIdChannel.forEach((idChannel: number) => {
			arIdGroup.forEach((idGroup: number) => {
				let isLinkFound = false;
				arChannelGroup.forEach((channelGroup: IChannelGroup) => {
					isLinkFound = isLinkFound || (channelGroup.idChannel == idChannel && channelGroup.idGroup == idGroup)
				})
				if (!isLinkFound) {
					arJoParamAdd.push({ idUserScope: idUserScope, idChannel: idChannel, idGroup: idGroup })
				}
			})
		})
		return arJoParamAdd
	}
}
