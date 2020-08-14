import { LayerRoutes } from "app/layers_template/LayerRoutes";
import { Application, Request, Response } from "express";
import { RoutesEnum } from "salesfy-shared";
import { ContentChannelSvc } from "app/modules/content_channel/ContentChannelSvc";

export class ContentChannelRte extends LayerRoutes {

	constructor(app: Application) {
		super(app)

		app.post(RoutesEnum.contentChannel, (req: Request, res: Response) => {
			const svc = new ContentChannelSvc()
			this.execAuthRte(req, res, svc, svc.post)
		})

		app.delete(RoutesEnum.contentChannel, (req: Request, res: Response) => {
			const svc = new ContentChannelSvc()
			this.execAuthRte(req, res, svc, svc.delete)
		})

		app.get(RoutesEnum.contentChannel, (req: Request, res: Response) => {
			const svc = new ContentChannelSvc()
			this.execAuthRte(req, res, svc, svc.get)
		})

		app.put(RoutesEnum.contentChannel, (req: Request, res: Response) => {
			const svc = new ContentChannelSvc()
			this.execAuthRte(req, res, svc, svc.put)
		})
	}
}
