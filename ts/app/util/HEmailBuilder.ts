import { I18n, KeyEnum, IContent, IUser, IChannel, IAuth, IGroup } from "salesfy-shared";
import { EmailBuilder } from "app/util/EmailBuilder";
import { HEmailStyle } from "app/util/HEmailStyle";
import { Env } from "app/structure/Env";

export class HEmailBuilder extends EmailBuilder {

	//tslint:disable
	public static getDsEmailWelcomeHtml(nrLanguage: number, lkEmailConfirmationRequest?: string): string {
		const dsHello = I18n.t(KeyEnum.emailWelcomeHello, undefined, nrLanguage)
		const dsIntro = I18n.t(KeyEnum.emailWelcomeIntro, undefined, nrLanguage)
		const dsPreButton = I18n.t(KeyEnum.emailWelcomePreConfirmation, undefined, nrLanguage)
		const dsButton = I18n.t(KeyEnum.emailWelcomeConfirmationButton, undefined, nrLanguage)
		const dsClosing = I18n.t(KeyEnum.emailWelcomeClosing, { emContact: Env.getEmailEmContactPublic() }, nrLanguage)

		// const dsPreHelloHtmlRow = HEmailBuilder.getHelloImageHtmlRow()
		const dsHelloHtmlRow = EmailBuilder.getRow({ dsRowText: dsHello, dsTdStyle: HEmailStyle.getHelloStyle() })
		const dsIntroHtmlRow = EmailBuilder.getRow({ dsRowText: dsIntro })
		let dsButtonHtmlRow = ""
		let dsPreButtonHtmlRow = ""
		if (lkEmailConfirmationRequest) {
			dsPreButtonHtmlRow = EmailBuilder.getRow({ dsRowText: dsPreButton })
			dsButtonHtmlRow = EmailBuilder.getRow({ nmButton: dsButton, dsButtonStyle: HEmailStyle.getButtonStyle(), lkHrefButton: lkEmailConfirmationRequest })
		}
		const dsClosingtmlRow = EmailBuilder.getRow({ dsRowText: dsClosing })
		const dsEmailHtml = HEmailBuilder.getDefaultStructure(nrLanguage, dsHelloHtmlRow, dsIntroHtmlRow, dsPreButtonHtmlRow, dsButtonHtmlRow, dsClosingtmlRow)
		return dsEmailHtml
	}
	//tslint:enable

	//tslint:disable
	public static getDsGeneratePasswordEmailHtml(nrLanguage: number, emUser: string, unKeyPassword: string): string {
		const dsHello = I18n.t(KeyEnum.emailHello, undefined, nrLanguage)
		const dsIntro = I18n.t(KeyEnum.emailGeneratePasswordIntro, undefined, nrLanguage)
		const dsEmailText = I18n.t(KeyEnum.emailGeneratePasswordEmail, { emUser: emUser }, nrLanguage)
		const dsUnPasswordText = I18n.t(KeyEnum.emailGeneratePasswordNewPassword, { unKeyPassword: unKeyPassword }, nrLanguage)
		const dsClosing = I18n.t(KeyEnum.emailGeneratePasswordClosing, undefined, nrLanguage)

		// const dsPreHelloHtmlRow = HEmailBuilder.getHelloImageHtmlRow()
		const dsHelloHtmlRow = EmailBuilder.getRow({ dsRowText: dsHello, dsTdStyle: HEmailStyle.getHelloStyle() })
		const dsIntroHtmlRow = EmailBuilder.getRow({ dsRowText: dsIntro })
		const dsEmailTextHtmlRow = EmailBuilder.getRow({ dsRowText: dsEmailText })
		const dsUnPasswordTextHtmlRow = EmailBuilder.getRow({ dsRowText: dsUnPasswordText })
		const dsClosingHtmlRow = EmailBuilder.getRow({ dsRowText: dsClosing })

		const dsEmailHtml = HEmailBuilder.getDefaultStructure(nrLanguage, dsHelloHtmlRow, dsIntroHtmlRow, dsEmailTextHtmlRow, dsUnPasswordTextHtmlRow, dsClosingHtmlRow)
		return dsEmailHtml
	}
	//tslint:enable

