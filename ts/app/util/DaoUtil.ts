import { ValHN, StringUtil, DateUtil, TDate, GeneralUtil, IEntity } from "salesfy-shared";
import { DbConn } from "app/structure/DbConn";

export class DaoUtil {

	public static fillSearchAll(joParam: any, dsMainSearch: string, ...dsEachSearch: string[]): any {
		if (!joParam[dsMainSearch]) {
			return joParam
		}
		dsEachSearch.forEach((dsSearch) => {
			joParam[dsSearch] = joParam[dsMainSearch]
		})
		return joParam
	}

	public static escapeStrings(joParam: any, ...arNmStringKeys: string[]): any {
		if (arNmStringKeys.length == 0) {
			arNmStringKeys = ValHN.getStringHNKeys(joParam);
		}

		const joParamEscaped = joParam;
		arNmStringKeys.forEach((nmStringKey: string) => {
			if (joParam[nmStringKey]) {
				const dsNewStringValue = joParam[nmStringKey];
				joParamEscaped[nmStringKey] = DaoUtil.escape(dsNewStringValue)
			}
		})
		return joParamEscaped;
	}

	public static escape(dsValue: string): string {
		return DbConn.sq.escape(dsValue)
	}

	public static maybeEscape(dsValue: any): any {
		if (StringUtil.isString(dsValue)) {
			return DbConn.sq.escape(dsValue)
		}
		return dsValue
	}

	public static asPartialStrings(joParam: any, nmParams: string[],
		joPartial?: { isOpenPrefix?: boolean, isOpenSuffix?: boolean }): any {
		let joParamModified = GeneralUtil.copy(joParam)
		if (Array.isArray(nmParams)) {
			nmParams.forEach((nmParam: string) => {
				joParamModified = DaoUtil.asPartialString(joParamModified, nmParam, joPartial)
			})
		}
		return joParamModified
	}

	public static asPartialString(joParam: any, nmParam: string,
		joPartial?: { isOpenPrefix?: boolean, isOpenSuffix?: boolean }): any {
		if (joParam[nmParam] != undefined && joParam[nmParam] != '') {
			const dsOpenPrefix = joPartial && joPartial.isOpenPrefix ? "%" : ""
			const dsOpenSuffix = joPartial && joPartial.isOpenSuffix ? "%" : ""
			joParam[nmParam] = dsOpenPrefix + (joParam[nmParam] + "").toLowerCase() + dsOpenSuffix;
		}
		return joParam
	}

	public static isActiveWhere(joParam: { isActive?: boolean }, nmEntity?: string): string {
		const dsNmEntity = nmEntity ? nmEntity + "." : ""
		const isActive = joParam.isActive == undefined ? "" : ` and ${dsNmEntity}isActive = ${joParam.isActive} `
		return isActive
	}

	public static qtLimitQtOffsetFilter(
		joParam: { qtLimit?: number, qtOffset?: number }, isLimitFree?: boolean): string {
		if (isLimitFree) {
			return ""
		}
		const qtLimit = joParam.qtLimit == undefined ? "" : ` limit ${joParam.qtLimit}`
		const qtOffset = joParam.qtOffset == undefined ? "" : ` offset ${joParam.qtOffset}`
		const qtLimitQtOffsetFilter = ` ${qtLimit} ${qtOffset} `
		return qtLimitQtOffsetFilter
	}

	public static sqlDateformat(dsValue: any, nmForcedType?: TDate, quotateIt = false): string {
		let formatted = ''
		if (dsValue instanceof Date) {
			formatted = DateUtil.beautify(dsValue, nmForcedType);
		}
		if (quotateIt) {
			formatted = `'${formatted}'`
		}
		return formatted
	}

	public static toPsqlDateMethod(dhValue: Date): string {
		const dsStringFormatted = DaoUtil.sqlDateformat(dhValue, "DateMili", true)
		const dsPsqlDate = `TO_TIMESTAMP(${dsStringFormatted}, 'YYYY-MM-DD HH24:MI:SS:MS')`
		return dsPsqlDate
	}

	public static sqlFormat(dsValue: any, nmForcedType?: TDate | "string"): string {
		if (dsValue == undefined || dsValue == null) {
			return 'null'
		}
		if (typeof dsValue == 'string' || nmForcedType == "string") {
			const dsValueEscaped = this.escape(dsValue)
			return dsValueEscaped
		}
		if (dsValue instanceof Date) {
			return DaoUtil.sqlDateformat(dsValue, nmForcedType, true)
		}
		return dsValue
	}

	//-------------------------------------------------

