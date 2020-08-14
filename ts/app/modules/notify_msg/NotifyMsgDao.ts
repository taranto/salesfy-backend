import { LayerDao } from "app/layers_template/LayerDao";
import { Transaction } from "app/structure/DbConn";
import { INotifyMsg } from "salesfy-shared";
import { NotifyMsg } from "app/modules/notify_msg/NotifyMsg";
import { DaoUtil } from "app/util/DaoUtil";

export class NotifyMsgDao extends LayerDao<NotifyMsg, INotifyMsg> {

	constructor(t: Transaction) {
		super(t);
	}

	public async get(joParam: any): Promise<INotifyMsg[]> {
		const query = `select ${DaoUtil.getCsNmField(NotifyMsg.getArNmField(), "notifyMsg", true)}
			from notifyMsg
			where true
			and
			ctSystem = ${joParam.ctSystem}
			and (
				(dhStart <= now() or dhStart is null)
				and
				(dhEnd >= now() or dhEnd is null)
			)
			order by snVersionMax`
		const result = await this.query(query)
		return result
	}
}
