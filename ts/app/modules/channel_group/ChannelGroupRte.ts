import { LayerRoutes } from "app/layers_template/LayerRoutes";
import { Application, Request, Response } from "express";
import { RoutesEnum } from "salesfy-shared";
import { ChannelGroupSvc } from "app/modules/channel_group/ChannelGroupSvc";

export class ChannelGroupRte extends LayerRoutes {

	constructor(app: Application) {
		super(app)

		app.post(RoutesEnum.channelGroup, (req: Request, res: Response) => {
			const svc = new ChannelGroupSvc()
			this.execAuthRte(req, res, svc, svc.post)
		})

		app.delete(RoutesEnum.channelGroup, (req: Request, res: Response) => {
			const svc = new ChannelGroupSvc()
			this.execAuthRte(req, res, svc, svc.delete)
		})

		app.get(RoutesEnum.channelGroup, (req: Request, res: Response) => {
			const svc = new ChannelGroupSvc()
			this.execAuthRte(req, res, svc, svc.get)
		})

		app.get(RoutesEnum.channelGroupAllGroups, (req: Request, res: Response) => {
			const svc = new ChannelGroupSvc()
			this.execAuthRte(req, res, svc, svc.getChannelGroupAllGroups)
		})
	}
}
