import { Request, Response } from "express";
import { StringUtil, SConst } from "salesfy-shared";
import { Log } from "app/structure/Log";
import { Env } from "app/structure/Env";
import { DaoUtil } from "app/util/DaoUtil";
const cluster = require('cluster');

export class LogMsg {

	private static dsToken(nmPrefix: string, crToken: string, isCompleteData = false): string {
		const qtSectionSize = isCompleteData ? 205 : 5
		let dsTokenToPrint = ""
		if (!isCompleteData && crToken != undefined && crToken != "" && crToken != SConst.KEY_EMPTY_TOKEN) {
			const dsTokenLastString = crToken.split(".")[2]
			dsTokenToPrint = crToken.split(".")[2].slice(dsTokenLastString.length - 5, dsTokenLastString.length)
		} else if (crToken != undefined && crToken != "" && crToken != SConst.KEY_EMPTY_TOKEN) {
			dsTokenToPrint = crToken
		}
		const dsMsg = LogMsg.dsLogText(nmPrefix, dsTokenToPrint, qtSectionSize)
		return dsMsg
	}

	private static dsTokenReq(req: Request, keyToken: string): string {
		let crToken = ""
		const r: any = req
		if (r && r.headers && r.headers[keyToken] != undefined) {
			crToken = r.headers[keyToken]
		}
		return crToken
	}

	private static dsTokenRes(res: Response, keyToken: string): string {
		let crToken = ""
		const r: any = res
		if (r && r["_headers"] && r["_headers"][keyToken]) {
			crToken = r["_headers"][keyToken]
		}
		return crToken
	}

	public static dsAccessTokenReq(req: Request, isCompleteData = false): string {
		const crToken = LogMsg.dsTokenReq(req, SConst.X_ACCESS_TOKEN)
		const dsLog = LogMsg.dsToken(`AT`, crToken, isCompleteData)
		return dsLog
	}

	public static dsAccessTokenRes(res: Response, isCompleteData = false): string {
		const crToken = LogMsg.dsTokenRes(res, SConst.X_ACCESS_TOKEN)
		const dsLog = LogMsg.dsToken(`AT`, crToken, isCompleteData)
		return dsLog
	}

	public static dsRefreshTokenReq(req: Request, isCompleteData = false): string {
		const crToken = LogMsg.dsTokenReq(req, SConst.X_REFRESH_TOKEN)
		const dsLog = LogMsg.dsToken(`RT`, crToken, isCompleteData)
		return dsLog
	}

	public static dsRefreshTokenRes(res: Response, isCompleteData = false): string {
		const crToken = LogMsg.dsTokenRes(res, SConst.X_REFRESH_TOKEN)
		const dsLog = LogMsg.dsToken(`RT`, crToken, isCompleteData)
		return dsLog
	}

	public static dsAuthNeeded(isAuthNeeded: boolean): string {
		const dsAuthNeeded = isAuthNeeded ? "Auth" : "Open"
		const dsLog = LogMsg.dsLogText("K", dsAuthNeeded, 5, true, false)//8 to match time in milisseconds length
		return dsLog
	}

	public static dsFill(qtFill: number): string {
		const dsFill = LogMsg.dsLogText("", "", qtFill)
		return dsFill
	}

	public static dsUser(idUser?: number): string {
		const dsUserLogged = idUser ? LogMsg.dsLogText("U", idUser, 5, true, false) : LogMsg.dsLogText("U", "", 5)
		return dsUserLogged
	}

	public static dsClusterProcess(): string {
		let dsCluster = ""
		if (cluster.isMaster) {
			dsCluster = LogMsg.dsLogText("C", "0", 1, true)
		} else {
			dsCluster = LogMsg.dsLogText("W", cluster.worker.id, 1, true)
		}
		const dsProcess = LogMsg.dsLogText("P", process.pid, 6, true, false)
		if (Env.isEnvLoaded() && Env.getClusterAcWorkers() && Env.getClusterCpusDesired() > 0) {
			return `${dsCluster}${dsProcess}`
		}
		return ""
	}

	public static dsExecCode(dsExecCode: string): string {
		const dsLog = LogMsg.dsLogText("E", dsExecCode, 8)
		return dsLog
	}

	public static dsPathDecorated(dsPath: string, isArriving: boolean): string {
		const dsPrefix = isArriving ? "->" : "<-"
		const dsPathDecorated = dsPrefix + " " + dsPath
		const dsLog = LogMsg.dsLogText("R", dsPathDecorated, 25)
		return dsLog
	}

	public static dsAgent(req: Request): string {
		const dsLog = LogMsg.dsLogText("A", req.headers["user-agent"] + "", 135)
		return dsLog
	}

	public static dsMethod(req: Request): string {
		const dsLog = LogMsg.dsLogText("M", req.method.substr(0, 3).toUpperCase(), 3)
		return dsLog
	}

	public static dsIp(req: Request): string {
		const dsIp = req.headers["x-forwarded-for"] != undefined ? req.headers["x-forwarded-for"] + "" : ""
		const dsLog = LogMsg.dsLogText("I", dsIp, 29)
		return dsLog
	}

	public static dsLinkUsed(req: Request): string {
		// req.baseUrl
		// req.host
		// req.hostname
		const dsLinkUsed = req.get('origin') ? "g " + req.get('origin') : req.header('origin') ? "h " + req.header('origin') : ""
		const dsLog = LogMsg.dsLogText("L", dsLinkUsed, 84)
		return dsLog
	}

	public static dsAppVersion(req: Request): string {
		//TODO se eu estiver com workers, somente 1 sessão vai ter o valor. ajustar
		let vlAppVersion = ""
		if (req.session != undefined && req.session.vlAppVersion != undefined) {
			vlAppVersion = req.session.vlAppVersion
		}
		const dsLog = LogMsg.dsLogText("V", vlAppVersion + "", 7)
		return dsLog
	}

	public static dsElapsedTime(miStart: number, miEnd: number): string {
		const qtElapsedTime = miEnd - miStart
		const dsLog = LogMsg.dsLogText("T", qtElapsedTime, 5, true, false) // T in ms
		return dsLog
	}

	public static dsParam(dsParam: string): string {
		const dsLog = LogMsg.dsLogText("P", dsParam)
		return dsLog
	}

	public static dsLogText(nmPrefix = "", dsMsg: string | number, qtLengthMsg?: number, hasBracket = true,
		shFillRight = true, dsFillWith = " "): string {
		if (nmPrefix) {
			nmPrefix = nmPrefix + " "
		}
		let dsLog = ""
		if (qtLengthMsg != undefined) {
			if (qtLengthMsg > 255) {
				if (qtLengthMsg > Env.getLogMsgCharLimiter()) {
					qtLengthMsg = Env.getLogMsgCharLimiter()
				}
			}
			dsLog = nmPrefix + StringUtil.dsFixLength(dsMsg, qtLengthMsg, shFillRight, dsFillWith)
		}
		if (qtLengthMsg == undefined) {
			dsLog = nmPrefix + dsMsg
		}
		if (hasBracket) {
			return "[" + dsLog + "]"
		}
		return dsLog
	}

	public static dsSessionID(req: Request): string {
		const dsLog = LogMsg.dsLogText("S", req.sessionID + "", 32)
		return dsLog
	}
}
