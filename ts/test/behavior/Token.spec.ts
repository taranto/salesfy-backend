import { Done, TestUserManager, supertest, TestUtil, TestShould, should } from "../barrel/Barrel.spec";
import { RoutesEnum, SConst, CtHttpStatus, KeyEnum } from "salesfy-shared";
import { AuthTokenBsn } from "app/modules/auth/AuthTokenBsn";
import { Response } from "superagent";
import { EnvTest } from "../support/EnvTest.spec";

export class TokenSpec {

	public static test() {
		describe(TestShould.dsText({dsText:"TokenSpec test", arNmTag:["Token"]}), () => {
			describe(TestShould.dsText({dsText:"Is test working", arNmTag:["Token"]}), () => {
				TokenSpec.preTestTokenExpire()
			})
			describe(TestShould.dsText({dsText:"Evaluate expected feedbacks", arNmTag:["Token"]}), () => {
				TokenSpec.testTokenFeedback()
			})
			describe(TestShould.dsText({dsText:"TokenSpec test expiration", arNmTag:["Token"]}), () => {
				TokenSpec.testTokenExpire()
			})
		})
	}

	public static testTokenFeedback() {
		const r = RoutesEnum.userLogged
		const m = SConst.HTTP_METHOD_GET
		const u = SConst.TEST_ROLE_NORMAL_USER

		let crAccessTokenOriginalSaved : string
		let crRefreshTokenOriginalSaved : string

		let crAccessTokenLoggedInSaved : string
		let crRefreshTokenLoggedInSaved : string

		before("Save original tokens", done => {
			crAccessTokenOriginalSaved = TestUserManager.getUser().loggedUser.tokens.accessToken
			crRefreshTokenOriginalSaved = TestUserManager.getUser().loggedUser.tokens.refreshToken
			done()
		})

		before("Log user in (and retrieve brand new tokens)", done => {
			const joParam = {
				emUser : TestUserManager.getUser().user.emUser,
				unKeyPassword : EnvTest.getUnPwDefault(),
			}
			const customResponse = (res: Response) => {
				crAccessTokenLoggedInSaved = res.header[SConst.X_ACCESS_TOKEN]
				crRefreshTokenLoggedInSaved = res.header[SConst.X_REFRESH_TOKEN]
				TestUserManager.getActiveUser(u).setAccessToken(crAccessTokenLoggedInSaved)
				TestUserManager.getActiveUser(u).setRefreshToken(crRefreshTokenLoggedInSaved)
			}
			const joResult = { customResponse : customResponse }
			TestUtil.customCall(done, RoutesEnum.userLogin, SConst.HTTP_METHOD_POST, undefined, joParam, joResult)
		})

		it("Access token valid, Refresh token valid", (done) => {
			const customResponse = (res: Response) => {
				const body = res.body
			}
			const joResult = { customResponse : customResponse }
			TestUtil.customCall(done, r, m, u, undefined, joResult)
		})

		// it("Access token valid, Refresh token valid", (done) => {
		// 	const customResponse = (res: Response) => {
		// 		const body = res.body
		// 	}
		// 	const joResult = {
		// 		nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
		// 		ctWarn:CtWarn.itemAlreadyExists,
		// 		customResponse : customResponse
		// 	}
		// 	TestUtil.customCall(done, r, m, u, undefined, joResult)
		// })

		it(TestShould.dsText({
			dsWhatsBeingTested: `Does tokens return "${SConst.KEY_EMPTY_TOKEN}" once there's no new values to update?`,
			dsCircumstances: `Make any call after getting brand new tokens`,
			dsExpected: `Expect "${SConst.KEY_EMPTY_TOKEN}" as access and refresh tokens`
		}), (d) => {
			const customResponse = (res: Response) => {
				const crAccessTokenReturned = res.header[SConst.X_ACCESS_TOKEN]
				const crRefreshTokenReturned = res.header[SConst.X_REFRESH_TOKEN]
				should().equal(crAccessTokenReturned, SConst.KEY_EMPTY_TOKEN)
				should().equal(crRefreshTokenReturned, SConst.KEY_EMPTY_TOKEN)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.content, SConst.HTTP_METHOD_GET, u, undefined, joResult)
		})

		after("replace with the original tokens", done => {
			TestUserManager.getActiveUser(u).setAccessToken(crAccessTokenOriginalSaved)
			TestUserManager.getActiveUser(u).setRefreshToken(crRefreshTokenOriginalSaved)
			done()
		})
	}

	public static preTestTokenExpire() {
		it("It should break the token and notify as valid(access)", done => {
			TokenSpec.validateToken(done, false)
		})
	}

	public static testTokenExpire() {
		const r = RoutesEnum.userLogged
		const m = SConst.HTTP_METHOD_GET
		const u = SConst.TEST_ROLE_NORMAL_USER

		let dsAccessTokenNew: string

		before("generate and register an about-to-expire access token", done => {
			const loggedUser = TestUserManager.getUser().loggedUser
			const accessToken = AuthTokenBsn.genCrCustomToken(loggedUser.user.idUser, SConst.MILI_SEC * 1,
				{ nmToken : SConst.X_ACCESS_TOKEN})
			TestUserManager.getActiveUser(u).setAccessToken(accessToken)
			setTimeout(() => {
				done()
			}, SConst.MILI_SEC * 2);
		})

		it("It should break the token and notify the expiration of the current access token", done => {
			TokenSpec.validateToken(done, true)
		})

		it("It should call a route and return a brand new access token", done => {
			TestUtil.call(r, m, u)
				.expect(200)
				.expect((res: supertest.Response) => {
					const dsAccessTokenOld = TestUserManager.getUser().loggedUser.tokens.accessToken
					const res1: any = res
					dsAccessTokenNew = res1.headers[SConst.X_ACCESS_TOKEN]
					if (dsAccessTokenNew == dsAccessTokenOld) {
						throw new Error("Token were not changed")
					}
					const isTokenExpired = AuthTokenBsn.isTokenExpired(dsAccessTokenNew)
					if (isTokenExpired) {
						throw new Error("The token brought by the server is still expired")
					}
				})
				.end(TestUtil.end(done));
		})

		after("generate and register a standard timed access token", done => {
			TestUserManager.getActiveUser(u).setAccessToken(dsAccessTokenNew)
			done()
		})
	}

	private static validateToken(done: Done, isExpirationExpected: boolean) {
		const accessToken = TestUserManager.getUser().loggedUser.tokens.accessToken
		const isTokenExpired = AuthTokenBsn.isTokenExpired(accessToken)
		if (isTokenExpired) {
			if (isExpirationExpected) {
				done()
			} else {
				done("This token should have been considered expired")
			}
		} else {
			if (isExpirationExpected) {
				done("This token should have been considered valid")
			} else {
				done()
			}
		}
	}
}
