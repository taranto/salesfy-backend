import { DbConn } from "../../structure/DbConn";
import { EmailFailureBsn } from "./EmailFailureBsn";
import { IEmailFailure } from "salesfy-shared";
import { EmailFailureRetry } from "./EmailFailureRetry";
import { Sys } from "app/structure/Sys";
import { Log } from "app/structure/Log";

export class EmailFailureJob {

	public static async startRetryJob() {
		if (!Sys.isClusterMainWorker()) {
			return
		}
		const t = await DbConn.startConn()
		const emailFailureBsn = new EmailFailureBsn(t)
		const emailFailures = await emailFailureBsn.listUnsent()
		await DbConn.performCommit(t)
		if (emailFailures.length) {
			Log.console(`EmailFailureJob is starting up. ${emailFailures.length} emails to send`);
			emailFailures.forEach((emailFailure:IEmailFailure) => {
				const emailFailureRetry = new EmailFailureRetry(emailFailure)
				emailFailureRetry.startRetry()
			})
		} else {
			Log.console(`EmailFailureJob is starting up. No emails to send`);
		}
	}
}
