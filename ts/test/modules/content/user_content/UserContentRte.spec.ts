import { RoutesEnum, SConst, TUserTest, StringUtil, CtHttpStatus, KeyEnum, CtWarn } from "salesfy-shared";
import { TestCaseItem, TestUserManager, TestShould, TestUtil } from "../../../barrel/Barrel.spec";
import { LayerDao } from "app/layers_template/LayerDao";
import { Response } from "superagent";
import { ConnDao } from "app/structure/ConnDao";
import { Content } from "app/modules/content/Content";
import { TestEntity } from "../../../support/TestEntity.spec";
import { TestRouteSpec } from "../../../support/TestRoute.spec";

export class UserContentRteSpec extends TestRouteSpec {

	public test() {
		describe(TestShould.dsText({ nmRoute: RoutesEnum.userContent, nmClass: "UserContentRteSpec" }), () => {
			describe(TestShould.dsText({ dsText: "Test put", nmMethod: SConst.HTTP_METHOD_PUT }), () => {
				this.testPut()
			})
			describe(TestShould.dsText({ dsText: "Test evaluation", nmMethod: SConst.HTTP_METHOD_PUT }), () => {
				this.testEvaluation()
			})
			describe(TestShould.dsText({ dsText: "Test like", nmMethod: SConst.HTTP_METHOD_PUT }), () => {
				this.testLike()
			})
			describe(TestShould.dsText({ dsText: "Test favorite", nmMethod: SConst.HTTP_METHOD_PUT }), () => {
				this.testFavorite()
			})
		})
	}

