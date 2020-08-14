import { Application, Request, Response } from "express";
import { LayerRoutes } from "./../../layers_template/LayerRoutes";
import { RoutesEnum } from "salesfy-shared";
import { WorkspaceSvc } from "app/modules/workspace/WorkspaceSvc";

export class WorkspaceRte extends LayerRoutes {

	constructor(app: Application) {
		super(app)

		app.get(RoutesEnum.workspace, (req: Request, res: Response) => {
			const svc = new WorkspaceSvc()
			this.execAuthRte(req, res, svc, svc.get)
		})

		app.post(RoutesEnum.workspace, (req: Request, res: Response) => {
			const svc = new WorkspaceSvc()
			this.execAuthRte(req, res, svc, svc.post)
		})

		app.put(RoutesEnum.workspace, (req: Request, res: Response) => {
			const svc = new WorkspaceSvc()
			this.execAuthRte(req, res, svc, svc.put)
		})

		app.delete(RoutesEnum.workspace, (req: Request, res: Response) => {
			const svc = new WorkspaceSvc()
			this.execAuthRte(req, res, svc, svc.delete)
		})
	}
}
