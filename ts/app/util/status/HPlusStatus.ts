import { BConst } from "../../structure/BConst";
import { IStatus } from "app/util/HBTypes";
import { HStatus } from "app/util/status/HStatus";

export class HPlusStatus extends HStatus {

	constructor(joStatus?: IStatus) {
		super(joStatus)
	}
	protected getNmBase() : string {
		return "[HPS]"
	}
	protected getNmLogLevelDefault() : string {
		return BConst.LOG_LEVEL_INFO.toString()
	}
}
