import { RoutesEnum, SConst, CtExcep } from "salesfy-shared";
import { KeyEnum, StringUtil, JsonUtil } from "salesfy-shared";
import { AuthBsn } from "../../../../app/modules/auth/AuthBsn";
import { TestCaseItem, TestUserManager, TestShould, TestUtil, supertest, should } from "../../../barrel/Barrel.spec";
import { Response } from "supertest";
import { LayerDao } from "app/layers_template/LayerDao";
import { ConnDao } from "app/structure/ConnDao";
import { EnvTest } from "../../../support/EnvTest.spec";
import { User } from "app/modules/user/User";
import { TestEntity } from "../../../support/TestEntity.spec";
import { DaoUtil } from "app/util/DaoUtil";

export class AuthRteSpec {

	public static test() {
		describe(TestShould.dsText({ nmClass: "AuthRteSpec" }), () => {
			describe(TestShould.describeTitle(RoutesEnum.userRegister), () => {
				AuthRteSpec.testRegister()
			})
			describe(TestShould.describeTitle(RoutesEnum.userMe), () => {
				AuthRteSpec.testUserMe()
			})
			describe(TestShould.describeTitle(RoutesEnum.userLogged), () => {
				AuthRteSpec.testLogged()
			})
			describe(TestShould.describeTitle(RoutesEnum.userLogoff), () => {
				AuthRteSpec.testLogoff()
			})
			describe(TestShould.describeTitle(RoutesEnum.userLogin), () => {
				AuthRteSpec.testLogin()
			})
			describe.skip(TestShould.describeTitle(RoutesEnum.userLoginGmail), () => {
				AuthRteSpec.testLoginIntegrated(RoutesEnum.userLoginGmail)
			})
			describe.skip(TestShould.describeTitle(RoutesEnum.userLoginFacebook), () => {
				AuthRteSpec.testLoginIntegrated(RoutesEnum.userLoginFacebook)
			})
			describe(TestShould.describeTitle(RoutesEnum.userChangePassword), () => {
				AuthRteSpec.testChangePassword()
			})
		})
	}

