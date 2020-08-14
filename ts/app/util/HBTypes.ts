import { CtWarn, CtError, CtExcep } from "salesfy-shared";

export interface IStatus {

	nmBase?: string
	nrStatus?: number,
	dsStatus?: string,
	joResult?: any,
	joExtraContent?: any,
	dsConsole?: string,
	nmLogLevel?: string,
	shPrintNow?: boolean,
	lkRedirectTo?: string,
	isSlightMsg?: boolean,
	dsHtmlResult?: string,
	ctStatus?: CtWarn|CtExcep|CtError
}
