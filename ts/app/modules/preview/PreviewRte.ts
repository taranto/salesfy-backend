import { Application, Request, Response } from "express";
import { RoutesEnum } from "salesfy-shared";
import { LayerRoutes } from "../../layers_template/LayerRoutes";
import { PreviewSvc } from "app/modules/preview/PreviewSvc";

export class PreviewRte extends LayerRoutes {

	constructor(app: Application) {
		super(app)

		app.get(RoutesEnum.preview, (req: Request, res: Response) => {
			const svc = new PreviewSvc()
			this.execRte(req, res, svc, svc.get)
		})

	}
}
