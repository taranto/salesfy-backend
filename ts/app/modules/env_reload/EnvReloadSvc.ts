import { LayerService } from "app/layers_template/LayerService";
import { Request, Response } from "express";
import { HStatus } from "app/util/status/HStatus";
import { ValUtil } from "app/util/ValUtil";
import { UserBsn } from "app/modules/user/UserBsn";
import { KeyEnum, CtExcep } from "salesfy-shared";
import { HExcep } from "app/util/status/HExcep";
import { Server } from "app/structure/Server";

export class EnvReloadSvc extends LayerService {

	constructor(req?: Request, res?: Response) {
		super(req, res)
	}

	public async reload(joParam:any) : Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idUserLogged")
		const userBsn = new UserBsn(this.t)
		const user : any= await userBsn.getUserLogged(joParam, false, true)
		if (!user.canReloadEnv) {
			throw new HExcep({ ctStatus:CtExcep.userNotAuthorized })
		}
		Server.reloadEnvVar()
		return new HStatus({})
	}

}
