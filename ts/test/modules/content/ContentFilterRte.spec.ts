import { RoutesEnum, SConst, TUserTest, StringUtil, JsonUtil, CtPlatform, CtExcep } from "salesfy-shared"
import { KeyEnum, THttpMethod, NumberUtil, I18n, CtLocale, CtHttpStatus, CtContent } from "salesfy-shared"
import { TestCaseItem, TestShould, Env } from "../../barrel/Barrel.spec"
import { TestUtil, TestUserManager, supertest } from "../../barrel/Barrel.spec"
import { LayerDao } from "app/layers_template/LayerDao"
import { Response } from "supertest"
import { ConnDao } from "app/structure/ConnDao"
import { TestEntity } from "../../support/TestEntity.spec"
import { Content } from "app/modules/content/Content"
import { ChannelGroup } from "app/modules/channel_group/ChannelGroup"
import { Channel } from "app/modules/channel/Channel"
import { Group } from "app/modules/group/Group"
import { ContentChannel } from "app/modules/content_channel/ContentChannel"
import { EnvTest } from "../../support/EnvTest.spec";

export class ContentFilterRteSpec {

	private mGet: THttpMethod = SConst.HTTP_METHOD_GET
	private mPost: THttpMethod = SConst.HTTP_METHOD_POST
	private u: TUserTest = SConst.TEST_ROLE_NORMAL_USER
	private r = RoutesEnum.content
	private joParamMain: any = {}

	public test() {
		describe(TestShould.dsText({
			nmRoute: RoutesEnum.content, nmMethod: SConst.HTTP_METHOD_GET,
			nmClass: "ContentFilterRteSpec"
		}), () => {
			describe(TestShould.dsText({ dsText: "exists" }), () => {
				this.testExists()
			})
			describe(TestShould.describeTitle("normal tests"), () => {
				this.testContent()
			})
			describe(TestShould.dsText({ dsText: "raw filter" }), () => {
				this.testRawFilter()
			})
			describe(TestShould.dsText({ dsText: "expected attr" }), () => {
				this.testExpectedAttr()
			})
			describe(TestShould.dsText({ dsText: "filter" }), () => {
				this.testFilter()
			})
		})
	}

