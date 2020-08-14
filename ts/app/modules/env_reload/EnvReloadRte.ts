import { Application, Request, Response } from "express";
import { LayerRoutes } from "./../../layers_template/LayerRoutes";
import { RoutesEnum } from "salesfy-shared";
import { EnvReloadSvc } from "app/modules/env_reload/EnvReloadSvc";

export class EnvReloadRte extends LayerRoutes {

	constructor(app: Application) {
		super(app)

		app.get(RoutesEnum.envReload, (req: Request, res: Response) => {
			const svc = new EnvReloadSvc()
			this.execAuthRte(req, res, svc, svc.reload)
		})
	}
}
