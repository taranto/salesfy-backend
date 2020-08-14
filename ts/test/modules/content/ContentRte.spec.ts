import { RoutesEnum, SConst, TUserTest, StringUtil, JsonUtil } from "salesfy-shared";
import { CtPlatform, CtHttpStatus, CtExcep } from "salesfy-shared";
import { KeyEnum } from "salesfy-shared";
import { TestCaseItem, TestShould, Env, should } from "../../barrel/Barrel.spec";
import { TestUtil, TestUserManager, supertest } from "../../barrel/Barrel.spec";
import { LayerDao } from "app/layers_template/LayerDao";
import { Response } from "supertest";
import { ConnDao } from "app/structure/ConnDao";
import { TestEntity } from "../../support/TestEntity.spec";
import { Content } from "app/modules/content/Content";
import { Channel } from "app/modules/channel/Channel";
import { TestUserBox } from "../../support/TestUserBox.spec";

export class ContentRteSpec {

	public static test() {
		describe("Test content", () => {
			describe(TestShould.dsText({ dsText: "basic" }), () => {
				ContentRteSpec.testBasic()
			})
			describe(TestShould.descRouteMethod(RoutesEnum.content, SConst.HTTP_METHOD_PUT), () => {
				ContentRteSpec.testPut()
			})
			describe(TestShould.descRouteMethod(RoutesEnum.content, SConst.HTTP_METHOD_POST), () => {
				ContentRteSpec.testPost()
			})
			describe(TestShould.descRouteMethod(RoutesEnum.content, SConst.HTTP_METHOD_DELETE), () => {
				ContentRteSpec.testDelete()
			})
			describe(TestShould.describeTitle(RoutesEnum.contentPublishPackage), () => {
				ContentRteSpec.testPublishPackagePost()
			})
			describe(TestShould.describeTitle(RoutesEnum.contentConversion, "Logged"), () => {
				ContentRteSpec.testUserContentConversion(SConst.TEST_ROLE_NORMAL_USER)
			})
			describe.skip(TestShould.describeTitle(RoutesEnum.contentConversion, "Annonymous"), () => {
				ContentRteSpec.testUserContentConversion(undefined)
			})
		})
	}

	private static testBasic() {
		TestCaseItem.descItShouldEvalExistence(true, RoutesEnum.content, SConst.TEST_ROLE_NORMAL_USER,
			SConst.HTTP_METHOD_PUT, SConst.HTTP_METHOD_POST, SConst.HTTP_METHOD_DELETE)
	}

