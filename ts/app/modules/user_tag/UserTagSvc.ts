import { LayerService } from "app/layers_template/LayerService";
import { Request, Response } from "express";
import { HStatus } from "app/util/status/HStatus";
import { UserTagBsn } from "app/modules/user_tag/UserTagBsn";
import { ValUtil } from "app/util/ValUtil";

export class UserTagSvc extends LayerService {

	constructor(req?: Request, res?: Response) {
		super(req, res)
	}

	public async post(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idUserLogged", "idTag")
		joParam.idUser = joParam.idUserLogged
		const userTagBsn = new UserTagBsn(this.t)
		const userTag = await userTagBsn.post(joParam)
		return new HStatus({joResult:userTag})
	}

	public async delete(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idUserLogged", "idTag")
		joParam.idUser = joParam.idUserLogged
		const userTagBsn = new UserTagBsn(this.t)
		await userTagBsn.delete(joParam)
		return new HStatus({})
	}

	public async get(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idUserLogged")
		joParam.idUser = joParam.idUserLogged
		const userTagBsn = new UserTagBsn(this.t)
		const userTag = await userTagBsn.get(joParam)
		return new HStatus({joResult:userTag})
	}
}
