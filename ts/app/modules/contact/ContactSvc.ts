import { LayerService } from "app/layers_template/LayerService";
import { Request, Response } from "express";
import { HStatus } from "app/util/status/HStatus";
import { ValUtil } from "app/util/ValUtil";
import { ContactEmailBsn } from "app/modules/contact/ContactEmailBsn";

export class ContactSvc extends LayerService {

	constructor(req?: Request, res?: Response) {
		super(req, res)
	}

	public async contact(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "nmContact", "emContact")
		ContactEmailBsn.sendContactRequestEmail(joParam)
		return new HStatus()
	}
}
