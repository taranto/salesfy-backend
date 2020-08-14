import { SConst, RoutesEnum, DateUtil, StringUtil, CtHttpStatus, JsonUtil, NumberUtil, CtUserGroupAccess } from "salesfy-shared";
import { LayerDao } from "app/layers_template/LayerDao";
import { Response } from "superagent";
import { TestShould, TestUtil, TestUserManager } from "../barrel/Barrel.spec";
import { TestEntity } from "../support/TestEntity.spec";
import { Content } from "app/modules/content/Content";
import { Group } from "app/modules/group/Group";
import { Channel } from "app/modules/channel/Channel";
import { EnvTest } from "../support/EnvTest.spec";

export class ContentViewedParallel {

	public static test() {
		describe.skip(TestShould.dsText({ nmRoute: RoutesEnum.content, nmMethod: SConst.HTTP_METHOD_GET+"" }), () => {
			ContentViewedParallel.testContentGetParallel()
		})
	}

	private static testContentGetParallel() {
		const r = RoutesEnum.channel
		const mGet = SConst.HTTP_METHOD_GET
		const mPost = SConst.HTTP_METHOD_POST
		const uA = SConst.TEST_ROLE_NORMAL_USER
		const uB = SConst.TEST_ROLE_NEW_USER
		const joParamMain: any = {}

		it(TestShould.dsText({ dsPreparation: "Post channel A" }), (done) => {
			const joParam = TestEntity.gen(Channel, { isPlaybook: true })
			const customResponse = (res: Response) => {
				joParamMain.joChannelA = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.channel, mPost, uA, joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: "Post group A" }), (done) => {
			const joParam = TestEntity.gen(Group, { idWorkspace: EnvTest.getIdWorkspaceDefault() })
			const customResponse = (res: Response) => {
				joParamMain.joGroupA = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.group, mPost, uA, joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: "Post user B to group A" }), (done) => {
			const user = TestUserManager.getNewUser().loggedUser.user
			const joParam = {
				idGroup: joParamMain.joGroupA.idGroup,
				idUser: user.idUser,
				idCtUserGroupAccess: CtUserGroupAccess.member.key
			}
			const customResponse = (res: Response) => {
				joParamMain.joUserBGroupA = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.userGroup, mPost, uA, joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: "Post group A to Channel A" }), (done) => {
			const joParam = {
				idChannel: joParamMain.joChannelA.idChannel,
				idGroup: joParamMain.joGroupA.idGroup
			}
			const customResponse = (res: Response) => {
				joParamMain.joChannelAGroupA = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.channelGroup, mPost, uA, joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: "Post content A1" }), (done) => {
			const joParam = TestEntity.gen(Content, { isPlaybook: true })
			const customResponse = (res: Response) => {
				joParamMain.joContentA1 = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.content, mPost, uA, joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: "Link content A1 to channel A" }), (done) => {
			const joParam = {
				idContent: joParamMain.joContentA1.idContent,
				idChannel: joParamMain.joChannelA.idChannel,
			}
			TestUtil.customCall(done, RoutesEnum.contentChannel, mPost, uA, joParam)
		})

		it(TestShould.dsText({ dsPreparation: "Post content A2" }), (done) => {
			const joParam = TestEntity.gen(Content, { isPlaybook: true })
			const customResponse = (res: Response) => {
				joParamMain.joContentA2 = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.content, mPost, uA, joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: "Link content A2 to channel A" }), (done) => {
			const joParam = {
				idContent: joParamMain.joContentA2.idContent,
				idChannel: joParamMain.joChannelA.idChannel,
			}
			TestUtil.customCall(done, RoutesEnum.contentChannel, mPost, uA, joParam)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: "Getting the contents twice in a row " +
				"may conflict the insert/update of UserContent row in the database. " +
				"The first call tries to insert, and succeed. Therefore the second call also tries to insert, " +
				"but it should update instead",
			dsCircumstances: "some calls will be made parallelly from just inserted channel/contents(playbooks)",
			dsExpected: "status 200"
		}), (done) => {
			const joParam = { idChannel: joParamMain.joChannelA.idChannel, qtLimit : 10 }
			TestUtil.customCall(undefined, RoutesEnum.content, mGet, uB, joParam)
			TestUtil.customCall(undefined, RoutesEnum.content, mGet, uB, joParam)
			TestUtil.customCall(undefined, RoutesEnum.content, mGet, uB, joParam)
			TestUtil.customCall(undefined, RoutesEnum.content, mGet, uB, joParam)
			TestUtil.customCall(undefined, RoutesEnum.content, mGet, uB, joParam)
			TestUtil.customCall(undefined, RoutesEnum.content, mGet, uB, joParam)
			TestUtil.customCall(undefined, RoutesEnum.content, mGet, uB, joParam)
			TestUtil.customCall(undefined, RoutesEnum.content, mGet, uB, joParam)
			TestUtil.customCall(undefined, RoutesEnum.content, mGet, uB, joParam)
			TestUtil.customCall(undefined, RoutesEnum.content, mGet, uB, joParam)
			TestUtil.customCall(done, RoutesEnum.content, mGet, uB, joParam)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: "Getting the contents twice in a row " +
				"may conflict the insert/update of UserContent row in the database. " +
				"The first call tries to insert, and succeed. Therefore the second call also tries to insert, " +
				"but it should update instead",
			dsCircumstances: "some calls will be made parallelly from LC", dsExpected: "status 200"
		}), (done) => {
			const joParam = { qtLimit : 10 }
			TestUtil.customCall(undefined, RoutesEnum.content, mGet, uB, joParam)
			TestUtil.customCall(undefined, RoutesEnum.content, mGet, uB, joParam)
			TestUtil.customCall(undefined, RoutesEnum.content, mGet, uB, joParam)
			TestUtil.customCall(undefined, RoutesEnum.content, mGet, uB, joParam)
			TestUtil.customCall(undefined, RoutesEnum.content, mGet, uB, joParam)
			TestUtil.customCall(undefined, RoutesEnum.content, mGet, uB, joParam)
			TestUtil.customCall(undefined, RoutesEnum.content, mGet, uB, joParam)
			TestUtil.customCall(undefined, RoutesEnum.content, mGet, uB, joParam)
			TestUtil.customCall(undefined, RoutesEnum.content, mGet, uB, joParam)
			TestUtil.customCall(undefined, RoutesEnum.content, mGet, uB, joParam)
			TestUtil.customCall(done, RoutesEnum.content, mGet, uB, joParam)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: "Getting the contents twice in a row " +
				"may conflict the insert/update of UserContent row in the database. " +
				"The first call tries to insert, and succeed. Therefore the second call also tries to insert, " +
				"but it should update instead",
			dsCircumstances: "some calls from the last two contexts will be made parallelly",
			dsExpected: "status 200"
		}), (done) => {
			const joParam1 = { idChannel: joParamMain.joChannelA.idChannel, qtLimit : 10 }
			const joParam2 = { qtLimit : 10 }
			TestUtil.customCall(undefined, RoutesEnum.content, mGet, uB, joParam1)
			TestUtil.customCall(undefined, RoutesEnum.content, mGet, uB, joParam2)
			TestUtil.customCall(undefined, RoutesEnum.content, mGet, uB, joParam1)
			TestUtil.customCall(undefined, RoutesEnum.content, mGet, uB, joParam2)
			TestUtil.customCall(undefined, RoutesEnum.content, mGet, uB, joParam1)
			TestUtil.customCall(undefined, RoutesEnum.content, mGet, uB, joParam2)
			TestUtil.customCall(undefined, RoutesEnum.content, mGet, uB, joParam1)
			TestUtil.customCall(undefined, RoutesEnum.content, mGet, uB, joParam2)
			TestUtil.customCall(undefined, RoutesEnum.content, mGet, uB, joParam1)
			TestUtil.customCall(undefined, RoutesEnum.content, mGet, uB, joParam2)
			TestUtil.customCall(undefined, RoutesEnum.content, mGet, uB, joParam1)
			TestUtil.customCall(done, RoutesEnum.content, mGet, uB, joParam2)
		})
	}
}
