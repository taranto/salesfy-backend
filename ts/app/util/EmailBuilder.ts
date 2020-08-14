import { HEmailStyle } from "app/util/HEmailStyle";
import { I18n, KeyEnum } from "salesfy-shared";
import { Env } from "app/structure/Env";

export class EmailBuilder {

	public static getRow(joParam: {
		dsTrStyle?: string, dsTdStyle?: string,
		dsFreeHtml?: string,
		dsRowText?: string, dsSpanStyle?: string,
		lkImage?: string, vlSizeWidthImage?: number,
		lkHrefButton?: string, nmButton?: string, dsButtonStyle?: string
	}): string {
		let dsRowHtml = ``
		if (joParam.lkImage) {
			const vlSizeWidthImage = joParam.vlSizeWidthImage || HEmailStyle.getImageDefaultWidth()
			dsRowHtml = `<img src="${joParam.lkImage}" style="${HEmailStyle.getImageStyle()}" width="${vlSizeWidthImage}px">`
		}
		else if (joParam.dsRowText) {
			dsRowHtml =
				`<span style="${HEmailStyle.getSpanDefaultStyle() + (joParam.dsSpanStyle || "")}">
					${joParam.dsRowText}
				</span>`
		}
		else if (joParam.nmButton) {
			const dsButtonStyleHtml = joParam.dsButtonStyle ? `style="${joParam.dsButtonStyle}"` : ""
			dsRowHtml = `<a href="${joParam.lkHrefButton}" ${dsButtonStyleHtml} target="_blank">${joParam.nmButton}</a>`
		}
		else if (joParam.dsFreeHtml) {
			dsRowHtml = joParam.dsFreeHtml
		}
		return (`
			<tr style="${HEmailStyle.getTrDefaultStyle() + (joParam.dsTrStyle || "")}">
				<td style="${HEmailStyle.getTdDefaultStyle() + (joParam.dsTdStyle || "")}">
					${dsRowHtml}
				</td>
			</tr>
		`)
	}

	public static getLink(dsText:string, lkText:string) :string {
		const dsTextLink = `<a href="${lkText}" target="_blank">${dsText}</a>`
		return dsTextLink
	}

	public static getTag(nmTagHtml: string, dsOpenIncrement?: string, ...arDsInnerHtml: string[]): string {
		const dsTagOpenHtml = `<${nmTagHtml} ${dsOpenIncrement || ""}>`
		const dsTagCloseHtml = `</${nmTagHtml}>`
		const dsInnerHtml = arDsInnerHtml.join(``)
		return `${dsTagOpenHtml}
		${dsInnerHtml}
		${dsTagCloseHtml}`
	}

	public static getDataForExcelPaste(joParam: any, ...nmKeysSequence: string[]) {
		let dsData = ``
		nmKeysSequence.forEach((nmKey) => {
			dsData = `${dsData}${joParam[nmKey]}\t`
		})
		return dsData
	}

	public static getSalesfyEmailSignatureHtmlRows(nrLanguage: number): string {
		const dsRegardsLeader = I18n.t(KeyEnum.emailRegardsLeader, { nmDevLeader: Env.getEmailNmDevLeader() }, nrLanguage)
		const dsSalesfyTeam = I18n.t(KeyEnum.emailSalesfyTeam, undefined, nrLanguage)
		const dsSalesfySlogan = I18n.t(KeyEnum.emailSalesfySlogan, undefined, nrLanguage)
		const dsRegardsLeaderHtmlRow = EmailBuilder.getRow({
			dsRowText: dsRegardsLeader + "<br/>" + dsSalesfyTeam + "<br/>" + dsSalesfySlogan + "<br/>",
			dsTdStyle: "padding-bottom: 1px;",
			dsSpanStyle: "color:#575757; font-size:11px"
		})
		// const dsSalesfyTeamHtmlRow = EmailBuilder.getRow({
		// 	dsRowText: dsSalesfyTeam,
		// 	dsTdStyle: "padding-bottom: 1px; font-weight:bold;",
		// 	dsSpanStyle: "color:#575757; font-size:11px"
		// })
		// const dsSalesfySloganHtmlRow = EmailBuilder.getRow(
		// 	{ dsRowText: dsSalesfySlogan, dsSpanStyle: "font-size:11px;" })
		return dsRegardsLeaderHtmlRow
	}

	public static getLogoHtmlRow(): string {
		const lkImageLogo = Env.getLkS3() + "/hatchers-website/app/email/salesfy_logo.png"
		const dsLogoHtmlRow = EmailBuilder.getRow({ lkImage: lkImageLogo, vlSizeWidthImage: 160 })
		return dsLogoHtmlRow
	}

