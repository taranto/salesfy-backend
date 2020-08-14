import { BConst } from "../../structure/BConst";
import { CtHttpStatus } from "salesfy-shared";
import { IStatus } from "app/util/HBTypes";
import { HExcep } from "app/util/status/HExcep";

export class HError extends HExcep {

	constructor(joStatus: IStatus) {
		super(joStatus)
	}

	protected getNmBase() : string {
		return "[HER]"
	}
	protected getNrStatusDefault() : number {
		return CtHttpStatus.status500.keyCtHttpStatus
	}
	protected getNmLogLevelDefault() : string {
		return BConst.LOG_LEVEL_ERROR.toString()
	}
}
