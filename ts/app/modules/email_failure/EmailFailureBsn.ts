import { Transaction } from "../../structure/DbConn";
import { LayerBusiness } from "../../layers_template/LayerBusiness";
import { EmailFailureDao } from "./EmailFailureDao";
import { IEmailFailure, CtError } from "salesfy-shared";
import { Env } from "../../structure/Env";
import { EmailFailure } from "./EmailFailure";
import { ValUtil } from "app/util/ValUtil";
import { HError } from "app/util/status/HError";

export class EmailFailureBsn extends LayerBusiness {

	constructor(t: Transaction) {
		super(t);
	}

	public async storeEmailFailure(joParam: any): Promise<EmailFailure> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "emTo", "emFrom", "dsHtml",
			"dsSubject", "cdErrorResponse", "dsErrorStack", "dhFailure", "qtRetry", "isSent")
		const emailFailureDao = new EmailFailureDao(this.t)
		const emailFailure = await emailFailureDao.insert(joParam)
		if (!emailFailure) {
			throw new HError({ ctStatus: CtError.dbInsertProblem, dsConsole: "EmailFailure failed to be inserted" })
		}
		return emailFailure
	}

	public static wasItFailedBefore(joEmailFailure: any): boolean {
		return joEmailFailure.idEmailFailure != null
	}

	public async setAsSent(joEmailFailure: IEmailFailure): Promise<IEmailFailure> {
		if (!EmailFailureBsn.wasItFailedBefore(joEmailFailure) || joEmailFailure.isSent) {
			return joEmailFailure
		}
		const emailFailureDao = new EmailFailureDao(this.t)
		const emailFailure = await emailFailureDao.setValue(+joEmailFailure.idEmailFailure, "isSent", true)
		return emailFailure
	}

	public async listUnsent(isUnderRetryTimeWindow = true): Promise<IEmailFailure[]> {
		const emailFailureDao = new EmailFailureDao(this.t)
		const now = new Date()
		const dhPastThisTime = now.getTime() - Env.getEmailRetryTimeWindow()
		const joParam = {
			isSent: false,
			maxTries: Env.getEmailMaxRetries(),
			dhUnderTimeWindow: new Date(dhPastThisTime)
		}
		const emailFailures = await emailFailureDao.get(joParam)
		return emailFailures
	}

	public async registerARetry(joMail: IEmailFailure): Promise<IEmailFailure> {
		const emailFailureDao = new EmailFailureDao(this.t)
		const emailFailure = await emailFailureDao.registerARetry(
			+joMail.idEmailFailure, joMail.cdErrorResponse, joMail.dsErrorStack)
		return emailFailure
	}
}
