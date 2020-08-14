import { Log } from "app/structure/Log";
import { Env } from "app/structure/Env";
import { StringUtil, CtError } from "salesfy-shared";
import { HError } from "app/util/status/HError";
import { Sys } from "app/structure/Sys";
import { LocalStorage } from "app/structure/LocalStorage";
import { LocalStorageJob } from "app/modules/local_storage/LocalStorageJob";

const cluster = require('cluster');
const os = require('os');

export class ClusterLoader {

	[key: string]: string | undefined;
	private static joDataReloadMainWorker = {
		message: "reloadMainWorker"
	}

	public static async load() {
		if (!Env.getRedisIsAvailable() && Env.getSessionStorageHandler() == "redis") {
			return
		}
		if (!Sys.getClusterAcWorkers()) {
			return
		}
		if (Sys.isClusterMaster()) {
			if (Env.getSessionStorageHandler() == "sequelize") {
				const localStorageJob = new LocalStorageJob()
				await localStorageJob.clearPreviousWorkers()
			}
			await ClusterLoader.addNrPidMainWorker()
		}
		ClusterLoader.config()
		if (!Sys.isClusterMaster()) {
			return
		}

		cluster.on('exit', async (worker: any, code: any, signal: any) => {
			Log.warn(`[The W${worker.id} P${StringUtil.dsFixLength(worker.process.pid, 6, false, " ")} has died]`)
			const e = new HError({
				ctStatus: CtError.clusterProblem,
				dsConsole: "Worker has died", joExtraContent: { worker: worker, code: code, signal: signal }
			})
			const isMainWorker = Sys.nrMainClusterPid == worker.process.pid
			await ClusterLoader.startWorker(isMainWorker)
		})

		const qtCpusToUse = ClusterLoader.getQtCpusToUse()
		Log.console(`Will be loaded ${qtCpusToUse} workers`);
		ClusterLoader.startWorkers(qtCpusToUse, 0);
		return
	}

	public static config() {
		process.on('message', async (joData: any) => {
			// Log.console(` received a message: ${joData.message}`);
			if (joData.message == "reloadMainWorker") {
				await ClusterLoader.reloadNrPidMainWorker()
			}
		})
	}

	public static askAllToReloadNrPidMainWorker() {
		Object.keys(cluster.workers).forEach((index: any) => {
			cluster.workers[index].send(ClusterLoader.joDataReloadMainWorker)
		})
	}

	public static async reloadNrPidMainWorker() {
		if (!Sys.isClusterMaster()) {
			const nrPidMainWorker = await ClusterLoader.getNrPidMainWorker()
			Log.console(`Got its nrPidMainWorker value updated from ${Sys.nrMainClusterPid} to ${nrPidMainWorker}`)
			Sys.nrMainClusterPid = nrPidMainWorker
		}
	}

	private static startWorkers(qtWorkers: number, nrMainWorker?: number) {
		for (let i = 0; i < qtWorkers; i++) {
			ClusterLoader.startWorker(i == 0)
		}
	}

	private static async startWorker(isMainWorker: boolean): Promise<any> {
		const newWorker = cluster.fork()
		const nrPidFormatted = StringUtil.dsFixLength(newWorker.process.pid, 6, false, "#")
		Log.console(`Starting up a new worker: [W${newWorker.id} pid P${nrPidFormatted}]`)
		if (isMainWorker) {
			await ClusterLoader.setNrPidMainWorker(newWorker.process.pid)
		}
		return newWorker
	}

	public static async addNrPidMainWorker() {
		await LocalStorage.add("nrPidMainWorker", "")
		Sys.nrMainClusterPid = undefined
		ClusterLoader.askAllToReloadNrPidMainWorker()
	}

	public static async setNrPidMainWorker(nrPid: number) {
		await LocalStorage.set("nrPidMainWorker", nrPid + "")
		// Log.console(`$$$$$$$$ nrPidMainWorker storage value updated from ${Sys.nrMainClusterPid} to ${nrPid}`)
		Sys.nrMainClusterPid = nrPid
		ClusterLoader.askAllToReloadNrPidMainWorker()
	}

	public static async getNrPidMainWorker(): Promise<number> {
		const nrPidMainWorker = await LocalStorage.get("nrPidMainWorker")
		// Log.console("----- getNrPidMainWorker: " + nrPidMainWorker)
		return Number(nrPidMainWorker)
	}

	public static getQtCpusToUse(): number {
		let qtCpusToUse = 1
		if (Env.getClusterAcWorkers()) {
			const qtCpusDesired = Env.getClusterCpusDesired()
			const qtCpusAvailable = os.cpus().length
			qtCpusToUse = qtCpusDesired < qtCpusAvailable ? qtCpusDesired : qtCpusAvailable
		}
		return qtCpusToUse
	}

}
