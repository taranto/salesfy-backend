import { IBuildOptions, Model, Table } from "sequelize-typescript";
import { FilteredModelAttributes } from "sequelize-typescript/lib/models/Model";
import { DaoUtil } from "app/util/DaoUtil";
import { EntityUtil } from "app/util/EntityUtil";

@Table({
	freezeTableName: true,
	paranoid: true,
	timestamps: false,
	underscored: false,
})
export class LayerEntity<T> extends Model<LayerEntity<T>> {

	constructor(values?: FilteredModelAttributes<LayerEntity<T>>, options?: IBuildOptions) {
		super(values, options);
	}

	public static getNmTable(): string {
		const nmTable = EntityUtil.getNmTable(this)
		return nmTable
	}

	public static getNmAlias(): string {
		const nmAlias = EntityUtil.getNmAlias(this)
		return nmAlias
	}

	// public static getCsNmField(
	// 	arNmField:string[], nmTable?: string, isQuoted = false, arNmFieldTransl?: string[]): string {
	// 	const stringified = EntityUtil.getCsNmField(this, arNmField, nmTable, isQuoted, arNmFieldTransl)
	// 	return stringified
	// }

	public static getCsSetOnConflict(shIncludePK: boolean, shIncludeUnique: boolean): string {
		const csSetOnConflict = EntityUtil.getCsSetOnConflict(this, shIncludePK, shIncludeUnique)
		return csSetOnConflict
	}

	public static getCsCsValuesToUpdate(arJoParam: any[], shIncludePK: boolean, shIncludeUnique: boolean)
		: string {
		const csCsValuesToUpdate = EntityUtil.getCsCsValuesToUpdate(this, arJoParam, shIncludePK, shIncludeUnique)
		return csCsValuesToUpdate
	}

	public static getArArValuesToUpdate(arJoParam: any[], shIncludePK: boolean, shIncludeUnique: boolean)
		: any[][] {
		const arArObValue = EntityUtil.getArArValuesToUpdate(this, arJoParam, shIncludePK, shIncludeUnique)
		return arArObValue
	}

	public static getArNmField(shIncludePK = true, shIncludeUnique = true): string[] {
		const arNmField = EntityUtil.getArNmField(this, shIncludePK, shIncludeUnique)
		return arNmField
	}

	public static getCsUniqueField(shIncludePK: boolean): string {
		const csUniqueField = EntityUtil.getCsUniqueField(this, shIncludePK)
		return csUniqueField
	}

	public static getArNmUniqueField(shIncludePK: boolean): string[] {
		const arNmUnique = EntityUtil.getArNmUniqueField(this, shIncludePK)
		return arNmUnique
	}
}
