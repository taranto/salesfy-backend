import { LayerRoutes } from "app/layers_template/LayerRoutes";
import { Application, Request, Response } from "express";
import { RoutesEnum } from "salesfy-shared";
import { UserTagSvc } from "app/modules/user_tag/UserTagSvc";

export class UserTagRte extends LayerRoutes {

	constructor(app: Application) {
		super(app)

		app.post(RoutesEnum.userTag, (req: Request, res: Response) => {
			const svc = new UserTagSvc()
			this.execAuthRte(req, res, svc, svc.post)
		})

		app.delete(RoutesEnum.userTag, (req: Request, res: Response) => {
			const svc = new UserTagSvc()
			this.execAuthRte(req, res, svc, svc.delete)
		})

		app.get(RoutesEnum.userTag, (req: Request, res: Response) => {
			const svc = new UserTagSvc()
			this.execAuthRte(req, res, svc, svc.get)
		})
	}
}