	private static testLoginIntegrated(route: string) {
		const r = route
		const m = SConst.HTTP_METHOD_POST

		const keys = ["dsToken"]
		let joParam: any
		//tslint:disable
		if (RoutesEnum.userLoginFacebook == route) {
			joParam = {
				dsToken: "EAAdt7A8rfI8BAIzZA8iJAl3GXV9SnByPt646BO3ARxkg31vUaZByeVGmJAR3Xse5Xk6ehfmNYDqBIRSUgjHPNSNOPcaZBUwZCz251ZCA8vTYu1gmZBXswJghTkCnBrp2ihd4K5WZCeGm6QD3Lnzv8HNbZCdRyZALNGivDt8Ka4w2OJ537edmFlO4f95B5S1P7iAgXLuW6qsYOFKskk1VwHdGB",
			}
		}
		if (RoutesEnum.userLoginGmail == route) {
			joParam = {
				dsToken: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ2M2ZlNDgwYzNjNTgzOWJiYjE1ODYxZTA4YzMyZDE4N2ZhZjlhNTYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiODMxMzcxMTcwOTM0LXVkYXBpdDVqaGpqNTZwZnQ1bDJkcmM5Z2poZmVjbGYzLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiODMxMzcxMTcwOTM0LXVkYXBpdDVqaGpqNTZwZnQ1bDJkcmM5Z2poZmVjbGYzLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTE1Mjg1ODExNDAzODMzMTg4MjU3IiwiZW1haWwiOiJmZXJ0YXJhbnRvQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoiU0l1blpjQ2lJNEJMdUl5ckVNNHBvQSIsIm5hbWUiOiJGZXJuYW5kbyBUYXJhbnRvIiwicGljdHVyZSI6Imh0dHBzOi8vbGg1Lmdvb2dsZXVzZXJjb250ZW50LmNvbS8ta3U4VS1QQXBQSlkvQUFBQUFBQUFBQUkvQUFBQUFBQUFBRDQvNkFvc1VJbGg2Y0Evczk2LWMvcGhvdG8uanBnIiwiZ2l2ZW5fbmFtZSI6IkZlcm5hbmRvIiwiZmFtaWx5X25hbWUiOiJUYXJhbnRvIiwibG9jYWxlIjoiZW4iLCJpYXQiOjE1NDM4NTg4MjAsImV4cCI6MTU0Mzg2MjQyMCwianRpIjoiY2Y2MmE3NTM3MWFkZDdjNzkyZDFhNTBhM2E4NDBhMjRhNzU0ZDhiMCJ9.JhPOgSMBZASv1P3HCVEI0cwwCRp_EgdTbplboGdaYo6gfrqqhJr_L_iAHL6VABRO8Rgmcjo23FkLCagSsV0-awXdYPKNsKTn98NIXTTXmPA0onCSf8D59fXwTNUpMEXntRcb8-uegWimfjM9o9x-3Xk8Urwk99WpigEQl_p6bG45krE7-JnPUcbFtp5FY1zQ-K8-vSoyvyPw1bYSctdnVEipzN2DDqTKeNwtkx8_vg60Pdt9us6zeZJvtJqtCgRQaRR4M6VarydiaYOq_R8QYXSxbN8PMgy4LmhAkAnE95QN6C826NI24xRsRoxnDHF-OpaZqUs8DhK2AkaQcJ5a-g"
			}

		}
		//tslint:enable

		it(TestShould.exist(), (done) => {
			TestCaseItem.callEvalExistence(done, r, m)
		})

		it(TestShould.failMissingAllParams(), (done) => {
			TestCaseItem.callEvalFailMissingAllParams(done, r, m)
		})

		keys.forEach(key => {
			it(TestShould.failMissingAParam(key), (done) => {
				TestCaseItem.callEvalFailMissingAParam(done, r, m, undefined, joParam, key)
			})
		})

		it("it should succeed", (done) => {
			TestUtil.customCall(done, r, m, undefined, joParam)
		})

		it("it should make an error", (done) => {
			let joParamExpired: any
			//tslint:disable
			if (RoutesEnum.userLoginFacebook == route) {
				joParamExpired = {
					dsToken: "EAAdt7A8rfI8BAE2ouJ2zLIvwok5xYTTJLfY2hM1cDakSMdm086mbDj3X0IUfEl08ujeCrW7mxuv4bIxyBHYZCSLxfUdVWu2RS73TJlimZAl7pmJcItA5CrlS93E3huz4aXXLaMBciqzyjJmZCRIWabU0a2sZBzAWbZChv9tRGcuXJzQeMJvF0sUZBxSuskk5daBsgsTtcppfCDLZBsoAulQQwutq1ZBEwxswS8YYXR489wZDZD",
				}
			}
			if (RoutesEnum.userLoginGmail == route) {
				joParamExpired = {
					dsToken: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ2M2ZlNDgwYzNjNTgzOWJiYjE1ODYxZTA4YzMyZDE4N2ZhZjlhNTYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiODMxMzcxMTcwOTM0LXVkYXBpdDVqaGpqNTZwZnQ1bDJkcmM5Z2poZmVjbGYzLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiODMxMzcxMTcwOTM0LXVkYXBpdDVqaGpqNTZwZnQ1bDJkcmM5Z2poZmVjbGYzLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTE1Mjg1ODExNDAzODMzMTg4MjU3IiwiZW1haWwiOiJmZXJ0YXJhbnRvQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoiU0l1blpjQ2lJNEJMdUl5ckVNNHBvQSIsIm5hbWUiOiJGZXJuYW5kbyBUYXJhbnRvIiwicGljdHVyZSI6Imh0dHBzOi8vbGg1Lmdvb2dsZXVzZXJjb250ZW50LmNvbS8ta3U4VS1QQXBQSlkvQUFBQUFBQUFBQUkvQUFBQUFBQUFBRDQvNkFvc1VJbGg2Y0Evczk2LWMvcGhvdG8uanBnIiwiZ2l2ZW5fbmFtZSI6IkZlcm5hbmRvIiwiZmFtaWx5X25hbWUiOiJUYXJhbnRvIiwibG9jYWxlIjoiZW4iLCJpYXQiOjE1NDM4NTg4MjAsImV4cCI6MTU0Mzg2MjQyMCwianRpIjoiY2Y2MmE3NTM3MWFkZDdjNzkyZDFhNTBhM2E4NDBhMjRhNzU0ZDhiMCJ9.JhPOgSMBZASv1P3HCVEI0cwwCRp_EgdTbplboGdaYo6gfrqqhJr_L_iAHL6VABRO8Rgmcjo23FkLCagSsV0-awXdYPKNsKTn98NIXTTXmPA0onCSf8D59fXwTNUpMEXntRcb8-uegWimfjM9o9x-3Xk8Urwk99WpigEQl_p6bG45krE7-JnPUcbFtp5FY1zQ-K8-vSoyvyPw1bYSctdnVEipzN2DDqTKeNwtkx8_vg60Pdt9us6zeZJvtJqtCgRQaRR4M6VarydiaYOq_R8QYXSxbN8PMgy4LmhAkAnE95QN6C826NI24xRsRoxnDHF-OpaZqUs8DhK2AkaQcJ5a-g"
				}
			}
			//tslint:enable
			TestUtil.call(r, m, undefined, joParamExpired)
				.expect(400)
				.expect(SConst.STATUS_MESSAGE, CtExcep.authenticationProblem.nmMsg)
				.end(TestUtil.end(done))
		})
	}

