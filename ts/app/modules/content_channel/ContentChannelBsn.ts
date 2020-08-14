import { LayerBusiness } from "app/layers_template/LayerBusiness";
import { KeyEnum, IContentChannel, CtError, CtWarn } from "salesfy-shared";
import { ValUtil } from "app/util/ValUtil";
import { HExcep } from "app/util/status/HExcep";
import { ContentChannelDao } from "app/modules/content_channel/ContentChannelDao";
import { HError } from "app/util/status/HError";

export class ContentChannelBsn extends LayerBusiness {

	public async post(joParam: any): Promise<IContentChannel> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idContent", "idChannel")
		delete joParam.idContentChannel
		const contentChannelDao = new ContentChannelDao(this.t)
		const contentChannel = await contentChannelDao.post(joParam)
		return contentChannel
	}

	public async delete(joParam: any): Promise<void> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idContentChannel")
		const contentChannelDao = new ContentChannelDao(this.t)
		await contentChannelDao.delete(joParam.idContentChannel)
		return
	}

	public async get(joParam: any): Promise<IContentChannel[]> {
		const contentChannelDao = new ContentChannelDao(this.t)
		const arContentChannelDao = await contentChannelDao.get(joParam)
		return arContentChannelDao
	}

	public async put(joParam: any): Promise<IContentChannel> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idContentChannel", "vlSort")
		const joParamPut = { idContentChannel: joParam.idContentChannel, vlSort: joParam.vlSort }
		const contentChannelDao = new ContentChannelDao(this.t)
		const contentChannel = await contentChannelDao.put(joParamPut)
		return contentChannel
	}

	public async get1(idContentChannel: number, idUserScope?: number): Promise<IContentChannel> {
		const contentChannelDao = new ContentChannelDao(this.t)
		const arContentChannel = await this.get({ idContentChannel: idContentChannel, idUserScope: idUserScope })
		if (arContentChannel.length > 1) {
			throw new HError({ ctStatus: CtError.parametersAreMissing })
		}
		return arContentChannel[0]
	}

	public relinkJoParamValKeys(joParam: any) : void {
		super.relinkJoParamValKeysGeneric(joParam,
			["idContent", "arIdChannel"],
			["idChannel", "arIdContent"],
			["arIdContent", "arIdChannel"],
			["idChannel", "idContent"],
		)
	}

	public relinkToDelete(idUserScope: number, arIdContent: number[], arIdChannel: number[], arContentChannel: any)
		: any[] {
		const arJoParamDel: any[] = []
		arContentChannel.forEach((contentChannel: IContentChannel) => {
			const isContentFound = arIdContent.indexOf(contentChannel.idContent) != -1
			const isChannelFound = arIdChannel.indexOf(contentChannel.idChannel) != -1
			if (!isContentFound || !isChannelFound) {
				arJoParamDel.push({ idUserScope: idUserScope, idContentChannel: contentChannel.idContentChannel })
			}
		})
		return arJoParamDel
	}

	public relinkToAdd(idUserScope: number, arIdContent: number[], arIdChannel: number[], arContentChannel: any)
		: any[] {
		const arJoParamAdd: any[] = []
		arIdContent.forEach((idContent: number) => {
			arIdChannel.forEach((idChannel: number) => {
				let isLinkFound = false;
				arContentChannel.forEach((contentChannel: IContentChannel) => {
					isLinkFound = isLinkFound || (contentChannel.idContent == idContent && contentChannel.idChannel == idChannel)
				})
				if (!isLinkFound) {
					arJoParamAdd.push({ idUserScope: idUserScope, idContent: idContent, idChannel: idChannel })
				}
			})
		})
		return arJoParamAdd
	}

}
