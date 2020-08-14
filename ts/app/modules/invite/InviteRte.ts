import { Application, Request, Response } from "express";
import { LayerRoutes } from "app/layers_template/LayerRoutes";
import { RoutesEnum } from "salesfy-shared";
import { InviteSvc } from "app/modules/invite/InviteSvc";

export class InviteRte extends LayerRoutes {

	constructor(app: Application) {
		super(app)

		app.post(RoutesEnum.invite, (req: Request, res: Response) => {
			const svc = new InviteSvc()
			this.execAuthRte(req, res, svc, svc.post)
		})
	}
}
