import { Application } from "express";
import { Log } from "./Log";
import { LogLoader } from "./server_comp/LogLoader";
import { EnvVarLoader } from "./server_comp/EnvVarLoader";
import { ExceptionHandlerLoader } from "./../structure/server_comp/ExceptionHandlerLoader";
import { AppLoader } from "./../structure/server_comp/AppLoader";
import { DbConnLoader } from "./../structure/server_comp/DbConnLoader";
import { RoutesLoader } from "./../structure/server_comp/RoutesLoader";
import { LibrariesLoader } from "./../structure/server_comp/LibrariesLoader";
import { TestingLoader } from "./TestingLoader";
import { HEmailLoader } from "./server_comp/HEmailLoader";
import { HEmail } from "./HEmail";
import { ClusterLoader } from "app/structure/server_comp/ClusterLoader";
import { SConst } from "salesfy-shared";
import { Env } from "app/structure/Env";
import { LocalStorage } from "app/structure/LocalStorage";
import { AWSConfigLoader } from "app/structure/server_comp/AWSConfigLoader";
const cluster = require('cluster');

export class Server {

	public static _app: Application
	public static qtInit = 12
	public static nuInit = 0
	public static nrVersion = "1.200616"

	public static async start(onStartedCallback: any) {
		try {
			const startTime = new Date().getTime()
			Log.console(`-------------SALESFY------------- v${Server.nrVersion}`)
			await Server.load(Server.loadEnvVars, "environment variables")
			await Server.load(Server.loadLogger, "log config")
			await Server.load(Server.loadUncaughtExceptionHandler, "uncaught exception handlers")
			await Server.load(Server.loadDatabase, "database connection")
			await Server.load(await Server.loadLocalStorage, "local storage")
			await Server.load(Server.loadClusters, "master node clusters")
			// LogLoader.printSample()
			const shClusterMasterLoad = (!cluster.isMaster && Env.getClusterAcWorkers()) || !Env.getClusterAcWorkers()
			if (shClusterMasterLoad) {
				const app =
					await Server.load(Server.loadApp, "express app", onStartedCallback)
				await Server.load(Server.loadAppRoutes, "routes", app)
				await Server.load(Server.loadMail, "mailing")
				await Server.load(Server.loadAWSConfig, "AWS config")
				await Server.load(Server.loadLibraryIncrements, "library increments")
				await Server.load(Server.testSomething, "extra tests")
			}
			const endTime = new Date().getTime()
			Log.console(`-------------All loaded (${(endTime - startTime)}ms)---------------`)
		} catch (err) {
			Server.tryClose(`There were a problem on the modules startup: ` + err)
		}
	}

	public static reloadEnvVar() {
		Server.load(Server.loadEnvVars, "environment variables")
	}

	private static async load(mtCall: any, nmLoad: string, maybeCallback?: any): Promise<Application> {
		Log.console(`(${Server.nuInit}/${Server.qtInit})${nmLoad} about to be loaded`)
		const maybeReturnApp = mtCall(maybeCallback)
		Log.console(`(${++Server.nuInit}/${Server.qtInit})${nmLoad} loaded`)
		return maybeReturnApp
	}

	public static async loadLocalStorage() {
		await LocalStorage.load()
	}

	private static loadApp(onStarted: any): Application {
		const app = AppLoader.load()
		AppLoader.loadConfig(app, onStarted)
		Server._app = app;
		return app
	}

	private static loadAWSConfig() {
		AWSConfigLoader.load()
	}

	private static loadClusters() {
		ClusterLoader.load()
	}

	private static loadMail() {
		HEmailLoader.load()
	}

	private static testSomething() {
		TestingLoader.load()
	}

	private static loadAppRoutes(app: Application) {
		RoutesLoader.load(app)
	}

	private static loadDatabase() {
		DbConnLoader.load()
	}

	private static loadUncaughtExceptionHandler() {
		ExceptionHandlerLoader.load()
	}

	private static loadEnvVars() {
		EnvVarLoader.load()
	}

	private static loadLogger() {
		LogLoader.load()
	}

	private static loadLibraryIncrements() {
		LibrariesLoader.load()
	}

	public static get app(): Application {
		return this._app
	}

	public static tryClose(dsReason?: string, triesBeforeForce = 10, callback?: any) {
		if (triesBeforeForce > 0 && !Server.isReadyToClose()) {
			Log.console("Server close requested." +
				" Tries before force: " + triesBeforeForce +
				(dsReason ? ". Reason: " + dsReason : ""))
			setTimeout(() => {
				Server.tryClose(dsReason, --triesBeforeForce, callback)
			}, SConst.MILI_SEC * 5);
		} else {
			if (callback) {
				callback()
			}
			Server.close(dsReason)
		}
	}

	public static isReadyToClose() {
		if (HEmail.pendingMails > 0) {
			Log.console("Emails still in need of confirmation(" + HEmail.pendingMails + ")")
			return false
		}
		return true
	}

	private static close(dsReason?: string) {
		Log.console("Server is now closing" + (dsReason ? ". Reason: " + dsReason : ""))
		process.exit()
	}
}
