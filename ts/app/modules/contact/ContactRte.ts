import { LayerRoutes } from "app/layers_template/LayerRoutes";
import { Application, Request, Response } from "express";
import { RoutesEnum } from "salesfy-shared";
import { ContactSvc } from "app/modules/contact/ContactSvc";

export class ContactRte extends LayerRoutes {

	constructor(app: Application) {
		super(app)

		app.post(RoutesEnum.contact, (req: Request, res: Response) => {
			const svc = new ContactSvc()
			this.execRte(req, res, svc, svc.contact)
		})
	}
}
