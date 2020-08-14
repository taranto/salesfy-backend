import { RoutesEnum, SConst, TUserTest, DateUtil, StringUtil } from "salesfy-shared";
import { LayerDao } from "app/layers_template/LayerDao";
import { TestUtil, TestShould, TestUserManager, TestCaseItem } from "../barrel/Barrel.spec";
import { Response } from "superagent";
import { ConnDao } from "app/structure/ConnDao";
import { EnvTest } from "../support/EnvTest.spec";

export class GroupScopeForChannelsSpec {

	public static test() {
		describe("Behavior group scope for channels", () => {
			GroupScopeForChannelsSpec.testChannelAccess()
		})
	}

	private static testChannelAccess() {
		const r = RoutesEnum.channel
		const mDel = SConst.HTTP_METHOD_DELETE
		const mGet = SConst.HTTP_METHOD_GET
		const mPost = SConst.HTTP_METHOD_POST
		const uA = SConst.TEST_ROLE_NORMAL_USER
		const uB = SConst.TEST_ROLE_NEW_USER

		TestCaseItem.itShouldEditUserPermission(uB, true, true, false, false)
		TestCaseItem.itShouldEditUserPermission(uA, true, true, false, false)

		/**
		uA: post channel A (sales intelligence)
		uA: post channel B (playbook)
		uB: get channel A(SI) and receive
		uB: get channel B(PB) and not receive
		uA: get channel A(SI) and receive
		uA: get channel B(PB) and receive
		*/

		const joParamMain: any = {}
		it("uA should post channel A(sales intelligence)", (done) => {
			const nmBase = StringUtil.random()
			const joParam = {
				nmChannel: `channel SI ${nmBase}`,
				isPlaybook: false
			}
			const customResponse = (res: Response) => {
				joParamMain.joChannelA = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mPost, uA, joParam, joResult)
		})

		it("uA should post channel B(playbook)", (done) => {
			const nmBase = StringUtil.random()
			const joParam = {
				nmChannel: `channel PB ${nmBase}`,
				isPlaybook: true
			}
			const customResponse = (res: Response) => {
				joParamMain.joChannelB = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mPost, uA, joParam, joResult)
		})

		it("uB should get channel A(SI) and receive", (done) => {
			const joParam = { idChannel: joParamMain.joChannelA.idChannel }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joChannelA, 'idChannel')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uB, joParam, joResult)
		})

		it("uB should get channel B(PB) and NOT receive", (done) => {
			const joParam = { idChannel: joParamMain.joChannelB.idChannel }
			const customResponse = (res: Response) => {
				TestCaseItem.shouldBringEmptyBody(res)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uB, joParam, joResult)
		})

		it("uA should get channel A(SI) and receive", (done) => {
			const joParam = { idChannel: joParamMain.joChannelA.idChannel }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joChannelA, 'idChannel')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uA, joParam, joResult)
		})

		it("uA should get channel B(PB) and receive", (done) => {
			const joParam = { idChannel: joParamMain.joChannelA.idChannel }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joChannelA, 'idChannel')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uA, joParam, joResult)
		})

		/**
		uA: post group B
		uA: link user B to group B
		uA: link group B to channel B
		uB: get channel B(PB) and receive
		*/

		it("uA should post group B", (done) => {
			const nmBase = StringUtil.random()
			const joParam = {
				nmGroup: `Group B ${nmBase}`,
				idWorkspace: EnvTest.getIdWorkspaceDefault()
			}
			const customResponse = (res: Response) => {
				joParamMain.joGroupB = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.group, mPost, uA, joParam, joResult)
		})

		it("uA should link user B to group B", (done) => {
			const user = TestUserManager.getNewUser().loggedUser.user
			const joParam = {
				idGroup: joParamMain.joGroupB.idGroup,
				idUser: user.idUser
			}
			const customResponse = (res: Response) => {
				joParamMain.joUserGroupB = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.userGroup, mPost, uA, joParam, joResult)
		})

		it("uA should link group B to channel B", (done) => {
			const joParam = {
				idGroup: joParamMain.joGroupB.idGroup,
				idChannel: joParamMain.joChannelB.idChannel
			}
			const customResponse = (res: Response) => {
				joParamMain.joChannelGroupB = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.channelGroup, mPost, uA, joParam, joResult)
		})

		it("uB should get channel B(PB) and receive", (done) => {
			const joParam = { idChannel: joParamMain.joChannelB.idChannel }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joChannelB, 'idChannel')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uA, joParam, joResult)
		})
	}
}
