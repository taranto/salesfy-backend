import { Transaction } from "sequelize";
import { LayerBusiness } from "app/layers_template/LayerBusiness";
import { INotifyMsg, SConst, StringUtil, CtLocale, CtSystem } from "salesfy-shared";
import { NotifyMsgDao } from "app/modules/notify_msg/NotifyMsgDao";

export class NotifyMsgBsn extends LayerBusiness {

	constructor(t: Transaction) {
		super(t);
	}

	public async getNotifyMsgsToShow(joParam: any): Promise<INotifyMsg> {
		const notifyMsgDao = new NotifyMsgDao(this.t)
		const ctSystem = CtSystem.get(joParam.nmCtSystem)
		const joFilterParam = {
			ctSystem : ctSystem.key
		}
		const notifyMsgs = await notifyMsgDao.get(joFilterParam)
		const nrActualFrontVersion = joParam.snVersion
		const notifyMsg = this.isNotifyMsgsDesired(notifyMsgs, nrActualFrontVersion)
		return notifyMsg
	}

	public static getDsLocaleMessage(notifyMsg: INotifyMsg, obCtLocale: any): string {
		let dsMsg = ''
		switch (obCtLocale) {
			case CtLocale.english.keyCtLocale: dsMsg = notifyMsg.dsMsgRawEn; break;
			case CtLocale.english.nmCtLocale: dsMsg = notifyMsg.dsMsgRawEn; break;
			default: dsMsg = notifyMsg.dsMsgRawPt
		}
		return dsMsg
	}

	public isNotifyMsgsDesired(notifyMsgs: INotifyMsg[], snVersionTarget: string): INotifyMsg {
		notifyMsgs = notifyMsgs.filter(notifyMsg => {
			return StringUtil.isVersionBetween(notifyMsg.snVersionMin, notifyMsg.snVersionMax, snVersionTarget)
		})
		return notifyMsgs[0]
	}

}
