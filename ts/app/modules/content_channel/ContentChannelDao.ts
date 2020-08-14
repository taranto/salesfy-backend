import { LayerDao } from "app/layers_template/LayerDao";
import { Transaction } from "app/structure/DbConn";
import { IContentChannel } from "salesfy-shared";
import { ContentChannel } from "app/modules/content_channel/ContentChannel";
import { DaoUtil } from "app/util/DaoUtil";
import { ContentDao } from "app/modules/content/ContentDao";
import { ChannelDao } from "app/modules/channel/ChannelDao";

export class ContentChannelDao extends LayerDao<ContentChannel, IContentChannel> {

	constructor(t: Transaction) {
		super(t);
		// this.select = DaoUtil.toSelect("cch", "idContentChannel", "idChannel", "idContent", "vlSort")
	}

	public async get(joParam: { idContentChannel?: number, idContent?: number, idChannel?: number, idUserScope?: number,
			arIdContent?: number[], arIdChannel?: number[] }) : Promise<IContentChannel[]> {
		const idContentChannelWhere =
			joParam.idContentChannel ? ` and cch.idContentChannel = ${joParam.idContentChannel} ` : ""
		const idChannelWhere = joParam.idChannel ? ` and cch.idChannel = ${joParam.idChannel} ` : ""
		const idContentWhere = joParam.idContent ? ` and cch.idContent = ${joParam.idContent} ` : ""
		const arIdChannelWhere = joParam.arIdChannel != undefined && joParam.arIdChannel.length > 0 ?
			`and ch.idChannel in (${joParam.arIdChannel}) ` : ""
		const arIdContentWhere = joParam.arIdContent != undefined && joParam.arIdContent.length > 0 ?
			`and c.idContent in (${joParam.arIdContent}) ` : ""
		const channelDao = new ChannelDao(this.t)
		const joParamCh : any = joParam
		const chBaseQuery = channelDao.getQuery({ ...joParamCh, isSelectQuoted: false })
		const contentDao = new ContentDao(this.t)
		const cBaseQuery = contentDao.getQuery({ ...joParam, isSelectQuoted: false })

		const query = `select ${DaoUtil.getCsNmField(ContentChannel.getArNmField(), "cch", true)},
			${DaoUtil.toSelect("ch", "nmChannel", "piChannel")},
			${DaoUtil.toSelect("c", "nmContent", "piContent")}
			from contentChannel cch
			join (${chBaseQuery}) ch using(idChannel)
			join (${cBaseQuery}) c using(idContent)
			where true
			${idContentChannelWhere}
			${idChannelWhere}
			${idContentWhere}
			${arIdChannelWhere}
			${arIdContentWhere}`
		const arContentChannel = await this.query(query)
		return arContentChannel
	}

	public async post(joParam: any): Promise<IContentChannel> {
		const result: any = await ContentChannel.create(joParam, { transaction: this.t, returning: true })
			.catch((err:any) => this.defaultCatchError(err))
		const contentChannel: IContentChannel = result.dataValues
		return contentChannel
	}

	public async put(joParam: any): Promise<IContentChannel> {
		const result: any = await ContentChannel.update(joParam,
			{ transaction: this.t, returning: true, where: { idContentChannel: joParam.idContentChannel } })
			.catch((err:any) => this.defaultCatchError(err))
		const contentChannel: IContentChannel = result[1][0].dataValues
		return contentChannel
	}

	public async delete(idContentChannel: number): Promise<void> {
		const result: any = await ContentChannel.destroy(
			{ transaction: this.t, where: { idContentChannel: idContentChannel } }
		)
			.catch((err:any) => this.defaultCatchError(err))
		return
	}
}
