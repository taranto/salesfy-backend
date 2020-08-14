import { Log } from "../../structure/Log";
import { Env } from "../../structure/Env";
import { IStatus } from "app/util/HBTypes";
import { JsonUtil } from "salesfy-shared";

export class StatusUtil {

	public static printMsg(msg: string, nmLevelConsole?: string) {
		Log.print(msg, nmLevelConsole);
	}

	public static getMsg2(s: IStatus): string {
		if (s.isSlightMsg) {
			const dsSlightMsg = StatusUtil.getDsSlightMsg(s)
			return dsSlightMsg
		} else {
			const dsFullMsg = StatusUtil.getDsFullMsg(s)
			return dsFullMsg
		}
	}

	private static getDsFullMsg(s: IStatus): string {
		let dsMsg = s.nmBase
		dsMsg = dsMsg + StatusUtil.getMsgStep("SC", s.nrStatus)
		dsMsg = dsMsg + StatusUtil.getMsgStep("SM", s.dsStatus)
		if (s.joResult) {
			let stringfiedResult = JSON.stringify(s.joResult)
			if ((s.joResult[0] && s.joResult.length>1) || stringfiedResult.length > Env.getLogMsgCharLimiter()) {
				stringfiedResult = "An array of " + s.joResult.length + " items. " +
					"Sample: " + JSON.stringify(s.joResult[0])
			}
			dsMsg = dsMsg + StatusUtil.getMsgStep("R", stringfiedResult)
		}
		dsMsg = dsMsg + StatusUtil.getMsgStep("EC", s.joExtraContent)
		if (s.dsConsole && s.dsConsole != s.dsStatus) {
			dsMsg = dsMsg + StatusUtil.getMsgStep("CM", s.dsConsole)
		}
		dsMsg = dsMsg + StatusUtil.getMsgStep("FW", s.lkRedirectTo)
		return dsMsg
	}

	private static getDsSlightMsg(s: IStatus): string {
		let dsMsg = s.nmBase
		dsMsg = dsMsg + StatusUtil.getMsgStep("SM", s.dsStatus)
		dsMsg = dsMsg + StatusUtil.getMsgStep("EC", s.joExtraContent)
		dsMsg = dsMsg + StatusUtil.getMsgStep("FW", s.lkRedirectTo)
		return dsMsg
	}

	private static getMsgStep(nmKey: string, dsMsg?: any): string {
		if (dsMsg == undefined || JsonUtil.isJoEmpty(dsMsg)) {
			return ""
		}
		if (typeof dsMsg == "string") {
			return `[${nmKey} ${dsMsg}]`
		}
		return `[${nmKey} ${JSON.stringify(dsMsg)}]`
	}
}
