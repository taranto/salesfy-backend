import { IStatus } from "app/util/HBTypes";
import { HStatus } from "app/util/status/HStatus";
import { ValUtil } from "app/util/ValUtil";
import { LayerService } from "app/layers_template/LayerService";
import { UserBsn } from "app/modules/user/UserBsn";
import { HExcep } from "app/util/status/HExcep";
import { CtExcep, JsonUtil } from "salesfy-shared";

export class UserSvc extends LayerService {

	public async get(joParam: any): Promise<IStatus> {
		const userBsn = new UserBsn(this.t)
		const users = await userBsn.get(joParam)
		return new HStatus({ joResult: users })
	}

	public async getUserLogged(joParam: any): Promise<IStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idUserLogged")
		const userBsn = new UserBsn(this.t)
		const user = await userBsn.getUserLogged(joParam, true, true)
		return new HStatus({ joResult: user })
	}

	public async getInUserNetwork(joParam: any): Promise<IStatus> {
		const userBsn = new UserBsn(this.t)
		joParam.isLimitFree = true
		const arUser = await userBsn.getArUserNetwork(joParam)
		return new HStatus({ joResult: arUser })
	}

	public async put(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idUser")
		joParam = JsonUtil.removeParams(joParam, "crKeyPassword", "emUser", "dhRegister",
			"crKeyRefreshToken", "crKeyResetPassword", "dhKeyResetPasswordExpiration", "crKeyEmailConfirmation",
			"isEmailConfirmed", "dhLastAccess", "keyFacebook", "keyGoogle", "isActive", "idExternal")
		if (joParam.idUser != joParam.idUserScope) { //se um dia deixar de ser isso, verificar se o usuário está no network
			throw new HExcep({ ctStatus: CtExcep.userNotAuthorized })
		}
		const userBsn = new UserBsn(this.t)
		await userBsn.put(joParam)
		const user = await userBsn.get1(joParam.idUser)
		return new HStatus({ joResult: user })
	}

}
