import { Application, Request, Response } from "express";
import { LayerRoutes } from "./../../layers_template/LayerRoutes";
import { ContentSvc } from "./ContentSvc";
import { RoutesEnum } from "salesfy-shared";

export class ContentRte extends LayerRoutes {

	constructor(app: Application) {
		super(app)

		app.get(RoutesEnum.content, (req: Request, res: Response) => {
			const svc = new ContentSvc()
			this.execAuthRte(req, res, svc, svc.get)
		})

		app.get(RoutesEnum.contentView, (req: Request, res: Response) => {
			const svc = new ContentSvc()
			this.execAuthRte(req, res, svc, svc.view)
		})

		app.get(RoutesEnum.contentConversion, (req: Request, res: Response) => {
			const svc = new ContentSvc()
			this.execAuthRte(req, res, svc, svc.conversion)
		})

		app.post(RoutesEnum.content, (req: Request, res: Response) => {
			const svc = new ContentSvc()
			this.execAuthRte(req, res, svc, svc.post)
		})

		app.put(RoutesEnum.content, (req: Request, res: Response) => {
			const svc = new ContentSvc()
			this.execAuthRte(req, res, svc, svc.put)
		})

		app.post(RoutesEnum.contentPublishPackage, (req: Request, res: Response) => {
			const svc = new ContentSvc()
			this.execAuthRte(req, res, svc, svc.publishPackage)
		})

		app.delete(RoutesEnum.content, (req: Request, res: Response) => {
			const svc = new ContentSvc()
			this.execAuthRte(req, res, svc, svc.delete)
		})
	}
}
