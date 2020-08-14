
import { RoutesEnum, SConst, KeyEnum, StringUtil, CtHttpStatus, CtExcep, CtUserGroupAccess } from "salesfy-shared";
import { TestUtil, TestShould, TestCaseItem, TestUserManager, should } from "../../barrel/Barrel.spec";
import { LayerDao } from "app/layers_template/LayerDao";
import { Response } from "superagent";
import { ConnDao } from "app/structure/ConnDao";
import { EnvTest } from "../../support/EnvTest.spec";
import { TestRouteSpec } from "../../support/TestRoute.spec";
import { TestEntity } from "../../support/TestEntity.spec";
import { TestUserBox } from "../../support/TestUserBox.spec";
import { Channel } from "app/modules/channel/Channel";
import { Group } from "app/modules/group/Group";

export class ChannelGroupRteSpec extends TestRouteSpec {

	public test() {
		describe(TestShould.describeTitle(RoutesEnum.channelGroup), () => {
			describe(TestShould.descRouteMethod(RoutesEnum.channelGroup, SConst.HTTP_METHOD_POST), () => {
				ChannelGroupRteSpec.testChannelGroupPost()
			})
			describe(TestShould.descRouteMethod(RoutesEnum.channelGroup, SConst.HTTP_METHOD_GET), () => {
				ChannelGroupRteSpec.testChannelGroupGet()
			})
			describe(TestShould.descRouteMethod(RoutesEnum.channelGroup, SConst.HTTP_METHOD_DELETE), () => {
				ChannelGroupRteSpec.testChannelGroupDelete()
			})
			describe(TestShould.dsText({ dsText: "relink" }), () => {
				this.testRelink()
			})
		})
	}