	private static testUserContentConversion(loggedInUser: TUserTest) {
		const m = SConst.HTTP_METHOD_GET
		const r = RoutesEnum.contentConversion

		const joParamMain: any = {}
		let joParamMainIdOnly: any = {}
		let qtAtrContentBefore: number
		let qtAtrUserContentBefore: number
		let dhLastConversionBeforeThan: Date
		let dhLastConversionFirstMoment: Date

		it(TestShould.failMissingAllParams(), (done) => {
			TestCaseItem.callEvalFailMissingAllParams(done, r, m, loggedInUser)
		})

		const keys = ["idContent"]
		keys.forEach(key => {
			it(TestShould.failMissingAParam(key), (done) => {
				TestCaseItem.callEvalFailMissingAParam(done, r, m, loggedInUser, joParamMainIdOnly, key)
			})
		})

		TestCaseItem.itShouldEditUserPermission(SConst.TEST_ROLE_NORMAL_USER, true, true, false, false)

		it("uA should post content A (SE)", (done) => {
			const joParam = TestEntity.gen(Content, { isPlaybook: false })
			const customResponse = (res: Response) => {
				joParamMain.joContentA = res.body
				joParamMainIdOnly = { idContent: joParamMain.joContentA.idContent }
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.content,
				SConst.HTTP_METHOD_POST, SConst.TEST_ROLE_NORMAL_USER, joParam, joResult)
		})

		if (loggedInUser) {
			it("Execute the route a single time to at least create a userContent row", (done) => {
				TestUtil.customCall(done, r, m, loggedInUser, joParamMainIdOnly)
			})
		}

		it("Set start date limit for the conversion (dhLastConversion)", (done) => {
			dhLastConversionBeforeThan = new Date()
			setTimeout(() => {
				done()
			}, SConst.MILI_SEC / 2)
		})

		it("Get the attribute of the content to count for the test", (done) => {
			const query = `select qtConversion as \"qtConversion\" from content where idContent = ${joParamMainIdOnly.idContent}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					qtAtrContentBefore = result[0][0].qtConversion
				})
				.then(() => done())
		})

		if (loggedInUser) {
			it("Get the attribute of the userContent to count for the test", (done) => {
				const loggedUser = TestUserManager.getUser().loggedUser
				const idUser = loggedUser.user.idUser
				const query = `select qtConversion as \"qtConversion\", dhLastConversion as \"dhLastConversion\" from userContent
					where idContent = ${joParamMainIdOnly.idContent} and idUser = ${idUser}`
				ConnDao.staticQueryPromise(query)
					.then((result) => {
						qtAtrUserContentBefore = result[0][0].qtConversion
						dhLastConversionFirstMoment = result[0][0].dhLastConversion
					})
					.then(() => done())
			})
		}

		it("Execute the route a single time to verify its results in the tests afterwards", (done) => {
			setTimeout(() => {
				TestUtil.customCall(done, r, m, loggedInUser, joParamMainIdOnly);
			}, SConst.MILI_SEC)
		})

		it(`It should increment qtConversion count for content`, (done) => {
			const query = `select qtConversion as \"qtConversion\" from content where idContent = ${joParamMainIdOnly.idContent}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					const qtAtrContentAfter = result[0][0].qtConversion
					if (qtAtrContentBefore != qtAtrContentAfter - 1) {
						throw new Error(`qtConversion not counted. Before: ${qtAtrContentBefore}. After: ${qtAtrContentAfter}`)
					}
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		if (loggedInUser) {
			it(`It should increment qtConversion count for user content interaction. Verify dhLastConversion also`, (done) => {
				const loggedUser = TestUserManager.getUser().loggedUser
				const query = `select qtConversion as \"qtConversion\", dhLastConversion as \"dhLastConversion\" from userContent
					where idContent = ${joParamMainIdOnly.idContent} and idUser = ${loggedUser.user.idUser}`
				ConnDao.staticQueryPromise(query)
					.then((result) => {
						const qtAtrUserContentAfter = result[0][0].qtConversion
						if (qtAtrUserContentBefore != qtAtrUserContentAfter - 1) {
							throw new Error(`qtConversion not counted.` +
								` Before: ${qtAtrUserContentBefore}. After: ${qtAtrUserContentAfter}`)
						}
						const a = joParamMainIdOnly.idContent
						const dhLastConversion = result[0][0].dhLastConversion
						if (dhLastConversion.getTime() == dhLastConversionFirstMoment.getTime()) {
							throw new Error(`dhLastConversion not counted.`)
						}
						if (dhLastConversionBeforeThan.getTime() > dhLastConversion.getTime()) {
							throw new Error(`dhLastConversion must've been later than ${dhLastConversionBeforeThan.getTime()}.` +
								` Was ${dhLastConversion.getTime()}`)
						}
						TestUtil.freeEnd(done)
					}).catch(done)
			})
		}

		const expectedAttr = ["idContent", "nmContent", "piContent", "idCtContent", "dsContent", "vlSort",
			"nmCtContent", "nmPublisher", "shShowDescription", "shShowTitle", "shShowPublisher", "qtLike", "dhPublish",
			"shShowFullscreenImage", "shShowActionButtons", "nmCtContent", "lkContent", "shShowShortCard", "shShowShareButton",
			"nrLanguage", "isPlaybook", "idPublisher", "idCtUserGroupAccess", "dhUpdate", "isActive", "qtEval", "vlEval",
			"vlEvalUser", "keyCtContentState"]
		if (loggedInUser) {
			expectedAttr.push("isFavorite", "isLike", "qtView", "dhLastView", "dhLastConversion")
		}
		it("It should bring only the expected attributes", (done) => {
			TestCaseItem.callEvalExpectedAttributes(done, r, m, loggedInUser, expectedAttr, joParamMainIdOnly)
		})
	}

	private static testDelete() {
		const r = RoutesEnum.content
		const mDel = SConst.HTTP_METHOD_DELETE
		const uA = SConst.TEST_ROLE_NORMAL_USER
		const uB = SConst.TEST_ROLE_NEW_USER

		const joParamMain: any = {}

		it(TestShould.failMissingAllParams(), (done) => {
			TestCaseItem.callEvalFailMissingAllParams(done, r, mDel, uA)
		})

		const keys = ["idContent"]
		keys.forEach(key => {
			it(TestShould.failMissingAParam(key), (done) => {
				TestCaseItem.callEvalFailMissingAParam(done, r, mDel, uA, {}, key)
			})
		})

		/*
		uA: should register the content A
		uB: should not be able to delete content
		uA: should delete the content A
		get: an SI content
		uB: should not be able to delete SI content
		make uA CanPostSeContent = true
		uA: should be able to delete SI content
		*/

		it("uA: should register the content A", (done) => {
			const joParam = TestEntity.gen(Content, { isPlaybook: true })
			const customResponse = (res: Response) => {
				joParamMain.contentA = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, SConst.HTTP_METHOD_POST, uA, joParam, joResult)
		})

		it("uB: should not be able to delete content A", (done) => {
			const joParam = {
				idContent: joParamMain.contentA.idContent,
			}
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus: CtExcep.userNotAuthorized.nmMsg
			}
			TestUtil.customCall(done, r, mDel, uB, joParam, joResult)
		})

		it("uA: should delete the content A", (done) => {
			const joParam = {
				idContent: joParamMain.contentA.idContent,
			}
			TestUtil.customCall(done, r, mDel, uA, joParam)
		})

		TestCaseItem.itShouldEditUserPermission(uB, false, false, false, false)
		TestCaseItem.itShouldEditUserPermission(uA, true, false, false, false)

		it("uA: should register the content A(SI)", (done) => {
			const joParam = TestEntity.gen(Content, { isPlaybook: false })
			const customResponse = (res: Response) => {
				joParamMain.contentSI = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, SConst.HTTP_METHOD_POST, uA, joParam, joResult)
		})

		it("uB: should not be able to delete content SI", (done) => {
			const joParam = {
				idContent: joParamMain.contentSI.idContent
			}
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus: CtExcep.userNotAuthorized.nmMsg
			}
			TestUtil.customCall(done, r, mDel, uB, joParam, joResult)
		})

		it("uA: should delete the content SI", (done) => {
			const joParam = {
				idContent: joParamMain.contentSI.idContent
			}
			TestUtil.customCall(done, r, mDel, uA, joParam)
		})
	}

