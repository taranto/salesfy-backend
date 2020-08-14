import { Transaction } from "sequelize";
import { LayerBusiness } from "app/layers_template/LayerBusiness";
import { IContent, IUser } from "salesfy-shared";
import { HEmailBuilder } from "app/util/HEmailBuilder";
import { HEmail } from "app/structure/HEmail";
import { Env } from "app/structure/Env";

export class ContentPublishEmailBsn extends LayerBusiness {

	constructor(t: Transaction) {
		super(t)
	}

	public static async sendToAdminNewPublishEmail(
		content: IContent, user: IUser, lkSalesfyContent: string) {
		const dsEmailHtml = HEmailBuilder.getDsAdminNewPublishHtml(content, user, lkSalesfyContent)
		const dsSubject = "Novo conteúdo publicado em Salesfy"
		const emEmailCurator = Env.getEmailEmCurator()
		HEmail.toSendEmail({ to: emEmailCurator, subject: dsSubject, html: dsEmailHtml })
	}

	public static async sendToAdminNewPublishPackageEmail(user: IUser, lkPlatformProfile: string) {
		const dsEmailHtml = HEmailBuilder.getDsAdminNewPublishPackageHtml(user, lkPlatformProfile)
		const dsSubject = "Requisição de publicação conteúdo em massa"
		const emEmailCurator = Env.getEmailEmCurator()
		HEmail.toSendEmail({ to: emEmailCurator, subject: dsSubject, html: dsEmailHtml })
	}
}
