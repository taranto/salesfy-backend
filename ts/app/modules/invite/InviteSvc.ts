import { LayerService } from "app/layers_template/LayerService";
import { HStatus } from "app/util/status/HStatus";
import { ValUtil } from "app/util/ValUtil";
import { AuthBsn } from "app/modules/auth/AuthBsn";
import { HExcep } from "app/util/status/HExcep";
import { HPlusStatus } from "app/util/status/HPlusStatus";
import { KeyEnum, IAuth, StringUtil, IGroup, CtError, CtExcep, CtUserGroupAccess } from "salesfy-shared";
import { InviteEmailBsn } from "app/modules/invite/InviteEmailBsn";
import { UserBsn } from "app/modules/user/UserBsn";
import { GroupBsn } from "app/modules/group/GroupBsn";
import { UserGroupBsn } from "app/modules/user_group/UserGroupBsn";
import { UserGroupSvc } from "app/modules/user_group/UserGroupSvc";
import { AuthEmailBsn } from "app/modules/auth/AuthEmailBsn";
import { UserSvc } from "app/modules/user/UserSvc";

export class InviteSvc extends LayerService {

	public async post(joParam: any): Promise<HStatus> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "emUserInvite")
		// const userBsn = new UserBsn(this.t)
		// const authInviter: any = await userBsn.getUserLogged(joParam, true)
		// if (!authInviter) {
		// 	throw new HExcep({ ctStatus:CtExcep.nmKeyNotFound, joExtraContent : { nmKey: KeyEnum.user } })
		// }

		const userSvc = new UserSvc(this.req, this.res, this.t)
		const iStatusU = await userSvc.getUserLogged(joParam)
		const userInviter = iStatusU.joResult

		const authBsn = new AuthBsn(this.t)
		const unKeyPassword = StringUtil.random()
		const joParamRegisterInvited = {
			emUser: joParam.emUserInvite,
			unKeyPassword: unKeyPassword,
		}

		const userInvited  = await authBsn.register(joParamRegisterInvited)
		let joResult
		let group
		let userGroup
		if (joParam.idGroup) {
			const groupBsn = new GroupBsn(this.t)
			group = await groupBsn.get1(joParam.idGroup, joParam.idUserScope)
			if (!group) {
				throw new HExcep({ ctStatus:CtExcep.userNotAuthorized })
			}
			const userGroupSvc = new UserGroupSvc(this.req, this.res, this.t)
			const joParamUserGroup = {
				...joParam,
				idUser: userInvited.idUser,
				idGroup: joParam.idGroup,
				idCtUserGroupAccess: CtUserGroupAccess.reader.key
			}
			userGroup = await userGroupSvc.post(joParamUserGroup)
			joResult = {
				...userGroup.joResult
			}
		} else {
			const userBsn = new UserBsn(this.t)
			const authInvitedWithNoPrivateInfo = await userBsn.get({ idUser: userInvited.idUser })
			joResult = {
				...authInvitedWithNoPrivateInfo[0],
				emUser : joParam.emUserInvite
			}
		}

		InviteEmailBsn.sendInviteEmail(userInviter, userInvited, unKeyPassword, group)
		AuthEmailBsn.sendAdminNewUserEmail(userInvited, userInviter)
		return new HPlusStatus({ joResult: joResult })
	}

}
