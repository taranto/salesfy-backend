import { LayerRoutes } from "app/layers_template/LayerRoutes";
import { Application, Request, Response } from "express";
import { RoutesEnum } from "salesfy-shared";
import { TagSvc } from "app/modules/tag/TagSvc";

export class TagRte extends LayerRoutes {

	constructor(app: Application) {
		super(app)

		app.get(RoutesEnum.tag, (req: Request, res: Response) => {
			const svc = new TagSvc()
			this.execRte(req, res, svc, svc.get)
		})
	}
}
