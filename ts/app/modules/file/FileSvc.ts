import { LayerService } from "app/layers_template/LayerService"
import { HStatus } from "app/util/status/HStatus"
import { CtHttpStatus, CtExcep, StringUtil } from "salesfy-shared"
import { Env } from "app/structure/Env"
import { IStatus } from "app/util/HBTypes"
import { ValUtil } from "app/util/ValUtil"
import { FileUtil } from "app/util/FileUtil"
import { BackendUtil } from "app/util/BackendUtil"
import { HExcep } from "app/util/status/HExcep"

export class FileSvc extends LayerService {

	public async delete(joParam: any): Promise<IStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "nmFile")
		await FileUtil.removeFromS3(joParam.nmFile)
		return new HStatus({})
	}

	public async get(joParam: any): Promise<IStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "nmFile")
		const lkFileS3 = `${BackendUtil.getLkS3ContentUsage()}/${joParam.nmFile}`
		const blFile = await FileUtil.getWebFile(lkFileS3)
		if (!blFile) {
			throw new HExcep({ ctStatus: CtExcep.nmKeyNotFound, joExtraContent: { nmKey: joParam.nmFile } })
		}
		const joFile = FileUtil.toJoFile(joParam.nmFile, lkFileS3)
		return new HStatus({ joResult: joFile })
	}

	public async post(joParam: any): Promise<IStatus> {
		joParam.obFile = await FileUtil.getS3AcceptableFormat(joParam)
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "obFile")
		const nmFile = joParam.nmFile || StringUtil.genFileName(joParam.idUserScope)
		await FileUtil.uploadToS3(nmFile, joParam.obFile)
		const lkFileS3 = `${BackendUtil.getLkS3ContentUsage()}/${nmFile}`
		const joFile = FileUtil.toJoFile(nmFile, lkFileS3)
		return new HStatus({ joResult: joFile })
	}
}
