import { SConst, RoutesEnum, DateUtil, StringUtil, CtHttpStatus, JsonUtil, NumberUtil, CtUserGroupAccess } from "salesfy-shared";
import { TestUtil, TestUserManager, supertest } from "../../barrel/Barrel.spec";
import { TestCaseItem, TestShould } from "../../barrel/Barrel.spec";
import { LayerDao } from "app/layers_template/LayerDao";
import { ChannelDao } from "app/modules/channel/ChannelDao";
import { KeyEnum, THttpMethod, TUserTest } from "salesfy-shared";
import { Response } from "superagent";
import { ConnDao } from "app/structure/ConnDao";
import { Channel } from "app/modules/channel/Channel";
import { TestEntity } from "../../support/TestEntity.spec";
import { Group } from "app/modules/group/Group";
import { ChannelGroup } from "app/modules/channel_group/ChannelGroup";
import { EnvTest } from "../../support/EnvTest.spec";

export class ChannelFilterRteSpec {

	private mGet: THttpMethod = SConst.HTTP_METHOD_GET
	private mPost: THttpMethod = SConst.HTTP_METHOD_POST
	private u: TUserTest = SConst.TEST_ROLE_NORMAL_USER
	private r = RoutesEnum.channel
	private joParamMain: any = {}

	public test() {
		describe(TestShould.dsText({ nmRoute: RoutesEnum.channel, nmMethod: SConst.HTTP_METHOD_GET + "" }), () => {
			describe(TestShould.dsText({dsText: "exists"}), () => {
				this.testExists()
			})
			describe(TestShould.dsText({dsText: "expected attr"}), () => {
				this.testExpectedAttr()
			})
			describe(TestShould.dsText({dsText: "raw filter"}), () => {
				this.testRawFilter()
			})
			describe(TestShould.dsText({dsText: "filter"}), () => {
				this.testFilter()
			})
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

	private testRawFilter() {
		it(TestShould.execute(0), (d) => {
			const joParam = {
				qtOffset: 5,
				qtLimit: 5,
				idPublisher: 1,
				idChannel: 1,
				nmChannel: "a",
				isPlaybook: true,
				idCtUserGroupAccess: CtUserGroupAccess.member.key,
				dsChannel: "asdasd",
				isChannelAdmin: false
			}
			TestCaseItem.callEvalMultipleParamCombinations(d, this.r, this.mGet, this.u, joParam, "idChannel")
		})
		it(TestShould.execute(1), (d) => {
			const joParam = {
				qtOffset: 50,
				qtLimit: 50,
				idPublisher: 1,
				idChannel: 1,
				nmChannel: "a",
				isPlaybook: false,
				idCtUserGroupAccess: CtUserGroupAccess.member.key,
				dsChannel: "asdasd",
				isChannelAdmin: true,
				sbContentState: false
			}
			TestCaseItem.callEvalMultipleParamCombinations(d, this.r, this.mGet, this.u, joParam, "idChannel")
		})
		it(TestShould.execute(2), (d) => {
			const joParam = {
				dsSearch: "a",
				nmTag: "a",
				nmGroup: "a",
				nmPublisher: "a",
				nmChannel: "a",
				dsChannel: "a",
				sbContentState: true,
				idChannelNotIn: 1
			}
			TestCaseItem.callEvalMultipleParamCombinations(d, this.r, this.mGet, this.u, joParam, "idChannel")
		})
		it(TestShould.execute(3), (d) => {
			const joParam = {
				arIdTag: [1],
				arIdGroup: [1],
				arIdPublisher: [1],
				arIdChannel: [1],
				arIdChannelNotIn: [1],
			}
			TestCaseItem.callEvalMultipleParamCombinations(d, this.r, this.mGet, this.u, joParam, "idChannel")
		})
	}

	private testExpectedAttr() {
		it("It should bring only the expected attributes", (d) => {
			const expectedAttr = ["idChannel", "nmChannel", "idPublisher", "nmPublisher", "piIcon", "dhLastConversion",
				"piChannel", "vlSort", "isPlaybook", "idCtUserGroupAccess", "dsChannel", "idCtChannelView", "dhPublish", "isActive"]
			TestCaseItem.callEvalExpectedAttributes(d, this.r, this.mGet, this.u, expectedAttr, undefined, true)
		})
	}

	private testFilter() {
		it(TestShould.dsText({ dsPreparation: "Register channel" }), (d) => {
			const joParam = TestEntity.gen(Channel, { isPlaybook: true })
			const customResponse = (res: Response) => {
				this.joParamMain.joChannel = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.channel, this.mPost, this.u, joParam, joResult)
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

		it(TestShould.dsText({ dsPreparation: "Find a tag" }), (d) => {
			const joParam = { qtLimit: 1 }
			const customResponse = (res: Response) => {
				this.joParamMain.joTag = res.body[0]
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.tag, this.mGet, this.u, joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: "Register channelTag" }), (d) => {
			const query = `insert into channeltag (idChannel, idTag) values
				(${this.joParamMain.joChannel.idChannel}, ${this.joParamMain.joTag.idTag})
				returning idChannel as \"idChannel\", idTag as \"idTag\", idChannelTag as \"idChannelTag\"`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					this.joParamMain.joChannelTag = result[0][0]
					TestUtil.freeEnd(d)
				}).catch(d)
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
			this.doStringTestCases("nmTag", "joTag")
		})
		describe(TestShould.dsText({ dsText: "nmPublisher" }), () => {
			const mtGetNmPublisher = () => {
				const nmPublisher = TestUserManager.getUser().loggedUser.user.nmUser
				return nmPublisher
			}
			this.doStringTestCases("nmPublisher", "nmPublisher", mtGetNmPublisher)
		})

		describe(TestShould.dsText({ dsText: "arIdTag" }), () => {
			const mtGetArId = () => {
				const arIdTag = [this.joParamMain.joTag.idTag]
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
		describe(TestShould.dsText({ dsText: "arIdPublisher" }), () => {
			const mtGetArId = () => {
				const arIdPublisher = [TestUserManager.getUser().loggedUser.user.idUser]
				return arIdPublisher
			}
			this.doArIdTestCases("arIdPublisher", mtGetArId)
		})

		describe(TestShould.dsText({ dsText: "arIdChannel" }), () => {
			const mtGetArId = () => {
				const arIdChannel = [this.joParamMain.joChannel.idChannel]
				return arIdChannel
			}
			this.doArIdTestCases("arIdChannel", mtGetArId)
		})

		describe(TestShould.dsText({ dsText: "dsSearch" }), () => {
			const mtNmTag = () => {
				return this.joParamMain.joTag.nmTag
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
				const idChannel = this.joParamMain.joChannel.idChannel
				if (shExpectLots) {
					TestCaseItem.evalIsTheOneAmong(res, this.joParamMain.joChannel, 'idChannel')
				} else {
					TestCaseItem.evalIsListOnlyWithIdsExpected(res, 'idChannel', [idChannel])
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, this.r, this.mGet, this.u, joParam, joResult)
		})
	}

	private doArIdTestCases(dsKeyFilter: string, mtDataCompared:any) {
		this.findThroughExactId(dsKeyFilter, mtDataCompared)
		this.notFindThroughWrongId(dsKeyFilter)
	}

	private notFindThroughWrongId(dsKeyFilter: string) {
		it(TestShould.dsText({
			dsWhatsBeingTested: `${dsKeyFilter} filter`,
			dsCircumstances: `All registered already, and will look for the WRONG id through ${dsKeyFilter}`,
			dsExpected: `to find that specific channel among all`
		}), (d) => {
			const arIdItem = [0]
			const joParam: any = {}
			joParam[dsKeyFilter] = arIdItem
			this.findThroughCondition(d, joParam, false)
		})
	}

	private findThroughExactId(dsKeyFilter: string, mtDataCompared:any) {
		it(TestShould.dsText({
			dsWhatsBeingTested: `${dsKeyFilter} filter`,
			dsCircumstances: `All registered already, and will look for the id through ${dsKeyFilter}`,
			dsExpected: `to find that specific channel among all`
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
			dsExpected: `to find that specific channel among all`
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
			dsExpected: `to find that specific channel among all`
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
			dsExpected: `not to find that specific channel among all`
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
				TestCaseItem.evalIsTheOneAmong(res, this.joParamMain.joChannel, 'idChannel')
			} else {
				TestCaseItem.evalIsNotTheOneAmong(res, this.joParamMain.joChannel, 'idChannel')
			}
		}
		const joResult = { customResponse: customResponse }
		TestUtil.customCall(d, this.r, this.mGet, this.u, joParam, joResult)
	}
}