	private static testRegister() {
		const r = RoutesEnum.userRegister
		const m = SConst.HTTP_METHOD_POST

		const nmUser = StringUtil.random()
		const joRegisterParam = TestUserManager.genJoUser({ nmUser: nmUser })
		const keys = ["unKeyPassword", "emUser"]

		it(TestShould.exist(), (done) => {
			TestCaseItem.callEvalExistence(done, r, m)
		})

		it(TestShould.failMissingAllParams(), (done) => {
			TestCaseItem.callEvalFailMissingAllParams(done, r, m)
		})

		keys.forEach(key => {
			it(TestShould.failMissingAParam(key), (done) => {
				TestCaseItem.callEvalFailMissingAParam(done, r, m, undefined, joRegisterParam, key)
			})
		})

		it("It should register a new user", (done) => {
			TestUserManager.register(done, joRegisterParam, undefined, undefined)
		})

		it("It should fail register a different user with the same email", (done) => {
			const nmUserDifferent = StringUtil.random()
			const joRegisterDiffUserParam = TestUserManager.genJoUser({ nmUser: nmUserDifferent })
			joRegisterDiffUserParam.emUser = joRegisterParam.emUser
			TestUtil.call(r, m, undefined, joRegisterDiffUserParam)
				.expect(400)
				.expect(SConst.STATUS_MESSAGE, CtExcep.nmKeyAlreadyExists.nmMsg)
				.expect(SConst.EXTRA_CONTENT, JSON.stringify({ nmKey: KeyEnum.email }))
				.end(TestUtil.end(done))
		})

		it("It should fail register a different user with the same email uppercased", (done) => {
			const nmUserDifferent = StringUtil.random()
			const joRegisterDiffUserParam = TestUserManager.genJoUser({ nmUser: nmUserDifferent })
			joRegisterDiffUserParam.emUser = joRegisterParam.emUser.toUpperCase()
			TestUtil.call(r, m, undefined, joRegisterDiffUserParam)
				.expect(400)
				.expect(SConst.STATUS_MESSAGE, CtExcep.nmKeyAlreadyExists.nmMsg)
				.expect(SConst.EXTRA_CONTENT, JSON.stringify({ nmKey: KeyEnum.email }))
				.end(TestUtil.end(done))
		})

		const joParamMain: any = {}

		it(TestShould.dsText({
			dsWhatsBeingTested: `Register an user and try to bypass some user-selected data which is system-only`,
			dsCircumstances: `Send some extra data at user registering route`,
			dsExpected: `Register and bring back only email and name as acceptable data`
		}), (d) => {
			const joUserCustomParam = { isNewUser: false, isEmailConfirmed: true, unKeyPassword: EnvTest.getUnPwDefault() }
			const joUserGen: any = TestEntity.gen(User, joUserCustomParam)
			const customResponse = (res: Response) => {
				const joUserReg = res.body
				joParamMain.joUserReg = joUserReg
				joParamMain.joUserGen = joUserGen
				should().equal(joUserGen.emUser, joUserReg.emUser)
				should().not.equal(joUserGen.dhRegister, joUserReg.dhRegister)
				should().not.equal(joUserGen.isEmailConfirmed, joUserReg.isEmailConfirmed)
				should().equal(joUserGen.snTelephone, joUserReg.snTelephone)
				should().equal(joUserGen.snWhatsapp, joUserReg.snWhatsapp)
				should().equal(joUserGen.lkFacebook, joUserReg.lkFacebook)
				should().not.equal(joUserGen.dhLastAccess, joUserReg.dhLastAccess)
				should().equal(joUserGen.nmUser, joUserReg.nmUser)
				should().equal(joUserGen.piAvatar, joUserReg.piAvatar)
				should().equal(joUserGen.nmCompany, joUserReg.nmCompany)
				should().equal(joUserGen.nmCargo, joUserReg.nmCargo)
				should().equal(joUserGen.dsTestimony, joUserReg.dsTestimony)
				should().equal(joUserGen.lkWebsite, joUserReg.lkWebsite)
				should().equal(joUserGen.lkLinkedin, joUserReg.lkLinkedin)
				should().not.equal(joUserGen.isNewUser, joUserReg.isNewUser)
				should().equal(joUserGen.lkWebsite, joUserReg.lkWebsite)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.userRegister, m, undefined, joUserGen, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Register an user and try to bypass some user-selected data which is system-only`,
			dsCircumstances: `User was already registered. Now we're getting it from DB and evaluating it`,
			dsExpected: `Evaluate the data that's system-only (not already evaluated from route normal return)`
		}), (d) => {
			const csSelect = DaoUtil.selectQuoted('crKeyRefreshToken', 'crKeyResetPassword',
				'dhKeyResetPasswordExpiration', 'crKeyEmailConfirmation', 'keyFacebook', 'keyGoogle')
			const query = `select ${csSelect} from usr where idUser = ${joParamMain.joUserReg.idUser}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					const joUserDB = result[0][0]
					const joUserGen = joParamMain.joUserGen
					should().not.equal(joUserGen.crKeyRefreshToken, joUserDB.crKeyRefreshToken)
					should().not.equal(joUserGen.crKeyResetPassword, joUserDB.crKeyResetPassword)
					should().not.equal(joUserGen.dhKeyResetPasswordExpiration, joUserDB.dhKeyResetPasswordExpiration)
					should().not.equal(joUserGen.crKeyEmailConfirmation, joUserDB.crKeyEmailConfirmation)
					should().not.equal(joUserGen.keyFacebook, joUserDB.keyFacebook)
					should().not.equal(joUserGen.keyGoogle, joUserDB.keyGoogle)
					d()
				})
		})
	}

	private static testUserMe() {
		const r = RoutesEnum.userMe
		const m = SConst.HTTP_METHOD_GET
		const u = SConst.TEST_ROLE_NORMAL_USER

		it(TestShould.exist(), (done) => {
			TestCaseItem.callEvalExistence(done, r, m)
		})

		it(TestShould.acceptBothTokens(), (done) => {
			TestCaseItem.callEvalAcceptBothTokens(done, r, m, u)
		})

		it(TestShould.acceptAccessTokenOnly(), (done) => {
			TestCaseItem.callEvalAcceptAccessTokenOnly(done, r, m, u)
		})

		it(TestShould.failWrongTokens(), (done) => {
			TestCaseItem.callEvalFailWrongTokens(done, r, m)
		})

		it(TestShould.failNoTokens(), (done) => {
			TestCaseItem.callEvalFailNoTokens(done, r, m)
		})

		const expectedAttr = ["idUser", "nmUser", "emUser", "dhRegister", "isEmailConfirmed", "nrLanguage",
			"snTelephone", "snWhatsapp", "piAvatar", "nmCompany", "nmCargo", "lkFacebook", "dsTestimony", "lkWebsite",
			"dhLastAccess", "canPostSeContent", "canPostSeChannel", "canSimulateSomeone", "idUserPermission", "canReloadEnv",
			"canPostWorkspace", "lkLinkedin", "idWorkspaceDefault"]
		it("It should bring only the expected attributes", (done) => {
			TestCaseItem.callEvalExpectedAttributes(done, r, m, u, expectedAttr, undefined, false)
		})

		it("It should compare all the attributes", (done) => {
			const loggedUser = TestUserManager.getNewUser().loggedUser
			TestUtil.call(r, m, u)
				.expect(200)
				.expect((res2: supertest.Response) => {
					const isEqual = JsonUtil.isSameJoKeys(res2.body, loggedUser.user, true, ...expectedAttr)
					if (!isEqual) {
						throw new Error("wrong set of attributes")
					}
				})
				.end(TestUtil.end(done))
		})
	}

	private static testLogged() {
		const r = RoutesEnum.userLogged
		const m = SConst.HTTP_METHOD_GET

		it(TestShould.exist(), (done) => {
			TestCaseItem.callEvalExistence(done, r, m)
		})

		it(TestShould.acceptBothTokens(), (done) => {
			TestCaseItem.callEvalAcceptBothTokens(done, r, m, SConst.TEST_ROLE_NEW_USER)
		})

		it(TestShould.acceptAccessTokenOnly(), (done) => {
			TestCaseItem.callEvalAcceptAccessTokenOnly(done, r, m, SConst.TEST_ROLE_NEW_USER)
		})

		it(TestShould.failWrongTokens(), (done) => {
			TestCaseItem.callEvalFailWrongTokens(done, r, m)
		})

		it(TestShould.failNoTokens(), (done) => {
			TestCaseItem.callEvalFailNoTokens(done, r, m)
		})
	}

	private static testLogoff() {
		const r = RoutesEnum.userLogoff
		const m = SConst.HTTP_METHOD_GET

		it(TestShould.exist(), (done) => {
			TestCaseItem.callEvalExistence(done, r, m)
		})

		it(TestShould.acceptBothTokens(), (done) => {
			TestCaseItem.callEvalAcceptBothTokens(done, r, m, SConst.TEST_ROLE_NEW_USER)
		})

		it(TestShould.failNoTokens(), (done) => {
			TestCaseItem.callEvalFailNoTokens(done, r, m)
		})
	}

	private static testLogin() {
		const r = RoutesEnum.userLogin
		const m = SConst.HTTP_METHOD_POST
		// UserTest.newUserActive = true

		it(TestShould.exist(), (done) => {
			TestCaseItem.callEvalExistence(done, r, m)
		})

		it(TestShould.failMissingAllParams(), (done) => {
			TestCaseItem.callEvalFailMissingAllParams(done, r, m, undefined)
		})

		const keys = ["emUser", "unKeyPassword"]
		keys.forEach(key => {
			it(TestShould.failMissingAParam(key), (done) => {
				const loggedUser = TestUserManager.getNewUser().loggedUser
				const joRegisterParam = { emUser: loggedUser.user.emUser, unKeyPassword: loggedUser.user.emUser }
				TestCaseItem.callEvalFailMissingAParam(done, r, m, undefined, joRegisterParam, key)
			})
		})

		it("It should login via emUser", (done) => {
			const loggedUser = TestUserManager.getNewUser().loggedUser
			const joLoginParam = { emUser: loggedUser.user.emUser, unKeyPassword: EnvTest.getUnPwDefault() }
			TestUtil.call(r, m, undefined, joLoginParam)
				.expect(200)
				.end(TestUtil.end(done))
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Conflict login route + valid tokens`,
			dsCircumstances: `Tokens being sent in a login route`,
			dsExpected: `To override tokens`
		}), (d) => {
			const loggedUser = TestUserManager.getNewUser().loggedUser
			const joLoginParam = { emUser: loggedUser.user.emUser, unKeyPassword: EnvTest.getUnPwDefault() }
			const customResponse = (res: Response) => {
				const resAny: any = res
				if (res.header[SConst.X_ACCESS_TOKEN] == resAny.req._headers[SConst.X_ACCESS_TOKEN]) {
					throw Error(`Access token should've been overriden`)
				}
				if (res.header[SConst.X_REFRESH_TOKEN] == resAny.req._headers[SConst.X_REFRESH_TOKEN]) {
					throw Error(`Refresh token should've been overriden`)
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, r, m, SConst.TEST_ROLE_NEW_USER, joLoginParam, joResult)
		})

		// it(TestShould.dsText({
		// 	dsWhatsBeingTested: `Conflict login route + invalid tokens`,
		// 	dsCircumstances: `Wrong tokens being sent in a login route`,
		// 	dsExpected: `To log in and override tokens`
		// }), (d) => {
		// 	const loggedUser = TestUserManager.getNewUser().loggedUser
		// 	const joLoginParam = { emUser: loggedUser.user.emUser, unKeyPassword: BTConst.PW_DEFAULT }
		// 	const customResponse = (res: Response) => {
		// 		const resAny : any = res
		// 		if (res.header[SConst.X_ACCESS_TOKEN] == resAny.req._headers[SConst.X_ACCESS_TOKEN]) {
		// 			throw Error(`Access token should've been overriden`)
		// 		}
		// 		if (res.header[SConst.X_REFRESH_TOKEN] == resAny.req._headers[SConst.X_REFRESH_TOKEN]) {
		// 			throw Error(`Refresh token should've been overriden`)
		// 		}
		// 	}
		// 	const joResult = { customResponse: customResponse }
		// 	TestUtil.call(r, m, undefined, joLoginParam)
		// 	.set(SConst.X_ACCESS_TOKEN, "lalala")
		// 	.set(SConst.X_REFRESH_TOKEN, "mimimi")
		// 	.expect(200)
		// 	.expect(customResponse)
		// 	.end(TestUtil.end(d))
		// })

		it("It should not find this user", (done) => {
			const emUserWrong = StringUtil.random() + "@hatchers.com.br"
			const joRegisterParam = { emUser: emUserWrong, unKeyPassword: emUserWrong }
			TestUtil.call(r, m, undefined, joRegisterParam)
				.expect(400)
				.expect(SConst.STATUS_MESSAGE, KeyEnum.nmKeyNotFound)
				.expect(SConst.EXTRA_CONTENT, JSON.stringify({ nmKey: KeyEnum.email }))
				.end(TestUtil.end(done))
		})

		it("It should not accept this password", (done) => {
			const unKeyPasswordWrong = StringUtil.random()
			const loggedUser = TestUserManager.getActiveUser().loggedUser
			const joRegisterParam = { emUser: loggedUser.user.emUser, unKeyPassword: unKeyPasswordWrong }
			TestUtil.call(r, m, undefined, joRegisterParam)
				.expect(400)
				.expect(SConst.STATUS_MESSAGE, CtExcep.incorrectPassword.nmMsg)
				.end(TestUtil.end(done))
		})
	}

