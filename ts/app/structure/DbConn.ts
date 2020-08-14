import { Transaction } from "sequelize";
import { Log } from "./Log";
import { Sequelize } from "sequelize-typescript";

export class DbConn {

	private static _sq: Sequelize;

	public static get sq(): Sequelize {
		return DbConn._sq
	}

	public static set sq(sq: Sequelize) {
		DbConn._sq = sq
	}
	public static async startConn(): Promise<Transaction> {
		Log.silly(`${this.name} to open connection`)
		const t = await DbConn.sq.transaction({ autocommit: false });
		Log.silly(`${this.name} connection opened`)
		return t
	}

	public static async promiseStartConn(): Promise<Transaction> {
		return new Promise<Transaction>(async (res, rej) => {
			try {
				const t = await DbConn.startConn()
				res(t)
				return t
			} catch (err) {
				rej()
				return
			}
		})
	}

	public static async promiseCommit(t: Transaction): Promise<Transaction> {
		return new Promise<Transaction>(async (res, rej) => {
			try {
				await DbConn.performCommit(t)
				res(t)
				return t
			} catch (err) {
				rej(t)
				return t
			}
		})
	}

	public static async performCommit(t: Transaction) {
		Log.silly(`${this.name} to close connection`)
		await t.commit()
		Log.silly(`${this.name} connection closed`)
	}

	public static async promiseRollback(err: Error, t: Transaction): Promise<Transaction> {
		return new Promise<Transaction>(async (res, rej) => {
			await DbConn.performRollback(err, t)
			Log.warn(`${this.name} Rolling back. Reason: ` + JSON.stringify(err))
			rej(err)
			return err
		});
	}

	public static async performRollback(err: Error, t: Transaction) {
		await t.rollback()
	}

	public static async promiseClose(err: Error, t: Transaction): Promise<Transaction> {
		if (err) {
			return DbConn.promiseCommit(t)
		}
		return DbConn.promiseRollback(err, t)
	}
}

export { Transaction }
