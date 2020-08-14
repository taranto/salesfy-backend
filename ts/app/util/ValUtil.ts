import { ValHN, KeyEnum, JsonUtil, CtWarn } from "salesfy-shared";
import { HExcep } from "app/util/status/HExcep";

export class ValUtil {

	public static isValArJoHN(arJoParam: any[], acEmpty = false, ...arNmKey: string[]) {
		arJoParam.forEach((joParam: any) => {
			return ValUtil.isValJoHN(joParam, acEmpty, ...arNmKey)
		})
		return true
	}

	public static isValJoHN(joParam: any, acEmpty = false, ...arNmKey: string[]) {
		const invalidParams = ValHN.getInvalidParams(joParam, acEmpty, arNmKey)
		if (invalidParams.length > 0) {
			return false
		}
		return true
	}

	public static isArNmKeyMissingInArJoParam(arJoParam: any[], ...arNmKey: string[]) {
		const arNmKeyMissing = JsonUtil.getArNmKeyMissingInArJoParam(arJoParam, ...arNmKey)
		if (arNmKeyMissing.length > 0) {
			return false
		}
		return true
	}

	public static isArNmKeyMissingInJoParam(joParam: any, ...arNmKey: string[]) : boolean {
		const arNmKeyMissing = JsonUtil.getArNmKeyMissingInJoParam(joParam, ...arNmKey)
		const isArNmKeyMissingInJoParam = arNmKeyMissing.length > 0
		return isArNmKeyMissingInJoParam
	}

	public static throwValArJoHN(arJoParam: any[], acEmpty = false, ...arNmKey: string[]) : void {
		arJoParam.forEach((joParam: any) => {
			ValUtil.throwValJoHN(joParam, acEmpty, ...arNmKey)
		})
	}

	public static throwValJoHN(joParam: any, acEmpty = false, ...arNmKey: string[]) {
		const invalidParams = ValHN.getInvalidParams(joParam, acEmpty, arNmKey)
		if (invalidParams.length > 0) {
			throw new HExcep({
				ctStatus: CtWarn.nmKeyInWrongFormat,
				joExtraContent: { nmKey: invalidParams.join(", "), count: invalidParams.length }
			})
		}
	}

	public static throwArNmKeyMissingInArJoParam(arJoParam: any[], ...arNmKey: string[]) {
		const arNmKeyMissing = JsonUtil.getArNmKeyMissingInArJoParam(arJoParam, ...arNmKey)
		if (arNmKeyMissing.length > 0) {
			throw new HExcep({
				ctStatus: CtWarn.nmKeyRequired,
				joExtraContent: { nmKey: arNmKeyMissing.join(", "), count: arNmKeyMissing.length }
			})
		}
	}

	public static throwArNmKeyMissingInJoParam(joParam: any, ...arNmKey: string[]) {
		const arNmKeyMissing = JsonUtil.getArNmKeyMissingInJoParam(joParam, ...arNmKey)
		if (arNmKeyMissing.length > 0) {
			throw new HExcep({
				ctStatus: CtWarn.nmKeyRequired,
				joExtraContent: { nmKey: arNmKeyMissing.join(", "), count: arNmKeyMissing.length }
			})
		}
	}

	public static throwArNmKeyMissingInJoParamCase(joParam: any, ...arArNmKey: string[][]) {
		let arNmKeyMissing: string[] = []
		let isCaseSucced = false
		arArNmKey.forEach(arNmKey => {
			if (!isCaseSucced) {
				arNmKeyMissing = JsonUtil.getArNmKeyMissingInJoParam(joParam, ...arNmKey)
				if (arNmKeyMissing.length == 0) {
					isCaseSucced = true
				}
			}
		})
		if (!isCaseSucced) {
			throw new HExcep({
				ctStatus: CtWarn.nmKeyRequired,
				joExtraContent: { nmKey: arNmKeyMissing.join(", "), count: arNmKeyMissing.length }
			})
		}
	}
}
