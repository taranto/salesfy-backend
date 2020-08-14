import { LayerService } from "app/layers_template/LayerService";
import { Request, Response } from "express";
import { HStatus } from "app/util/status/HStatus";
import { TagBsn } from "app/modules/tag/TagBsn";

export class TagSvc extends LayerService {

	constructor(req?: Request, res?: Response) {
		super(req, res)
	}

	public async get(joParam: any): Promise<HStatus> {
		const tagBsn = new TagBsn(this.t)
		const rows = await tagBsn.get(joParam)
		return new HStatus({joResult:rows})
	}

}
