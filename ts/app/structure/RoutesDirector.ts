import { Log } from "app/structure/Log";
import { BackendUtil } from "app/util/BackendUtil";
import { Request, Response } from "express";
import { LayerService } from "app/layers_template/LayerService";
import { LayerRoutes } from "app/layers_template/LayerRoutes";
import { StringUtil, SConst, KeyEnum, CtError, CtHttpStatus, CtExcep } from "salesfy-shared";
import { AuthBsn } from "app/modules/auth/AuthBsn";
import { BConst } from "app/structure/BConst";
import { IStatus } from "app/util/HBTypes";
import { HExcep } from "app/util/status/HExcep";
import { Env } from "app/structure/Env";
import { Sys } from "app/structure/Sys";
import { LogMsg } from "app/structure/LogMsg";
import { AuthTokenBsn } from "app/modules/auth/AuthTokenBsn";
import { ValUtil } from "app/util/ValUtil";
import { HStatus } from "app/util/status/HStatus";
import { HError } from "app/util/status/HError";
import { LegacyTranslator } from "app/structure/LegacyTranslator";

export class RoutesDirector {

	public static async routeCalled(
		req: Request, res: Response, svcClass: LayerService, mtSvc: (joParam: any) => Promise<IStatus>,
		shBeLoggedIn: boolean, rte: LayerRoutes) {
		const startTime = new Date().getTime()
		const dsExecCode = StringUtil.random()
		try {
			const joParam = RoutesDirector.getParametersParsed(req)
			if (!RoutesDirector.isCSRFValid(req, res)) {
				throw new HError({ ctStatus: CtError.csrfProblem, })
			}
			RoutesDirector.wipeSystemReservedParams(joParam)
			const svcResult = await RoutesDirector.callService(
				mtSvc, svcClass, joParam, req, res, shBeLoggedIn, dsExecCode)
			RoutesDirector.answerHeader(res, req, svcResult, dsExecCode, startTime)
		} catch (err) {
			const structuredError = RoutesDirector.normalizeError(err)
			RoutesDirector.answerHeader(res, req, structuredError, dsExecCode, startTime)
		}
	}

	public static async callService(mtSvc: (joParam: any) => Promise<IStatus>,
		svcClass: LayerService, joParam: any, req: Request, res: Response,
		shBeLoggedIn: boolean, dsExecCode: string): Promise<IStatus> {
		try {
			svcClass.setReqResTrans(req, res);
			await svcClass.openTrs()
			svcClass.newLayerBusiness()
			await RoutesDirector.isAccessibleThrows(joParam, svcClass, shBeLoggedIn, dsExecCode)
			const svcResult = await RoutesDirector.maybeBulkItAndCall(joParam, mtSvc, svcClass)
			await svcClass.closeTrs()
			return svcResult
		} catch (err) {
			await svcClass.closeTrs(err)
			throw err
		}
	}

	private static async maybeBulkItAndCall(
		joParam: any, mtSvc: (joParam: any) => Promise<IStatus>, svcClass: LayerService): Promise<IStatus> {
		let svcResult: IStatus = new HStatus()
		let svcResultFailure: any = ""
		if (joParam.arJoBulk && joParam.arJoBulk.length > 60) {
			throw new HExcep({ ctStatus: CtExcep.bulkLimitExceeded })
		}
		ValUtil.throwValJoHN(joParam, true)
		if (joParam.arJoBulk && joParam.arJoBulk.length > 0) {
			svcResult.joResult = []
			await Promise.all(joParam.arJoBulk.map(async (joBulk: any) => {
				try {
					joBulk.idUserLogged = joParam.idUserLogged
					joBulk.idUserScope = joParam.idUserScope
					joBulk = LegacyTranslator.translateSystemLegacyParams(joBulk)
					let aBulkSvcResult = await RoutesDirector.call(joBulk, mtSvc, svcClass)
					aBulkSvcResult = LegacyTranslator.translateSystemLegacyResults(aBulkSvcResult)
					svcResult.joResult.push(aBulkSvcResult.joResult)
				} catch (e) {
					svcResultFailure = e
				}
			}))
			if (svcResultFailure) {
				throw new HError(svcResultFailure)
			}
		} else {
			joParam = LegacyTranslator.translateSystemLegacyParams(joParam)
			svcResult = await RoutesDirector.call(joParam, mtSvc, svcClass)
			svcResult = LegacyTranslator.translateSystemLegacyResults(svcResult)
		}
		return svcResult
	}

	private static async call(joParam: any, mtSvc: (joParam: any) => Promise<IStatus>, svcClass: LayerService) {
		const svcResult = await mtSvc.call(svcClass, joParam)
		return svcResult
	}

	public static async isAccessibleThrows(
		joParam: any, svc: LayerService, shBeLoggedIn: boolean, dsExecCode: string): Promise<boolean> {
		const authTokenBsn = new AuthTokenBsn(svc.t)
		const idUser = AuthTokenBsn.getIdUserFromRequest(svc.req)
		if (shBeLoggedIn || svc.req.headers[SConst.X_ACCESS_TOKEN] != undefined) {
			joParam.idUserLogged = idUser
			joParam.idUserScope = idUser
			const dsJoParam2 = StringUtil.stringfyAndHideSpecialValues(joParam)
			RoutesDirector.logReq(dsExecCode, shBeLoggedIn, dsJoParam2, svc.req, idUser)
			const isUserAllowed = await authTokenBsn.shTokenAllowRouteAccess(svc.req, svc.res)
			if (isUserAllowed) {
				return true
			}
			throw new HError({
				ctStatus: CtError.unreachable,
				dsConsole: "It should have been thrown earlier - user not allowed"
			})
		}
		if (!shBeLoggedIn) {
			const dsJoParam1 = StringUtil.stringfyAndHideSpecialValues(joParam)
			RoutesDirector.logReq(dsExecCode, shBeLoggedIn, dsJoParam1, svc.req, idUser)
			return true
		}
		throw new HError({ ctStatus: CtError.unreachable, dsConsole: "It should have been thrown earlier" })
	}

