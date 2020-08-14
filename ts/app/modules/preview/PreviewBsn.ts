import { LayerBusiness } from "app/layers_template/LayerBusiness";
const metascraper = require('metascraper')
	([
		require('metascraper-author')(),
		require('metascraper-date')(),
		require('metascraper-description')(),
		require('metascraper-image')(),
		require('metascraper-logo')(),
		require('metascraper-clearbit-logo')(),
		require('metascraper-publisher')(),
		require('metascraper-title')(),
		require('metascraper-url')()
	])
import { Log } from "app/structure/Log";
import * as got from 'got'
import { StringUtil, CtExcep } from "salesfy-shared";
import { BConst } from "app/structure/BConst";
import * as rp from "request-promise";
import { AnyFindOptions } from "sequelize";
import { HExcep } from "app/util/status/HExcep";

export class PreviewBsn extends LayerBusiness {

	public static async getJoLinkHead(lkPreview: string): Promise<any> {
		let joResultHead
		try {
			joResultHead = await rp.head({ uri: lkPreview })
		} catch (err) {
			throw new HExcep({ ctStatus: CtExcep.notAllowedToRetreiveData, joExtraContent: { lkPreview: lkPreview } })
		}
		return joResultHead

	}

	public static async getLinkPreviewMetadata(lkPreview: string, miStart: number, miAfterEval: number): Promise<any> {
		let joPreviewRaw
		joPreviewRaw = await PreviewBsn.getLinkPreviewMetadataOptions(
			lkPreview, { ecdhCurve: "secp384r1" }, miStart, miAfterEval)
		if (joPreviewRaw) {
			return joPreviewRaw
		}
		joPreviewRaw = await PreviewBsn.getLinkPreviewMetadataOptions(
			lkPreview, { ecdhCurve: "prime256v1" }, miStart, miAfterEval)
		if (joPreviewRaw) {
			return joPreviewRaw
		}
		joPreviewRaw = await PreviewBsn.getLinkPreviewMetadataOptions(
			lkPreview, { ecdhCurve: undefined }, miStart, miAfterEval)
		if (joPreviewRaw) {
			return joPreviewRaw
		}
		PreviewBsn.logIt(BConst.LOG_LEVEL_WARN, "Failed", lkPreview, miStart, miAfterEval, undefined, undefined)
		return {}
	}

	public static async getLinkPreviewMetadataOptions(
		lkPreview: string, joOption: any, miStart: number, miAfterEval: number): Promise<any> {
		joOption.retry = 0
		try {
			const { body: html, url } = await got(lkPreview, joOption)
			const miStartGot = new Date().getTime()
			const joPreviewRaw = await metascraper({ html: html, url: url })
			const miStartScraper = new Date().getTime()
			if (joPreviewRaw) {
				PreviewBsn.logIt(
					BConst.LOG_LEVEL_DEBUG, joOption.ecdhCurve, lkPreview, miStart, miAfterEval, miStartGot, miStartScraper)
				return joPreviewRaw
			}
		} catch (err) {
			// PreviewBsn.logIt(BConst.LOG_LEVEL_SILLY, joOption.ecdhCurve, lkPreview, 
			// miStartTotal. miStartGot, miStartScraper, err)
		}
		return undefined
	}

	private static logIt(nmCtLogLevel: BConst.LOG_LEVEL_WARN | BConst.LOG_LEVEL_DEBUG | BConst.LOG_LEVEL_SILLY,
		ecdhCurve: string | undefined, lkPreview: string, miStart: number, miAfterEval: number,
		miStartGot?: number, miStartScraper?: number, dsErr?: string): void {
		const qtElapsedTimeEval = miAfterEval - miStart
		const qtElapsedTimeGot = miStartGot ? miStartGot - miAfterEval : miStartGot
		const qtElapsedTimeScraper = miStartGot && miStartScraper ? miStartScraper - miStartGot : undefined
		const miEnd = new Date().getTime()
		const qtElapsedTimeTotal = miStart ? miEnd - miStart : undefined
		Log.print(`[ecdhCurve ${StringUtil.dsFixLength(ecdhCurve, 10, true)}]` +
			`[T pre-eval  ${StringUtil.dsFixLength(qtElapsedTimeEval, 6, false)}]` +
			`[T got  ${StringUtil.dsFixLength(qtElapsedTimeGot, 6, false)}]` +
			`[T scraper  ${StringUtil.dsFixLength(qtElapsedTimeScraper, 6, false)}]` +
			`[T Total ${StringUtil.dsFixLength(qtElapsedTimeTotal, 6, false)}]` +
			`[LK ${lkPreview}]` +
			(dsErr ? `[ERROR ${dsErr}` : ""), nmCtLogLevel)
	}

	public static parseRawPreview(joPreviewRaw: any): any {
		if (!joPreviewRaw) {
			return {}
		}
		const piPreview = joPreviewRaw.image || joPreviewRaw.logo || joPreviewRaw["og:image"]
		const dsPreview = joPreviewRaw.description || joPreviewRaw["og:description"]
		const lkPreview = joPreviewRaw.url || joPreviewRaw.source
		const nmPreview = joPreviewRaw.title || joPreviewRaw["og:title"] || lkPreview
		const joPreview = {
			nmPreview: nmPreview,
			dsPreview: dsPreview,
			piPreview: piPreview,
			lkPreview: lkPreview,
		}
		return joPreview
	}
}
