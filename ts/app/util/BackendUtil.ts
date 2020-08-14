import { Request } from "express";
import { Env } from "../structure/Env";
import * as qs from 'qs'
import { RegExpConst, SConst, StringUtil, I18n, RoutesEnum } from "salesfy-shared";
import { HError } from "app/util/status/HError";

export class BackendUtil {

	public static lkWebsiteMsg(joParam: any, path: string): string {
		return BackendUtil.lkSiteBaseUrl() + path + StringUtil.jsonToQueryString(joParam)
	}

	public static lkServerBaseUrl(req: Request, hasPort = false): string {
		const lkEscaped = "http://" + req.hostname + (hasPort ? ":" + Env.getNodeEnvPort() : "")
		return lkEscaped
	}

	public static lkSiteBaseUrl(): string {
		const lkEscaped = "https://" + Env.getLkWebsite()
		return lkEscaped
	}

	public static originalUrlQueryStringToJSON(req: Request): string {
		try {
			const pathEndIndex = req.path.length
			const urlLength = req.originalUrl.length
			const body = req.originalUrl.substring(pathEndIndex + 1, urlLength)
			const decodedQueryString = decodeURIComponent(body)
			const iParseOptions = { arrayLimit: 999, decoder: this.decoder }
			const joQueryString = qs.parse(decodedQueryString, iParseOptions)
			return joQueryString
		} catch (err) {
			throw new HError({ dsConsole: "error at BackendUtil.originalUrlQueryStringToJSON " +
				"with the following url: " + req.originalUrl })
		}
	}

	private static decoder = (obParam: any) => {
		if (RegExpConst.NUMBER.test(obParam)) {
			return parseFloat(obParam)
		}

		const keywords: any = {
			true: true,
			false: false,
			null: null,
			undefined: undefined,
		}

		if (obParam in keywords) {
			const val = keywords[obParam]
			return val
		}

		if(typeof obParam == "string" && obParam.startsWith("[") && obParam.endsWith("]")) {
			return JSON.parse(obParam)
		}

		return obParam
	}

	public static defaultDaoListParam(joParam: any): any {
		if (!joParam.qtOffset) {
			joParam.qtOffset = joParam.qtOffset || 0
		}
		if (!joParam.qtLimit || joParam.qtLimit > Env.getEnvQtLimitFetchDefault()) {
			joParam.qtLimit = Env.getEnvQtLimitFetchDefault()
		}
		return joParam
	}

	public static getLkS3Content() : string {
		const lkS3Content =
			`https://s3-${Env.getS3NmRegion()}.amazonaws.com/${Env.getS3NmBucket()}/${Env.getS3NmContentDir()}`
		return lkS3Content
	}

	public static getLkS3ContentUsage() : string {
		const lkS3Content =
			`https://${Env.getS3NmBucket()}.s3-${Env.getS3NmRegion()}.amazonaws.com/${Env.getS3NmContentDir()}`
		return lkS3Content
	}
}