	public static getStoreButtonsTable(arJoParam: any[], dsTrStyle?: string, dsTdStyle?: string): string {
		const arDsRowHtml: string[] = []
		arDsRowHtml.push(`<tr style="${HEmailStyle.getTrDefaultStyle() + (dsTrStyle || "")}">`)
		arJoParam.forEach((joParam: any) => {
			const dsColHtml = EmailBuilder.getStoreButtonCol(joParam, dsTdStyle)
			arDsRowHtml.push(dsColHtml)
		})
		arDsRowHtml.push("</tr>")
		const dsDefaultTable = EmailBuilder.getDefaultTableTag(...arDsRowHtml)
		return dsDefaultTable
	}

	public static getStoreButtonCol(joParam: { lkStore: string, piStore: string }, dsTdStyle?: string): string {
		const dsColHtml =
			`<td style="${HEmailStyle.getTdDefaultStyle() + (dsTdStyle || "")}">
				<a href="${joParam.lkStore}" target="_blank">
					<img src="${joParam.piStore}" style="${HEmailStyle.getImageStyle()}" width="${(128)}px">
				</a>
			</td>`
		return dsColHtml
	}

	public static getStoreHtmlRow(): string {
		const piAppleStore = Env.getLkS3() + "/hatchers-website/app/email/apple_store.png"
		const piPlayStore = Env.getLkS3() + "/hatchers-website/app/email/play_store.png"
		const lkAppleStore = Env.getLkAppleStore()
		const lkPlayStore = Env.getLkPlayStore()
		const joPlayStore = { piStore: piPlayStore, lkStore: lkPlayStore }
		const joAppleStore = { piStore: piAppleStore, lkStore: lkAppleStore }
		const dsTrStyle = "width:150px"
		const dsTdStyle = "width:150px"
		const dsStoreHtmlTable = EmailBuilder.getStoreButtonsTable([joPlayStore, joAppleStore], dsTrStyle, dsTdStyle)
		const dsStoreHtmlRow = EmailBuilder.getRow({ dsFreeHtml: dsStoreHtmlTable })
		return dsStoreHtmlRow
	}

	// public static getHelloImageHtmlRow(): string {
	// 	const lkImageHello = Env.getLkS3() + "/hatchers-website/app/email/hello_email.png"
	// 	const dsPreHelloHtmlRow = EmailBuilder.getRow({ lkImage: lkImageHello, vlSizeWidthImage: 170 })
	// 	return dsPreHelloHtmlRow
	// }

	public static getDefaultHeaderTag() {
		//tslint:disable-next-line
		return EmailBuilder.getTag("header", undefined, `<meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />`)
	}

	public static getDefaultStyleTag() {
		return EmailBuilder.getTag("style", `type="text/css"`, HEmailStyle.getCssMediaQueryStyle())
	}

	public static getDefaultTableTag(...dsRows: string[]) {
		//tslint:disable-next-line
		return EmailBuilder.getTag("table", `style="${HEmailStyle.getTableDefaultStyle()}" align="center" class="${HEmailStyle.getDefaultMediaQueryWidths()}"`, ...dsRows)
	}

	public static getDefaultBodyTag(...dsComponentsHtml: string[]) {
		//tslint:disable-next-line
		return EmailBuilder.getTag("body", `style="${HEmailStyle.getBodyDefaultStyle()}" class="bodyEmail ${HEmailStyle.getDefaultMediaQueryWidths()}"`, ...dsComponentsHtml)
	}

	public static getDefaultStructure(nrLanguage: number, ...dsComponentsHtml: string[]) {
		const dsHeaderHtml = EmailBuilder.getDefaultHeaderTag()
		const dsStyleHtml = EmailBuilder.getDefaultStyleTag()
		const dsSignatureHtmlRows = EmailBuilder.getSalesfyEmailSignatureHtmlRows(nrLanguage)
		const dsLogoHtmlRow = EmailBuilder.getLogoHtmlRow()
		const dsStoresRow = EmailBuilder.getStoreHtmlRow()
		const dsTableHtml = EmailBuilder.getDefaultTableTag(
			...dsComponentsHtml, dsSignatureHtmlRows, dsLogoHtmlRow, dsStoresRow)
		const dsBodyHtml = EmailBuilder.getDefaultBodyTag(dsTableHtml)
		const dsEmailHtml = EmailBuilder.getTag("html", undefined, dsHeaderHtml, dsStyleHtml, dsBodyHtml)
		return dsEmailHtml
	}
}