	//tslint:disable
	public static getDsPasswordRecoveryEmailHtml(nrLanguage: number, lkPasswordRecovery: string): string {
		const dsHello = I18n.t(KeyEnum.emailHello, undefined, nrLanguage)
		const dsIntro = I18n.t(KeyEnum.emailPasswordRecoveryIntro, undefined, nrLanguage)
		const dsButton = I18n.t(KeyEnum.emailPasswordRecoveryButton, undefined, nrLanguage)
		const dsClosing = I18n.t(KeyEnum.emailPasswordRecoveryClosing, undefined, nrLanguage)

		// const dsPreHelloHtmlRow = HEmailBuilder.getHelloImageHtmlRow()
		const dsHelloHtmlRow = EmailBuilder.getRow({ dsRowText: dsHello, dsTdStyle: HEmailStyle.getHelloStyle() })
		const dsIntroHtmlRow = EmailBuilder.getRow({ dsRowText: dsIntro })
		const dsButtonHtmlRow = EmailBuilder.getRow({ nmButton: dsButton, dsButtonStyle: HEmailStyle.getButtonStyle(), lkHrefButton: lkPasswordRecovery })
		const dsClosingHtmlRow = EmailBuilder.getRow({ dsRowText: dsClosing })

		const dsEmailHtml = HEmailBuilder.getDefaultStructure(nrLanguage, dsHelloHtmlRow, dsIntroHtmlRow, dsButtonHtmlRow, dsClosingHtmlRow)
		return dsEmailHtml
	}
	//tslint:enable

	public static getDsAdminNewPublishHtml(content: IContent, user: IUser, lkSalesfyContent: string): string {
		const dsHello = `Novo conteúdo publicado em Salesfy`
		const dsContent =
			"Conteúdo Excel: " + HEmailBuilder.getDataForExcelPaste(content,
				"idContent", "nmContent", "nmCtContent", "lkContent", "nmPublisher", "dsContent", "piContent", "cdTemplateLayout") +
			"<br/><br/>Conteúdo: " + JSON.stringify(content).split(',').join(',<br/>') +
			"<br/><br/>Usuário: " + JSON.stringify(user).split(',').join(',<br/>') +
			"<br/><br/>link do conteúdo: " + lkSalesfyContent

		const dsHelloHtmlRow = EmailBuilder.getRow({ dsRowText: dsHello, dsTdStyle: HEmailStyle.getHelloStyle() })
		const dsContentHtmlRow = EmailBuilder.getRow({ dsRowText: dsContent })

		const dsHeaderHtml = HEmailBuilder.getDefaultHeaderTag()
		const dsStyleHtml = HEmailBuilder.getDefaultStyleTag()
		const dsTableHtml = HEmailBuilder.getDefaultTableTag(dsHelloHtmlRow, dsContentHtmlRow)
		const dsBodyHtml = HEmailBuilder.getDefaultBodyTag(dsTableHtml)
		const dsEmailHtml = EmailBuilder.getTag("html", undefined, dsHeaderHtml, dsStyleHtml, dsBodyHtml)
		return dsEmailHtml
	}

	public static getDsAdminNewPublishPackageHtml(user: IUser, lkPlatformProfile: string): string {
		const dsHello = `Requisição de publicação conteúdo em massa`
		const dsContent =
			"Usuário: " + JSON.stringify(user).split(',').join(',<br/>') +
			"<br/><br/>link do perfil da pagina: " + lkPlatformProfile

		const dsHelloHtmlRow = EmailBuilder.getRow({ dsRowText: dsHello, dsTdStyle: HEmailStyle.getHelloStyle() })
		const dsContentHtmlRow = EmailBuilder.getRow({ dsRowText: dsContent })

		const dsHeaderHtml = HEmailBuilder.getDefaultHeaderTag()
		const dsStyleHtml = HEmailBuilder.getDefaultStyleTag()
		const dsTableHtml = HEmailBuilder.getDefaultTableTag(dsHelloHtmlRow, dsContentHtmlRow)
		const dsBodyHtml = HEmailBuilder.getDefaultBodyTag(dsTableHtml)
		const dsEmailHtml = EmailBuilder.getTag("html", undefined, dsHeaderHtml, dsStyleHtml, dsBodyHtml)
		return dsEmailHtml
	}

