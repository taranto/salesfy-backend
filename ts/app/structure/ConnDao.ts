import { DbConn, Transaction } from "app/structure/DbConn";
import { QueryTypes, QueryOptions } from "sequelize";

export class ConnDao {

	public static async staticQuery(queryString: string, customOptions?: QueryOptions): Promise<any> {
		const t = await DbConn.startConn()
		const result = ConnDao.performQuery(t, queryString, customOptions, true)
		await DbConn.promiseCommit(t)
		return result
	}

	public static async staticQueryPromise(
		queryString: string, options?: QueryOptions): Promise<any> {
		const t = await DbConn.startConn()
		const performed = ConnDao.performQuery(t, queryString, options, false)
		await DbConn.performCommit(t)
		return performed
	}

	public static async performQuery(
		t: Transaction, queryString: string, customOptions?: QueryOptions, isStraightToResults = true): Promise<any> {
		let defaultOptions: any = { transaction: t }
		let isUpdate = false
		let isInsert = false
		if (isStraightToResults) {
			const queryStringFixed = queryString.trim().toLowerCase()
			const isSelect = queryStringFixed.startsWith("select")
			if (isSelect) {
				defaultOptions.type = QueryTypes.SELECT
			}
			isUpdate = queryStringFixed.startsWith("update")
			isInsert = queryStringFixed.startsWith("insert")
			if (isUpdate) {
				defaultOptions.type = QueryTypes.UPDATE
			}
			if (isInsert) {
				defaultOptions.type = QueryTypes.INSERT
			}
		}
		if (customOptions) {
			defaultOptions = {
				...defaultOptions,
				...customOptions
			}
		}
		if (isStraightToResults) {
			const result = await DbConn.sq.query(queryString, defaultOptions)
			if (isUpdate || isInsert) {
				return result[0]
			}
			return result
		}
		const resultPromise = DbConn.sq.query(queryString, defaultOptions)
		return resultPromise
	}

	public static async staticUpsertPromise(entityClass: any, joParam: any, customOptions?: QueryOptions): Promise<any> {
		const t = await DbConn.startConn()
		const result = ConnDao.performUpsert(t, entityClass, joParam, customOptions)
		return result
	}

	private static async performUpsert(t: Transaction, entityClass: any,
		joParam: any, customOptions?: QueryOptions, isStraightToResults = true): Promise<boolean> {
		const promise = entityClass.upsert(joParam, { transaction: t })
			.then(async (result: any) => {
				await DbConn.performCommit(t)
				return result
			})
		return promise
	}

}
