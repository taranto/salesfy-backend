
import { RoutesEnum, SConst, KeyEnum, StringUtil, CtHttpStatus, CtUserGroupAccess } from "salesfy-shared";
import { TestUtil, TestShould, TestUserManager, TestCaseItem } from "../../barrel/Barrel.spec";
import { LayerDao } from "app/layers_template/LayerDao";
import { Response } from "superagent";
import { EnvTest } from "../../support/EnvTest.spec";

export class ChannelGroupFuncRteSpec {

	public static test() {
		describe(TestShould.describeTitle(RoutesEnum.channelGroupAllGroups, "functions"), () => {
			describe(TestShould.descRouteMethod(RoutesEnum.channelGroup, SConst.HTTP_METHOD_GET), () => {
				ChannelGroupFuncRteSpec.testGet()
			})
		})
	}

	private static testGet() {
		const r = RoutesEnum.channelGroupAllGroups
		const mDel = SConst.HTTP_METHOD_DELETE
		const mGet = SConst.HTTP_METHOD_GET
		const mPost = SConst.HTTP_METHOD_POST
		const mPut = SConst.HTTP_METHOD_PUT
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

		it(TestShould.failMissingAllParams(), (done) => {
			TestCaseItem.callEvalFailMissingAllParams(done, r, mGet, uA)
		})

		const keys = ["idChannel"]
		keys.forEach(key => {
			it(TestShould.failMissingAParam(key), (done) => {
				const joParam2 = {
					idChannelGroup: 0,
				}
				TestCaseItem.callEvalFailMissingAParam(done, r, mGet, uA, joParam2, key)
			})
		})

		it(TestShould.execute(1), (done) => {
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

		/*
		uB: get channelGroupAllGroup channel A - should NOT get group A
		uB: get channelGroupAllGroup channel A - should NOT get group B
		uA: put user B as Admin of group A
		uB: get channelGroupAllGroup channel A - should get group B
		*/

		it("uB: get channelGroupAllGroup channel A - should NOT get group A", (done) => {
			const joParam = {
				idChannel: joParamMain.joChannelA.idChannel,
			}
			const customResponse = (res: Response) => {
				TestCaseItem.shouldBringEmptyBody(res)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.channelGroupAllGroups, mGet, uB, joParam, joResult)
		})

		it("uB: get channelGroupAllGroup channel A - should NOT get group B", (done) => {
			const joParam = {
				idChannel: joParamMain.joChannelA.idChannel,
			}
			const customResponse = (res: Response) => {
				TestCaseItem.shouldBringEmptyBody(res)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.channelGroupAllGroups, mGet, uB, joParam, joResult)
		})

		it("uA: put user B as Admin of group A", (done) => {
			const joParam = {
				idUserGroup: joParamMain.joUserGroupA.idUserGroup,
				idCtUserGroupAccess: CtUserGroupAccess.admin.key
			}
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joUserGroupA, 'idUserGroup')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.userGroup, mPut, uA, joParam, joResult)
		})

		it("uB: get channelGroupAllGroup channel A - should get group B", (done) => {
			const joParam = {
				idChannel: joParamMain.joChannelA.idChannel,
			}
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joGroupA, 'idGroup')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.channelGroupAllGroups, mGet, uB, joParam, joResult)
		})
	}
}