	public static getDsContactRequestHtml(joParam: any): string {
		const dsHello = `Contato requisitado`
		const dsContent = `
				Nome: ${joParam.nmContact}
				<br/>Email: ${joParam.emContact}
				<br/>Contato: ${joParam.snTelephone}
				<br/>Descrição: ${joParam.dsContact}`

		const dsHelloHtmlRow = EmailBuilder.getRow({ dsRowText: dsHello, dsTdStyle: HEmailStyle.getHelloStyle() })
		const dsContentHtmlRow = EmailBuilder.getRow({ dsRowText: dsContent })

		const dsHeaderHtml = HEmailBuilder.getDefaultHeaderTag()
		const dsStyleHtml = HEmailBuilder.getDefaultStyleTag()
		const dsTableHtml = HEmailBuilder.getDefaultTableTag(dsHelloHtmlRow, dsContentHtmlRow)
		const dsBodyHtml = HEmailBuilder.getDefaultBodyTag(dsTableHtml)
		const dsEmailHtml = EmailBuilder.getTag("html", undefined, dsHeaderHtml, dsStyleHtml, dsBodyHtml)
		return dsEmailHtml
	}

	public static getDsAdminNewChannelHtml(channel: IChannel, user: IUser): string {
		const dsHello = `Novo canal publicado em Salesfy`
		const dsContent =
			// "Conteúdo Excel: " + HEmailBuilder.getDataForExcelPaste(channel,
			// 	"idContent", "nmContent", "nmCtContent") +
			"<br/><br/>Canal: " + JSON.stringify(channel).split(',').join(',<br/>') +
			"<br/><br/>Usuário: " + JSON.stringify(user).split(',').join(',<br/>')

		const dsHelloHtmlRow = EmailBuilder.getRow({ dsRowText: dsHello, dsTdStyle: HEmailStyle.getHelloStyle() })
		const dsContentHtmlRow = EmailBuilder.getRow({ dsRowText: dsContent })

		const dsHeaderHtml = HEmailBuilder.getDefaultHeaderTag()
		const dsStyleHtml = HEmailBuilder.getDefaultStyleTag()
		const dsTableHtml = HEmailBuilder.getDefaultTableTag(dsHelloHtmlRow, dsContentHtmlRow)
		const dsBodyHtml = HEmailBuilder.getDefaultBodyTag(dsTableHtml)
		const dsEmailHtml = EmailBuilder.getTag("html", undefined, dsHeaderHtml, dsStyleHtml, dsBodyHtml)
		return dsEmailHtml
	}

	public static getDsAdminNewUserHtml(user: IAuth, userInvitedBy?: IAuth): string {
		let dsHello = `Novo usuário cadastrado em Salesfy`
		const dsContentInvited =
			"<br/><br/>Usuário: " + JSON.stringify(user).split(',').join(',<br/>')

		let dsContentInvitedByHtmlRow = ""
		if (userInvitedBy) {
			dsHello = `Novo usuário convidado em Salesfy`
			const dsContentInvitedBy =
				"<br/><br/>Convidado por: " + JSON.stringify(userInvitedBy).split(',').join(',<br/>')
			dsContentInvitedByHtmlRow = EmailBuilder.getRow({ dsRowText: dsContentInvitedBy })
		}

		const dsHelloHtmlRow = EmailBuilder.getRow({ dsRowText: dsHello, dsTdStyle: HEmailStyle.getHelloStyle() })
		const dsContentInvitedHtmlRow = EmailBuilder.getRow({ dsRowText: dsContentInvited })

		const dsHeaderHtml = HEmailBuilder.getDefaultHeaderTag()
		const dsStyleHtml = HEmailBuilder.getDefaultStyleTag()
		const dsTableHtml = HEmailBuilder.getDefaultTableTag(
			dsHelloHtmlRow, dsContentInvitedHtmlRow, dsContentInvitedByHtmlRow)
		const dsBodyHtml = HEmailBuilder.getDefaultBodyTag(dsTableHtml)
		const dsEmailHtml = EmailBuilder.getTag("html", undefined, dsHeaderHtml, dsStyleHtml, dsBodyHtml)
		return dsEmailHtml
	}

