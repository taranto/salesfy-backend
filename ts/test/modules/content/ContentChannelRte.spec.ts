
import { THttpMethod, TUserTest, NumberUtil, JsonUtil, CtExcep, CtUserGroupAccess } from "salesfy-shared";
import { RoutesEnum, SConst, KeyEnum, StringUtil, CtHttpStatus } from "salesfy-shared";
import { TestUtil, TestShould, TestCaseItem, TestUserManager, should } from "../../barrel/Barrel.spec";
import { LayerDao } from "app/layers_template/LayerDao";
import { Response } from "superagent";
import { ConnDao } from "app/structure/ConnDao";
import { TestEntity } from "../../support/TestEntity.spec";
import { Content } from "app/modules/content/Content";
import { TestUserBox } from "../../support/TestUserBox.spec";
import { Channel } from "app/modules/channel/Channel";
import { TestRouteSpec } from "../../support/TestRoute.spec";
import { UserGroup } from "app/modules/user_group/UserGroup";
import { Group } from "app/modules/group/Group";
import { EnvTest } from "../../support/EnvTest.spec";

export class ContentChannelRteSpec extends TestRouteSpec {

	public test() {
		describe(TestShould.dsText({ nmRoute: RoutesEnum.contentChannel }), () => {
			describe(TestShould.dsText({ dsText: "basic" }), () => {
				ContentChannelRteSpec.testBasic()
			})
			describe(TestShould.dsText({ nmMethod: "all" }), () => {
				ContentChannelRteSpec.testAll()
			})
			describe(TestShould.dsText({ dsText: "relink" }), () => {
				ContentChannelRteSpec.testRelink()
			})
		})
	}

	public static testRelink() {
		const joParamMain: any = {}

		it(TestShould.dsText({ dsPreparation: `U1 post channel1` }), (d) => {
			const customResponse = (res: Response) => { joParamMain.joChannel1 = res.body }
			TestEntity.reg(d, RoutesEnum.channel, TestUserBox.getUser(0), Channel, customResponse, { isPlaybook: true })
		})

		it(TestShould.dsText({ dsPreparation: `U1 post channel2` }), (d) => {
			const customResponse = (res: Response) => { joParamMain.joChannel2 = res.body }
			TestEntity.reg(d, RoutesEnum.channel, TestUserBox.getUser(0), Channel, customResponse, { isPlaybook: true })
		})

		it(TestShould.dsText({ dsPreparation: `U1 post channel3` }), (d) => {
			const customResponse = (res: Response) => { joParamMain.joChannel3 = res.body }
			TestEntity.reg(d, RoutesEnum.channel, TestUserBox.getUser(0), Channel, customResponse, { isPlaybook: true })
		})

		it(TestShould.dsText({ dsPreparation: `U1 post content1` }), (d) => {
			const customResponse = (res: Response) => { joParamMain.joContent1 = res.body }
			const joContentCustom = {
				isPlaybook: true,
				arIdChannel: [joParamMain.joChannel2.idChannel, joParamMain.joChannel1.idChannel]
			}
			TestEntity.reg(d, RoutesEnum.content, TestUserBox.getUser(0), Content, customResponse, joContentCustom)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Is content really linked with the channels?`,
			dsCircumstances: `Link content and channels by /content post method. Searched by the channels`,
			dsExpected: `To be linked`
		}), (d) => {
			const joParam2: any = { arIdChannel: [joParamMain.joChannel2.idChannel, joParamMain.joChannel1.idChannel] }
			const customResponse = (res: Response) => {
				should().equal(res.body.length, 2, "Quantity of links are wrong")
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.contentChannel, SConst.HTTP_METHOD_GET, TestUserBox.getUser(0), joParam2, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Is content really linked with the channels?`,
			dsCircumstances: `Link content and channels by /content post method. Searched by the content`,
			dsExpected: `To be linked`
		}), (d) => {
			const joParam2: any = { idContent: joParamMain.joContent1.idContent }
			const customResponse = (res: Response) => {
				should().equal(res.body.length, 2, "Quantity of links are wrong")
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.contentChannel, SConst.HTTP_METHOD_GET, TestUserBox.getUser(0), joParam2, joResult)
		})

