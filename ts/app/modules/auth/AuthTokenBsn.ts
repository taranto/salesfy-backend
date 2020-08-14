import { LayerBusiness } from "app/layers_template/LayerBusiness";
import { Transaction } from "sequelize";
import * as jwt from "jsonwebtoken";
import { Log } from "app/structure/Log";
import { Env } from "app/structure/Env";
import { Request, Response } from "express";
import { AuthBsn } from "app/modules/auth/AuthBsn";
import { AuthDao } from "app/modules/auth/AuthDao";
import { SConst, IAuth, DateUtil, KeyEnum, CtExcep, CtError } from "salesfy-shared";
import { HError } from "app/util/status/HError";
import { HExcep } from "app/util/status/HExcep";
import { LogMsg } from "app/structure/LogMsg";

export class AuthTokenBsn extends LayerBusiness {

	constructor(t: Transaction) {
		super(t);
	}

	public static getJoDecodedToken(crToken: string): string | { [key: string]: any } | undefined | null {
		try {
			const options = { complete: true, json: true }
			const joDecodedToken = jwt.decode(crToken, options)
			return joDecodedToken
		} catch (err) {
			Log.warn("Impossible to decode token. Something's wrong with this user access")
			return
		}
	}

	public static genCrCustomToken(idUser: number, miLastsLong: number, joParam: any): string {
		const payload = { idUser: idUser, joParam: joParam, dtCreation: new Date() }
		const options: any = {
			mutatePayload: true,
			expiresIn: miLastsLong + "ms"
		}
		const crToken = jwt.sign(payload, Env.getEncryptSecret(), options)
		// const joDecodedToken: any = AuthTokenBsn.getJoDecodedToken(crToken)
		// const dsLastsUntil = DateUtil.beautify(joDecodedToken.payload.exp*SConst.MILI_SEC)
		// const dsNow = DateUtil.beautify()
		// Log.silly(`Generated token for the user ${idUser}. Lasts for ${miLastsLong}ms Long, until ${dsLastsUntil}. ` +
		// 	` Now is ${dsNow}.`)// Token: ${token}`)
		// const joDecodedToken: any = AuthTokenBsn.getJoDecodedToken(crToken)
		// Log.console("---- " + "GENERATED (" + JSON.stringify(joDecodedToken) + ")" + crToken)
		return crToken
	}

	public static getTokenSignature(crToken: string): string {
		if (crToken.split(".")[3]) {
			throw new HError({ ctStatus: CtExcep.tokenInvalid, dsConsole: "token has more dots than expected" })
		}
		return (crToken.split(".")[2])
	}

	public static isValidTokenSignature(crToken: string): boolean {
		const dsSignature = this.getTokenSignature(crToken)
		if (dsSignature) {
			const decodedToken = AuthTokenBsn.getJoDecodedToken(crToken)
			if (decodedToken) {
				return JSON.parse(JSON.stringify(decodedToken)).signature == dsSignature
			}
		}
		return false
	}

	public static isTokenExpired(crToken: string): boolean {
		const joDecodedToken: any = AuthTokenBsn.getJoDecodedToken(crToken)
		if (joDecodedToken) {
			const isTokenExpired = joDecodedToken.payload.exp * SConst.MILI_SEC < new Date().getTime()
			const dsLastsUntil = DateUtil.beautify(joDecodedToken.payload.exp * SConst.MILI_SEC)
			const dsNow = DateUtil.beautify()
			Log.silly(`is token expired?${isTokenExpired}. Expected to last until ${dsLastsUntil}.` +
				` Now is ${dsNow}`)
			return isTokenExpired
		}
		return false
	}

	public static isTokenRightNamed(crToken: string, nmToken: string): boolean {
		const joDecodedToken: any = AuthTokenBsn.getJoDecodedToken(crToken)
		if (joDecodedToken) {
			const isTokenRightNamed = joDecodedToken.payload["nmToken"] == nmToken
			return isTokenRightNamed
		}
		return false
	}

	public static isValidToken(crToken: string, nmToken: string): boolean {
		let isValid = false
		try {
			const verifiedToken: any = jwt.verify(crToken, Env.getEncryptSecret())
			Log.silly(JSON.stringify(verifiedToken))
			isValid = verifiedToken.joParam ? verifiedToken.joParam.nmToken == nmToken : false
		} catch (err) {
			if (!crToken) {
				Log.silly("Invalid token! Reason: " + "No tokens")
			} else if (err.message == "jwt expired") {
				Log.silly("Invalid token! Reason: " + err)
			} else {
				Log.warn("Invalid token! Reason: " + err + `[Token: ${crToken}]`)
			}
		}
		return isValid
	}

