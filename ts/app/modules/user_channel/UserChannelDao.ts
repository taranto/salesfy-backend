import { LayerDao } from "../../layers_template/LayerDao";
import { IContent, IUserChannel, SConst } from "salesfy-shared";
import { Transaction } from "sequelize";
import { Content } from "app/modules/content/Content";
import { UserChannel } from "app/modules/user_channel/UserChannel";
import { DaoUtil } from "app/util/DaoUtil";

export class UserChannelDao extends LayerDao<UserChannel, IUserChannel> {

	constructor(t: Transaction) {
		super(t)
	}

	public async upsert(joParam: any): Promise<IUserChannel> {
		const result = await super.upsert(UserChannel, joParam)
		return result
	}

	public async addConversion(idChannel: number, idUser: number, dhLastConversion : Date): Promise<IUserChannel> {
		const result = await this.doOpCustom(UserChannel,
			`qtConversion = qtConversion+1, dhLastConversion = ${DaoUtil.toPsqlDateMethod(dhLastConversion)}`,
			`idChannel = ${idChannel} and idUser = ${idUser}`)
		return result[0]
	}

	public async get(joParam: { idUser?: number, idChannel?: number }): Promise<IUserChannel[]> {
		const base = `select ${DaoUtil.getCsNmField(UserChannel.getArNmField(), "uc", true)}
			from userChannel uc where true `
		const dsUserFilter = joParam.idUser != undefined ? ` and idUser = ${joParam.idUser}` : ""
		const dsChannelFilter = joParam.idChannel != undefined ? ` and idChannel = ${joParam.idChannel}` : ""
		const query = base + dsUserFilter + dsChannelFilter
		const userChannels = await this.query(query)
		return userChannels
	}
}
