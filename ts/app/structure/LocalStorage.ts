import * as redis from 'redis'
import { Env } from 'app/structure/Env';
import { LocalStorageRedis } from './LocalStorageRedis';
import { LocalStorageJob } from 'app/modules/local_storage/LocalStorageJob';

export class LocalStorage {

	public static async load(): Promise<void> {
		if (Env.getSessionStorageHandler() == "redis") {
			await LocalStorageRedis.load()
			return;
		}
		return
	}

	public static async add(nmKey: string, dsValue: string, cb?: redis.Callback<'OK'>): Promise<boolean> {
		if (Env.getSessionStorageHandler() == "redis") {
			await LocalStorageRedis.set(nmKey, dsValue, cb)
		}
		if (Env.getSessionStorageHandler() == "sequelize") {
			const localStorageJob = new LocalStorageJob()
			await localStorageJob.post({ nmKey, dsValue })
		}
		return false
	}

	public static async set(nmKey: string, dsValue: string, cb?: redis.Callback<'OK'>): Promise<boolean> {
		if (Env.getSessionStorageHandler() == "redis") {
			await LocalStorageRedis.set(nmKey, dsValue, cb)
		}
		if (Env.getSessionStorageHandler() == "sequelize") {
			const localStorageJob = new LocalStorageJob()
			await localStorageJob.put({ nmKey, dsValue })
		}
		return false
	}

	public static async get(nmKey: string): Promise<string | undefined> {
		if (Env.getSessionStorageHandler() == "redis") {
			return await LocalStorageRedis.get(nmKey)
		}
		if (Env.getSessionStorageHandler() == "sequelize") {
			const localStorageJob = new LocalStorageJob()
			const hStatus = await localStorageJob.get({ nmKey })
			if (hStatus.joResult && hStatus.joResult[0]) {
				return hStatus.joResult[0].dsValue
			}
		}
		return undefined
	}
}