	private testPut() {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = {}
			done()
		})

		const customResponse1 = (res: Response) => { this.joParamMain.joContent = res.body }
		TestEntity.itReg(RoutesEnum.content, this.u, Content, customResponse1, { isPlaybook: true })

		it(TestShould.exist(), (done) => {
			TestCaseItem.callEvalExistence(done, RoutesEnum.userContent, this.mPut)
		})

		it(TestShould.failMissingAllParams(), (done) => {
			TestCaseItem.callEvalFailMissingAllParams(done, RoutesEnum.userContent, this.mPut, this.u)
		})

		const keys = ["idContent"]
		keys.forEach(key => {
			it(TestShould.failMissingAParam(key), (done) => {
				const joParam: any = { idContent: this.joParamMain.joContent.idContent }
				TestCaseItem.callEvalFailMissingAParam(done, RoutesEnum.userContent, this.mPut, this.u, joParam, key)
			})
		})

		it(TestShould.acceptBothTokens(), (done) => {
			TestCaseItem.callEvalAcceptBothTokens(done, RoutesEnum.userContent, this.mPut, this.u)
		})

		it(TestShould.failNoTokens(), (done) => {
			TestCaseItem.callEvalFailNoTokens(done, RoutesEnum.userContent, this.mPut)
		})

		it("It should bring only the expected attributes", (done) => {
			const expectedAttr = ["idContent", "nmContent", "piContent", "idCtContent", "dsContent",
				"nmCtContent", "nmPublisher", "isLike", "isFavorite", "qtLike", "dhPublish", "nrLanguage",
				"shShowDescription", "shShowTitle", "shShowPublisher", "shShowFullscreenImage", "shShowActionButtons",
				"nmCtContent", "idPublisher", "isActive", "shShowShortCard", "shShowShareButton", "vlSort", "isPlaybook",
				"dhUpdate", "qtView", "idCtUserGroupAccess", "dhLastView", "dhLastConversion", "qtEval", "vlEval", "vlEvalUser",
				"keyCtContentState"
			]
			const joParam: any = { idContent: this.joParamMain.joContent.idContent }
			TestCaseItem.callEvalExpectedAttributes(done, RoutesEnum.userContent, this.mPut, this.u, expectedAttr, joParam)
		})
	}

	private testLike() {
		const nmQtAttribute = "qtLike"
		const nmIsAttribute = "isLike"
		this.userContentFavoLike(nmQtAttribute, nmIsAttribute)
	}

	private testFavorite() {
		const nmQtAttribute = "qtLike"
		const nmIsAttribute = "isLike"
		this.userContentFavoLike(nmQtAttribute, nmIsAttribute)
	}

	private userContentFavoLike(nmQtAttribute: string, nmIsAttribute: string) {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = {}
			done()
		})
		TestCaseItem.itShouldEditUserPermission(this.u, true, true, true, true)

		const customResponse1 = (res: Response) => { this.joParamMain.joContent = res.body }
		TestEntity.itReg(RoutesEnum.content, this.u, Content, customResponse1, { isPlaybook: false })

		it(TestShould.dsText({ dsPreparation: `Create an userContent row` }), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent.idContent }
			TestUtil.customCall(d, RoutesEnum.content, this.mGet, this.u, joParam)
		})

		it(TestShould.dsText({ dsPreparation: `Get the amount of ${nmQtAttribute} of content` }), (d) => {
			const query = `select ${nmQtAttribute} as \"${nmQtAttribute}\"
			from content where idContent = ${this.joParamMain.joContent.idContent}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					this.joParamMain.qtAtrContentBefore = result[0][0][nmQtAttribute]
					TestUtil.freeEnd(d)
				}).catch(d)
		})

		it(TestShould.dsText({ dsPreparation: `Get the amount of ${nmIsAttribute} of userContent` }), (d) => {
			const loggedUser = TestUserManager.getUser().loggedUser
			const query = `select ${nmIsAttribute} as \"${nmIsAttribute}\" from userContent
			where idContent = ${this.joParamMain.joContent.idContent} and idUser = ${loggedUser.user.idUser}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					this.joParamMain.isAtrUserContentBefore = result[0][0][nmIsAttribute]
					TestUtil.freeEnd(d)
				}).catch(d)
		})

		it(TestShould.dsText({ dsPreparation: `U1 execute the route a single time to increment results` }), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent.idContent }
			joParam[nmIsAttribute] = true
			TestUtil.customCall(d, RoutesEnum.userContent, this.mPut, this.u, joParam)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Is userContent under the right ${nmIsAttribute}?`,
			dsCircumstances: `u1 just put ${nmIsAttribute} true`,
			dsExpected: `It should change ${nmIsAttribute} to true`
		}), (d) => {
			const query = `select idContent as \"idContent\", ${nmQtAttribute} as \"${nmQtAttribute}\" from content
				where idContent = ${this.joParamMain.joContent.idContent} limit 1`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					const isAtrUserContentBefore = this.joParamMain.isAtrUserContentBefore
					const isAtrUserContentAfter = result[0][0][nmIsAttribute]
					if (isAtrUserContentBefore == isAtrUserContentAfter) {
						throw new Error(`${nmIsAttribute} not changed.`)
					}
					TestUtil.freeEnd(d)
				}).catch(d)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Is content under the right ${nmQtAttribute}?`,
			dsCircumstances: `u1 just put ${nmIsAttribute} true`,
			dsExpected: `It should increment ${nmQtAttribute} count for content`
		}), (d) => {
			const query = `select idContent as \"idContent\", ${nmQtAttribute} as \"${nmQtAttribute}\" from content
				where idContent = ${this.joParamMain.joContent.idContent} limit 1`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					const qtAtrContentBefore = this.joParamMain.qtAtrContentBefore
					const qtAtrContentAfter = result[0][0][nmQtAttribute]
					if (qtAtrContentBefore != (qtAtrContentAfter + 1)) {
						throw new Error(`${nmQtAttribute} not counted. Before: ${qtAtrContentBefore}. After: ${qtAtrContentAfter}`)
					}
					TestUtil.freeEnd(d)
				}).catch(d)
		})

		it(TestShould.dsText({ dsPreparation: `Execute the route AGAIN with the same parameters` }), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent.idContent }
			joParam[nmIsAttribute] = true
			TestUtil.customCall(d, RoutesEnum.userContent, this.mPut, this.u, joParam)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Is content under the right ${nmQtAttribute}?`,
			dsCircumstances: `u1 just put ${nmIsAttribute} true AGAIN`,
			dsExpected: `It should NOT increment ${nmQtAttribute} count for content since the last time`
		}), (d) => {
			const query = `select idContent as \"idContent\", ${nmQtAttribute} as \"${nmQtAttribute}\" from content
				where idContent = ${this.joParamMain.joContent.idContent} limit 1`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					const qtAtrContentBefore = this.joParamMain.qtAtrContentBefore
					const qtAtrContentAfter = result[0][0][nmQtAttribute]
					if (qtAtrContentBefore != (qtAtrContentAfter + 1)) {
						throw new Error(`${nmQtAttribute} is different. Before: ${qtAtrContentBefore}. After: ${qtAtrContentAfter}`)
					}
					TestUtil.freeEnd(d)
				}).catch(d)
		})

		it(TestShould.dsText({ dsPreparation: `U2 execute the route a single time to increment results` }), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent.idContent }
			joParam[nmIsAttribute] = true
			TestUtil.customCall(d, RoutesEnum.userContent, this.mPut, this.u2, joParam)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Is content under the right ${nmQtAttribute}?`,
			dsCircumstances: `u2 just put ${nmIsAttribute} true`,
			dsExpected: `It should increment ${nmQtAttribute} count for content (now +2) since the first state`
		}), (d) => {
			const query = `select idContent as \"idContent\", ${nmQtAttribute} as \"${nmQtAttribute}\" from content
				where idContent = ${this.joParamMain.joContent.idContent} limit 1`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					const qtAtrContentBefore = this.joParamMain.qtAtrContentBefore
					const qtAtrContentAfter = result[0][0][nmQtAttribute]
					if (qtAtrContentBefore != (qtAtrContentAfter + 2)) {
						throw new Error(`${nmQtAttribute} is different. Before: ${qtAtrContentBefore}. After: ${qtAtrContentAfter}`)
					}
					TestUtil.freeEnd(d)
				}).catch(d)
		})
	}

	private testEvaluation() {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = {}
			done()
		})
		TestCaseItem.itShouldEditUserPermission(this.u, true, true, true, true)

		const customResponse1 = (res: Response) => { this.joParamMain.joContent1 = res.body }
		TestEntity.itReg(RoutesEnum.content, this.u, Content, customResponse1, { isPlaybook: false })

		it(TestShould.dsText({
			dsWhatsBeingTested: `Is the content under the right evaluate values?`,
			dsCircumstances: `User has just added content`,
			dsExpected: `The values should be zero for quantities and null for values`
		}), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent1.idContent }
			const customResponse = (res: Response) => {
				const content = res.body[0]
				if (content.qtEval != 0) {
					throw Error(`wrong qtEval. Expected 0, Returned ${content.qtEval}`)
				}
				if (content.vlEval != undefined) {
					throw Error(`wrong vlEval. Expected undefined, Returned ${content.qtEval}`)
				}
				if (content.vlEvalUser != undefined) {
					throw Error(`wrong vlEvalUser. Expected undefined, Returned ${content.vlEvalUser}`)
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.content, this.mGet, this.u, joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: `U1 evaluates C1 as 5stars` }), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent1.idContent, vlEval: 5 }
			TestUtil.customCall(d, RoutesEnum.userContent, this.mPut, this.u, joParam)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Is the content under the right evaluate values?`,
			dsCircumstances: `User registered and starred evaluation as 5`,
			dsExpected: `Evaluation as 5`
		}), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent1.idContent }
			const customResponse = (res: Response) => {
				const content = res.body[0]
				if (content.qtEval != 1) {
					throw Error(`wrong qtEval. Expected 1, Returned ${content.qtEval}`)
				}
				if (content.vlEval != 5) {
					throw Error(`wrong vlEval. Expected 5, Returned ${content.qtEval}`)
				}
				if (content.vlEvalUser != 5) {
					throw Error(`wrong vlEvalUser. Expected 5, Returned ${content.vlEvalUser}`)
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.content, this.mGet, this.u, joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: `U2 evaluates C1 as 4stars` }), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent1.idContent, vlEval: 4 }
			TestUtil.customCall(d, RoutesEnum.userContent, this.mPut, this.u2, joParam)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Is the content under the right evaluate values?`,
			dsCircumstances: `Users evaluated content as 5 and 4`,
			dsExpected: `Evaluation as 4.5`
		}), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent1.idContent }
			const customResponse = (res: Response) => {
				const content = res.body[0]
				if (content.qtEval != 2) {
					throw Error(`wrong qtEval. Expected 2, Returned ${content.qtEval}`)
				}
				if (content.vlEval != 4.5) {
					throw Error(`wrong vlEval. Expected 4.5, Returned ${content.qtEval}`)
				}
				if (content.vlEvalUser != 4) {
					throw Error(`wrong vlEvalUser. Expected 4, Returned ${content.vlEvalUser}`)
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.content, this.mGet, this.u2, joParam, joResult)
		})

		it(TestShould.dsText({
			dsPreparation: `Register a new user(u3) to this test ` +
				`(to evaluate more  data)`
		}), (d) => {
			TestUserManager.register(d, undefined, undefined, 1)
		})

		it(TestShould.dsText({ dsPreparation: `U3 evaluates C1 as 5stars` }), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent1.idContent, vlEval: 5 }
			TestUtil.customCall(d, RoutesEnum.userContent, this.mPut, this.u2, joParam)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Is the content under the right evaluate values?`,
			dsCircumstances: `Users evaluated content as 5, 4, 5`,
			dsExpected: `Evaluation as 4.7`
		}), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent1.idContent }
			const customResponse = (res: Response) => {
				const content = res.body[0]
				if (content.qtEval != 3) {
					throw Error(`wrong qtEval. Expected 3, Returned ${content.qtEval}`)
				}
				if (content.vlEval != 4.7) {
					throw Error(`wrong vlEval. Expected 4.7, Returned ${content.vlEval}`)
				}
				if (content.vlEvalUser != 5) {
					throw Error(`wrong vlEvalUser. Expected 5, Returned ${content.vlEvalUser}`)
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.content, this.mGet, this.u2, joParam, joResult)
		})

		it(TestShould.dsText({
			dsPreparation: `Register a new user(u4) to this test ` +
				`(to evaluate more  data)`
		}), (d) => {
			const joRegisterParam = TestUserManager.genJoUser()
			TestUserManager.register(d, joRegisterParam, undefined, 1)
		})

		it(TestShould.dsText({ dsPreparation: `U4 evaluates C1 as 4stars` }), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent1.idContent, vlEval: 4 }
			TestUtil.customCall(d, RoutesEnum.userContent, this.mPut, this.u2, joParam)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Is the content under the right evaluate values?`,
			dsCircumstances: `Users evaluated content as 5, 4, 5, 4`,
			dsExpected: `Evaluation as 4.5`
		}), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent1.idContent }
			const customResponse = (res: Response) => {
				const content = res.body[0]
				if (content.qtEval != 4) {
					throw Error(`wrong qtEval. Expected 4, Returned ${content.qtEval}`)
				}
				if (content.vlEval != 4.5) {
					throw Error(`wrong vlEval. Expected 4.5, Returned ${content.vlEval}`)
				}
				if (content.vlEvalUser != 4) {
					throw Error(`wrong vlEvalUser. Expected 4, Returned ${content.vlEvalUser}`)
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.content, this.mGet, this.u2, joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: `U1 evaluates AGAIN C1 as 4stars` }), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent1.idContent, vlEval: 4 }
			TestUtil.customCall(d, RoutesEnum.userContent, this.mPut, this.u, joParam)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Is the content under the right evaluate values?`,
			dsCircumstances: `Users evaluated content as 4, 4, 5, 4`,
			dsExpected: `Evaluation as 4.3`
		}), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent1.idContent }
			const customResponse = (res: Response) => {
				const content = res.body[0]
				if (content.qtEval != 4) {
					throw Error(`wrong qtEval. Expected 4, Returned ${content.qtEval}`)
				}
				if (content.vlEval != 4.3) {
					throw Error(`wrong vlEval. Expected 4.3, Returned ${content.vlEval}`)
				}
				if (content.vlEvalUser != 4) {
					throw Error(`wrong vlEvalUser. Expected 4, Returned ${content.vlEvalUser}`)
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.content, this.mGet, this.u, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Evaluate out of limits`,
			dsCircumstances: `User evaluated content as 6`,
			dsExpected: `Error`
		}), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent1.idContent, vlEval: 6 }
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus: CtWarn.valueOutOfLimits.nmMsg
			}
			TestUtil.customCall(d, RoutesEnum.userContent, this.mPut, this.u, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Evaluate out of limits`,
			dsCircumstances: `User evaluated content as 0`,
			dsExpected: `Error`
		}), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent1.idContent, vlEval: 0 }
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus: CtWarn.valueOutOfLimits.nmMsg
			}
			TestUtil.customCall(d, RoutesEnum.userContent, this.mPut, this.u, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Remove user evaluation`,
			dsCircumstances: `User evaluated content as undefined. 4, 4, 5, 4(now undefined) = 13/3`,
			dsExpected: `To remove evaluation`
		}), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent1.idContent, vlEval: null }
			const customResponse = (res: Response) => {
				const content = res.body
				if (content.qtEval != 3) {
					throw Error(`wrong qtEval. Expected 3, Returned ${content.qtEval}`)
				}
				if (content.vlEval != 4.3) {
					throw Error(`wrong vlEval. Expected 4.3, Returned ${content.vlEval}`)
				}
				if (content.vlEvalUser != undefined) {
					throw Error(`wrong vlEvalUser. Expected undefined, Returned ${content.vlEvalUser}`)
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.userContent, this.mPut, this.u, joParam, joResult)
		})

		const customResponse2 = (res: Response) => { this.joParamMain.joContent2 = res.body }
		TestEntity.itReg(RoutesEnum.content, this.u, Content, customResponse2, { isPlaybook: false })

		it(TestShould.dsText({ dsPreparation: `U1 evaluates C2 as 3stars` }), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent2.idContent, vlEval: 3 }
			TestUtil.customCall(d, RoutesEnum.userContent, this.mPut, this.u, joParam)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Remove user evaluation`,
			dsCircumstances: `User evaluated content 2 as undefined. It was evaluated as 3(now undefined)`,
			dsExpected: `To remove evaluation`
		}), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent2.idContent, vlEval: null }
			const customResponse = (res: Response) => {
				const content = res.body
				if (content.qtEval != 0) {
					throw Error(`wrong qtEval. Expected 0, Returned ${content.qtEval}`)
				}
				if (content.vlEval != undefined) {
					throw Error(`wrong vlEval. Expected undefined, Returned ${content.vlEval}`)
				}
				if (content.vlEvalUser != undefined) {
					throw Error(`wrong vlEvalUser. Expected undefined, Returned ${content.vlEvalUser}`)
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.userContent, this.mPut, this.u, joParam, joResult)
		})
	}

}
