import { LayerBusiness } from "app/layers_template/LayerBusiness";
import { BackendUtil } from "app/util/BackendUtil";
import { CtError, IWorkspace } from "salesfy-shared";
import { ValUtil } from "app/util/ValUtil";
import { HError } from "app/util/status/HError";
import { SampleDao } from "app/modules/sample/SampleDao";

export class SampleBsn extends LayerBusiness {

	public async post(joParam: any): Promise<IWorkspace> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "")
		const sampleDao = new SampleDao(this.t)
		const sample = await sampleDao.create(joParam)
		return sample
	}

	public async get(joParam: any): Promise<IWorkspace[]> {
		const sampleDao = new SampleDao(this.t)
		const sample = await sampleDao.get(joParam)
		return sample
	}

	public async get1(idSample: number, idUserScope?: number): Promise<IWorkspace> {
		const arSample = await this.get({ idSample: idSample, idUserScope: idUserScope })
		if (arSample.length > 1) {
			throw new HError({ ctStatus:CtError.parametersAreMissing })
		}
		return arSample[0]
	}

	public async put(joParam: any): Promise<IWorkspace> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idSample")
		const sampleDao = new SampleDao(this.t)
		const sample = await sampleDao.upsert(joParam)
		return sample
	}

	public async delete(joParam: any): Promise<void> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idSample")
		const sampleDao = new SampleDao(this.t)
		await sampleDao.create(joParam)
	}
}
