import { Env } from "../Env";
import { HEmail } from "../HEmail";
import { Log } from "../Log";
import { Server } from "../Server";
import { EmailFailureJob } from "../../modules/email_failure/EmailFailureJob";
import { Sys } from "app/structure/Sys";

export class HEmailLoader {

	public static load() {
		if (Env.getEmailWorkEmail()) {
			HEmailLoader.sendTestEmailAvailability();
			EmailFailureJob.startRetryJob()
		}
	}

	private static sendTestEmailAvailability() {
		if (!(Env.getEmailVerifyAtStartup() && Sys.isClusterMainWorker())) {
			return
		}
		const startupEmailTesting = {
			from: Env.getEmailNmEmailFrom(),
			to: Env.getEmailArEmAdmin(),
			subject: "Startup Email",
			html: "This email is being sent for the starting-up proceeding. " +
				"Salesfy is now online again. " + (new Date()).toISOString()
		}
		HEmail.toSendEmail(startupEmailTesting, undefined, HEmailLoader.loaderCallback);
	}

	private static loaderCallback(transport:any) {
		return (error: Error, response: any) => {
			if (error) {
				const msg = `Server failed to send startup verify email. Error: ${error.message}`
				if (Env.getEmailShutdownServerOnNoMail()) {
					Server.tryClose(msg)
				} else {
					Log.warn(msg)
				}
			} else {
				Log.info("Startup verify email sent from " + response.envelope.from + " to " + response.envelope.to.toString());
			}
		}
	}
}
