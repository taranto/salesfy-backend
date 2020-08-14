import { LayerService } from "app/layers_template/LayerService";
import { Request, Response } from "express";
import { NotifyMsgBsn } from "app/modules/notify_msg/NotifyMsgBsn";
import { ValUtil } from "app/util/ValUtil";
import { SConst, CtLocale } from "salesfy-shared";
import { AuthBsn } from "app/modules/auth/AuthBsn";
import { HStatus } from "app/util/status/HStatus";

export class NotifyMsgSvc extends LayerService {

	private notifyMsgBsn: NotifyMsgBsn

	constructor(req?: Request, res?: Response) {
		super(req, res)
	}

	public newLayerBusiness(): void {
		this.notifyMsgBsn = new NotifyMsgBsn(this.t)
	}

	public async notifyMsg(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "snVersion", "nmCtSystem")
		this.registerInSession(joParam);
		const notifyMsg = await this.notifyMsgBsn.getNotifyMsgsToShow(joParam)
		if (!notifyMsg) {
			return new HStatus()
		}
		const obCtLocale = await this.getDesiredLocale(joParam);
		const dsMsgRaw = notifyMsg.keyMsg ? undefined : NotifyMsgBsn.getDsLocaleMessage(notifyMsg, obCtLocale)
		const joAnswer = {
			keyMsg: notifyMsg.keyMsg,
			dsMsgRaw: dsMsgRaw,
			isBlocked: notifyMsg.isBlockable,
			isUpdate: notifyMsg.isUpdatable
		}
		return new HStatus({ joResult: joAnswer })
	}

	private registerInSession(joParam: any) {
		if (this.req.session) {
			this.req.session.vlAppVersion = joParam.snVersion;
		}
	}

	private async getDesiredLocale(joParam: any) {
		let ctLocale = CtLocale.get(joParam.nmCtLocale || joParam.keyCtLocale).keyCtLocale
		if (joParam.idUserLogged) {
			const authBsn = new AuthBsn(this.t);
			const auth = await authBsn.get(joParam.idUserLogged);
			ctLocale = +auth.nrLanguage;
		}
		return ctLocale;
	}
}
