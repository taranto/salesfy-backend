import { Env } from "app/structure/Env";
const cluster = require('cluster');

export class Sys extends Env {

	public static nrMainClusterPid: number | undefined = undefined
	// public static isStartupMailVerified : boolean

	// public static isTestUser(idUser?: number): boolean {
	// 	if (idUser) {
	// 		return false
	// 	}
	// 	return Env.getTestIdUsers().split(",").indexOf(idUser + "") != -1
	// }

	public static isClusterWorker(): boolean {
		return !cluster.isMaster || !Env.getClusterAcWorkers()
	}

	public static isClusterMainWorker(): boolean {
		const isClusterMainWorker =
			(!cluster.isMaster && (Sys.nrMainClusterPid == process.pid || cluster.worker.id == 1)) ||
			(!Env.getClusterAcWorkers() && cluster.isMaster)
		return isClusterMainWorker
	}

	public static isClusterMaster(): boolean {
		return cluster.isMaster || !Env.getClusterAcWorkers()
	}
}
