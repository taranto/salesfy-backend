import { LayerBusiness } from "app/layers_template/LayerBusiness";
import { Transaction } from "sequelize";
import { HEmail } from "app/structure/HEmail";
import { Env } from "app/structure/Env";
import { HEmailBuilder } from "app/util/HEmailBuilder";

export class ContactEmailBsn extends LayerBusiness {

	constructor(t: Transaction) {
		super(t)
	}

	public static async sendContactRequestEmail(joParam:any) {
		const dsEmailHtml = HEmailBuilder.getDsContactRequestHtml(joParam)
		const dsSubject = "Contato Requisitado"
		const emEmailContact = Env.getEmailEmContactInternal()
		HEmail.toSendEmail({ to: emEmailContact, subject: dsSubject, html: dsEmailHtml })
	}
}
