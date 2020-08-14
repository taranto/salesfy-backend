import { Application, Request, Response } from "express";
import { RoutesEnum } from "salesfy-shared";
import { LayerRoutes } from "app/layers_template/LayerRoutes";
import { UserContentSvc } from "app/modules/user_content/UserContentSvc";

export class UserContentRte extends LayerRoutes {

	constructor(app: Application) {
		super(app)
		app.put(RoutesEnum.userContent, (req: Request, res: Response) => {
			const svc = new UserContentSvc()
			this.execAuthRte(req, res, svc, svc.put)
		})
	}
}