	private static wipeSystemReservedParams(joParam: any) {
		delete joParam.isAdmin
		delete joParam.isPrivateSelect
		delete joParam.idUserScope
		delete joParam.idUserAs
		delete joParam.idUserLogged
		delete joParam.isLimitFree
	}

	private static normalizeError(err: any) {
		let structuredError = err;
		if (!(err instanceof HExcep || err instanceof HError || err instanceof HExcep)) {
			structuredError = new HError({
				ctStatus: CtError.somethingWentWrong,
				dsConsole: "LayerRoutes UnhandledException " + err, nmLogLevel: BConst.LOG_LEVEL_ERROR
			});
		}
		return structuredError;
	}

	private static getParametersParsed(req: Request) {
		if (req.method.toLowerCase() == SConst.HTTP_METHOD_GET) {
			const joQueryString = BackendUtil.originalUrlQueryStringToJSON(req)
			return joQueryString
		} else {
			return req.body
		}
	}

	public static answerHeader(res: Response, req: Request, status: IStatus, dsExecCode: string, dhStart: number) {
		if (status.nrStatus) {
			res.status(status.nrStatus)
		}
		if (status.lkRedirectTo) {
			res.redirect(status.lkRedirectTo)
		} else {
			if (status.dsStatus) res.set(SConst.STATUS_MESSAGE, status.dsStatus + "");
			if (status.joExtraContent) res.set(SConst.EXTRA_CONTENT, JSON.stringify(status.joExtraContent))
			if (status.dsHtmlResult) {
				res.send(status.dsHtmlResult)
			} else {
				res.json(status.joResult || "")
			}
		}
		RoutesDirector.logRes(req, res, status, dsExecCode, dhStart)
	}

	private static logReq(dsExecCode: string, shBeLoggedIn: boolean, dsJoParam: string, req: Request, idUser?: number) {
		const arLogText: string[] = []
		arLogText.push(...RoutesDirector.logBoth(dsExecCode, req, true, idUser))
		arLogText.push(LogMsg.dsMethod(req))
		if (Env.isProdMode()) {
			arLogText.push(LogMsg.dsIp(req))
			arLogText.push(LogMsg.dsAppVersion(req))
			arLogText.push(LogMsg.dsLinkUsed(req))
			arLogText.push(LogMsg.dsAccessTokenReq(req))
			arLogText.push(LogMsg.dsRefreshTokenReq(req))
		}
		arLogText.push(LogMsg.dsAuthNeeded(shBeLoggedIn))
		arLogText.push(LogMsg.dsParam(dsJoParam))
		Log.verbose(arLogText)
	}

	private static logRes(req: Request, res: Response, status: IStatus, dsExecCode: string, dhStart: number) {
		const idUser = AuthTokenBsn.getIdUserFromRequest(req)
		const arLogText = []
		arLogText.push(...RoutesDirector.logBoth(dsExecCode, req, false, idUser))
		if (Env.isProdMode()) {
			arLogText.push(LogMsg.dsAgent(req))
			arLogText.push(LogMsg.dsAccessTokenRes(res))
			arLogText.push(LogMsg.dsRefreshTokenRes(res))
		} else {
			arLogText.push(LogMsg.dsFill(5))
		}
		arLogText.push(LogMsg.dsElapsedTime(dhStart, new Date().getTime()))
		arLogText.push(status.toString())
		const nmLogLevelMinVerbose = Log.atLeast(status.nmLogLevel, BConst.LOG_LEVEL_VERBOSE);
		Log.print(arLogText, nmLogLevelMinVerbose)
	}

	private static logBoth(dsExecCode: string, req: Request, isCall: boolean, idUser?: number): string[] {
		const arLogText: string[] = []
		arLogText.push(LogMsg.dsUser(idUser))
		arLogText.push(LogMsg.dsPathDecorated(req.path, isCall))
		arLogText.push(LogMsg.dsExecCode(dsExecCode))
		return arLogText
	}

	// private static ip(req: Request) {
	// 	return (req.headers['x-forwarded-for'] ||
	// 		req.ip ||
	// 		req.connection.remoteAddress ||
	// 		req.socket?req.socket.remoteAddress:undefined ||
	// 		((req.connection && (req.connection as any)["socket"]) ? (req.connection as any)["socket"].remoteAddress : null)
	// 	)
	// }

	// `URL ${req.url}`,
	// `Status ${req.statusCode}-${req.statusMessage}`,
	// `Referer ${req.headers.referer}`,
	// `H ${req.httpVersion}`,

	public static isCSRFValid(req: Request, res: Response): boolean { // import * as csurf from 'csurf'
		// Log.silly("CSRF res.body.csrftoken " + req.body.csrftoken)
		// Log.silly("CSRF res.body._csrf " + req.body._csrf)
		// Log.silly("CSRF res.locals.csrftoken " + res.locals.csrftoken)
		// Log.silly("CSRF req.csrfToken() " + req.csrfToken())
		// Log.silly(res.locals)
		// // csurf()(req, res)
		// Log.silly("aaaaaaaaaaaa")
		// // return res.locals.csrftoken == req.csrfToken()

		//@ts-ignore
		// Log.debug(req.csrfToken())
		//@ts-ignore
		// res.locals._csrf = req.csrfToken();
		return true
	}
}
