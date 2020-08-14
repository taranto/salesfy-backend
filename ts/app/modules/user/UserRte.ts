import { Application, Request, Response } from "express";
import { LayerRoutes } from "./../../layers_template/LayerRoutes";
import { RoutesEnum } from "salesfy-shared";
import { UserSvc } from "app/modules/user/UserSvc";

export class UserRte extends LayerRoutes {

	constructor(app: Application) {
		super(app)
		app.get(RoutesEnum.user, (req: Request, res: Response) => {
			const svc = new UserSvc()
			this.execAuthRte(req, res, svc, svc.get)
		})

		app.get(RoutesEnum.userMe, (req: Request, res: Response) => {
			const svc = new UserSvc()
			this.execAuthRte(req, res, svc, svc.getUserLogged)
		})

		app.get(RoutesEnum.userNetwork, async (req: Request, res: Response) => {
			const svc = new UserSvc()
			this.execAuthRte(req, res, svc, svc.getInUserNetwork)
		})

		app.put(RoutesEnum.user, (req: Request, res: Response) => {
			const svc = new UserSvc()
			this.execAuthRte(req, res, svc, svc.put)
		})
	}
}
