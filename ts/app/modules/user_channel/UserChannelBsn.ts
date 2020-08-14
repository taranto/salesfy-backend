import { LayerBusiness } from "app/layers_template/LayerBusiness";
import { IUserChannel } from "salesfy-shared";
import { ValUtil } from "app/util/ValUtil";
import { UserChannelDao } from "app/modules/user_channel/UserChannelDao";
import { HError } from "app/util/status/HError";

export class UserChannelBsn extends LayerBusiness {

	public async get(joParam: any): Promise<IUserChannel[]> {
		const userChannelDao = new UserChannelDao(this.t)
		const userChannels = await userChannelDao.get(joParam)
		return userChannels
	}

	public async upsert(joParam: any): Promise<IUserChannel> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idUser", "idChannel")
		const userChannelDao = new UserChannelDao(this.t)
		const userChannelFinal = await userChannelDao.upsert(joParam)
		return userChannelFinal
	}

	public async userConvertedChannel(joParam: any): Promise<IUserChannel> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idUser", "idChannel")
		const userChannelDao = new UserChannelDao(this.t)
		const joUCh: any = {
			idUser: joParam.idUser,
			idChannel: joParam.idChannel,
			dhLastConversion: new Date()
		}
		await userChannelDao.upsert(joUCh)
		const userChannelFinal = await userChannelDao.addConversion(joUCh.idChannel, joUCh.idUser, joUCh.dhLastConversion)
		return userChannelFinal
	}
}
