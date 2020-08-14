import * as dotenv from 'dotenv';
const path = require('path');
import { Env } from '../Env';
import { Log } from '../Log';
const cluster = require('cluster');

export class EnvVarLoader {

	public static load() {
		const dotenvConfig = dotenv.config({ path: EnvVarLoader.getEnvConfigPath() })
		if (cluster.isMaster && (Env.isDevMode() || Env.isTestMode())) {
			Log.console(JSON.stringify(dotenvConfig))
		}
		Env.evaluateAll()
		EnvVarLoader.validateAll()
	}

	private static getEnvConfigPath(): string {
		return path.join(process.cwd(), Env.getEnvModePath());
	}

	public static validateAll() {

	}
}
