import { LayerRoutes } from "app/layers_template/LayerRoutes";
import { Application, Request, Response } from "express";
import { RoutesEnum } from "salesfy-shared";
import { ChannelSvc } from "app/modules/channel/ChannelSvc";
import { GroupSvc } from "app/modules/group/GroupSvc";

export class GroupRte extends LayerRoutes {

	constructor(app: Application) {
		super(app)

		app.post(RoutesEnum.group, (req: Request, res: Response) => {
			const svc = new GroupSvc()
			this.execAuthRte(req, res, svc, svc.post)
		})
		app.get(RoutesEnum.group, (req: Request, res: Response) => {
			const svc = new GroupSvc()
			this.execAuthRte(req, res, svc, svc.get)
		})
		app.put(RoutesEnum.group, (req: Request, res: Response) => {
			const svc = new GroupSvc()
			this.execAuthRte(req, res, svc, svc.put)
		})
		app.delete(RoutesEnum.group, (req: Request, res: Response) => {
			const svc = new GroupSvc()
			this.execAuthRte(req, res, svc, svc.delete)
		})

	}
}
