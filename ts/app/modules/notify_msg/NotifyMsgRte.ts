import { Application, Request, Response } from "express";
import { RoutesEnum } from "salesfy-shared";
import { LayerRoutes } from "../../layers_template/LayerRoutes";
import { NotifyMsgSvc } from "app/modules/notify_msg/NotifyMsgSvc";

export class NotifyMsgRte extends LayerRoutes {

	constructor(app: Application) {
		super(app)

		app.get(RoutesEnum.notifyMsg, (req: Request, res: Response) => {
			const svc = new NotifyMsgSvc()
			this.execRte(req, res, svc, svc.notifyMsg)
		})
	}
}
