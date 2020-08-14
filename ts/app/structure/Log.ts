const split = require("split");
const fs = require("fs-extra");
import * as winston from "winston";
import { LogComp } from "./server_comp/LogComp";
import { BConst } from "./BConst";
import { Env } from "./Env";
import { StringUtil, DateUtil } from "salesfy-shared";
import { LogMsg } from "app/structure/LogMsg";
const path = require(`path`);

export class Log {

	private static _logger: winston.LoggerInstance

	public static createLogFile(fileName: string) {
		fs.ensureFileSync(fileName);
	}

	public static getFilename(dsSuffix: string, dtFile?: Date): string {
		return path.join(process.cwd(), Env.getLogFolder(), dtFile + dsSuffix + `.log`)
	}

	public static startWinston() {
		const transportsArray = []
		const dtFile = new Date()
		// if (Env.isProdMode()) {
		// 	const logFileConfig = Log.newLogComp(false, Env.getLogLevelFile(), dtFile);
		// 	transportsArray.push(new winston.transports.File(logFileConfig.joConfig))

		// 	const logErrorFileConfig = Log.newLogComp(false, Env.getLogLevelErrorFile(), dtFile);
		// 	logErrorFileConfig.json = true;
		// 	transportsArray.push(new winston.transports.File(logErrorFileConfig.joConfig))
		// }
		const logConsoleConfig = Log.newLogComp(true, Env.getLogLevelConsole());
		transportsArray.push(new winston.transports.Console(logConsoleConfig.joConfig));

		this._logger = new winston.Logger({
			transports: transportsArray,
			exitOnError: false, // do not exit on handled exceptions
		});
		this._logger.stream = split().on("data", (message: string) => {
			Log.print(message, Env.getLogLevelStream());
		});
		winston.addColors({
			error: `red`,
			warn: `yellow`,
			info: `blue`,
			verbose: `cyan`,
			debug: `green`,
			silly: `grey`
		});
	}

	public static get logger(): winston.LoggerInstance {
		return this._logger;
	}

	public static newLogComp(isConsole: boolean, ctLevel: string, dtFile?: Date): LogComp {
		if (!isConsole) {
			const logFilePath = Log.getFilename(ctLevel, dtFile);
			Log.createLogFile(logFilePath);
			return new LogComp(isConsole, ctLevel, logFilePath);
		}
		return new LogComp(isConsole, ctLevel);
	}

	public static printSample() {
		const msgSample = "message sample"
		Log.console(`${BConst.LOG_LEVEL_CONSOLE} ${msgSample}`);
		Log.silly(`${BConst.LOG_LEVEL_SILLY} ${msgSample}`);
		Log.debug(`${BConst.LOG_LEVEL_DEBUG} ${msgSample}`);
		Log.verbose(`${BConst.LOG_LEVEL_VERBOSE} ${msgSample}`);
		Log.info(`${BConst.LOG_LEVEL_INFO} ${msgSample}`);
		Log.warn(`${BConst.LOG_LEVEL_WARN} ${msgSample}`);
		Log.error(`${BConst.LOG_LEVEL_ERROR} ${msgSample}`);

		Log.console(`Console log level: ${Env.getLogLevelConsole()}`);
		// if (Env.isProdMode()) {
		// 	Log.console(`File log level: ${Env.getLogLevelFile()}`)
		// 	Log.console(`Error file log level: ${Env.getLogLevelErrorFile()}`)
		// }
	}

	public static asLevel(nmCtLog: string): number {
		let lvCtLog = 0
		switch (nmCtLog) {
			case BConst.LOG_LEVEL_CONSOLE: lvCtLog = 6; break;
			case BConst.LOG_LEVEL_SILLY: lvCtLog = 0; break;
			case BConst.LOG_LEVEL_DEBUG: lvCtLog = 1; break;
			case BConst.LOG_LEVEL_VERBOSE: lvCtLog = 2; break;
			case BConst.LOG_LEVEL_INFO: lvCtLog = 3; break;
			case BConst.LOG_LEVEL_WARN: lvCtLog = 4; break;
			case BConst.LOG_LEVEL_ERROR: lvCtLog = 5; break;
			default: lvCtLog = 0
		}
		return lvCtLog
	}

	public static asName(lvCtLog: number): string {
		let nmCtLog = BConst.LOG_LEVEL_CONSOLE
		switch (lvCtLog) {
			case 0: nmCtLog = BConst.LOG_LEVEL_CONSOLE; break;
			case 6: nmCtLog = BConst.LOG_LEVEL_SILLY; break;
			case 5: nmCtLog = BConst.LOG_LEVEL_DEBUG; break;
			case 4: nmCtLog = BConst.LOG_LEVEL_VERBOSE; break;
			case 3: nmCtLog = BConst.LOG_LEVEL_INFO; break;
			case 2: nmCtLog = BConst.LOG_LEVEL_WARN; break;
			case 1: nmCtLog = BConst.LOG_LEVEL_ERROR; break;
			default: nmCtLog = BConst.LOG_LEVEL_CONSOLE
		}
		return nmCtLog
	}

	public static atLeast(nmCtLog: string | undefined, nmCtLogAtLeast: string) {
		if (!nmCtLog) {
			return nmCtLogAtLeast
		}
		if (Log.asLevel(nmCtLog) > Log.asLevel(nmCtLogAtLeast)) {
			return nmCtLog
		}
		return nmCtLogAtLeast
	}