	private testFilter() {
		it(TestShould.dsText({ dsPreparation: "Register content" }), (d) => {
			const joParam = TestEntity.gen(Content, { isPlaybook: true, idCtContent: NumberUtil.random(1) + 1 })
			const customResponse = (res: Response) => {
				this.joParamMain.joContent = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.content, this.mPost, this.u, joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: "Register channel" }), (d) => {
			const joParam = TestEntity.gen(Channel, { isPlaybook: true })
			const customResponse = (res: Response) => {
				this.joParamMain.joChannel = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.channel, this.mPost, this.u, joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: "Register contentChannel" }), (d) => {
			const joParam = TestEntity.gen(ContentChannel,
				{ idContent: this.joParamMain.joContent.idContent, idChannel: this.joParamMain.joChannel.idChannel })
			const customResponse = (res: Response) => {
				this.joParamMain.joContentChannel = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.contentChannel, this.mPost, this.u, joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: "Register group" }), (d) => {
			const joParam = TestEntity.gen(Group, { idWorkspace: EnvTest.getIdWorkspaceDefault() })
			const customResponse = (res: Response) => {
				this.joParamMain.joGroup = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.group, this.mPost, this.u, joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: "Register channelGroup" }), (d) => {
			const joParam = TestEntity.gen(ChannelGroup,
				{ idGroup: this.joParamMain.joGroup.idGroup, idChannel: this.joParamMain.joChannel.idChannel })
			const customResponse = (res: Response) => {
				this.joParamMain.joChannelGroup = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.channelGroup, this.mPost, this.u, joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: "Find 2 tags" }), (d) => {
			const joParam = { qtLimit: 2 }
			const customResponse = (res: Response) => {
				this.joParamMain.joTag1 = res.body[0]
				this.joParamMain.joTag2 = res.body[1]
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.tag, this.mGet, this.u, joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: "Register channelTag" }), (d) => {
			const query = `insert into channeltag (idChannel, idTag) values
				(${this.joParamMain.joChannel.idChannel}, ${this.joParamMain.joTag1.idTag})
				returning idChannel as \"idChannel\", idTag as \"idTag\", idChannelTag as \"idChannelTag\"`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					this.joParamMain.joChannelTag = result[0][0]
					TestUtil.freeEnd(d)
				}).catch(d)
		})

		it(TestShould.dsText({ dsPreparation: "Register contentTag" }), (d) => {
			const query = `insert into contenttag (idContent, idTag) values
				(${this.joParamMain.joContent.idContent}, ${this.joParamMain.joTag2.idTag})
				returning idContent as \"idContent\", idTag as \"idTag\", idContentTag as \"idContentTag\"`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					this.joParamMain.joContentTag = result[0][0]
					TestUtil.freeEnd(d)
				}).catch(d)
		})

		it(TestShould.dsText({ dsPreparation: "Find CtContent" }), (d) => {
			const idCtContent = this.joParamMain.joContent.idCtContent
			const ctContent = CtContent.get(idCtContent)
			this.joParamMain.joCtContent = {
				idCtContent: ctContent.key,
				nmCtContent: I18n.t(ctContent.nm, undefined, CtLocale.portuguese.keyCtLocale)
			}
			d()
		})

		describe(TestShould.dsText({ dsText: "nmContent" }), () => {
			this.doStringTestCases("nmContent", "joContent")
		})
		describe(TestShould.dsText({ dsText: "dsContent" }), () => {
			this.doStringTestCases("dsContent", "joContent")
		})
		describe(TestShould.dsText({ dsText: "nmChannel" }), () => {
			this.doStringTestCases("nmChannel", "joChannel")
		})
		describe(TestShould.dsText({ dsText: "dsChannel" }), () => {
			this.doStringTestCases("dsChannel", "joChannel")
		})
		describe(TestShould.dsText({ dsText: "nmGroup" }), () => {
			this.doStringTestCases("nmGroup", "joGroup")
		})
		describe(TestShould.dsText({ dsText: "nmTag" }), () => {
			this.doStringTestCases("nmTag", "joTag2")
		})
		describe(TestShould.dsText({ dsText: "nmTag1 - should not find the content through the channel tags" }), () => {
			this.specificNmChannelTagTest()
		})

		describe(TestShould.dsText({ dsText: "nmCtContent" }), () => {
			this.doStringTestCases("nmCtContent", "joCtContent")
		})
		describe(TestShould.dsText({ dsText: "nmPublisher" }), () => {
			const mtGetNmItem = () => {
				const nmPublisher = TestUserManager.getUser().loggedUser.user.nmUser
				return nmPublisher
			}
			this.doStringTestCases("nmPublisher", "nmPublisher", mtGetNmItem)
		})

		describe(TestShould.dsText({ dsText: "arIdTag" }), () => {
			const mtGetArId = () => {
				const arIdTag = [this.joParamMain.joTag2.idTag]
				return arIdTag
			}
			this.doArIdTestCases("arIdTag", mtGetArId)
		})
		describe(TestShould.dsText({ dsText: "arIdGroup" }), () => {
			const mtGetArId = () => {
				const arIdGroup = [this.joParamMain.joGroup.idGroup]
				return arIdGroup
			}
			this.doArIdTestCases("arIdGroup", mtGetArId)
		})
		describe(TestShould.dsText({ dsText: "arIdChannel" }), () => {
			const mtGetArId = () => {
				const arIdChannel = [this.joParamMain.joChannel.idChannel]
				return arIdChannel
			}
			this.doArIdTestCases("arIdChannel", mtGetArId)
		})
		describe(TestShould.dsText({ dsText: "arIdCtContent" }), () => {
			const mtGetArId = () => {
				const arIdCtContent = [this.joParamMain.joCtContent.idCtContent]
				return arIdCtContent
			}
			this.doArIdTestCases("arIdCtContent", mtGetArId)
		})
		describe(TestShould.dsText({ dsText: "arIdPublisher" }), () => {
			const mtGetArId = () => {
				const arIdPublisher = [TestUserManager.getUser().loggedUser.user.idUser]
				return arIdPublisher
			}
			this.doArIdTestCases("arIdPublisher", mtGetArId)
		})

		describe(TestShould.dsText({ dsText: "idContentNotIn" }), () => {
			it(TestShould.dsText({
				dsWhatsBeingTested: `idContentNotIn filter`,
				dsCircumstances: `All registered already, and will expect not to find them`,
				dsExpected: `not to find that specific content among all`
			}), (d) => {
				const joParam: any = {
					arIdContentNotIn: [this.joParamMain.joContent.idContent]
				}
				this.findThroughCondition(d, joParam, false)
			})
		})

		describe(TestShould.dsText({ dsText: "dsSearch" }), () => {
			const mtNmContent = () => {
				return this.joParamMain.joContent.nmContent
			}
			this.testDsSearch("nmContent", mtNmContent, false)
			const mtDsContent = () => {
				return this.joParamMain.joContent.dsContent
			}
			this.testDsSearch("dsContent",mtDsContent, false)
			const mtNmTag = () => {
				return this.joParamMain.joTag2.nmTag
			}
			this.testDsSearch("nmTag", mtNmTag, true)
			const mtNmGroup = () => {
				return this.joParamMain.joGroup.nmGroup
			}
			this.testDsSearch("nmGroup", mtNmGroup, true)
			const mtNmPublisher = () => {
				return TestUserManager.getUser().loggedUser.user.nmUser
			}
			this.testDsSearch("nmPublisher", mtNmPublisher, true)
			const mtNmCtContent = () => {
				return this.joParamMain.joCtContent.nmCtContent
			}
			this.testDsSearch("nmCtContent", mtNmCtContent, true)
			const mtNmChannel = () => {
				return this.joParamMain.joChannel.nmChannel
			}
			this.testDsSearch("nmChannel", mtNmChannel, false)
			const mtDsChannel = () => {
				return this.joParamMain.joChannel.dsChannel
			}
			this.testDsSearch("dsChannel", mtDsChannel, false)
		})
	}

	private testDsSearch(nmKeyToFind: string, mtValueToFind: any, shExpectLots:boolean) {
		it(TestShould.dsText({
			dsWhatsBeingTested: `dsSearch filter`,
			dsCircumstances: `to find each content by OR criteria`,
			dsExpected: `Send ${nmKeyToFind} and find it`
		}), (d) => {
			const joParam = { dsSearch: mtValueToFind() }
			const customResponse = (res: Response) => {
				const idContent = this.joParamMain.joContent.idContent
				if (shExpectLots) {
					TestCaseItem.evalIsTheOneAmong(res, this.joParamMain.joContent, 'idContent')
				} else {
					TestCaseItem.evalIsListOnlyWithIdsExpected(res, 'idContent', [idContent])
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, this.r, this.mGet, this.u, joParam, joResult)
		})
	}

	private specificNmChannelTagTest() {
		it(TestShould.dsText({
			dsWhatsBeingTested: `nmTag1 filter`,
			dsCircumstances: `All registered already, and will look for a full name nmTag1`,
			dsExpected: `to find that specific content among all`
		}), (d) => {
			const nmItem = this.joParamMain.joTag1.nmTag
			const joParam: any = {}
			joParam.nmTag = nmItem
			this.findThroughCondition(d, joParam, false)
		})
		it(TestShould.dsText({
			dsWhatsBeingTested: `nmTag1 filter`,
			dsCircumstances: `All registered already, and will look for a part name nmTag1`,
			dsExpected: `to find that specific content among all`
		}), (d) => {
			const nmItem = this.joParamMain.joTag1.nmTag
			const nmItemPart = nmItem.substring(1, nmItem.length - 2).toUpperCase()
			const joParam: any = {}
			joParam.nmTag = nmItemPart
			this.findThroughCondition(d, joParam, false)
		})
		it(TestShould.dsText({
			dsWhatsBeingTested: `nmTag1 filter`,
			dsCircumstances: `All registered already, and will look for a WRONG nmTag1`,
			dsExpected: `not to find that specific content among all`
		}), (d) => {
			const nmItem = this.joParamMain.joTag1.nmTag
			const joParam: any = {}
			joParam.nmTag = StringUtil.random() + nmItem + StringUtil.random()
			this.findThroughCondition(d, joParam, false)
		})
	}

	private doArIdTestCases(dsKeyFilter: string, mtDataCompared: any) {
		this.findThroughExactId(dsKeyFilter, mtDataCompared)
		this.notFindThroughWrongId(dsKeyFilter)
	}

	private notFindThroughWrongId(dsKeyFilter: string) {
		it(TestShould.dsText({
			dsWhatsBeingTested: `${dsKeyFilter} filter`,
			dsCircumstances: `All registered already, and will look for the WRONG id through ${dsKeyFilter}`,
			dsExpected: `to find that specific item among all`
		}), (d) => {
			const arIdItem = [0]
			const joParam: any = {}
			joParam[dsKeyFilter] = arIdItem
			this.findThroughCondition(d, joParam, false)
		})
	}

	private findThroughExactId(dsKeyFilter: string, mtDataCompared: any) {
		it(TestShould.dsText({
			dsWhatsBeingTested: `${dsKeyFilter} filter`,
			dsCircumstances: `All registered already, and will look for the id through ${dsKeyFilter}`,
			dsExpected: `to find that specific item among all`
		}), (d) => {
			const arIdItem = mtDataCompared()
			const joParam: any = {}
			joParam[dsKeyFilter] = arIdItem
			this.findThroughCondition(d, joParam, true)
		})
	}

	private doStringTestCases(dsKeyFilter: string, nmObjFilter: string, mtAlternativeDataCompared?: any) {
		this.findFullName(dsKeyFilter, nmObjFilter, mtAlternativeDataCompared)
		this.findPartName(dsKeyFilter, nmObjFilter, mtAlternativeDataCompared)
		this.notFindWrongName(dsKeyFilter, nmObjFilter, mtAlternativeDataCompared)
	}

	private findFullName(dsKeyFilter: string, nmObjFilter: string, mtAlternativeDataCompared?: any) {
		it(TestShould.dsText({
			dsWhatsBeingTested: `${dsKeyFilter} filter`,
			dsCircumstances: `All registered already, and will look for a full name ${dsKeyFilter}`,
			dsExpected: `to find that specific item among all`
		}), (d) => {
			const nmItem = mtAlternativeDataCompared ? mtAlternativeDataCompared() : this.joParamMain[nmObjFilter][dsKeyFilter]
			const joParam: any = {}
			joParam[dsKeyFilter] = nmItem
			this.findThroughCondition(d, joParam, true)
		})
	}

	private findPartName(dsKeyFilter: string, nmObjFilter: string, mtAlternativeDataCompared?: any) {
		it(TestShould.dsText({
			dsWhatsBeingTested: `${dsKeyFilter} filter`,
			dsCircumstances: `All registered already, and will look for a part name ${dsKeyFilter}`,
			dsExpected: `to find that specific item among all`
		}), (d) => {
			const nmItem = mtAlternativeDataCompared ? mtAlternativeDataCompared() : this.joParamMain[nmObjFilter][dsKeyFilter]
			const nmItemPart = nmItem.substring(1, nmItem.length - 2).toUpperCase()
			const joParam: any = {}
			joParam[dsKeyFilter] = nmItemPart
			this.findThroughCondition(d, joParam, true)
		})
	}

	private notFindWrongName(dsKeyFilter: string, nmObjFilter: string, mtAlternativeDataCompared?: any) {
		it(TestShould.dsText({
			dsWhatsBeingTested: `${dsKeyFilter} filter`,
			dsCircumstances: `All registered already, and will look for a WRONG ${dsKeyFilter}`,
			dsExpected: `not to find that specific item among all`
		}), (d) => {
			const nmItem = mtAlternativeDataCompared ? mtAlternativeDataCompared() : this.joParamMain[nmObjFilter][dsKeyFilter]
			const joParam: any = {}
			joParam[dsKeyFilter] = StringUtil.random() + nmItem + StringUtil.random()
			this.findThroughCondition(d, joParam, false)
		})
	}

	private findThroughCondition(d: any, joParam: any, shExpectToFind: boolean) {
		const customResponse = (res: Response) => {
			if (shExpectToFind) {
				TestCaseItem.evalIsTheOneAmong(res, this.joParamMain.joContent, 'idContent')
			} else {
				TestCaseItem.evalIsNotTheOneAmong(res, this.joParamMain.joContent, 'idContent')
			}
		}
		const joResult = { customResponse: customResponse }
		TestUtil.customCall(d, this.r, this.mGet, this.u, joParam, joResult)
	}

	private testExpectedAttr() {
		it("It should bring only the expected attributes", (done) => {
			const expectedAttr = ["idContent", "nmContent", "piContent", "idCtContent", "dsContent", "shShowDescription",
				"shShowTitle", "shShowPublisher", "shShowFullscreenImage", "shShowActionButtons", "nmPublisher", "nmCtContent",
				"qtLike", "dhPublish", "nrLanguage", "shShowShareButton", "shShowShortCard", "vlSort", "isPlaybook",
				"idPublisher", "idCtUserGroupAccess", "isLike", "isFavorite", "lkContent", "qtView", "dhUpdate", "isActive",
				"dhLastView", "dhLastConversion", "qtEval", "vlEval", "vlEvalUser", "keyCtContentState"]
			TestCaseItem.callEvalExpectedAttributes(done, this.r, this.mGet, this.u, expectedAttr, undefined, true)
		})
	}

	private testRawFilter() {
		it(TestShould.execute(0), (done) => {
			const joParam = {
				qtOffset: 5,
				qtLimit: 5,
				isFavorite: true,
				idChannel: 1,
				dsSearch: "Conheça",
				arIdTag: [1, 2, 3, 4],
				idPublisher: 0
			}
			TestCaseItem.callEvalMultipleParamCombinations(done, this.r, this.mGet, this.u, joParam, "idContent")
		})

		it(TestShould.execute(1), (done) => {
			const user = TestUserManager.getNewUser().loggedUser.user
			const joParam = {
				nmSort: "dhPublish",
				qtOffset: 50,
				qtLimit: 50,
				isFavorite: false,
				idChannel: 1,
				dsSearch: " ",
				arIdTag: [],
				idPublisher: user.idUser
			}
			TestCaseItem.callEvalMultipleParamCombinations(done, this.r, this.mGet, this.u, joParam, "idContent")
		})

		it(TestShould.execute(2), (done) => {
			const joParam = {
				nmSort: "nmContent",
				dsSearch: "a",
				nmContent: "a",
				dsContent: "a",
				nmTag: "a",
				nmGroup: "a",
				nmPublisher: "a",
				nmChannel: "a",
				dsChannel: "a",
				nmCtContent: "a",
				isPlaybook: false
			}
			TestCaseItem.callEvalMultipleParamCombinations(done, this.r, this.mGet, this.u, joParam, "idContent")
		})
	}

	private testExists() {
		it(TestShould.exist(), (d) => {
			TestCaseItem.callEvalExistence(d, this.r, this.mGet)
		})

		it(TestShould.acceptBothTokens(), (d) => {
			TestCaseItem.callEvalAcceptBothTokens(d, this.r, this.mGet, this.u)
		})

		it(TestShould.failNoTokens(), (d) => {
			TestCaseItem.callEvalFailNoTokens(d, this.r, this.mGet)
		})
	}

	private testContent() {
		const r = RoutesEnum.content
		const m = SConst.HTTP_METHOD_GET
		const u = SConst.TEST_ROLE_NORMAL_USER

		it(TestShould.exist(), (done) => {
			TestCaseItem.callEvalExistence(done, r, m)
		})

		const joParamMain: any = {}
		let joParamMainIdOnly: any = {}
		let joContentBefore: any
		let joUciBefore: any

		TestCaseItem.itShouldEditUserPermission(this.u, true, true, false, false)

		it("uA should post content A (SE)", (done) => {
			const joParam = TestEntity.gen(Content, { isPlaybook: false })
			const customResponse = (res: Response) => {
				joParamMain.joContentA = res.body
				joParamMainIdOnly = { idContent: joParamMain.joContentA.idContent }
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, SConst.HTTP_METHOD_POST, u, joParam, joResult)
		})

		it("uA should get content A by partial dsSearch", (done) => {
			const nmContent: string = joParamMain.joContentA.nmContent
			const nmContentPart = nmContent.substring(1, nmContent.length - 1)
			const joParam = {
				dsSearch: nmContentPart
			}
			const customResponse = (res: Response) => {
				const content = res.body[0]
				if (content.nmContent != joParamMain.joContentA.nmContent) {
					throw Error("Should've brought the content just inserted")
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, m, u, joParam, joResult)
		})

		it("Execute it once to at least create the userContent row if unexistent", (done) => {
			TestUtil.customCall(done, r, m, u, joParamMainIdOnly)
		})

		it("Get the attribute of the content to count for the test", (done) => {
			const query = `select idContent as \"idContent\", qtView as \"qtView\"
				from content where idContent = ${joParamMainIdOnly.idContent}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					joContentBefore = result[0][0]
				})
				.then(() => done())
		})

		it("Get the attribute of the userContent to count for the test", (done) => {
			const loggedUser = TestUserManager.getUser().loggedUser
			const idUser = loggedUser.user.idUser
			const query = `select idContent as \"idContent\", qtView as \"qtView\"
					from userContent
					where idContent = ${joParamMainIdOnly.idContent} and idUser = ${idUser}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					joUciBefore = result[0][0]
				})
				.then(() => done())
		})

		it("Execute the route a single time to verify its results in the tests afterwards", (done) => {
			TestUtil.customCall(done, r, m, u, joParamMainIdOnly)
		})

		it(`It should increment qtView count for content`, (done) => {
			const query = `select idContent as \"idContent\", qtView as \"qtView\"
				from content where idContent = ${joParamMainIdOnly.idContent}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					const joContentAfter = result[0][0]
					if (joContentBefore.qtView != joContentAfter.qtView - 1) {
						throw new Error(`qtView not counted for idContent ${joContentBefore.idContent}.` +
							` Before: ${joContentBefore.qtView}. After: ${joContentAfter.qtView}`)
					}
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it(`It should increment qtView count for user content interaction`, (done) => {
			const loggedUser = TestUserManager.getUser().loggedUser
			const query = `select idContent as \"idContent\", qtView as \"qtView\"
					from userContent
					where idContent = ${joParamMainIdOnly.idContent} and idUser = ${loggedUser.user.idUser}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					const joUciAfter = result[0][0]
					if (joUciBefore.qtView != joUciAfter.qtView - 1) {
						throw new Error(`qtView not counted for idContent ${joUciBefore.idContent}.` +
							` Before: ${joUciBefore.qtView}. After: ${joUciAfter.qtView}`)
					}
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		let idChannelTest = 1
		it("get any channel", (done) => {
			const customResponse = (res: Response) => {
				idChannelTest = res.body[0]["idChannel"]
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.channel, SConst.HTTP_METHOD_GET, u, undefined, joResult)
		})

		const keyword = "Conheça"
		it(`It should return a list filtered by a keyword`, (done) => {
			TestCaseItem.callEvalFilter(done, r, m, u, "nmContent", keyword, "idContent", "nmContent")
		})
		it(`It should return a list filtered by a keyword`, (done) => {
			TestCaseItem.callEvalFilter(done, r, m, u, "dsContent", keyword, "idContent", "dsContent")
		})
		it(`It should return a list filtered by a keyword`, (done) => {
			TestCaseItem.callEvalFilter(done, r, m, u, "nmPublisher", keyword, "idContent", "nmPublisher")
		})
		it(`It should return a list filtered by a keyword`, (done) => {
			TestCaseItem.callEvalFilter(done, r, m, u, "nmCtContent", keyword, "idContent", "nmCtContent")
		})

		it("It should get it sorted by date (dhPublish)", (done) => {
			const loggedUser = TestUserManager.getNewUser().loggedUser
			const joParam = {
				nmSort: "dhPublish"
			}
			TestUtil.call(r, m, u, joParam)
				.expect(200)
				.expect((res: supertest.Response) => {
					const body: any = res.body
					if (body.length < 2) {
						throw new Error("no sufficient contents to test the sorting")
					}
					const dhPublishLast = new Date(body[body.length-1].dhPublish)
					const dhPublishSecondLast = new Date(body[body.length-2].dhPublish)
					const dhPublishFirst = new Date(body[0].dhPublish)
					if (dhPublishLast > dhPublishSecondLast) {
						throw new Error("wrong sort last~second-last")
					}
					if (dhPublishLast > dhPublishFirst) {
						throw new Error("wrong sort first~last")
					}
				})
				.end(TestUtil.end(done))
		})

		it("uA should fail to request a channel which he neither see nor exists", (done) => {
			const joParam = {
				idChannel: 1
			}
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus: CtExcep.userNotAuthorized.nmMsg
			}
			TestUtil.customCall(done, r, m, u, joParam, joResult)
		})
	}
}
