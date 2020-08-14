import { DbConn } from "./../DbConn"
import { Transaction } from "sequelize";
import { Log } from "./../Log";
import { Model, Sequelize } from "sequelize-typescript";
import { EntityLoader } from "./DbModelsLoader";
import { Env } from "../Env";
import { SequelizeConfig } from "sequelize-typescript/lib/types/SequelizeConfig";

export class DbConnLoader {

	public static load() {
		DbConn.sq = new Sequelize(DbConnLoader.getJoConn());
		DbConnLoader.loadEntities(DbConn.sq)
		DbConnLoader.test();
	}

	public static getJoConn(): SequelizeConfig {
		return {
			database: Env.getDbDatabase(),
			dialect: Env.getDbDialect(),
			username: Env.getDbUsername(),
			password: Env.getDbPassword(),
			host: Env.getDbHost(),
			port: Env.getDbPort(),
			pool: {
				max: Env.getDbPoolMax(),
				min: Env.getDbPoolMin(),
				acquire: Env.getDbPoolAcquire(),
				idle: Env.getDbPoolIdle(),
			},
			operatorsAliases: false,
			isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
			logging: (msg: string) => Log.print(msg, Env.getLogLevelDatabase()),
			define: {
				timestamps: false,
				underscored: false,
				underscoredAll: false,
			},
			timezone: Env.getTimezone()
		};
	}

	public static addModels(models: Array<typeof Model>): void {
		DbConn.sq.addModels(models);
	}

	public static loadEntities(sq: Sequelize) {
		EntityLoader.load(sq)
	}

	public static test() {
		DbConn.sq.authenticate()
	}
}
