import { Transaction } from "sequelize";
import { LayerBusiness } from "app/layers_template/LayerBusiness";
import { IContent, IUser, IChannel } from "salesfy-shared";
import { HEmailBuilder } from "app/util/HEmailBuilder";
import { HEmail } from "app/structure/HEmail";
import { Env } from "app/structure/Env";

export class ChannelEmailBsn extends LayerBusiness {

	constructor(t: Transaction) {
		super(t)
	}

	public static async sendToAdminNewChannelEmail(channel: IChannel, user: IUser) {
		const dsEmailHtml = HEmailBuilder.getDsAdminNewChannelHtml(channel, user)
		const dsSubject = "Novo canal publicado em Salesfy"
		const emEmailCurator = Env.getEmailEmCurator()
		HEmail.toSendEmail({ to: emEmailCurator, subject: dsSubject, html: dsEmailHtml })
	}
}
