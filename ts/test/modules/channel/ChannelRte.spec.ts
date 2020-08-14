import { SConst, RoutesEnum, DateUtil, StringUtil, CtHttpStatus, JsonUtil, NumberUtil, CtExcep, CtUserGroupAccess } from "salesfy-shared";
import { TestUtil, TestUserManager, supertest } from "../../barrel/Barrel.spec";
import { TestCaseItem, TestShould } from "../../barrel/Barrel.spec";
import { LayerDao } from "app/layers_template/LayerDao";
import { ChannelDao } from "app/modules/channel/ChannelDao";
import { KeyEnum } from "salesfy-shared";
import { Response } from "superagent";
import { ConnDao } from "app/structure/ConnDao";
import { Channel } from "app/modules/channel/Channel";
import { TestEntity } from "../../support/TestEntity.spec";
import { Group } from "app/modules/group/Group";
import { DaoUtil } from "app/util/DaoUtil";
import { EnvTest } from "../../support/EnvTest.spec";

export class ChannelRteSpec {

	public static test() {
		describe(TestShould.describeTitle(RoutesEnum.channel), () => {
			describe(TestShould.descRouteMethod(RoutesEnum.channel, SConst.HTTP_METHOD_POST), () => {
				ChannelRteSpec.testChannelPost()
			})
			describe(TestShould.descRouteMethod(RoutesEnum.channel, SConst.HTTP_METHOD_PUT), () => {
				ChannelRteSpec.testChannelPut()
			})
			describe(TestShould.descRouteMethod(RoutesEnum.channel, SConst.HTTP_METHOD_DELETE), () => {
				ChannelRteSpec.testChannelDelete()
			})
		})
	}

	private static testChannelDelete() {
		const r = RoutesEnum.channel
		const m = SConst.HTTP_METHOD_DELETE
		const u = SConst.TEST_ROLE_NORMAL_USER
		const uB = SConst.TEST_ROLE_NEW_USER

		const joParamBIsAdmin: any = { nmChannel: "channel B is admin " + StringUtil.random() }
		const joParamAIsAdmin: any = { nmChannel: "channel A is admin " + StringUtil.random() }
		const nmChannelAfter = "grupo " + StringUtil.random()
		const nmChannelAfter2 = "grupo " + StringUtil.random()

		it(TestShould.exist(), (done) => {
			TestCaseItem.callEvalExistence(done, r, m)
		})

		it(TestShould.failMissingAllParams(), (done) => {
			TestCaseItem.callEvalFailMissingAllParams(done, r, m, u)
		})

		const keys = ["idChannel"]
		keys.forEach(key => {
			it(TestShould.failMissingAParam(key), (done) => {
				const joParam = { idChannel: 0 }
				TestCaseItem.callEvalFailMissingAParam(done, r, m, u, joParam, key)
			})
		})

		TestCaseItem.itShouldEditUserPermission(u, false, true, false, false)
		TestCaseItem.itShouldEditUserPermission(uB, false, true, false, false)

		it("It should add a channel. User A is NOT the admin", (done) => {
			TestUtil.customCall(
				done, r, SConst.HTTP_METHOD_POST, SConst.TEST_ROLE_NEW_USER, joParamBIsAdmin)
		})

		it("It should add a channel. User A IS the admin", (done) => {
			TestUtil.customCall(done, r, SConst.HTTP_METHOD_POST, u, joParamAIsAdmin)
		})

		it(`It should get the idChannel to test`, (done) => {
			const query = `select idChannel as \"idChannel\", nmChannel as \"nmChannel\" from channel
				where nmChannel like '${joParamBIsAdmin.nmChannel}'
				or nmChannel like '${joParamAIsAdmin.nmChannel}'`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					if (+result[0][0].idChannel == undefined || +result[0][1].idChannel == undefined) {
						throw Error("No sufficient Channels to execute the test. The just created Channels were not found")
					}
					if (result[0][0].nmChannel == joParamBIsAdmin.nmChannel) {
						joParamBIsAdmin.idChannel = +result[0][0].idChannel
						joParamAIsAdmin.idChannel = +result[0][1].idChannel
					} else {
						joParamBIsAdmin.idChannel = +result[0][1].idChannel
						joParamAIsAdmin.idChannel = +result[0][0].idChannel
					}
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it("It should delete this Channel", (done) => {
			const joParam2 = { idChannel: joParamAIsAdmin.idChannel }
			TestUtil.customCall(done, r, m, u, joParam2)
		})

		it(`It should find it as Channel isActive = false`, (done) => {
			const query = `select idChannel as \"idChannel\", nmChannel as \"nmChannel\", isActive as \"isActive\" from channel
				where idChannel = ${joParamAIsAdmin.idChannel}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					if (result[0].length == 0) {
						throw new Error("Channel not found (it should be found as isActive = false")
					}
					if (result[0][0].isActive != false) {
						throw new Error("Channel found but not as isActive = false")
					}
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it("It should NOT delete this Channel(he is not the admin of this Channel)", (done) => {
			const joParam2 = { idChannel: joParamBIsAdmin.idChannel }
			const joResult = { nrStatus: CtHttpStatus.status400.keyCtHttpStatus }
			TestUtil.customCall(done, r, m, u, joParam2, joResult)
		})

		it(`It should still find the Channel`, (done) => {
			const query = `select idChannel as \"idChannel\", nmChannel as \"nmChannel\" from channel
				where idChannel = ${joParamBIsAdmin.idChannel}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					if (result[0].length == 0) {
						throw new Error("The user was able to find the Channel. He could delete a Channel which he's not an admin")
					}
					TestUtil.freeEnd(done)
				}).catch(done)
		})
	}