		it(TestShould.dsText({
			dsPreparation: `Relink channel2 and channel3 to content (therefore excluding channel1)`,
		}), (d) => {
			const joParam2: any = {
				idContent: joParamMain.joContent1.idContent,
				arIdChannel: [joParamMain.joChannel2.idChannel, joParamMain.joChannel3.idChannel]
			}
			TestUtil.customCall(d, RoutesEnum.content, SConst.HTTP_METHOD_PUT, TestUserBox.getUser(0), joParam2)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Relink channel2 and channel3 to content (therefore excluding channel1)`,
			dsCircumstances: `Channel 1 and 2 were already linked. Channel3 was not`,
			dsExpected: `to return channel2 and channel3 linked`
		}), (d) => {
			const joParam2: any = { idContent: joParamMain.joContent1.idContent }
			const customResponse = (res: Response) => {
				should().equal(res.body.length, 2, "Quantity of links are wrong")
				let idChannel2 = res.body[1].idChannel
				let idChannel3 = res.body[0].idChannel
				if (res.body[0].idChannel == joParamMain.joChannel2.idChannel) {
					idChannel2 = res.body[0].idChannel
					idChannel3 = res.body[1].idChannel
				}
				should().equal(idChannel2, joParamMain.joChannel2.idChannel, "Wrong link of channel2")
				should().equal(idChannel3, joParamMain.joChannel3.idChannel, "Wrong link of channel3")
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.contentChannel, SConst.HTTP_METHOD_GET, TestUserBox.getUser(0), joParam2, joResult)
		})
	}

	private static testBasic() {
		TestCaseItem.descItShouldEvalExistence(true, RoutesEnum.contentChannel, SConst.TEST_ROLE_NORMAL_USER,
			SConst.HTTP_METHOD_PUT, SConst.HTTP_METHOD_POST, SConst.HTTP_METHOD_DELETE)
	}

	private static testAll() {
		const r = RoutesEnum.contentChannel
		const mDel = SConst.HTTP_METHOD_DELETE
		const mPost = SConst.HTTP_METHOD_POST
		const mPut = SConst.HTTP_METHOD_PUT
		const mGet = SConst.HTTP_METHOD_GET
		const u = SConst.TEST_ROLE_NORMAL_USER

		const joParamMain: any = {
			nmChannel: "contentChannel Test " + StringUtil.random(),
			vlSort: NumberUtil.random(2)
		}

		it("It should post a new content", (done) => {
			const joParam = TestEntity.gen(Content, { isPlaybook: true })
			const customResponse = (res: Response) => {
				joParamMain.idContent = res.body["idContent"]
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.content, mPost, u, joParam, joResult)
		})

		it("It should post a new channel", (done) => {
			const joParam = { nmChannel: joParamMain.nmChannel }
			const customResponse = (res: Response) => {
				joParamMain.idChannel = res.body["idChannel"]
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.channel, mPost, u, joParam, joResult)
		})

		it("It should post a new link of channel and content", (done) => {
			const joParam = {
				idChannel: joParamMain.idChannel,
				idContent: joParamMain.idContent,
				vlSort: joParamMain.vlSort
			}
			const customResponse = (res: Response) => {
				joParamMain.idContentChannel = res.body["idContentChannel"]
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.contentChannel, mPost, u, joParam, joResult)
		})

		it("It should query the link just created", (done) => {
			const query =
				`select idContentChannel as \"idContentChannel\", idContent as \"idContent\",
				idChannel as \"idChannel\", vlSort as \"vlSort\"
			from contentChannel cch
				where idContentChannel = ${joParamMain.idContentChannel}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					const joContentChannelDb = result[0][0]
					if (joContentChannelDb == undefined) {
						throw Error("contentChannel not found")
					}
					const joExpected = {
						idContentChannel: joParamMain.iContentChannel,
						idContent: joParamMain.idContent,
						idChannel: joParamMain.idChannel,
						vlSort: joParamMain.vlSort
					}
					const isSameJo = JsonUtil.isSameJoKeys(joExpected, joContentChannelDb, false)
					if (!isSameJo) {
						throw Error("Some characteristics of contentChannel were not expected")
					}
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it("It should fail to post the same link", (done) => {
			const joParam = {
				idChannel: joParamMain.idChannel,
				idContent: joParamMain.idContent,
				vlSort: joParamMain.vlSort
			}
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus: CtExcep.nmKeyAlreadyExists.nmMsg,
				joExtraContent: { nmKey: KeyEnum.bond }
			}
			TestUtil.customCall(done, RoutesEnum.contentChannel, mPost, u, joParam, joResult)
		})

		it("It should put a new value for vlSort", (done) => {
			joParamMain.vlSortNew = joParamMain.vlSort + 1
			const joParam = {
				idContentChannel: joParamMain.idContentChannel,
				vlSort: joParamMain.vlSortNew
			}
			TestUtil.customCall(done, RoutesEnum.contentChannel, mPut, u, joParam)
		})

		it("It should get the link and verify new vlSort set", (done) => {
			const joParam = {
				idContentChannel: joParamMain.idContentChannel,
			}
			const customResponse = (res: Response) => {
				if (joParamMain.vlSortNew != res.body[0]["vlSort"]) {
					throw Error(`The vlSort is not the value expected. ` +
						`Expected: ${joParamMain.vlSort + 1}, Received: ${res.body["vlSort"]}`)
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.contentChannel, mGet, u, joParam, joResult)
		})

		it("It should get the link and verify the values", (done) => {
			const joParam = {
				idContentChannel: joParamMain.idContentChannel,
			}
			const customResponse = (res: Response) => {
				const joContentChannelDb = res.body[0]
				if (joContentChannelDb == undefined) {
					throw Error("contentChannel not found")
				}
				if (res.body[1] != undefined) {
					throw Error(`It should've brought a single row`)
				}
				const joExpected = {
					idContentChannel: joParamMain.iContentChannel,
					idContent: joParamMain.idContent,
					idChannel: joParamMain.idChannel,
					vlSort: joParamMain.vlSortNew
				}
				const isSameJo = JsonUtil.isSameJoKeys(joExpected, joContentChannelDb, false)
				if (!isSameJo) {
					throw Error("Some characteristics of contentChannel were not expected")
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.contentChannel, mGet, u, joParam, joResult)
		})

		it("It should delete the link of content and channel", (done) => {
			const joParam = {
				idContentChannel: joParamMain.idContentChannel
			}
			TestUtil.customCall(done, RoutesEnum.contentChannel, mDel, u, joParam)
		})

		it("It should try to get content channel and fail", (done) => {
			const joParam = {
				idContentChannel: joParamMain.idContentChannel,
			}
			TestUtil.customCall(done, r, mGet, u, joParam)
		})

		it("It should query and not find the link", (done) => {
			const query =
				`select idContentChannel as \"idContentChannel\", idContent as \"idContent\",
			idChannel as \"idChannel\", vlSort as \"vlSort\"
		from contentChannel cch
			where idContentChannel = ${joParamMain.idContentChannel}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					const joContentChannelDb = result[0][0]
					if (joContentChannelDb != undefined) {
						throw Error("contentChannel should have not been found")
					}
					TestUtil.freeEnd(done)
				}).catch(done)
		})
	}
}
