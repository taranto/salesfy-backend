import * as nodemailer from "nodemailer";
import { Env } from "./Env";
import { Log } from "./Log";
import { DbConn, Transaction } from "./DbConn";
import { EmailFailureBsn } from "../modules/email_failure/EmailFailureBsn";
import { IEmailFailure } from "salesfy-shared";
import { EmailFailureRetry } from "../modules/email_failure/EmailFailureRetry";

export class HEmail {

	private static _pendingMails = 0
	private static baseTransport: any

	public static getBaseTransport() {
		if (!HEmail.baseTransport) {
			HEmail.baseTransport = nodemailer.createTransport({
				host: Env.getEmailNmHost(),
				service: Env.getEmailNmService(),
				port: Env.getEmailNuPort(),
				secure: true,
				auth: {
					user: Env.getEmailNmUserFrom(),
					pass: Env.getEmailPwEmailFrom()
				},
				pool: true,
				rateLimit: Env.getEmailRateLimit(),
				rateDelta: Env.getEmailRateDelta(),
				maxConnections: Env.getEmailMaxConn(),
				maxMessages: Env.getEmailMaxMessagesPerConn(),
			})
		}
		return HEmail.baseTransport
	}

	public static addPending() {
		HEmail._pendingMails++
	}

	public static subPending() {
		HEmail._pendingMails--
	}

	public static get pendingMails(): number {
		return HEmail._pendingMails
	}

	public static getBaseCallback(transport: any, joMailParam: any, onError?: any, onSuccess?: any) {
		const joMail = joMailParam
		return async (error: Error, response: any) => {
			HEmail.subPending()
			let logFeedback = `[Title ${joMailParam.subject}]`
			if (response && response.envelope && response.envelope.to[0]) {
				logFeedback = `[To ${response.envelope.to[0]}]` + logFeedback
			} else {
				logFeedback = `[To ${joMailParam.to}]` + logFeedback
			}
			if (joMailParam.to.split(",").length > 0) {
				logFeedback = `[To Multiple '${joMailParam.to}']` + logFeedback
			}
			if (!!error) {
				Log.warn(`[Email][Failed]${logFeedback}[Reason ${error.message}]`)
				HEmail.handleRetrySendingMail(error, response, transport, joMail)
				if (onError) {
					onError(error, response)
				}
			} else {
				Log.info(`[Email][Sent]${logFeedback}`);
				if (EmailFailureBsn.wasItFailedBefore(joMailParam)) {
					await HEmail.setAsSent(joMailParam)
				}
				if (onSuccess) {
					onSuccess(response)
				}
			}
		}
	}

	public static toSendEmail(joMail: { to: string, subject: string, html: string },
		customTransport?: any, customCallbackError?: any, customCallbackSuccess?: any) {
		if (HEmail.shouldWorkEmail()) {
			const theTransport = customTransport || HEmail.getBaseTransport()
			const sendMailCallback = HEmail.getBaseCallback(theTransport, joMail, customCallbackError, customCallbackSuccess)
			HEmail.send(theTransport, joMail, sendMailCallback)
		}
	}

	public static toSendErrorEmail(joErrorMail: { to?: string, subject: string, html: string },
		customTransport?: any, customCallback?: any) {
		joErrorMail.subject = `[${Env.getNodeEnv().toUpperCase()}]` + joErrorMail.subject
		const joMail = {
			to: Env.getEmailNmEmailToError(),
			...joErrorMail
		}
		if (HEmail.shouldWorkErrorEmail()) {
			HEmail.toSendEmail(joMail, customCallback)
		}
	}

	private static send(transport: any, joMail: any, sendMailCallback: any) {
		if (!Env.isProdMode()) {
			joMail.to = Env.getEmailNmEmailToTest()
		}
		joMail.from = Env.getEmailNmEmailFrom()
		if (Env.getEmailWorkEmail()) {
			HEmail.sendMultiple(transport, joMail, sendMailCallback)
		}
	}

	private static sendMultiple(transport: any, joMail: any, sendMailCallback: any) {
		const arEmTo = (joMail.to as string).replace(" ", "").split(",")
		arEmTo.forEach((emTo) => {
			const aJoMail = {
				...joMail,
				to: emTo
			}
			transport.sendMail(aJoMail, sendMailCallback)
			HEmail.addPending()
		})
	}

	private static shouldWorkErrorEmail(): boolean {
		return HEmail.shouldWorkEmail() && Env.getEmailUseErrorEmail() && (Env.getEmailNmEmailToError() != undefined)
	}

	private static shouldWorkEmail(): boolean {
		return Env.getEmailWorkEmail() && (
			(!Env.isProdMode() && Env.getEmailWorkDevEmail()) ||
			(Env.isProdMode() && (Env.getEmailNmEmailToTest() != undefined))
		)
	}

	private static async handleRetrySendingMail(
		err: Error, response: any, transport: any, joMail: any) {
		const e = err as any
		if (!joMail.idEmailFailure) {
			const arEmTo = joMail.to.split(",")
			await arEmTo.forEach(async (emTo: string) => {
				const t = await DbConn.startConn()
				await HEmail.registerSingleEmailFailureRetry(e, joMail, emTo, t)
				await DbConn.performCommit(t)
			})
		} else {
			const t = await DbConn.startConn()
			const emailFailureBsn = new EmailFailureBsn(t)
			joMail.cdErrorResponse = e.responseCode
			joMail.dsErrorStack = e.stack
			const emailFailure = await emailFailureBsn.registerARetry(joMail)
			await DbConn.performCommit(t)
		}
	}

	private static async registerSingleEmailFailureRetry(e: any, joMail: any, emTo: string, t:Transaction) {
		const joStoreFailedMail = {
			cdErrorResponse: e.responseCode || 0,
			dsErrorStack: e.stack,
			emTo: emTo,
			emFrom: joMail.from,
			dsHtml: joMail.html,
			dsSubject: joMail.subject,
			dhFailure: new Date(),
			qtRetry: 0,
			isSent: false
		}
		const emailFailureBsn = new EmailFailureBsn(t)
		const emailFailure = await emailFailureBsn.storeEmailFailure(joStoreFailedMail);
		const emailFailureRetry = new EmailFailureRetry(emailFailure);
		emailFailureRetry.startRetry();
	}

	public static async setAsSent(joEmailFailure: IEmailFailure) {
		const t = await DbConn.startConn()
		const emailFailureBsn = new EmailFailureBsn(t)
		await emailFailureBsn.setAsSent(joEmailFailure)
		await DbConn.performCommit(t)
	}

}
