import { Transaction } from "sequelize";
import { LayerBusiness } from "app/layers_template/LayerBusiness";
import { IContent, IUser, KeyEnum, I18n, IAuth, IGroup } from "salesfy-shared";
import { HEmailBuilder } from "app/util/HEmailBuilder";
import { HEmail } from "app/structure/HEmail";
import { Env } from "app/structure/Env";

export class InviteEmailBsn extends LayerBusiness {

	constructor(t: Transaction) {
		super(t)
	}

	public static async sendInviteEmail(userInviter : IAuth, authInvited: IAuth, unKeyPassword:string, group?:IGroup) {
		const dsEmailHtml = HEmailBuilder.getDsInviteHtml(userInviter, authInvited, unKeyPassword, group)
		const dsSubject = I18n.t(KeyEnum.emailInviteSubject, undefined, userInviter.nrLanguage)
		HEmail.toSendEmail({ to: authInvited.emUser, subject: dsSubject, html: dsEmailHtml })
	}
}
