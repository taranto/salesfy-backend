import { Env, HEmail, Log, Done } from "../barrel/Barrel.spec";
import { StringUtil } from "salesfy-shared";
import { DaoUtil } from "app/util/DaoUtil";

export class HMailSpec {

	private static workDevMailEnv = undefined //"Work dev Email environment variable turned off"

	public static test() {
		describe.skip("Mail test context @email", () => {
			HMailSpec.sendingEmail()
		})
	}

	private static sendingEmail() {
		it("It should send an email", (done) => {
			if (Env.getEmailWorkDevEmail()) {
				const mail = {
					from: Env.getEmailNmEmailFrom(),
					to: Env.getEmailNmEmailToTest(),
					subject: "Test email",
					html: "This email is being sent for testing purposes. " + (new Date()).toISOString()
				}
				const onError = () => {
					done("Email failed to be sent")
				}
				const onSuccess = () => {
					done()
				}
				const thisTransport = HEmail.getBaseTransport()
				HEmail.toSendEmail(mail, thisTransport, onError, onSuccess)
			} else {
				done(HMailSpec.workDevMailEnv)
			}
		})

		const qtEmails = 20 - HEmail.pendingMails
		it("It should test stress: get "+qtEmails+" emails notification (among failure and success)", (done) => {
			if (Env.getEmailWorkDevEmail()) {
				HMailSpec.sendAnEmail(done, qtEmails)
			} else {
				done(HMailSpec.workDevMailEnv)
			}
		})
	}

	private static qtAnswersRemaining : number

	private static sendAnEmail(done:Done, qtEmails :number, joParamCustom? : { arEmMail?:string } ) {
		HMailSpec.qtAnswersRemaining = qtEmails
		joParamCustom = joParamCustom?joParamCustom:{}
		const joParam = {
			subject : "Stress test email code: " + StringUtil.random(),
			arEmMail : Env.getEmailNmEmailToTest(),
			...joParamCustom
		}
		const mail = {
			from: Env.getEmailNmEmailFrom(),
			to: joParam.arEmMail,
			subject: joParam.subject,
			html: "This email is being sent for testing purposes. " + DaoUtil.sqlDateformat(new Date(), "DateSec")
		}
		const onError = () => {
			HMailSpec.qtAnswersRemaining--
			HMailSpec.anAnswerWasReceived("Error", HMailSpec.qtAnswersRemaining, qtEmails, done)
		}
		const onSuccess = () => {
			HMailSpec.qtAnswersRemaining--
			HMailSpec.anAnswerWasReceived("Succe", HMailSpec.qtAnswersRemaining, qtEmails, done)
		}
		const thisTransport = HEmail.getBaseTransport()
		for (let index = 0; index < qtEmails; index++) {
			HEmail.toSendEmail(mail, thisTransport, onError, onSuccess)
		}
		const qtSecondsToWait = qtEmails+(qtEmails/2)
		HMailSpec.waitForTheAnswerBeforeDone(qtSecondsToWait, done)
	}

	private static waitForTheAnswerBeforeDone(qtTimeSeconds:number, done : Done) {
		const timer = setTimeout(() => {
			if (HMailSpec.qtAnswersRemaining != 0) {
				done("Email failed to receive an answer. Remaining: " + HMailSpec.qtAnswersRemaining)
			} else {
				clearTimeout(timer)
			}
		}, (1000*qtTimeSeconds)+5000)
	}

	private static anAnswerWasReceived(
		nmOcurrence : "Error"|"Succe", qtAnswersRemaining:number, qtEmails:number, done:Mocha.Done) {
		Log.debug(`(${nmOcurrence}) Remaining: ${qtAnswersRemaining}`)
		if (qtAnswersRemaining == 0) {
			done()
		}
	}
}
