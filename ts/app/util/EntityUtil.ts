import { IEntity, ValHN } from "salesfy-shared";
import { DaoUtil } from "app/util/DaoUtil";

export class EntityUtil {

	public static getNmTable(entityClass: any): string {
		const nmTable = entityClass["tableName"]
		return nmTable
	}

	public static getNmAlias(entityClass: any): string {
		const nmAlias = entityClass["nmAlias"]
		return nmAlias
	}

	public static getCsNmField(
		entityClass: any, arNmField: string[], nmTable?: string, isQuoted = false, arNmFieldTransl?: string[]): string {
		const stringified = DaoUtil.getCsNmField(arNmField, nmTable, isQuoted, arNmFieldTransl)
		return stringified
	}

	public static getCsSetOnConflict(entityClass: any, shIncludePK: boolean, shIncludeUnique: boolean): string {
		const arSetOnConflict: string[] = []
		const arNmField = EntityUtil.getArNmField(entityClass, shIncludePK, shIncludeUnique)
		arNmField.forEach((nmField: string) => {
			const dsSetOnConflict = `${nmField} = excluded.${nmField}`
			arSetOnConflict.push(dsSetOnConflict)
		})
		const csSetOnConflict = arSetOnConflict.join(`,
		`)
		return csSetOnConflict
	}

	public static getCsCsValuesToUpdate(entityClass: any, arJoParam: any[], shIncludePK: boolean, shIncludeUnique: boolean)
		: string {
		const arArValuesToUpdate = EntityUtil.getArArValuesToUpdate(entityClass, arJoParam, shIncludePK, shIncludeUnique)
		const arCsValuesToUpdate: string[] = []
		arArValuesToUpdate.forEach((arValuesToUpdate: any[]) => {
			const csValuesToUpdate = `(${arValuesToUpdate.join(",")})`
			arCsValuesToUpdate.push(csValuesToUpdate)
		})
		const csCsValuesToUpdate = arCsValuesToUpdate.join(`,
		`)
		return csCsValuesToUpdate
	}

	public static getArArValuesToUpdate(entityClass: any, arJoParam: any[], shIncludePK: boolean, shIncludeUnique: boolean)
		: any[][] {
		const arArObValue: string[][] = []
		const arNmField = EntityUtil.getArNmField(entityClass, shIncludePK, shIncludeUnique)
		arJoParam.forEach((joParam: any) => {
			const arObValue: string[] = []
			arNmField.forEach((nmField: string) => {
				let obValue = joParam[nmField]
				if (obValue == undefined) {
					const obValueDefault = EntityUtil.getFieldDefaultValue(entityClass, nmField)
					obValue = obValueDefault
				}
				const obValueFormatted = DaoUtil.sqlFormat(obValue)
				arObValue.push(obValueFormatted)
			})
			arArObValue.push(arObValue)
		})
		return arArObValue
	}

	public static getFieldDefaultValue(entityClass: any, nmField: string): any {
		const obValueDefault = entityClass["fieldRawAttributesMap"][nmField.toLowerCase()]["defaultValue"]
		return obValueDefault
	}

	public static getArNmField(entityClass: any, shIncludePK = true, shIncludeUnique = true): string[] {
		const arNmField: string[] = []
		const arNmExclude: string[] = []
		if (!shIncludePK) {
			const nmPrimaryKeyField = entityClass["primaryKeyField"]
			arNmExclude.push(nmPrimaryKeyField)
		}
		if (!shIncludeUnique) {
			const arNmUnique = EntityUtil.getArNmUniqueField(entityClass, false)
			arNmExclude.push(...arNmUnique)
		}
		const arJoFieldDirty = entityClass["rawAttributes"]
		const arNmFieldDirty = Object.getOwnPropertyNames(arJoFieldDirty)
		arNmFieldDirty.forEach((nmFieldDirty: any) => {
			if (arNmExclude.indexOf(nmFieldDirty.toLowerCase()) == -1) {
				arNmField.push(nmFieldDirty)
			}
		})
		return arNmField
	}

	public static getCsUniqueField(entityClass: any, shIncludePK: boolean): string {
		const arNmUniqueField = EntityUtil.getArNmUniqueField(entityClass, shIncludePK)
		const csUniqueField = arNmUniqueField.join(",")
		return csUniqueField
	}

	//TODO metodo potencialmente errado. arrumar usando rawAttributes como elemento de comparação.
	public static getArNmUniqueField(entityClass: any, shIncludePK: boolean): string[] {
		const nmPrimaryKeyField = entityClass["primaryKeyField"]
		const arNmUniqueDirty = entityClass["uniqueKeys"]["uniqueTag"]["fields"]
		const arNmUnique = ValHN.toArCamelCase(arNmUniqueDirty)
		return arNmUnique
	}
}