	public async isRefreshTokenSameAsStored(crRefreshToken: string): Promise<boolean> {
		const idUser = await AuthTokenBsn.getIdUserFromToken(crRefreshToken)
		const authDao = new AuthDao(this.t)
		const iAuth = await authDao.getRefreshToken(idUser)
		if (iAuth[1]) {
			throw new HError({
				ctStatus: CtError.tokenProblem,
				dsConsole: `Inconsistency! database has two equal refresh tokens!(${idUser})`
			})
		}
		if (!iAuth[0]) {
			return false
		}
		const crKeyRefreshToken = iAuth[0].crKeyRefreshToken
		const isSynchronizedRefreshToken = await AuthBsn.isEncryptionMatch(crRefreshToken, crKeyRefreshToken)
		return isSynchronizedRefreshToken
	}

	public async fetchRefreshToken(idUser?: number, crRefreshToken?: string): Promise<IAuth[]> {
		const authDao = new AuthDao(this.t)
		const iAuths = await authDao.getRefreshToken(idUser, crRefreshToken)
		return iAuths
	}

	public static genAccessToken(idUser: number): string {
		const accessToken = this.genCrCustomToken(idUser, Env.getAccessTokenTimeMili(),
			{ nmToken: SConst.X_ACCESS_TOKEN })
		return accessToken
	}

	public static genRefreshToken(idUser: number): string {
		const refreshToken = this.genCrCustomToken(idUser, Env.getRefreshTokenTimeMili(),
			{ nmToken: SConst.X_REFRESH_TOKEN })
		return refreshToken
	}

	public static genTokens(idUser: number): { accessToken: string, refreshToken: string } {
		const dsAccessToken = AuthTokenBsn.genAccessToken(idUser)
		const dsRefreshToken = AuthTokenBsn.genRefreshToken(idUser)
		const tokens = {
			accessToken: dsAccessToken,
			refreshToken: dsRefreshToken
		}
		return tokens
	}

	public async storeRefreshToken(idUser: number, crRefreshToken: string | undefined) {
		const authDao = new AuthDao(this.t)
		Log.silly(`the refresh token of the user ${idUser} is being refreshed`)
		if (crRefreshToken) {
			const crKeyRefreshTokenAgain = await AuthBsn.encrypt(crRefreshToken)
			await authDao.updateRefreshToken(idUser, crKeyRefreshTokenAgain)
		} else {
			await authDao.updateRefreshToken(idUser, undefined)
		}
	}

	public static getIdUserFromRequest(req: Request, nmToken?: string): number | undefined {
		if (!nmToken) {
			nmToken = SConst.X_ACCESS_TOKEN
		}
		const idUser = AuthTokenBsn.getIdUserFromToken(req.headers[nmToken])
		if (idUser) {
			return +idUser
		}
		return
	}

	public static getIdUserFromToken(crToken: string | undefined | string[]): number | undefined {
		if (!crToken) {
			return
		}
		if (crToken instanceof Array) {
			crToken = crToken[0]
		}
		const joDecodedToken: any = AuthTokenBsn.getJoDecodedToken(crToken)
		if (joDecodedToken) {
			Log.silly("getTokenIdUser: " + JSON.stringify(joDecodedToken))
			return joDecodedToken.payload.idUser
		}
		return
	}

	public async shTokenAllowRouteAccess(req: Request, res: Response): Promise<boolean> {
		const crAccessToken = req.headers[SConst.X_ACCESS_TOKEN]
		const crRefreshToken = req.headers[SConst.X_REFRESH_TOKEN]

		const isAccessTokenValid = AuthTokenBsn.isAccessTokenValid(crAccessToken)
		const idUserAccess = AuthTokenBsn.getIdUserFromToken(crAccessToken + "")
		if (isAccessTokenValid) {
			if (idUserAccess) {
				this.registerRefreshTokenInResponseHeader(req, res, SConst.KEY_EMPTY_TOKEN)
				this.registerAccessTokenInResponseHeader(req, res, SConst.KEY_EMPTY_TOKEN)
				return true
			}
			throw new HError({ ctStatus: CtError.userNotFoundInRefreshToken })
		}
		const authTokenBsn = new AuthTokenBsn(this.t)
		if (crRefreshToken == undefined) {
			throw new HExcep({ ctStatus: CtExcep.refreshTokenUndefined })
		}
		const isRefreshTokenExpired2 = AuthTokenBsn.isTokenExpired(crRefreshToken + "")
		if (isRefreshTokenExpired2) {
			throw new HExcep({ ctStatus: CtExcep.refreshTokenExpired })
		}
		const isRefreshTokenValid2 = AuthTokenBsn.isRefreshTokenValid(crRefreshToken)
		if (!isRefreshTokenValid2) {
			throw new HExcep({ ctStatus: CtExcep.refreshTokenInvalid })
		}
		const isRefreshTokenSameAsStored = await this.isRefreshTokenSameAsStored(crRefreshToken + "")
		if (!isRefreshTokenSameAsStored) {
			throw new HExcep({ ctStatus: CtExcep.refreshTokenDiffFromStored })
		}

		const idUserRefresh = AuthTokenBsn.getIdUserFromToken(crRefreshToken + "")
		if (!idUserRefresh) {
			throw new HError({ ctStatus: CtError.userNotFoundInRefreshToken })
		}
		if (crAccessToken == undefined) {
			Log.debug(LogMsg.dsUser(idUserRefresh) + `[${KeyEnum.accessTokenUndefined}. Refreshing]`)
		}
		const isAccessTokenExpired = AuthTokenBsn.isTokenExpired(crAccessToken + "")
		if (isAccessTokenExpired) {
			Log.debug(LogMsg.dsUser(idUserRefresh) + `[${KeyEnum.accessTokenExpired}. Refreshing]`)
		}
		if (!isAccessTokenExpired && !isAccessTokenValid) {
			Log.debug(LogMsg.dsUser(idUserRefresh) + `[${KeyEnum.accessTokenInvalid}. Refreshing]`)
		}

		const dsAccessToken = AuthTokenBsn.genAccessToken(idUserRefresh)
		this.registerAccessTokenInResponseHeader(req, res, dsAccessToken, idUserRefresh)
		return true
	}

