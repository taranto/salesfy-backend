import { Log } from "./../structure/Log"
import { Transaction } from './../structure/DbConn'
import { StringUtil, IEntity, CtError } from "salesfy-shared";
import { QueryOptions } from "sequelize";
import { HError } from "app/util/status/HError";
import { ConnDao } from "app/structure/ConnDao";
import { DaoUtil } from "app/util/DaoUtil";
import { LayerEntity } from "app/layers_template/LayerEntity";
import { Model } from "sequelize-typescript";
import { EntityUtil } from "app/util/EntityUtil";

export abstract class LayerDao<T extends LayerEntity<Model<T>>, I extends IEntity> {

	protected t: Transaction

	constructor(t: Transaction) {
		this.t = t
	}

	protected static isSelectQuoted(joParam: { isSelectQuoted?: boolean }, isAlternative = true): boolean {
		const isSelectQuoted = joParam.isSelectQuoted != undefined ? joParam.isSelectQuoted : isAlternative
		return isSelectQuoted
	}

	protected async doOp(entityClass: any, idField: number, nmField: string, dsFullOperation: string): Promise<I> {
		const result = await this.doOpCustom(entityClass, dsFullOperation, `${nmField} = ${idField}`)
		return result[0]
	}

	protected async doOpMulti(entityClass: any, arIdField: number[], nmField: string, dsFullOperation: string)
		: Promise<I[]> {
		const result = await this.doOpCustom(entityClass, dsFullOperation, `${nmField} in (${arIdField})`)
		return result
	}

	protected async doOpCustom(entityClass: any, dsFullOperation: string, dsFullCondition: string): Promise<I[]> {
		const nmTable = EntityUtil.getNmTable(entityClass)
		const query = `update ${nmTable}
			set ${dsFullOperation}
			where ${dsFullCondition}
			returning ${DaoUtil.getCsNmField(entityClass.getArNmField(), nmTable, true, entityClass.getArNmField())}`
		const result = await this.query(query)
		return result
	}

	public abstract get(joParam: any): Promise<I[]>

	protected async query(
		queryString: string, customOptions?: QueryOptions, isStraightToResults = true): Promise<I[]> {
		const result: any = await ConnDao.performQuery(this.t, queryString, customOptions, isStraightToResults)
			.then(qr => this.defaultResultLog(qr, queryString))
			.catch(err => this.defaultCatchError(err))
		const resultCast: I[] = result
		return resultCast
	}

	protected defaultCatchError(err: any) {
		throw new HError({
			ctStatus: CtError.databaseProblem,
			dsConsole: `[DAO][${this.constructor.name}][REASON ${err}][QUERY ${err.sql}][STACK ${err.stack}]`
		})
	}

	protected defaultResultLog(result: any, query: string): string {
		const queryBracket = query ? `[QUERY ${query}]` : ""
		Log.silly(`[DAO][QUERY AT ${this.constructor.name}][QUERY RESULT ${JSON.stringify(result)}]${queryBracket}`)
		return result
	}

	public async bulkUpsert(entityClass: any, arJoParam: any | I): Promise<I[]> {
		const className = entityClass.name
		const csNmField = entityClass.getArNmField(false, true)
		const csCsValuesToUpdate = entityClass.getCsCsValuesToUpdate(arJoParam, false, true)
		const csUniqueAttribute = entityClass.getCsUniqueField(false)
		const csSetOnConflict = entityClass.getCsSetOnConflict(false, false)
		const csReturning = DaoUtil.getCsNmField(
			entityClass.getArNmField(), entityClass.getNmTable(), true, entityClass.getArNmField())
		const query = `INSERT INTO
		${className} (${csNmField})
		VALUES
		${csCsValuesToUpdate}
		ON CONFLICT (${csUniqueAttribute}) DO UPDATE SET
		${csSetOnConflict}
		returning ${csReturning}`
		const result: I[] = await this.query(query, { transaction: this.t, returning: true })
		return result
	}

	public async upsert(entityClass: any, joParam: any | I): Promise<I> {
		const result: any = await entityClass.upsert(joParam, { transaction: this.t, returning: true })
			.catch((err: any) => this.defaultCatchError(err))
		const entity: I = result[0].dataValues
		return entity
	}

	public async create(entityClass: any, joParam: any | I, shThrowForcedPk = true): Promise<I> {
		const nmIdEntityClass = entityClass["primaryKeyAttribute"]
		if (joParam[nmIdEntityClass]) {
			if (shThrowForcedPk) {
				this.defaultCatchError(
					`Trying to create an object with an id number already associated: ${joParam[nmIdEntityClass]}`)
			}
			delete joParam[nmIdEntityClass]
		}
		if (entityClass.rawAttributes.hasOwnProperty('isActive')) {
			joParam.isActive = true
		}
		const result: any = await entityClass.create(joParam, { transaction: this.t, returning: true })
			.catch((err: any) => this.defaultCatchError(err))
		const entity: I = result.dataValues
		return entity
	}

	public async update(entityClass: any, joParam: any | I, joWhere?: any): Promise<I> {
		if (!joWhere) {
			const nmIdEntityClass = entityClass["primaryKeyAttribute"]
			if (!joParam[nmIdEntityClass]) {
				this.defaultCatchError("Trying to update with neither custom nor default pk condition")
			}
			joWhere = {}
			joWhere[nmIdEntityClass] = joParam[nmIdEntityClass]
		}
		const result: any = await entityClass.update(joParam, { transaction: this.t, returning: true, where: joWhere })
			.catch((err: any) => this.defaultCatchError(err))
		const entity: I = result[1][0].dataValues
		return entity
	}

	public async delete(entityClass: any, joWhere: any): Promise<void> {
		if (joWhere == {}) { //TODO adicionar também a inexistência de qualquer nome de atributo desta tabela
			this.defaultCatchError("Trying to delete with no where condition")
		}
		if (entityClass.rawAttributes.hasOwnProperty('isActive')) {
			await this.inactivate(entityClass, joWhere)
			return
		}

		const result: any = await entityClass.destroy({ transaction: this.t, where: joWhere })
			.catch((err: any) => this.defaultCatchError(err))
		return
	}

	private async inactivate(entityClass: any, joWhere: any) {
		if (joWhere == {}) { //TODO adicionar também a inexistência de qualquer nome de atributo desta tabela
			this.defaultCatchError("Trying to inactivate with no where condition")
		}
		if (entityClass.hasOwnProperty('isActive')) {
			const nmIdEntityClass = entityClass["primaryKeyAttribute"]
			if (!joWhere.hasOwnProperty(nmIdEntityClass)) {
				if (!joWhere[nmIdEntityClass]) {
					this.defaultCatchError("Trying to inactivate with neither custom nor default pk condition")
				}
			}
			const joParam = {
				isActive: false
			}
			await this.update(entityClass, joParam, joWhere)
			return
		}
	}

	// public async getRaw(entityClass: any, joWhere: any): Promise<I[]> {
	// 	//TODO colocar limit/offset
	// 	//TODO colocar idpk verify
	// 	//TODO colocar idfk1 idfk2 verify (p/ MxM)
	// 	const result: any = await entityClass.find({ transaction: this.t, returning: true, where: joWhere })
	// 		.catch((err: any) => this.defaultCatchError(err))
	// 	const entity: I[] = result[1]
	// 	return entity
	// }
}
