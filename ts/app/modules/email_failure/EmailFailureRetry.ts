import { IEmailFailure, SConst } from "salesfy-shared";
import * as Retry from 'retry'
import { HEmail } from "../../structure/HEmail";
import { Env } from "../../structure/Env";
import { Log } from "../../structure/Log";

export class EmailFailureRetry {

	private emailFailure: IEmailFailure
	private operationSettings : Retry.OperationOptions
	private operation : Retry.RetryOperation

	constructor(emailFailure: IEmailFailure) {
		this.emailFailure = emailFailure
		this.operationSettings = {
			retries: Env.getEmailMaxRetries(),
			factor: Env.getEmailIncrementalBackoffFactor(),
			minTimeout: Env.getEmailMinTimeoutInMin() * SConst.MILI_MIN,
			maxTimeout: Env.getEmailMaxTimeoutInMin() * SConst.MILI_MIN,
			randomize: false
		}
	}

	public startRetry() {
		const specificOpSetting = {
			...this.operationSettings,
			retries: Env.getEmailMaxRetries()-this.emailFailure.qtRetry,
			maxRetryTime: Env.getEmailMaxTimeoutInMin() * SConst.MILI_MIN
		}
		this.operation = Retry.operation(specificOpSetting)
		Retry.timeouts(specificOpSetting)

		const waitToStartRetryJob = 5*SConst.MILI_SEC
		const timer = setTimeout(() => {
			this.operation.attempt(this.aTry)
			clearTimeout(timer)
		}, waitToStartRetryJob)
	}

	private aTry = (qtTries:number) => {
		const joMail = {
			to : this.emailFailure.emTo,
			from : this.emailFailure.emFrom,
			html : this.emailFailure.dsHtml,
			subject : this.emailFailure.dsSubject,
			idEmailFailure : this.emailFailure.idEmailFailure,
			qtRetry : this.emailFailure.qtRetry
		}
		Log.debug("Trying to resend an email for idEmailFailure: "+ this.emailFailure.idEmailFailure+". "+
			"Retries already made: " + this.emailFailure.qtRetry)
		HEmail.toSendEmail(joMail, undefined, this.onEmailFailure)
	}

	private onEmailFailure = () => {
		this.emailFailure.qtRetry = this.emailFailure.qtRetry+1
		if ((this.emailFailure.qtRetry) < Env.getEmailMaxRetries()) {
			Log.debug("Failed to resend an email. Rescheduled retrying for idEmailFailure "+ this.emailFailure.idEmailFailure)
			this.operation.retry(new Error())
			return;
		} else {
			Log.warn("Failed for the last time to resend an email. Giving up. idEmailFailure "+ this.emailFailure.idEmailFailure)
		}
	}

}