	private static testChangePassword() {
		const r = RoutesEnum.userChangePassword
		const m = SConst.HTTP_METHOD_POST

		const unKeyPasswordNew = StringUtil.random()
		let crKeyPasswordOld: string
		let pwDefaultPasswordToRestabilish: string

		it(TestShould.exist(), (done) => {
			TestCaseItem.callEvalExistence(done, r, m)
		})

		it(TestShould.failMissingAllParams(), (done) => {
			TestCaseItem.callEvalFailMissingAllParams(done, r, m, SConst.TEST_ROLE_NEW_USER)
		})

		const keys = ["emUser", "unKeyPasswordOld", "unKeyPasswordNew", "unKeyPasswordNewAgain"]
		keys.forEach(key => {
			it(TestShould.failMissingAParam(key), (done) => {
				const loggedUser = TestUserManager.getNewUser().loggedUser
				const unKeyPasswordOld = loggedUser.user.emUser
				const joParam = {
					emUser: loggedUser.user.emUser,
					unKeyPasswordOld: unKeyPasswordOld,
					unKeyPasswordNew: unKeyPasswordNew,
					unKeyPasswordNewAgain: unKeyPasswordNew
				}
				TestCaseItem.callEvalFailMissingAParam(done, r, m, SConst.TEST_ROLE_NEW_USER, joParam, key)
			})
		})

		before("Encrypt a password to work like 'old password'", (done) => {
			const loggedUser = TestUserManager.getNewUser().loggedUser
			const unKeyPasswordOld = loggedUser.user.emUser
			AuthBsn.encrypt(unKeyPasswordOld)
				.then((crKeyPasswordOldParam) => {
					crKeyPasswordOld = crKeyPasswordOldParam
					done()
				})
		})

		before("Encrypt the new password to get the encrypted string to compare later", (done) => {
			AuthBsn.encrypt(unKeyPasswordNew)
				.then((crKeyPasswordNewParam) => {
					done()
				})
		})

		before("Set password to work like 'old password'", (done) => {
			const loggedUser = TestUserManager.getNewUser().loggedUser
			const query = `update usr set crKeyPassword = '${crKeyPasswordOld}' where idUser = ${loggedUser.user.idUser}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					done()
				})
		})

		before("Get the original password", (done) => {
			const loggedUser = TestUserManager.getNewUser().loggedUser
			const query = `select crKeyPassword from usr where idUser = ${loggedUser.user.idUser}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					pwDefaultPasswordToRestabilish = result[0].crKeyPassword
					done()
				})
		})

		it("It should NOT change to the new password", (done) => {
			const loggedUser = TestUserManager.getNewUser().loggedUser
			const unKeyPasswordOld = loggedUser.user.emUser

			const joParam = {
				emUser: loggedUser.user.emUser,
				unKeyPasswordOld: unKeyPasswordOld,
				unKeyPasswordNew: unKeyPasswordNew + "a",
				unKeyPasswordNewAgain: unKeyPasswordNew
			}
			TestUtil.call(r, m, SConst.TEST_ROLE_NEW_USER, joParam)
				.expect(400)
				.expect(SConst.STATUS_MESSAGE, KeyEnum.passwordsWereNotTheSame)
				.end(TestUtil.end(done))
		})

		it("It should change to the new password", (done) => {
			const loggedUser = TestUserManager.getNewUser().loggedUser
			const unKeyPasswordOld = loggedUser.user.emUser

			const joParam = {
				emUser: loggedUser.user.emUser,
				unKeyPasswordOld: unKeyPasswordOld,
				unKeyPasswordNew: unKeyPasswordNew,
				unKeyPasswordNewAgain: unKeyPasswordNew
			}
			TestUtil.call(r, m, SConst.TEST_ROLE_NEW_USER, joParam)
				.expect(200)
				.end(TestUtil.end(done))
		})

		it("It should login via emUser with the new password (validate the whole process)", (done) => {
			const loggedUser = TestUserManager.getNewUser().loggedUser
			const joRegisterParam2 = { emUser: loggedUser.user.emUser, unKeyPassword: unKeyPasswordNew }
			TestUtil.call(
				RoutesEnum.userLogin, SConst.HTTP_METHOD_POST, undefined, joRegisterParam2)
				.expect(200)
				.end(TestUtil.end(done))
		})

		after("Restabilish the default password", (done) => {
			const loggedUser = TestUserManager.getNewUser().loggedUser
			TestUserManager.setUserPassword(loggedUser.user.emUser, pwDefaultPasswordToRestabilish, false)
				.then(() => {
					done()
				})
		})
	}
}
