import { LayerRoutes } from "app/layers_template/LayerRoutes";
import { Application, Request, Response } from "express";
import { RoutesEnum } from "salesfy-shared";
import { UserGroupSvc } from "app/modules/user_group/UserGroupSvc";

export class UserGroupRte extends LayerRoutes {

	constructor(app: Application) {
		super(app)

		app.post(RoutesEnum.userGroup, (req: Request, res: Response) => {
			const svc = new UserGroupSvc()
			this.execAuthRte(req, res, svc, svc.post)
		})

		app.delete(RoutesEnum.userGroup, (req: Request, res: Response) => {
			const svc = new UserGroupSvc()
			this.execAuthRte(req, res, svc, svc.delete)
		})

		app.get(RoutesEnum.userGroup, (req: Request, res: Response) => {
			const svc = new UserGroupSvc()
			this.execAuthRte(req, res, svc, svc.get)
		})

		app.put(RoutesEnum.userGroup, (req: Request, res: Response) => {
			const svc = new UserGroupSvc()
			this.execAuthRte(req, res, svc, svc.put)
		})
	}
}
