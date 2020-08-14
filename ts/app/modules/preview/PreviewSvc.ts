import { LayerService } from "app/layers_template/LayerService";
import { HStatus } from "app/util/status/HStatus";
import { CtHttpStatus, CtExcep, StringUtil, CtError, SConst } from "salesfy-shared";
import { Env } from "app/structure/Env";
import { IStatus } from "app/util/HBTypes";
import { ValUtil } from "app/util/ValUtil";
import { FileUtil } from "app/util/FileUtil";
import { BackendUtil } from "app/util/BackendUtil";
import { HExcep } from "app/util/status/HExcep";
import { HError } from "app/util/status/HError";
import { PreviewBsn } from "app/modules/preview/PreviewBsn";
import { Log } from "app/structure/Log";
import { HStatusAbstract } from "app/util/status/HStatusAbstract";

export class PreviewSvc extends LayerService {

	public async get(joParam: any): Promise<IStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "lkPreview")
		let joPreview: any = {}
		try {
			const lkPreviewToFetch = StringUtil.maybePutHttpPrefix(joParam.lkPreview)
			const miStart = new Date().getTime()
			const joLinkHead = await PreviewBsn.getJoLinkHead(lkPreviewToFetch)
			if (!joLinkHead['content-type'] || !joLinkHead['content-type'].startsWith('text/html')) {
				throw new HExcep({ ctStatus: CtExcep.notHtmlPage, joExtraContent: { lkPreview: joParam.lkPreview } })
			}
			if (joLinkHead['content-length'] > (SConst.MEGBYTE_SIZE * 4)) {
				throw new HExcep({ ctStatus: CtExcep.pageSizeExceeded, joExtraContent: { lkPreview: joParam.lkPreview } })
			}
			const miAfterEval = new Date().getTime()
			const joPreviewRaw = await PreviewBsn.getLinkPreviewMetadata(lkPreviewToFetch, miStart, miAfterEval)
			joPreview = PreviewBsn.parseRawPreview(joPreviewRaw)
		} catch (err) {
			if (err instanceof HStatusAbstract) {
				throw err
			}
			throw new HExcep({ ctStatus: CtError.somethingWentWrong, dsConsole: err })
		}
		return new HStatus({ joResult: joPreview })
	}

}
