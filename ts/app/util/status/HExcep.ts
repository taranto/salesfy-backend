import { BConst } from "../../structure/BConst";
import { StatusUtil } from "./StatusUtil";
import { CtHttpStatus } from "salesfy-shared";
import { IStatus } from "app/util/HBTypes";
import { HEmail } from "app/structure/HEmail";
import { HStatusAbstract } from "app/util/status/HStatusAbstract";

export class HExcep extends HStatusAbstract {

	constructor(joStatus: IStatus) {
		super(joStatus)
	}

	public maybeSendEmailNow() {
		if (this.nmLogLevel == BConst.LOG_LEVEL_ERROR.toString()) {
			this.toSendErrorEmail()
		}
	}

	public toSendErrorEmail() {
		HEmail.toSendErrorEmail({
			subject:this.nmBase + this.dsStatus,
			html:StatusUtil.getMsg2(this)
		})
	}

	protected getNmBase() : string {
		return "[HEX]"
	}
	protected getNrStatusDefault() : number {
		return CtHttpStatus.status400.keyCtHttpStatus
	}
	protected getNmLogLevelDefault() : string {
		return BConst.LOG_LEVEL_DEBUG.toString()
	}
	protected getShPrintNowDefault() : boolean {
		return true
	}
}
