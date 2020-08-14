import { Application, Request, Response } from "express"
import { RoutesEnum } from "salesfy-shared"
import { LayerRoutes } from "../../layers_template/LayerRoutes"
import { FileSvc } from "app/modules/file/FileSvc"

export class FileRte extends LayerRoutes {

	constructor(app: Application) {
		super(app)

		app.get(RoutesEnum.file, (req: Request, res: Response) => {
			const svc = new FileSvc()
			this.execAuthRte(req, res, svc, svc.get)
		})

		app.post(RoutesEnum.file, (req: Request, res: Response) => {
			const svc = new FileSvc()
			this.execAuthRte(req, res, svc, svc.post)
		})

		app.delete(RoutesEnum.file, (req: Request, res: Response) => {
			const svc = new FileSvc()
			this.execAuthRte(req, res, svc, svc.delete)
		})
	}
}