	public static getDsInviteHtml(user: IAuth, authInvited: IAuth, unKeyPassword: string, group?: IGroup): string {
		const dsHello = I18n.t(KeyEnum.emailHello, undefined, user.nrLanguage)
		let dsIntro = ""
		if (group) {
			dsIntro = I18n.t(KeyEnum.emailInviteIntroGroup, { nmUser: user.nmUser, nmGroup: group.nmGroup }, user.nrLanguage)
		} else {
			dsIntro = I18n.t(KeyEnum.emailInviteIntro, { nmUser: user.nmUser }, user.nrLanguage)
		}
		const dsPurpose = I18n.t(KeyEnum.emailInvitePurpose, undefined, user.nrLanguage)
		const dsLkAccess = I18n.t(KeyEnum.emailInviteAccessLink, { lkSalesfy: Env.getLkWebApp() }, user.nrLanguage)
		const dsEmUserInvited = I18n.t(KeyEnum.emailInviteAccessEmail, { emUser: authInvited.emUser }, user.nrLanguage)
		const dsUnPasswordText = I18n.t(KeyEnum.emailInviteAccessPassword, { unKeyPassword: unKeyPassword }, user.nrLanguage)
		const dsTerm = I18n.t(KeyEnum.termsOfUse, {}, user.nrLanguage)
		const htmlTerm = EmailBuilder.getLink(dsTerm, Env.lkTermsOfUse())
		const dsTermsAcceptance = I18n.t(KeyEnum.emailInviteByAccessingAcceptance, { htmlTerm: htmlTerm }, user.nrLanguage)
		const dsSocialsLoginAvailable = I18n.t(KeyEnum.emailSocialsLoginAvailable, undefined, user.nrLanguage)

		const dsHelloHtmlRow = EmailBuilder.getRow({ dsRowText: dsHello, dsTdStyle: HEmailStyle.getHelloStyle() })
		const dsIntroHtmlRow = EmailBuilder.getRow({ dsRowText: dsIntro })
		const dsPurposeHtmlRow = EmailBuilder.getRow({ dsRowText: dsPurpose })
		const dsLkAccessHtmlRow = EmailBuilder.getRow({ dsRowText: dsLkAccess })
		const dsEmUserInvitedHtmlRow = EmailBuilder.getRow({ dsRowText: dsEmUserInvited })
		const dsUnPasswordTextHtmlRow = EmailBuilder.getRow({ dsRowText: dsUnPasswordText })
		const dsTermsAcceptanceRow = EmailBuilder.getRow({ dsRowText: dsTermsAcceptance })
		const dsSocialsLoginAvailableHtmlRow = EmailBuilder.getRow({ dsRowText: dsSocialsLoginAvailable })
		const dsSignatureHtmlRows = HEmailBuilder.getSalesfyEmailSignatureHtmlRows(user.nrLanguage)
		const dsLogoHtmlRow = HEmailBuilder.getLogoHtmlRow()

		// const dsPreHelloHtmlRow = HEmailBuilder.getHelloImageHtmlRow()
		const dsHeaderHtml = HEmailBuilder.getDefaultHeaderTag()
		const dsStyleHtml = HEmailBuilder.getDefaultStyleTag()
		const dsTableHtml = HEmailBuilder.getDefaultTableTag(
			dsHelloHtmlRow, dsIntroHtmlRow, dsPurposeHtmlRow, dsLkAccessHtmlRow,
			dsEmUserInvitedHtmlRow, dsUnPasswordTextHtmlRow, dsSocialsLoginAvailableHtmlRow,
			dsTermsAcceptanceRow, dsSignatureHtmlRows, dsLogoHtmlRow)
		const dsBodyHtml = HEmailBuilder.getDefaultBodyTag(dsTableHtml)
		const dsEmailHtml = EmailBuilder.getTag("html", undefined, dsHeaderHtml, dsStyleHtml, dsBodyHtml)
		return dsEmailHtml
	}
}