	/** @deprecated  aAa, bBb, cCc */
	public static toSelect(nmTableBase?: string, ...nmField: string[]): string {
		const dsTableBase = nmTableBase ? `${nmTableBase}.` : ""
		const selectString = nmField.reduce(
			(previousValue: string, currentValue: string, currentIndex: number, array: string[]) => {
				let selectStringAggregator = previousValue + DaoUtil.as(dsTableBase + currentValue, currentValue)
				if (array.length - 1 != currentIndex) {
					selectStringAggregator = selectStringAggregator + ", "
				}
				return selectStringAggregator
			}, "")
		return selectString + " "
	}

	public static as(dsTableAndAttribute: string, dsAsAttribute: string): string {
		const dsTranslated = `${dsTableAndAttribute} as \"${dsAsAttribute}\"`
		return dsTranslated
	}

	public static selectQuoted(...arNmAttribute: string[]): string {
		const arNmTranslatedPart: string[] = []
		arNmAttribute.forEach(nmAttribute => {
			arNmTranslatedPart.push(DaoUtil.as(nmAttribute, nmAttribute))
		})
		const cnTranslated = arNmTranslatedPart.join(", ")
		return cnTranslated
	}

	/** @deprecated  t.aAa, t.bBb, t.cCc */
	public static toFieldIdentified(nmTableBase?: string, ...nmField: string[]): string {
		const dsTableBase = nmTableBase ? `${nmTableBase}.` : ""
		const selectString = nmField.reduce(
			(previousValue: string, currentValue: string, currentIndex: number, array: string[]) => {
				let selectStringAggregator = previousValue + `${dsTableBase}${currentValue}`
				if (array.length - 1 != currentIndex) {
					selectStringAggregator = selectStringAggregator + ", "
				}
				return selectStringAggregator
			}, "")
		return selectString + " "
	}

	/** @deprecated aAa as "aAa", bBb as "bBb", c as "cCc" */
	public static toQuoted(...nmField: string[]): string {
		const selectString = nmField.reduce(
			(previousValue: string, currentValue: string, currentIndex: number, array: string[]) => {
				let selectStringAggregator = previousValue + ` \"${currentValue}\"`
				if (array.length - 1 != currentIndex) {
					selectStringAggregator = selectStringAggregator + ", "
				}
				return selectStringAggregator
			}, "")
		return selectString + " "
	}

	public static getCsNmField(arNmField: string[], nmTable?: string, isQuoted = false, arNmFieldTransl?: string[])
		: string {
		let csNmField = ""
		for (let index = 0; index < arNmField.length; index++) {
			const nmFieldTransl = arNmFieldTransl != undefined ? arNmFieldTransl[index] : undefined
			const nmField = arNmField[index]
			const nmFieldFinal = DaoUtil.getCsNmFieldUnit(nmField, nmTable, isQuoted, nmFieldTransl)
			csNmField = `${csNmField} ${nmFieldFinal} `
			if (arNmField.length - 1 != index) {
				csNmField = csNmField + ", "
			}
		}
		return ` ${csNmField} `
	}

	private static getCsNmFieldUnit(nmField: string, nmTable?: string, isQuoted = false, nmFieldTransl?: string) {
		if (!nmTable && !nmFieldTransl && !isQuoted) {
			return nmField
		}
		if (nmTable && !nmFieldTransl && !isQuoted) {
			return `${nmTable}.${nmField}`
		}
		if (!nmTable && nmFieldTransl && !isQuoted) {
			return `${nmField} as ${nmFieldTransl}`
		}
		if (!nmTable && !nmFieldTransl && isQuoted) {
			return `${DaoUtil.toQuote(nmField, isQuoted)}`
		}
		if (!nmTable && nmFieldTransl && isQuoted) {
			return `${nmField} as ${DaoUtil.toQuote(nmFieldTransl, isQuoted)}`
		}
		if (nmTable && !nmFieldTransl && isQuoted) {
			return `${nmTable}.${nmField} as ${DaoUtil.toQuote(nmField, isQuoted)}`
		}
		if (nmTable && nmFieldTransl && !isQuoted) {
			return `${nmTable}.${nmField} as ${nmFieldTransl}`
		}
		if (nmTable && nmFieldTransl && isQuoted) {
			return `${nmTable}.${nmField} as ${DaoUtil.toQuote(nmFieldTransl, isQuoted)}`
		}
		return nmField
	}

	public static toQuote(nmField: string, isQuoted = true): string {
		if (isQuoted) {
			return `\"${nmField}\"`
		}
		return nmField
	}

	public static csNmSelect(arNmField: string[], nmTable?: string, isQuoted = true, arNmFieldTransl?: string[]): string {
		const stringified = DaoUtil.getCsNmField(arNmField, nmTable, isQuoted, arNmFieldTransl)
		return stringified
	}

	public static csNmGroupBy(arNmField: string[], nmTable?: string, isQuoted = true): string {
		const stringified = DaoUtil.getCsNmField(arNmField, nmTable, isQuoted)
		return stringified
	}
}
