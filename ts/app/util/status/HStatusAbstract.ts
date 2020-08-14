import { StatusUtil } from "./StatusUtil";
import { IStatus } from "app/util/HBTypes";
import { CtHttpStatus, CtWarn } from "salesfy-shared";

export abstract class HStatusAbstract implements IStatus {

	public nmBase: string
	public nrStatus: number //numero do status
	public dsStatus: string //statusMessage
	public joResult?: any //resultado no body
	public joExtraContent?: any //complemento do statusMessage
	public dsConsole?: string //mensagem de print no console
	public nmLogLevel?: string
	public shPrintNow?: boolean
	public lkRedirectTo?: string
	public isSlightMsg?: boolean
	public dsHtmlResult?: string
	public ctStatus: CtWarn

	constructor(joStatus?: IStatus) {
		if (!joStatus) {
			joStatus = {}
		}
		this.nmBase = this.getNmBase()
		this.nrStatus = joStatus.nrStatus || this.getNrStatusDefault()
		let dsStatusOption = joStatus.ctStatus ? joStatus.ctStatus.nmMsg : undefined
		dsStatusOption = dsStatusOption || joStatus.dsStatus || CtHttpStatus.getDsStatus(this.getNrStatusDefault())
		this.dsStatus = dsStatusOption
		this.joResult = joStatus.joResult
		this.joExtraContent = joStatus.joExtraContent
		this.dsConsole = joStatus.dsConsole
		this.nmLogLevel = joStatus.nmLogLevel || this.getNmLogLevelDefault()
		this.shPrintNow = joStatus.shPrintNow == undefined ? this.getShPrintNowDefault() : joStatus.shPrintNow
		this.onSetLkRedirectTo(joStatus.lkRedirectTo)
		this.isSlightMsg = joStatus.isSlightMsg == undefined ? this.getIsSlightMsgDefault() : joStatus.isSlightMsg
		this.dsHtmlResult = joStatus.dsHtmlResult

		this.maybePrint()
		this.maybeSendEmailNow()
	}

	public print() {
		const dsMsg = this.toString()
		StatusUtil.printMsg(dsMsg, this.nmLogLevel)
	}

	public toString(): string {
		return StatusUtil.getMsg2(this)
	}

	public maybePrint() {
		if (this.shPrintNow) {
			this.print()
		}
	}

	protected maybeSendEmailNow() { }

	protected abstract getNmBase(): string
	protected abstract getNrStatusDefault(): number
	protected abstract getNmLogLevelDefault(): string
	protected getIsSlightMsgDefault(): boolean {
		return false
	}
	protected getShPrintNowDefault(): boolean {
		return false
	}
	protected onSetLkRedirectTo(lkRedirectTo?: string) {
		if (lkRedirectTo) {
			this.lkRedirectTo = lkRedirectTo
			this.nrStatus = CtHttpStatus.status302.keyCtHttpStatus
		}
	}
}
