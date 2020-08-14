import { Request, Response, Application } from "express"
import { RoutesDirector } from "app/structure/RoutesDirector";
import { LayerService } from "app/layers_template/LayerService";
import { IStatus } from "app/util/HBTypes";

export abstract class LayerRoutes {

	protected app: Application

	constructor(app: Application) {
		this.app = app;
	}

	public execAuthRte = async (req: Request, res: Response, svcClass: LayerService,
		mtSvc: (joParam: any) => Promise<IStatus>) => {
		this.execRte(req, res, svcClass, mtSvc, true)
	}

	public execRte = async (req: Request, res: Response, svcClass: LayerService,
		svcMethod: (joParam: any) => Promise<IStatus>, shBeLoggedIn = false) => {
		RoutesDirector.routeCalled(req, res, svcClass, svcMethod, shBeLoggedIn, this)
	}
}
