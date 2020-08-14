import { LayerService } from "app/layers_template/LayerService";
import { Request, Response } from "express";
import { HStatus } from "app/util/status/HStatus";
import { SampleBsn } from "app/modules/sample/SampleBsn";

export class SampleSvc extends LayerService {

	constructor(req?: Request, res?: Response) {
		super(req, res)
	}

	public async get(joParam: any): Promise<HStatus> {
		const sampleBsn = new SampleBsn(this.t)
		const arSample = await sampleBsn.get(joParam)
		return new HStatus({ joResult: arSample })
	}

	public async post(joParam: any): Promise<HStatus> {
		const sampleBsn = new SampleBsn(this.t)
		const arSample = await sampleBsn.post(joParam)
		return new HStatus({ joResult: arSample })
	}

	public async put(joParam: any): Promise<HStatus> {
		const sampleBsn = new SampleBsn(this.t)
		const arSample = await sampleBsn.put(joParam)
		return new HStatus({ joResult: arSample })
	}

	public async delete(joParam: any): Promise<HStatus> {
		const sampleBsn = new SampleBsn(this.t)
		const arSample = await sampleBsn.delete(joParam)
		return new HStatus({ joResult: arSample })
	}
}