	private testRelink() {
		const joParamMain: any = {}

		it(TestShould.dsText({ dsPreparation: `U1 post group1` }), (d) => {
			const customResponse = (res: Response) => { joParamMain.joGroup1 = res.body }
			TestEntity.reg(d, RoutesEnum.group, TestUserBox.getUser(0), Group, customResponse)
		})

		it(TestShould.dsText({ dsPreparation: `U1 post group2` }), (d) => {
			const customResponse = (res: Response) => { joParamMain.joGroup2 = res.body }
			TestEntity.reg(d, RoutesEnum.group, TestUserBox.getUser(0), Group, customResponse)
		})

		it(TestShould.dsText({ dsPreparation: `U1 post channel1` }), (d) => {
			const customResponse = (res: Response) => { joParamMain.joChannel1 = res.body }
			TestEntity.reg(d, RoutesEnum.channel, TestUserBox.getUser(0), Channel, customResponse, { isPlaybook: true })
		})

		it(TestShould.dsText({ dsPreparation: `U1 post channel2` }), (d) => {
			const customResponse = (res: Response) => { joParamMain.joChannel2 = res.body }
			const arIdGroup = [joParamMain.joGroup1.idGroup]
			const joParam = { isPlaybook: true, arIdGroup:arIdGroup }
			TestEntity.reg(d, RoutesEnum.channel, TestUserBox.getUser(0), Channel, customResponse, joParam)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Is channel1 really linked with the group1?`,
			dsCircumstances: `Linked channel1 and group1 by /channel post method. Searched by the arIdGroup param`,
			dsExpected: `NOT to be linked`
		}), (d) => {
			const joParam: any = { arIdGroup: [ joParamMain.joGroup1.idGroup ] }
			const customResponse = (res: Response) => {
				should().not.equal(res.body[0].idChannel, joParamMain.joChannel1.idChannel, "The link shouldn't be this one")
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.channelGroup, this.mGet, TestUserBox.getUser(0), joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Is channel1 really linked with the group1?`,
			dsCircumstances: `Linked channel1 and group1 by /channel post method. Searched by the arIdChannel param`,
			dsExpected: `NOT to be linked`
		}), (d) => {
			const joParam: any = { arIdChannel: [ joParamMain.joChannel1.idChannel ] }
			const customResponse = (res: Response) => {
				should().equal(res.body.length, 0, "There should be zero links")
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.channelGroup, this.mGet, TestUserBox.getUser(0), joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Is channel2 really linked with the group1?`,
			dsCircumstances: `Linked channel2 and group1 by /channel post method. Searched by the arIdGroup param`,
			dsExpected: `To be linked`
		}), (d) => {
			const joParam: any = { arIdGroup: [ joParamMain.joGroup1.idGroup ] }
			const customResponse = (res: Response) => {
				should().equal(res.body[0].idChannel, joParamMain.joChannel2.idChannel, "The link shouldn't be this one")
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.channelGroup, this.mGet, TestUserBox.getUser(0), joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Is channel2 really linked with the group1?`,
			dsCircumstances: `Linked channel2 and group1 by /channel post method. Searched by the arIdChannel param`,
			dsExpected: `To be linked`
		}), (d) => {
			const joParam: any = { arIdChannel: [ joParamMain.joChannel2.idChannel ] }
			const customResponse = (res: Response) => {
				should().equal(res.body[0].idGroup, joParamMain.joGroup1.idGroup, "The link shouldn't be this one")
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.channelGroup, this.mGet, TestUserBox.getUser(0), joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: `U1 put channel2 with g2` }), (d) => {
			const joParam: any = { idChannel: joParamMain.joChannel2.idChannel, arIdGroup: [ joParamMain.joGroup2.idGroup ] }
			TestUtil.customCall(d, RoutesEnum.channel, this.mPut, TestUserBox.getUser(0), joParam)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Is channel2 really linked with the group2?`,
			dsCircumstances: `Linked channel2 and group2 by /channel put method. Searched by the arIdChannel+arIdGroup param`,
			dsExpected: `NOT to be linked with g1. Linked with g2`
		}), (d) => {
			const joParam: any = {
				arIdChannel: [ joParamMain.joChannel2.idChannel ],
				arIdGroup: [ joParamMain.joGroup2.idGroup ]
			}
			const customResponse = (res: Response) => {
				should().equal(res.body[0].idGroup, joParamMain.joGroup2.idGroup, "The link shouldn't be this one")
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.channelGroup, this.mGet, TestUserBox.getUser(0), joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: `U1 put channel1 with g2` }), (d) => {
			const joParam: any = { idChannel: joParamMain.joChannel1.idChannel, arIdGroup: [ joParamMain.joGroup2.idGroup ] }
			TestUtil.customCall(d, RoutesEnum.channel, this.mPut, TestUserBox.getUser(0), joParam)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Is channel1 really linked with the group2?`,
			dsCircumstances: `Linked channel1 and group2 by /channel put method. Searched by the arIdChannel+arIdGroup param`,
			dsExpected: `NOT to be linked with g1. Linked with g2`
		}), (d) => {
			const joParam: any = {
				arIdChannel: [ joParamMain.joChannel1.idChannel ],
				arIdGroup: [ joParamMain.joGroup2.idGroup ]
			}
			const customResponse = (res: Response) => {
				should().equal(res.body[0].idGroup, joParamMain.joGroup2.idGroup, "The link shouldn't be this one")
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.channelGroup, this.mGet, TestUserBox.getUser(0), joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Is channel2 really linked with the group2?`,
			dsCircumstances: `Linked channel2 and group2 by /channel put method. Searched by the arIdChannel+arIdGroup param`,
			dsExpected: `NOT to be linked with g1. Linked with g2`
		}), (d) => {
			const joParam: any = {
				arIdChannel: [ joParamMain.joChannel2.idChannel ],
				arIdGroup: [ joParamMain.joGroup2.idGroup ]
			}
			const customResponse = (res: Response) => {
				should().equal(res.body[0].idGroup, joParamMain.joGroup2.idGroup, "The link shouldn't be this one")
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.channelGroup, this.mGet, TestUserBox.getUser(0), joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: `U1 put channel1 with no group` }), (d) => {
			const joParam: any = { idChannel: joParamMain.joChannel1.idChannel, arIdGroup: [] }
			TestUtil.customCall(d, RoutesEnum.channel, this.mPut, TestUserBox.getUser(0), joParam)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Is channel1 really linked with NO group?`,
			dsCircumstances: `Unlinked channel1 by /channel put method. Searched by the arIdChannel param`,
			dsExpected: `NOT to be linked with any group`
		}), (d) => {
			const joParam: any = { arIdChannel: [ joParamMain.joChannel1.idChannel ] }
			const customResponse = (res: Response) => {
				should().equal(res.body.length, 0, "There sould've been returned zero groups")
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.channelGroup, this.mGet, TestUserBox.getUser(0), joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: `U1 put channel1 with g1 and g2` }), (d) => {
			const joParam: any = {
				idChannel: joParamMain.joChannel1.idChannel,
				arIdGroup: [
					joParamMain.joGroup1.idGroup,
					joParamMain.joGroup2.idGroup
				]
			}
			TestUtil.customCall(d, RoutesEnum.channel, this.mPut, TestUserBox.getUser(0), joParam)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Is channel1 really linked with g1 and g2?`,
			dsCircumstances: `Linked channel1 with g1 and g2 by /channel put method. Searched by the arIdChannel param`,
			dsExpected: `To be linked with g1 and g2`
		}), (d) => {
			const joParam: any = { arIdChannel: [ joParamMain.joChannel1.idChannel ] }
			const customResponse = (res: Response) => {
				should().equal(res.body.length, 2, "There sould've been returned 2 groups")
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.channelGroup, this.mGet, TestUserBox.getUser(0), joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: `U1 put channel2 with g1 and g2` }), (d) => {
			const joParam: any = {
				idChannel: joParamMain.joChannel2.idChannel,
				arIdGroup: [
					joParamMain.joGroup1.idGroup,
					joParamMain.joGroup2.idGroup
				]
			}
			TestUtil.customCall(d, RoutesEnum.channel, this.mPut, TestUserBox.getUser(0), joParam)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Is channel2 really linked with g1 and g2?`,
			dsCircumstances: `Linked channel2 with g1 and g2 by /channel put method. Searched by the arIdChannel param`,
			dsExpected: `To be linked with g1 and g2`
		}), (d) => {
			const joParam: any = { arIdChannel: [ joParamMain.joChannel2.idChannel ] }
			const customResponse = (res: Response) => {
				should().equal(res.body.length, 2, "There sould've been returned 2 groups")
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.channelGroup, this.mGet, TestUserBox.getUser(0), joParam, joResult)
		})
	}

	private static testChannelGroupDelete() {
		const r = RoutesEnum.channelGroup
		const m = SConst.HTTP_METHOD_DELETE
		const u = SConst.TEST_ROLE_NORMAL_USER

		const joParamMain: any = {
			nmGroup: "grupo A delete test " + StringUtil.random(),
			nmChannel: "channel A delete test " + StringUtil.random(),
			// idChannel: 1,
			// idUserPublisher: 1,
			// idGroup: 1,
			// idChannelGroup: 1,
			// idUser: 1,
			// idCtUserGroupAccess: CtUserGroupAccess.member.key
		}

		it(TestShould.exist(), (done) => {
			TestCaseItem.callEvalExistence(done, r, m)
		})

		it(TestShould.acceptBothTokens(), (done) => {
			TestCaseItem.callEvalAcceptBothTokens(done, r, m, u)
		})

		it(TestShould.failNoTokens(), (done) => {
			TestCaseItem.callEvalFailNoTokens(done, r, m)
		})

		it(TestShould.failMissingAllParams(), (done) => {
			TestCaseItem.callEvalFailMissingAllParams(done, r, m, u)
		})

		const keys = ["idChannelGroup"]
		keys.forEach(key => {
			it(TestShould.failMissingAParam(key), (done) => {
				const joParam2 = {
					idChannelGroup: 0,
				}
				TestCaseItem.callEvalFailMissingAParam(done, r, m, u, joParam2, key)
			})
		})

		before("add a new group", (done) => {
			const joParam2 = {
				nmGroup: joParamMain.nmGroup,
				idWorkspace: EnvTest.getIdWorkspaceDefault()
			}
			const customResponse = (res: Response) =>  {
				joParamMain.idGroup = res.body["idGroup"]
			}
			const joResult = { customResponse:customResponse }
			TestUtil.customCall(done, RoutesEnum.group, SConst.HTTP_METHOD_POST, u, joParam2, joResult)
		})

		before("add a new channel", (done) => {
			const joParam2 = { nmChannel: joParamMain.nmChannel }
			const customResponse = (res: Response) =>  {
				joParamMain.idChannel = res.body["idChannel"]
			}
			const joResult = { customResponse:customResponse }
			TestUtil.customCall(done, RoutesEnum.channel, SConst.HTTP_METHOD_POST, u, joParam2, joResult)
		})

		before("count group channels", (done) => {
			const query = `select count(*) as \"qtChannelGroup\" from channelGroup`
			const customResponse = (res: any) => {
				joParamMain.qtChannelGroupBeforeTest = res[0][0]["qtChannelGroup"]
			}
			TestUtil.query(done, query, customResponse)
		})

		before("add group A to the channel A (user A action)", (done) => {
			const joParam2 = {
				idGroup: joParamMain.idGroup,
				idChannel: joParamMain.idChannel,
			}
			const customResponse = (res: any) => {
				joParamMain.idChannelGroup = res.body["idChannelGroup"]
			}
			const joResult = { customResponse:customResponse }
			TestUtil.customCall(done, r, SConst.HTTP_METHOD_POST, u, joParam2, joResult)
		})

		it("it should delete group A in the channel A (user A action)", (done) => {
			const joParam2 = {
				idChannelGroup: joParamMain.idChannelGroup
			}
			TestUtil.customCall(done, r, m, u, joParam2)
		})

		it("it should count the group channel. After post and delete, the quantity must be the same", (done) => {
			const joParam2 = {
				idChannelGroup: joParamMain.idChannelGroup
			}
			const query = `select count(*) as \"qtChannelGroup\" from channelGroup`
			const customResponse = (res: any) => {
				joParamMain.qtChannelGroupAfterTest = res[0][0]["qtChannelGroup"]
				if (joParamMain.qtChannelGroupBeforeTest != joParamMain.qtChannelGroupAfterTest) {
					throw new Error("This case has added and deleted one channel group, but the count not ended the same")
				}
			}
			TestUtil.query(done, query, customResponse)
		})
	}

	private static testChannelGroupGet() {
		const r = RoutesEnum.channelGroup
		const mDel = SConst.HTTP_METHOD_DELETE
		const mGet = SConst.HTTP_METHOD_GET
		const mPost = SConst.HTTP_METHOD_POST
		const uA = SConst.TEST_ROLE_NORMAL_USER
		const uB = SConst.TEST_ROLE_NEW_USER

		const joParamMain : any = { }

		it(TestShould.exist(), (done) => {
			TestCaseItem.callEvalExistence(done, r, mGet)
		})

		it(TestShould.acceptBothTokens(), (done) => {
			TestCaseItem.callEvalAcceptBothTokens(done, r, mGet, uA)
		})

		it(TestShould.failNoTokens(), (done) => {
			TestCaseItem.callEvalFailNoTokens(done, r, mGet)
		})

		it(TestShould.execute(1), (done) => {
			const joParam = {}
			TestUtil.customCall(done, r, mGet, uA, joParam)
		})
		it(TestShould.execute(2), (done) => {
			const joParam = {
				nmGroup: "grupo A get test " + StringUtil.random(),
				nmChannel: "channel A get test " + StringUtil.random(),
				idChannel: 1,
				idUserPublisher: 1,
				idGroup: 1,
				idChannelGroup: 1,
				idUser: 1,
				idCtUserGroupAccess: CtUserGroupAccess.member.key,
				qtOffset: 5,
				qtLimit: 5
			}
			TestUtil.customCall(done, r, mGet, uA, joParam)
		})

		/*
		uA: post channel A
		uA: post group A
		uA: link channel A to group A
		uA: post group B
		uA: link channel A to group B
		uA: link user B to group A
		uB: get channelGroup channel A - should get group A
		uB: get channelGroup channel A - should NOT get group B
		*/

		it("uA: post channel A", (done) => {
			const nmBase = StringUtil.random()
			const joParam = {
				nmChannel: `channel A ${nmBase}`,
				isPlaybook: true
			}
			const customResponse = (res: Response) => {
				joParamMain.joChannelA = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.channel, mPost, uA, joParam, joResult)
		})

		it("uA: post group A", (done) => {
			const nmBase = StringUtil.random()
			const joParam = {
				nmGroup: `group A ${nmBase}`,
				idWorkspace: EnvTest.getIdWorkspaceDefault()
			}
			const customResponse = (res: Response) => {
				joParamMain.joGroupA = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.group, mPost, uA, joParam, joResult)
		})

		it("uA: link channel A to group A", (done) => {
			const joParam = {
				idGroup: joParamMain.joGroupA.idGroup,
				idChannel: joParamMain.joChannelA.idChannel
			}
			const customResponse = (res: Response) => {
				joParamMain.joChannelGroupA = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.channelGroup, mPost, uA, joParam, joResult)
		})

		it("uA: post group B", (done) => {
			const nmBase = StringUtil.random()
			const joParam = {
				nmGroup: `group B ${nmBase}`,
				idWorkspace: EnvTest.getIdWorkspaceDefault()
			}
			const customResponse = (res: Response) => {
				joParamMain.joGroupB = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.group, mPost, uA, joParam, joResult)
		})

		it("uA: link channel A to group B", (done) => {
			const joParam = {
				idGroup: joParamMain.joGroupB.idGroup,
				idChannel: joParamMain.joChannelA.idChannel
			}
			const customResponse = (res: Response) => {
				joParamMain.joChannelGroupB = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.channelGroup, mPost, uA, joParam, joResult)
		})

		it("uA: link user B to group A", (done) => {
			const user = TestUserManager.getNewUser().loggedUser.user
			const joParam = {
				idUser: user.idUser,
				idGroup: joParamMain.joGroupA.idGroup,
			}
			const customResponse = (res: Response) => {
				joParamMain.joUserGroupA = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.userGroup, mPost, uA, joParam, joResult)
		})

		it("uB: get channelGroup channel A - should get group A", (done) => {
			const joParam = {
				idChannel: joParamMain.joChannelA.idChannel,
			}
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joGroupA, 'idGroup')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.channelGroup, mGet, uB, joParam, joResult)
		})

		it("uB: get channelGroup channel A - should NOT get group B", (done) => {
			const joParam = {
				idChannel: joParamMain.joChannelA.idChannel,
			}
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsNotTheOneAmong(res, joParamMain.joGroupB, 'idGroup')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.channelGroup, mGet, uB, joParam, joResult)
		})
	}

	private static testChannelGroupPost() {
		const r = RoutesEnum.channelGroup
		const m = SConst.HTTP_METHOD_POST
		const u = SConst.TEST_ROLE_NORMAL_USER

		const joParamBGroup: any = { nmGroup: "grupo B is admin " + StringUtil.random() }
		const joParamAGroup: any = { nmGroup: "grupo A is admin " + StringUtil.random() }
		const joParamBChannel: any = { nmChannel: "channel B is admin " + StringUtil.random() }
		const joParamAChannel: any = { nmChannel: "channel A is admin " + StringUtil.random() }
		let idUserGroupUBGA: any

		it(TestShould.exist(), (done) => {
			TestCaseItem.callEvalExistence(done, r, m)
		})

		it(TestShould.acceptBothTokens(), (done) => {
			TestCaseItem.callEvalAcceptBothTokens(done, r, m, u)
		})

		it(TestShould.failNoTokens(), (done) => {
			TestCaseItem.callEvalFailNoTokens(done, r, m)
		})

		it(TestShould.failMissingAllParams(), (done) => {
			TestCaseItem.callEvalFailMissingAllParams(done, r, m, u)
		})

		const keys = ["idGroup", "idChannel"]
		keys.forEach(key => {
			it(TestShould.failMissingAParam(key), (done) => {
				const joParam2 = {
					idGroup: 0,
					idChannel: 0,
				}
				TestCaseItem.callEvalFailMissingAParam(done, r, m, u, joParam2, key)
			})
		})

		before("Add a new group(added by A test user)", (done) => {
			const joParam2 = {
				nmGroup: joParamAGroup.nmGroup,
				idWorkspace: EnvTest.getIdWorkspaceDefault()
			}
			TestUtil.customCall(done, RoutesEnum.group, m, u, joParam2)
		})

		before("Add a new group(added by B test user)", (done) => {
			const joParam2 = {
				nmGroup: joParamBGroup.nmGroup,
				idWorkspace: EnvTest.getIdWorkspaceDefault()
			}
			TestUtil.customCall(done, RoutesEnum.group, m, SConst.TEST_ROLE_NEW_USER, joParam2)
		})

		before(`Get the idGroup to test`, (done) => {
			const query = `select idGroup as \"idGroup\", nmGroup as \"nmGroup\" from grp
				where nmGroup like '${joParamBGroup.nmGroup}'
				or nmGroup like '${joParamAGroup.nmGroup}'`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					if (+result[0][0].idGroup == undefined || +result[0][1].idGroup == undefined) {
						throw Error("No sufficient groups to execute the test. The just created groups were not found")
					}
					if (result[0][0].nmGroup == joParamBGroup.nmGroup) {
						joParamBGroup.idGroup = +result[0][0].idGroup
						joParamAGroup.idGroup = +result[0][1].idGroup
					} else {
						joParamBGroup.idGroup = +result[0][1].idGroup
						joParamAGroup.idGroup = +result[0][0].idGroup
					}
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		before("Add a new channel(added by A user)", (done) => {
			const joParam2 = {
				nmChannel: joParamAChannel.nmChannel
			}
			TestUtil.customCall(done, RoutesEnum.channel, m, u, joParam2)
		})

		before("Add a new channel(added by B user)", (done) => {
			const joParam2 = {
				nmChannel: joParamBChannel.nmChannel
			}
			TestUtil.customCall(done, RoutesEnum.channel, m, u, joParam2)
		})

		before(`Get the idChannel to test`, (done) => {
			const query = `select idChannel as \"idChannel\", nmChannel as \"nmChannel\" from channel
				where nmChannel like '${joParamBChannel.nmChannel}'
				or nmChannel like '${joParamAChannel.nmChannel}'`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					if (+result[0][0].idChannel == undefined || +result[0][1].idChannel == undefined) {
						throw Error("No sufficient channels to execute the test. The just created channels were not found")
					}
					if (result[0][0].nmChannel == joParamBChannel.nmChannel) {
						joParamBChannel.idChannel = +result[0][0].idChannel
						joParamAChannel.idChannel = +result[0][1].idChannel
					} else {
						joParamBChannel.idChannel = +result[0][1].idChannel
						joParamAChannel.idChannel = +result[0][0].idChannel
					}
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it("It should add group A to the channel A (user A action)", (done) => {
			const joParam2 = {
				idGroup: joParamAGroup.idGroup,
				idChannel: joParamAChannel.idChannel,
			}
			TestUtil.customCall(done, r, m, u, joParam2)
		})

		it(`It should verify new channelGroup row in database (the one just created)`, (done) => {
			const query = `select idChannel as \"idChannel\", idGroup as \"idGroup\" from channelGroup
				where idGroup = ${joParamAGroup.idGroup}
				and idChannel = ${joParamAChannel.idChannel}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					if (+result[0][0].idChannel == undefined || +result[0][0].idGroup == undefined) {
						throw Error("The channelGroup expected were not inserted into the database")
					}
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it("It should fail to add group A to the channel A (user A action) again", (done) => {
			const joParam2 = {
				idGroup: joParamAGroup.idGroup,
				idChannel: joParamAChannel.idChannel,
			}
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus:CtExcep.nmKeyAlreadyExists.nmMsg,
				joExtraContent: { nmKey:KeyEnum.bond }
			}
			TestUtil.customCall(done, r, m, u, joParam2, joResult)
		})

		it("It should fail to add group B to the channel A (user B action - B not authorized at channel A)", (done) => {
			const joParam2 = {
				idGroup: joParamBGroup.idGroup,
				idChannel: joParamAChannel.idChannel,
			}
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus:CtExcep.userNotAuthorized.nmMsg
			}
			TestUtil.customCall(done, r, m, SConst.TEST_ROLE_NEW_USER, joParam2, joResult)
		})

		it("It should fail to add group B to the channel A (user A action - A is not at group B)", (done) => {
			const joParam2 = {
				idGroup: joParamBGroup.idGroup,
				idChannel: joParamAChannel.idChannel,
			}
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus:CtExcep.userNotAuthorized.nmMsg
			}
			TestUtil.customCall(done, r, m, u, joParam2, joResult)
		})

		it("It should add user B(as normal user) to the group A (user A action)", (done) => {
			const user = TestUserManager.getNewUser().loggedUser.user
			const joParam2 = {
				idGroup: joParamAGroup.idGroup,
				idUser: user.idUser,
				idCtUserGroupAccess: CtUserGroupAccess.member.key
			}
			TestUtil.customCall(done, RoutesEnum.userGroup, m, u, joParam2)
		})

		it("It should fail to add group B to the channel A (user B action - B has access but has no power)", (done) => {
			const joParam2 = {
				idGroup: joParamAGroup.idGroup,
				idChannel: joParamAChannel.idChannel,
			}
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus:CtExcep.userNotAuthorized.nmMsg
			}
			TestUtil.customCall(done, r, m, SConst.TEST_ROLE_NEW_USER, joParam2, joResult)
		})

		it("It should get the idUserGroup user B group A", (done) => {
			const user = TestUserManager.getNewUser().loggedUser.user
			const query = `select idUserGroup as \"idUserGroup\" from userGroup
				join grp using (idGroup)
				where nmGroup like '${joParamAGroup.nmGroup}'
				and iduser = ${user.idUser}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					if (result[0].length == 0) {
						throw Error("userGroup not found")
					}
					idUserGroupUBGA = result[0][0].idUserGroup
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it("It should turn user B a group A admin (User A Action)", (done) => {
			const user = TestUserManager.getUser().loggedUser.user
			const joParam2 = {
				idUserGroup: idUserGroupUBGA,
				idCtUserGroupAccess: CtUserGroupAccess.admin.key
			}
			TestUtil.customCall(done, RoutesEnum.userGroup, SConst.HTTP_METHOD_PUT, u, joParam2)
		})

		it("It should succeed adding group B to the channel A (user B action - user B is now channel A admin)", (done) => {
			const joParam2 = {
				idGroup: joParamBGroup.idGroup,
				idChannel: joParamAChannel.idChannel,
			}
			TestUtil.customCall(done, r, m, SConst.TEST_ROLE_NEW_USER, joParam2)
		})
	}
}
