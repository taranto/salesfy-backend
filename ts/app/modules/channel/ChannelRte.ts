import { LayerRoutes } from "app/layers_template/LayerRoutes";
import { Application, Request, Response } from "express";
import { RoutesEnum } from "salesfy-shared";
import { ChannelSvc } from "app/modules/channel/ChannelSvc";

export class ChannelRte extends LayerRoutes {

	constructor(app: Application) {
		super(app)

		app.get(RoutesEnum.channel, (req: Request, res: Response) => {
			const svc = new ChannelSvc()
			this.execAuthRte(req, res, svc, svc.get)
		})

		app.get(RoutesEnum.channelStories, (req: Request, res: Response) => {
			const svc = new ChannelSvc()
			this.execAuthRte(req, res, svc, svc.stories)
		})

		app.post(RoutesEnum.channel, (req: Request, res: Response) => {
			const svc = new ChannelSvc()
			this.execAuthRte(req, res, svc, svc.post)
		})

		app.put(RoutesEnum.channel, (req: Request, res: Response) => {
			const svc = new ChannelSvc()
			this.execAuthRte(req, res, svc, svc.put)
		})

		app.delete(RoutesEnum.channel, (req: Request, res: Response) => {
			const svc = new ChannelSvc()
			this.execAuthRte(req, res, svc, svc.delete)
		})

		app.post(RoutesEnum.channelCopy, (req: Request, res: Response) => {
			const svc = new ChannelSvc()
			this.execAuthRte(req, res, svc, svc.copy)
		})

		app.post(RoutesEnum.channelImport, (req: Request, res: Response) => {
			const svc = new ChannelSvc()
			this.execAuthRte(req, res, svc, svc.import)
		})
	}
}