	public static print(dsMsg: string|string[], nmCtLog?: string) {
		let mtPrint = Log.console
		try {
			switch (nmCtLog) {
				case BConst.LOG_LEVEL_CONSOLE: mtPrint = Log.console; break;
				case BConst.LOG_LEVEL_SILLY: mtPrint = Log.silly; break;
				case BConst.LOG_LEVEL_DEBUG: mtPrint = Log.debug; break;
				case BConst.LOG_LEVEL_VERBOSE: mtPrint = Log.verbose; break;
				case BConst.LOG_LEVEL_INFO: mtPrint = Log.info; break;
				case BConst.LOG_LEVEL_WARN: mtPrint = Log.warn; break;
				case BConst.LOG_LEVEL_ERROR: mtPrint = Log.error; break;
				default: mtPrint = Log.console;
			}
		} catch (err) {
			mtPrint = Log.console
		}
		mtPrint(dsMsg)
	}

	public static silly(dsMsg: string|string[]) {
		Log.printNormalizer(BConst.LOG_LEVEL_SILLY, dsMsg)
	}
	public static debug(dsMsg: string|string[]) {
		Log.printNormalizer(BConst.LOG_LEVEL_DEBUG, dsMsg)
	}
	public static verbose(dsMsg: string|string[]) {
		Log.printNormalizer(BConst.LOG_LEVEL_VERBOSE, dsMsg)
	}
	public static info(dsMsg: string|string[]) {
		Log.printNormalizer(BConst.LOG_LEVEL_INFO, dsMsg)
	}
	public static warn(dsMsg: string|string[]) {
		Log.printNormalizer(BConst.LOG_LEVEL_WARN, dsMsg)
	}
	public static error(dsMsg: string|string[]) {
		Log.printNormalizer(BConst.LOG_LEVEL_ERROR, dsMsg)
	}
	public static console(dsMsg: string|string[]) {
		Log.printNormalizer(BConst.LOG_LEVEL_CONSOLE, dsMsg)
	}
	private static consolePrinter(dsMsg: string|string[]) {
		const dsDtNow = DateUtil.beautify(undefined, "DateMili")
		const dsConsole = BConst.LOG_LEVEL_CONSOLE
		//tslint:disable-next-line:no-console
		console.log(`${dsDtNow} - ${dsConsole}: ${dsMsg}`)
	}

	private static printNormalizer(nmMethod: string, dsMsg: string|string[]) {
		const mtPrint = Log.getMtPrint(nmMethod)
		const dsMargin = Log.dsPrintLvRightMarginFix(nmMethod)
		const dsClusterProcess = LogMsg.dsClusterProcess()
		const dsMsgNormalized = Log.normalizeDsMsg(dsMsg);
		const dsAllMsg = dsMargin + dsClusterProcess + dsMsgNormalized
		mtPrint(dsAllMsg)
	}

	private static normalizeDsMsg(dsMsg: string | string[]) {
		if (dsMsg instanceof Array) {
			let dsMsgNormalized = "";
			dsMsg.forEach(aMsg => {
				dsMsgNormalized += aMsg;
			})
			return dsMsgNormalized
		}
		return dsMsg;
	}

	private static dsPrintLvRightMarginFix(mtPrint: any): string {
		const nmMethodPrintLength = mtPrint ? mtPrint.length : BConst.LOG_LEVEL_CONSOLE.length
		const dsMargin = StringUtil.addLeftLetters(" ", BConst.LOG_LEVEL_VERBOSE.length - nmMethodPrintLength);
		return dsMargin
	}

	private static getMtPrint(nmMethod: string): any {
		const logger: any = this._logger
		if (logger && logger[nmMethod]) {
			return logger[nmMethod]
		}
		return Log.consolePrinter
	}
}

export function logResultsDec(target: any, key: string, descriptor: TypedPropertyDescriptor<any>) {
	const originalMethod = descriptor.value;
	descriptor.value = function (...args: any[]) {
		const parameters = args.map((aParameter) => JSON.stringify(aParameter)).join();
		const result = originalMethod.apply(this, args);
		const r = JSON.stringify(result);
		Log.debug(`${target.name}.${key}(${parameters}) => ${r}`);
		return result;
	};
	return descriptor;
}

export function logStartEndDec(target: any, key: string, descriptor: TypedPropertyDescriptor<any>) {
	// save a reference to the original method
	// this way we keep the values currently in the
	// descriptor and don`t overwrite what another
	// decorator might have done to the descriptor.
	const originalMethod = descriptor.value;

	// editing the descriptor/value parameter
	descriptor.value = function (...args: any[]) {
		Log.debug(`${target.name}.${key} started`);
		const parameters = args.map((aParameter) => JSON.stringify(aParameter)).join();
		// note usage of originalMethod here
		const result = originalMethod.apply(this, args);
		// var r = JSON.stringify(result);
		// console.log(`Call: ${key}(${a}) => ${r}`);
		Log.debug(`${target.name}.${key} ended`);
		return result;
	};

	// return edited descriptor as opposed to overwriting
	// the descriptor by returning a new descriptor
	return descriptor;
}