	public async fetchUserRefreshToken(idUser: number): Promise<string> {
		const authTokenBsn = new AuthTokenBsn(this.t)
		const arAuth = await authTokenBsn.fetchRefreshToken(idUser)
		return arAuth[0].crKeyRefreshToken
	}

	public static isAccessTokenValid(dsAccessToken?: string | string[]): boolean {
		const hasAccessToken = dsAccessToken != undefined
		if (hasAccessToken) {
			const isValidAccessToken = AuthTokenBsn.isValidToken(dsAccessToken + "", SConst.X_ACCESS_TOKEN)
			if (isValidAccessToken) {
				return true
			}
		}
		return false
	}

	public static isRefreshTokenValid(dsRefreshToken?: string | string[]): boolean {
		const hasRefreshToken = dsRefreshToken != undefined
		if (!hasRefreshToken) {
			return false
		}
		const isValidRefreshToken = AuthTokenBsn.isValidToken(dsRefreshToken + "", SConst.X_REFRESH_TOKEN)
		if (!isValidRefreshToken) {
			return false
		}
		return true
	}

	public async generateAndRegisterTokens(req: Request, res: Response, idUser: number) {
		const tokens = AuthTokenBsn.genTokens(idUser)
		await this.storeRefreshToken(idUser, tokens.refreshToken)
		this.registerTokensInResponseHeader(req, res, tokens, idUser)
	}

	public registerTokensInResponseHeader(req: Request, res: any,
		tokens: { accessToken: string, refreshToken: string }, idUser: number) {
		Log.silly("---- " + SConst.X_ACCESS_TOKEN + " from user " + req.headers[SConst.X_ACCESS_TOKEN])
		Log.silly("---- " + SConst.X_ACCESS_TOKEN + "   to user " + tokens.accessToken)
		Log.silly("---- " + SConst.X_REFRESH_TOKEN + " from user " + req.headers[SConst.X_REFRESH_TOKEN])
		Log.silly("---- " + SConst.X_REFRESH_TOKEN + "   to user " + tokens.refreshToken)
		this.registerRefreshTokenInResponseHeader(req, res, tokens.refreshToken, idUser)
		this.registerAccessTokenInResponseHeader(req, res, tokens.accessToken, idUser)
	}

	public registerRefreshTokenInResponseHeader(req: Request, res: Response, dsToken: string, idUser?: number) {
		this.registerTokenInResponseHeader(req, res, dsToken, SConst.X_REFRESH_TOKEN, idUser)
	}

	public registerAccessTokenInResponseHeader(req: Request, res: Response, dsToken: string, idUser?: number) {
		this.registerTokenInResponseHeader(req, res, dsToken, SConst.X_ACCESS_TOKEN, idUser)
	}

	public registerTokenInResponseHeader(req: Request, res: Response,
		dsToken: string, keyToken: SConst.X_REFRESH_TOKEN | SConst.X_ACCESS_TOKEN,
		idUser?: number) {
		if (req.session) {
			res.set(keyToken, dsToken);
			Log.silly(`${keyToken} refreshed for the user ${idUser}`)
		} else {
			throw new HError({ ctStatus: CtError.sessionProblem, dsConsole: "No session were available. User: " + idUser })
		}
	}
}