	private static testChannelPut() {
		const r = RoutesEnum.channel
		const m = SConst.HTTP_METHOD_PUT
		const mPost = SConst.HTTP_METHOD_POST
		const u = SConst.TEST_ROLE_NORMAL_USER

		const joParamMain: any = {}
		let joParamChannel: any = {
			nmChannel: "channel uA is admin " + StringUtil.random(),
			piChannel: "123.png",
			vlSort: 1,
			isPlaybook: true,
			piIcon: "abc.png"
		}
		const channelSelect = DaoUtil.toSelect("ch",
			"idChannel", "nmChannel", "piChannel", "vlSort", "isPlaybook", "piIcon", "idPublisher", "idCtChannelView",
			"dhPublish")
		let joParamALateChange: any
		const nmChannelLateChangeByB = "channel update will succeed " + StringUtil.random()

		it(TestShould.exist(), (done) => {
			TestCaseItem.callEvalExistence(done, r, m)
		})

		it(TestShould.failMissingAllParams(), (done) => {
			TestCaseItem.callEvalFailMissingAllParams(done, r, m, u)
		})

		const keys = ["idChannel"]
		keys.forEach(key => {
			it(TestShould.failMissingAParam(key), (done) => {
				const joParam = { idChannel: 0 }
				TestCaseItem.callEvalFailMissingAParam(done, r, m, u, joParam, key)
			})
		})

		it(TestShould.dsText({ dsPreparation: "Post group A" }), (done) => {
			const joParam = TestEntity.gen(Group, { idWorkspace: EnvTest.getIdWorkspaceDefault() })
			const customResponse = (res: Response) => {
				joParamMain.joGroupA = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.group, mPost, u, joParam, joResult)
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
			TestUtil.customCall(done, RoutesEnum.userGroup, mPost, u, joParam, joResult)
		})

		it("It should add a channel to use as example. User B IS NOT the owner", (done) => {
			TestUtil.customCall(
				done, r, SConst.HTTP_METHOD_POST, u, joParamChannel)
		})

		it(`It should get the channel database row to use in the test`, (done) => {
			const query = `select ${channelSelect} from channel ch
				where nmChannel like '${joParamChannel.nmChannel}'`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					if (+result[0][0].idChannel == undefined) {
						throw Error("No sufficient channels to execute the test. The just created channels were not found")
					}
					joParamChannel = result[0][0]
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it("It should fail updating nmChannel by user B", (done) => {
			const joParam = {
				idChannel: joParamChannel.idChannel,
				nmChannel: "channel update will fail " + StringUtil.random()
			}
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus: CtExcep.userNotAuthorized.nmMsg
			}
			TestUtil.customCall(done, r, m, SConst.TEST_ROLE_NEW_USER, joParam, joResult)
		})

		it("It should verify the channel having the same name as before", (done) => {
			const query = `select ${channelSelect} from channel ch
				where nmChannel like '${joParamChannel.nmChannel}'`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					if (+result[0][0].idChannel == undefined) {
						throw Error("Channel not found. Probably had the name changed (It shouldn't have had occurred)")
					}
					joParamChannel = result[0][0]
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it("It should update all possible attributes of this channel (includes changing ownership to the user B)", (done) => {
			const idUserB = TestUserManager.getNewUser().loggedUser.user.idUser
			joParamALateChange = TestEntity.gen(Channel, {
				isPlaybook: true, idChannel: joParamChannel.idChannel, idPublisher: idUserB
			})
			TestUtil.customCall(done, r, m, u, joParamALateChange)
		})

		it(`It should evaluate/compare all attributes intended to be updated`, (done) => {
			const query = `select ${channelSelect} from channel ch
				where idChannel = ${joParamChannel.idChannel}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					const joChannelAdded = result[0][0]
					if (!joChannelAdded) {
						throw new Error("The specific channel was not found")
					}
					const arNmAttributesToCompare =
						["nmChannel", "piChannel", "vlSort", "isPlaybook", "piIcon"]
					if (!JsonUtil.isSameJoKeys(joParamALateChange, joChannelAdded, false, ...arNmAttributesToCompare)) {
						throw new Error("There's an attribute in the channel update that is different than the expected")
					}
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it("It should succeed at updating nmChannel by user B", (done) => {
			const joParam = {
				idChannel: joParamChannel.idChannel,
				nmChannel: nmChannelLateChangeByB
			}
			TestUtil.customCall(done, r, m, SConst.TEST_ROLE_NEW_USER, joParam)
		})

		it("It should verify the channels new name", (done) => {
			const query = `select ${channelSelect} from channel ch
				where nmChannel like '${nmChannelLateChangeByB}'`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					if (+result[0][0].idChannel == undefined) {
						throw Error("User B was not able to change the channel's name")
					}
					joParamChannel = result[0][0]
					TestUtil.freeEnd(done)
				}).catch(done)
		})

	}

	private static testChannelPost() {
		const r = RoutesEnum.channel
		const m = SConst.HTTP_METHOD_POST
		const u = SConst.TEST_ROLE_NORMAL_USER

		const channelSelect = DaoUtil.toSelect("ch",
			"idChannel", "nmChannel", "piChannel", "vlSort", "isPlaybook", "piIcon", "idPublisher", "idCtChannelView",
			"dhPublish")
		let joParamPost: any = {}
		let qtChannel = 0
		const joParamMain: any = {}

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

		const keys = ["nmChannel"]
		keys.forEach(key => {
			it(TestShould.failMissingAParam(key), (done) => {
				TestCaseItem.callEvalFailMissingAParam(done, r, m, u, joParamPost, key)
			})
		})

		before(`It should get the number of existent channels`, (done) => {
			const query = `select count(*) as \"qtChannel\" from channel`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					qtChannel = +result[0][0].qtChannel
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it("It should add a new channel", (done) => {
			joParamPost = TestEntity.gen(Channel, { isPlaybook: true })
			const customResponse = (res: Response) => {
				joParamMain.joChannelA = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, m, u, joParamPost, joResult)
		})

		it(`It should evaluate/compare all attributes intended to be added`, (done) => {
			const query = `select ${channelSelect} from channel ch
				where idChannel = ${joParamMain.joChannelA.idChannel}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					const joChannelAdded = result[0][0]
					if (!joChannelAdded) {
						throw new Error("Specific channel not found")
					}
					const idPublisherAdded = result[0][0].idPublisher
					const idUserLogged = TestUserManager.getUser().loggedUser.user.idUser
					if (idPublisherAdded == joParamPost.idPublisher) {
						throw new Error("The channel publisher must be the logged one, not the one sent by parameter")
					}
					if (idPublisherAdded != idUserLogged) {
						throw new Error("The channel publisher must be the logged one. " +
							"The idPublished registered there is not from the one logged")
					}
					const arNmAttributesToCompare =
						["nmChannel", "piChannel", "vlSort", "isPlaybook", "piIcon"]
					if (!JsonUtil.isSameJoKeys(joParamPost, joChannelAdded, false, ...arNmAttributesToCompare)) {
						throw new Error("There's an attribute in the channel added that is different than the expected")
					}
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it(`It should count one channel more`, (done) => {
			const query = `select count(*) as \"qtChannel\" from channel`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					const qtChannelAfter = +result[0][0].qtChannel
					if (qtChannelAfter - 1 != qtChannel) {
						throw new Error("Channel not added correctly")
					}
					TestUtil.freeEnd(done)
				}).catch(done)
		})
	}

}
