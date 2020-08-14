import { HError } from 'app/util/status/HError';
import { CtError } from 'salesfy-shared';

export class ExceptionHandlerLoader {

	public static load() {
		process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
			promise.catch(() => { })
			ExceptionHandlerLoader.printAndSendMail(CtError.somethingWentWrong,
				`process.on: UNHANDLED_REJECTION -> Unhandled Rejection at Promise: ${reason.stack}`)
		})
		process.on('uncaughtException', (err: Error) => {
			ExceptionHandlerLoader.printAndSendMail(CtError.somethingWentWrong,
				`process.on: UNCAUGHT_EXCEPTION -> Uncaught Exception thrown ${err.name} | ${err.message}`)
			process.exit(1);
		})
		process.on('exit', (code: number) => {
			ExceptionHandlerLoader.printAndSendMail(CtError.somethingWentWrong,
				`process.on: EXIT -> To exit with code: ${code}`)
		})
		process.on('beforeExit', (code: number) => {
			ExceptionHandlerLoader.printAndSendMail(CtError.somethingWentWrong,
				`process.on: BEFORE_EXIT -> About to exit with code: ${code}`)
		})
	}

	private static printAndSendMail(ctStatus: CtError, msg: string) {
		const hError = new HError({ dsConsole: msg })
		hError.toSendErrorEmail()
	}

}
