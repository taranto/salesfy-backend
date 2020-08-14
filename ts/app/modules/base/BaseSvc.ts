import { LayerService } from "app/layers_template/LayerService";
import { HStatus } from "app/util/status/HStatus";
import { CtHttpStatus, CtExcep } from "salesfy-shared";
import { Env } from "app/structure/Env";
import { getEnvelopedHtml } from "app/util/ServerRenderingUtil";

export class BaseSvc extends LayerService {

	public async root() : Promise<HStatus> {
		const dsAnswer = getEnvelopedHtml("Salesfy online!")
		return new HStatus({ dsHtmlResult: dsAnswer })
	}

	public async wrongRoute() : Promise<HStatus> {
		return new HStatus(
			{ ctStatus:CtExcep.wrongRoute, nrStatus: CtHttpStatus.status404.keyCtHttpStatus })
	}
}
