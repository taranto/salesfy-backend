import { Application, Request, Response } from "express";
import { RoutesEnum, CtHttpStatus } from "salesfy-shared";
import { LayerRoutes } from "../../layers_template/LayerRoutes";
import { HStatus } from "../../util/status/HStatus";
import { NextFunction } from "express-serve-static-core";
import { RoutesDirector } from "app/structure/RoutesDirector";
import { BaseSvc } from "app/modules/base/BaseSvc";

export class BaseRte extends LayerRoutes {

	constructor(app: Application) {
		super(app)

		app.get(RoutesEnum.root, (req: Request, res: Response) => {
			const svc = new BaseSvc()
			this.execRte(req, res, svc, svc.root)
		})

		app.post(RoutesEnum.root, (req: Request, res: Response) => {
			const svc = new BaseSvc()
			this.execRte(req, res, svc, svc.root)
		})

		app.delete(RoutesEnum.root, (req: Request, res: Response) => {
			const svc = new BaseSvc()
			this.execRte(req, res, svc, svc.root)
		})

		app.put(RoutesEnum.root, (req: Request, res: Response) => {
			const svc = new BaseSvc()
			this.execRte(req, res, svc, svc.root)
		})

		app.use((req: Request, res: Response, next: NextFunction) => {
			const svc = new BaseSvc()
			this.execRte(req, res, svc, svc.wrongRoute)
		})

	}
}