	private static testPublishPackagePost() {
		const r = RoutesEnum.contentPublishPackage
		const m = SConst.HTTP_METHOD_POST
		const u = SConst.TEST_ROLE_NORMAL_USER

		const joParam = {
			lkPlatformProfile: CtPlatform.facebook.lkCtPlatformBase + "/CanalLegal"
		}

		it(TestShould.failMissingAllParams(), (done) => {
			TestCaseItem.callEvalFailMissingAllParams(done, r, m, u)
		})

		const keys = ["lkPlatformProfile"]
		keys.forEach(key => {
			it(TestShould.failMissingAParam(key), (done) => {
				TestCaseItem.callEvalFailMissingAParam(done, r, m, u, joParam, key)
			})
		})

		it("It should ask to publish a pack of something", (done) => {
			TestUtil.customCall(done, r, m, u, joParam)
		})
	}

	private static testPost() {
		const r = RoutesEnum.content
		const m = SConst.HTTP_METHOD_POST
		const u = SConst.TEST_ROLE_NORMAL_USER

		const dsRandom = StringUtil.random()
		let joParam: any
		let qtContentBefore = 0
		let dhPublishStartBoundary: Date

		it(TestShould.failMissingAllParams(), (done) => {
			TestCaseItem.callEvalFailMissingAllParams(done, r, m, u)
		})

		it(TestShould.dsText({ dsPreparation: "Build content for testing" }), (done) => {
			joParam = TestEntity.gen(Content, { isPlaybook: true })
			done()
		})

		// const keys = ["idCtContent", "isPlaybook"]
		// keys.forEach(key => {
		// 	it(TestShould.failMissingAParam(key), (done) => {
		// 		TestCaseItem.callEvalFailMissingAParam(done, r, m, u, joParam, key)
		// 	})
		// })

		it(`It should get the insert date boundary ready`, (done) => {
			dhPublishStartBoundary = new Date()
			done()
		})

		it("It should get the quantity of contents in the database", (done) => {
			const query = `select count(*) as \"qtContent\" from content`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					qtContentBefore = +result[0][0].qtContent
					done()
				})
		})

		it("It should publish something", (done) => {
			TestUtil.customCall(done, r, m, u, joParam)
		})

		it("It should still add a content to the database (and ignore idContent forced)", (done) => {
			const joParamChanged = {
				...joParam,
				idContent: 1
			}
			TestUtil.customCall(done, r, m, u, joParamChanged)
		})

		it("It should verify the quantity of contents in the database (must have +2)", (done) => {
			const query = `select count(*) as \"qtContent\" from content`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					const qtContentAfter = +result[0][0].qtContent
					if (qtContentBefore == qtContentAfter - 2) {
						done()
					} else {
						done("Wrong counting")
					}
				})
		})

		it("It should exist a reference of the user in the content table", (done) => {
			const loggedUser = TestUserManager.getUser().loggedUser
			const query = `select idPublisher as \"idPublisher\" from content
				where idPublisher = ${loggedUser.user.idUser}
				order by idContent desc limit 1`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					const idUserPublisher = result[0][0].idPublisher
					if (idUserPublisher == loggedUser.user.idUser) {
						done()
					} else {
						done("Wrong reference of the user. The last published content is not authored by this user. " +
							`Expected: ${loggedUser.user.idUser}. Found: ${idUserPublisher}`)
					}
				})
		})

		it(`It should consider the content as just published`, (done) => {
			const loggedUser = TestUserManager.getUser().loggedUser
			const query = `select idContent as \"idContent\", dhPublish as \"dhPublish\" from content
				where nmContent like '${joParam.nmContent}'`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					if (result[0] == undefined || result[0][0] == undefined) {
						throw new Error("content not found/not inserted")
					}
					const dhPublishDb = result[0][0].dhPublish
					if (dhPublishDb == undefined) {
						throw new Error("content should have a publish datetime")
					}
					if (dhPublishDb.getTime() == joParam.dhPublish.getTime()) {
						throw new Error("content should have ignored the dhPublish parameter")
					}
					const now = new Date()
					if (dhPublishDb.getTime() < dhPublishStartBoundary.getTime() || dhPublishDb.getTime() > now.getTime()) {
						throw new Error("The dhPublish attribute shoul've been registered as between the start of the test and now")
					}
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `direct usage of lkPreview`,
			dsCircumstances: `lkPreview as only parameter`,
			dsExpected: `adding a right content`
		}), (d) => {
			const joParam1: any = { lkPreview: "www.youtube.com", isPlaybook: true, idCtContent: 1 }
			const customResponse = (res: Response) => {
				const content = res.body
				if (content.nmContent != "YouTube") {
					throw new Error("Wrong expected name")
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.content, m, u, joParam1, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `direct usage of lkPreview`,
			dsCircumstances: `lkPreview to cover extra data`,
			dsExpected: `adding a right content`
		}), (d) => {
			const joParam1: any = {
				lkPreview: "www.youtube.com",
				nmContent: StringUtil.random(),
				isPlaybook: true,
				idCtContent: 1
			}
			const customResponse = (res: Response) => {
				const content = res.body
				if (content.nmContent != joParam1.nmContent) {
					throw new Error("Wrong expected name")
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.content, m, u, joParam1, joResult)
		})
	}

	private static testPut() {
		const r = RoutesEnum.content
		const mDel = SConst.HTTP_METHOD_DELETE
		const mGet = SConst.HTTP_METHOD_GET
		const mPut = SConst.HTTP_METHOD_PUT
		const mPost = SConst.HTTP_METHOD_POST
		const uA = SConst.TEST_ROLE_NORMAL_USER
		const uB = SConst.TEST_ROLE_NEW_USER

		const joParamMain: any = {}

		it("uA should post content A (playbook)", (done) => {
			const joParam = TestEntity.gen(Content, { isPlaybook: true })
			const customResponse = (res: Response) => {
				joParamMain.joContentA = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mPost, uA, joParam, joResult)
		})

		it("uA should get content A(playbook) and receive", (done) => {
			const joParam = { idContent: joParamMain.joContentA.idContent }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joContentA, 'idContent')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uA, joParam, joResult)
		})

		it("uA should put content A(playbook)", (done) => {
			const nmBase2 = StringUtil.random()
			joParamMain.nmBase2 = nmBase2
			const joParam = { idContent: joParamMain.joContentA.idContent, nmContent: nmBase2 }
			const customResponse = (res: Response) => {
				joParamMain.joContentA2 = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mPut, uA, joParam, joResult)
		})

		it("uA should get content A(playbook) and receive", (done) => {
			const joParam = { idContent: joParamMain.joContentA.idContent }
			const customResponse = (res: Response) => {
				if (joParamMain.joContentA == joParamMain.joContentA2) {
					throw Error("put not working1")
				}
				if (res.body[0].nmContent != joParamMain.nmBase2) {
					throw Error("put not working2")
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uA, joParam, joResult)
		})
	}
}
