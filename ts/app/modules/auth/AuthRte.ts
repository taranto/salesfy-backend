import { Application, Request, Response } from "express";
import { LayerRoutes } from "./../../layers_template/LayerRoutes";
import { AuthSvc } from "./AuthSvc";
import { RoutesEnum } from "salesfy-shared";

export class AuthRte extends LayerRoutes {

	constructor(app: Application) {
		super(app)

		app.post(RoutesEnum.userLoginGmail, (req: Request, res: Response) => {
			const svc = new AuthSvc()
			this.execRte(req, res, svc, svc.loginGmail)
		})

		app.post(RoutesEnum.userLoginFacebook, (req: Request, res: Response) => {
			const svc = new AuthSvc()
			this.execRte(req, res, svc, svc.loginFacebook)
		})

		app.post(RoutesEnum.userLogin, (req: Request, res: Response) => {
			const svc = new AuthSvc()
			this.execRte(req, res, svc, svc.login)
		})

		app.post(RoutesEnum.userRegister, (req: Request, res: Response) => {
			const svc = new AuthSvc()
			this.execRte(req, res, svc, svc.register)
		})

		app.get(RoutesEnum.userLogoff, (req: Request, res: Response) => {
			const svc = new AuthSvc()
			this.execAuthRte(req, res, svc, svc.logoff)
		})

		app.get(RoutesEnum.userLogged, (req: Request, res: Response) => {
			const svc = new AuthSvc()
			this.execAuthRte(req, res, svc, svc.logged)
		})

		app.post(RoutesEnum.userChangePassword, (req: Request, res: Response) => {
			const svc = new AuthSvc()
			this.execRte(req, res, svc, svc.changePassword)
		})

		app.get(RoutesEnum.userPasswordRecovery, (req: Request, res: Response) => {
			const svc = new AuthSvc()
			this.execRte(req, res, svc, svc.passwordRecovery)
		})

		app.get(RoutesEnum.userGeneratePassword, (req: Request, res: Response) => {
			const svc = new AuthSvc()
			this.execRte(req, res, svc, svc.generatePassword)
		})

		app.get(RoutesEnum.userEmailConfirmation, (req: Request, res: Response) => {
			const svc = new AuthSvc()
			this.execRte(req, res, svc, svc.emailConfirmation)
		})
	}
}
