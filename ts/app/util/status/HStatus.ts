import { BConst } from "../../structure/BConst";
import { CtHttpStatus } from "salesfy-shared";
import { HStatusAbstract } from "app/util/status/HStatusAbstract";
import { IStatus } from "app/util/HBTypes";

export class HStatus extends HStatusAbstract {

	constructor(joStatus?: IStatus) {
		super(joStatus)
	}
	protected getNmBase() : string {
		return "[HS]"
	}
	protected getNrStatusDefault() : number {
		return CtHttpStatus.status200.keyCtHttpStatus
	}
	protected getNmLogLevelDefault() : string {
		return BConst.LOG_LEVEL_VERBOSE.toString()
	}
}
