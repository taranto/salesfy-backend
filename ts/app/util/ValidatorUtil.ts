import { ValHN, KeyEnum, CtWarn, CtExcep } from "salesfy-shared";
import { HExcep } from "app/util/status/HExcep";

/**
 * @deprecated
 */
export class ValidatorUtil {

	public static keepOnlyJoKeys(joParam: any, ...keyNames: string[]) {
		const joParamResult : any = {}
		keyNames.forEach(keyName => {
			joParamResult[keyName] = joParam[keyName]
		})
		return joParamResult
	}

	public static keepOnlyArJoKeys(arJoParam: any[], ...keyNames: string[]) {
		const arJoParamResult : any[] = []
		arJoParam.forEach((joParam: any) => {
			const joParamResult = ValidatorUtil.keepOnlyJoKeys(joParam, ...keyNames)
			arJoParamResult.push(joParamResult)
		})
		return arJoParamResult
	}

	public static removeJoKeys(joParam: any, ...keyNames: string[]) {
		keyNames.forEach(keyName => {
			delete joParam[keyName]
		})
	}

	public static removeArJoKeys(arJoParam: any[], ...keyNames: string[]) {
		arJoParam.forEach((joParam: any) => {
			ValidatorUtil.removeJoKeys(joParam, ...keyNames)
		})
	}

	public static denyJoKeys(joParam: any, ...keyNames: string[]) {
		keyNames.forEach(keyName => {
			if (joParam[keyName] != null) {
				throw new HExcep({ ctStatus: CtWarn.nmKeyProhibited, joExtraContent: { nmKey: keyName } })
			}
		})
	}

	public static denyArJoKeys(arJoParam: any[], ...keyNames: string[]) {
		arJoParam.forEach((joParam: any) => {
			ValidatorUtil.denyJoKeys(joParam, ...keyNames)
		})
	}

	public static valArJoKeysRequiredOne(arJoParam: any, ...keyNames: string[]) {
		arJoParam.forEach((joParam:any) => {
			ValidatorUtil.valJoKeysRequiredOne(joParam)
		})
	}

	public static valJoKeysRequiredOne(joParam: any, ...keyNames: string[]) {
		let isAnyKeyNameFound = false
		keyNames.forEach(keyName => {
			if (joParam[keyName] != null) {
				isAnyKeyNameFound = true
			}
		})
		if (!isAnyKeyNameFound) {
			throw new HExcep({ ctStatus: CtWarn.nmKeyRequired,
				joExtraContent: { nmKey:keyNames.join(",") } })
		}
	}

	public static valJoKeys(joParam: any, acEmpty=false, ...keyNames: string[]) {
		ValidatorUtil.valJoKeysRequired(joParam, ...keyNames)
		ValidatorUtil.valJoHungarianNotation(joParam, acEmpty, ...keyNames)
	}

	public static valArJoKeys(arJoParam: any[], acEmpty=false, ...keyNames: string[]) {
		ValidatorUtil.valArJoKeysRequired(arJoParam, acEmpty, ...keyNames)
		ValidatorUtil.valArJoHungarianNotation(arJoParam, acEmpty, ...keyNames)
	}

	public static valArJoHungarianNotation(arJoParam: any[], acEmpty=false, ...keyNames: string[]) {
		arJoParam.forEach((joParam: any) => {
			ValidatorUtil.valJoHungarianNotation(joParam, acEmpty, ...keyNames)
		})
	}

	public static valJoHungarianNotation(joParam: any, acEmpty=false, ...keyNames: string[]) {
		const invalidParams = ValHN.getInvalidParams(joParam, acEmpty, keyNames)
		if (invalidParams.length > 0) {
			throw new HExcep({ ctStatus: CtWarn.nmKeyInWrongFormat,
				joExtraContent: { nmKey: invalidParams.join(", "), count:invalidParams.length } })
		}
	}

	public static valArJoKeysRequired(arJoParam: any, acEmpty=false, ...keyNames: string[]) {
		arJoParam.forEach((joParam: any) => {
			ValidatorUtil.valJoKeys(joParam, acEmpty, ...keyNames)
		})
	}

	public static valJoKeysRequired(joParam: any, ...keyNames: string[]) {
		keyNames.forEach(keyName => {
			if (joParam[keyName] == null) {
				throw new HExcep({ ctStatus: CtWarn.nmKeyRequired, joExtraContent: { nmKey: keyName } })
			}
		})
	}
}
