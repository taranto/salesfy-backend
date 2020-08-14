import { CtUserGroupAccess } from "salesfy-shared";
import { IStatus } from "app/util/HBTypes";
import { Env } from "app/structure/Env";

export class LegacyTranslator {

	public static translateSystemLegacyParams(joParam : any) : any {
		if (!Env.shSupportLegacy()) {
			return joParam
		}
		joParam = LegacyTranslator.translateReaderUpdateParam(joParam)
		return joParam
	}

	private static translateReaderUpdateParam(joParam : any) : any { //20T1
		if (joParam.isGroupAdmin != undefined) {
			joParam.idCtUserGroupAccess = joParam.isGroupAdmin ? CtUserGroupAccess.admin.key : CtUserGroupAccess.member.key
			delete joParam.isGroupAdmin
		}
		if (joParam.isChannelAdmin != undefined) {
			joParam.idCtUserGroupAccess = joParam.isChannelAdmin ? CtUserGroupAccess.admin.key : CtUserGroupAccess.member.key
			delete joParam.isChannelAdmin
		}
		return joParam
	}

	public static translateSystemLegacyResults(iStatus : IStatus) : IStatus {
		if (!Env.shSupportLegacy()) {
			return iStatus
		}
		if (!iStatus.joResult) {
			return iStatus
		}
		const joParam = LegacyTranslator.translateAllResults(iStatus.joResult)
		if (joParam.length != undefined) {
			for (let index = 0; index < joParam.length; index++) {
				joParam[index] = LegacyTranslator.translateAllResults(joParam[index])
			}
		}
		iStatus.joResult = joParam
		return iStatus
	}

	private static translateAllResults(joParam : any|any[]) : any|any {
		LegacyTranslator.translateReaderUpdateResult(joParam)
		return joParam
	}

	private static translateReaderUpdateResult(joParam : any) : any { //20T1
		if (joParam.idCtUserGroupAccess != undefined) {
			joParam.isGroupAdmin = joParam.idCtUserGroupAccess == CtUserGroupAccess.admin.key
		}
		return joParam
	}
}
