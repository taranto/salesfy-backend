import { TestRouteSpec } from "../../support/TestRoute.spec";
import { RoutesEnum, SConst, TUserTest, DateUtil, THttpMethod, CtCardState } from "salesfy-shared";
import { TestShould, TestCaseItem, TestUtil, TestUserManager } from "../../barrel/Barrel.spec";
import { TestEntity } from "../../support/TestEntity.spec";
import { Group } from "app/modules/group/Group";
import { UserGroup } from "app/modules/user_group/UserGroup";
import { ChannelGroup } from "app/modules/channel_group/ChannelGroup";
import { Response } from "supertest";
import { Channel } from "app/modules/channel/Channel";
import { Content } from "app/modules/content/Content";
import { ContentChannel } from "app/modules/content_channel/ContentChannel";
import { ConnDao } from "app/structure/ConnDao";
import { DaoUtil } from "app/util/DaoUtil";
import { EnvTest } from "../../support/EnvTest.spec";

export class ChannelStoriesRteSpec extends TestRouteSpec {

	public test() {
		describe(TestShould.dsText({
			nmRoute: RoutesEnum.channelStories, nmMethod: this.mGet,
			nmClass: "ChannelStoriesRteSpec"
		}), () => {
			describe(TestShould.dsText({ dsText: "Test basics" }), () => {
				this.testBasics()
			})
			describe(TestShould.dsText({ dsText: "Test when to show and when to hide (Playbook channels)" }), () => {
				this.testStoriesAccess(true)
			})
			describe.skip(TestShould.dsText({ dsText: "Test when to show and when to hide (LC channels)" }), () => {
				this.testStoriesAccess(false)
			})
		})
	}

	private testStoriesAccess(isPlaybook: boolean) {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = {}
			done()
		})

		it(TestShould.dsText({
			dsPreparation: `Register a new user to this test ` +
				`(no previous link to groups/channels expected)`
		}), (d) => {
			// const customResponse = (res: Response) => {
				// TestUserManager.regAsUserTest(d, joRegisterParam.emUser,  this.u2)
			// }
			TestUserManager.register(d, undefined, undefined, 1)
		})

		if (isPlaybook) {
			const customResponse1 = (res: Response) => { this.joParamMain.joGroup = res.body }
			const joCustom1 = () => {
				return { idWorkspace:EnvTest.getIdWorkspaceDefault() }
			}
			TestEntity.itReg(RoutesEnum.group, this.u, Group, customResponse1, joCustom1)

			const customResponse2 = (res: Response) => { this.joParamMain.joUserGroup = res.body }
			const joCustom2 = () => {
				return {
					idUser: TestUserManager.getNewUser().user.idUser,
					idGroup: this.joParamMain.joGroup.idGroup
				}
			}
			TestEntity.itReg(RoutesEnum.userGroup, this.u, UserGroup, customResponse2, joCustom2)
		} else {
			TestCaseItem.itShouldEditUserPermission(this.u, true, true, true, true)

			it(TestShould.dsText({ dsPreparation: `It should get any tag to add to the user` }), (d) => {
				const loggedUser = TestUserManager.getUser().loggedUser
				const query = `select idTag as \"idTag\" from tag where idTag not in
					(select idTag from userTag where idUser = ${loggedUser.user.idUser})`
				ConnDao.staticQueryPromise(query)
					.then((result) => {
						this.joParamMain.idTag = +result[0][0].idTag
						TestUtil.freeEnd(d)
					}).catch(d)
			})

			it(TestShould.dsText({ dsPreparation: "It should add a tag to the user2" }), (done) => {
				const joParam = { idTag: this.joParamMain.idTag }
				TestUtil.customCall(done, RoutesEnum.userTag, SConst.HTTP_METHOD_POST, this.u2, joParam)
			})

			it(TestShould.dsText({ dsPreparation: "It should add a tag to the user1" }), (done) => {
				const joParam = { idTag: this.joParamMain.idTag }
				TestUtil.customCall(done, RoutesEnum.userTag, SConst.HTTP_METHOD_POST, this.u, joParam)
			})

			it(TestShould.dsText({ dsPreparation: `It should unlink this tag from all other channels` }), (done) => {
				const idTag = this.joParamMain.idTag
				const query = `delete from channelTag where idTag = ${idTag}`
				ConnDao.staticQueryPromise(query)
					.then((result) => {
						TestUtil.freeEnd(done)
					}).catch(done)
			})
		}

		this.registerPackage(1, isPlaybook)
		this.registerPackage(2, isPlaybook)
		this.registerPackage(3, isPlaybook)
		this.registerPackage(4, isPlaybook)
		this.registerPackage(5, isPlaybook)

		it(TestShould.dsText({ dsPreparation: `U2 visualizes c2` }), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent2.idContent }
			TestUtil.customCall(d, RoutesEnum.content, this.mGet, this.u2, joParam)
		})

		it(TestShould.dsText({ dsPreparation: `U2 visualizes c3` }), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent3.idContent }
			TestUtil.customCall(d, RoutesEnum.content, this.mGet, this.u2, joParam)
		})

		it(TestShould.dsText({ dsPreparation: `U2 converts c3` }), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent3.idContent }
			TestUtil.customCall(d, RoutesEnum.contentConversion, this.mGet, this.u2, joParam)
		})

		it(TestShould.dsText({ dsPreparation: `U2 visualizes c4` }), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent4.idContent }
			TestUtil.customCall(d, RoutesEnum.content, this.mGet, this.u2, joParam)
		})

		it(TestShould.dsText({ dsPreparation: `U2 converts c4` }), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent4.idContent }
			TestUtil.customCall(d, RoutesEnum.contentConversion, this.mGet, this.u2, joParam)
		})

		it(TestShould.dsText({ dsPreparation: `U1 updates c4` }), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent4.idContent, shNotifyUpdate: true }
			TestUtil.customCall(d, RoutesEnum.content, this.mPut, this.u, joParam)
		})

		it(TestShould.dsText({ dsPreparation: `U1 converts c1` }), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent1.idContent }
			TestUtil.customCall(d, RoutesEnum.contentConversion, this.mGet, this.u, joParam)
		})

		it(TestShould.dsText({ dsPreparation: `U1 converts c2` }), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent2.idContent }
			TestUtil.customCall(d, RoutesEnum.contentConversion, this.mGet, this.u, joParam)
		})

		it(TestShould.dsText({ dsPreparation: `U1 converts c3` }), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent3.idContent }
			TestUtil.customCall(d, RoutesEnum.contentConversion, this.mGet, this.u, joParam)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Is the channel just notified under the right state?`,
			dsCircumstances: `u1 has just notified content4 as content updated (all others are already converted)`,
			dsExpected: `the content should be in allConverted state `
		}), (d) => {
			const joParam: any = { idChannel: this.joParamMain.joChannel4.idChannel }
			const customResponse = (res: Response) => {
				const channel = res.body[0]
				if (channel.keyCtContentState != CtCardState.allConverted.key) {
					throw Error(`channel DB is in the wrong state`)
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.channelStories, this.mGet, this.u, joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: `System rewinds c5 in 2 weeks` }), (d) => {
			const idContent = this.joParamMain.joContent5.idContent
			const dh14DaysBefore = new Date(new Date().getTime() - (SConst.MILI_DAY * 14))
			const query = `update content set
				dhUpdate = ${DaoUtil.toPsqlDateMethod(dh14DaysBefore)},
				dhPublish = ${DaoUtil.toPsqlDateMethod(dh14DaysBefore)}
				where idContent = ${idContent}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					TestUtil.freeEnd(d)
				}).catch(d)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Is the channel stories under the right state?`,
			dsCircumstances: `Everything is registered and available to u2 to use`,
			dsExpected: `The channel stories must be have 4 sorted items of each state`
		}), (d) => {
			const joParam: any = {}
			const customResponse = (res: Response) => {
				const channel1 = res.body[0]
				if (channel1.idChannel != this.joParamMain.joChannel1.idChannel) {
					throw Error(`channel1 is in the wrong position`)
				}
				if (channel1.keyCtContentState != CtCardState.notViewed.key) {
					throw Error(`channel1 is in the wrong state: ${channel1.keyCtContentState}`)
				}
				const channel2 = res.body[1]
				if (channel2.idChannel != this.joParamMain.joChannel2.idChannel) {
					throw Error(`channel2 is in the wrong position`)
				}
				if (channel2.keyCtContentState != CtCardState.notConverted.key) {
					throw Error(`channel2 is in the wrong state: ${channel2.keyCtContentState}`)
				}
				const channel4 = res.body[2]
				if (channel4.idChannel != this.joParamMain.joChannel4.idChannel) {
					throw Error(`channel4 is in the wrong position`)
				}
				if (channel4.keyCtContentState != CtCardState.notConvertedUpdate.key) {
					throw Error(`channel4 is in the wrong state: ${channel4.keyCtContentState}`)
				}
				const channel3 = res.body[3]
				if (channel3.idChannel != this.joParamMain.joChannel3.idChannel) {
					throw Error(`channel3 is in the wrong position`)
				}
				if (channel3.keyCtContentState != CtCardState.allConverted.key) {
					throw Error(`channel3 is in the wrong state: ${channel3.keyCtContentState}`)
				}
				if (res.body.length > 4) {
					throw Error(`There are more channels in stories than expected`)
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.channelStories, this.mGet, this.u2, joParam, joResult)
		})

	}

	private registerPackage(nrIndex: number, isPlaybook: boolean) {
		const customResponse1 = (res: Response) => { this.joParamMain[`joChannel${nrIndex}`] = res.body }
		TestEntity.itReg(RoutesEnum.channel, this.u, Channel, customResponse1, { isPlaybook: isPlaybook })

		if (isPlaybook) {
			const customResponse2 = (res: Response) => { this.joParamMain[`joChannelGroup${nrIndex}`] = res.body }
			const joCustom2 = () => {
				return {
					idChannel: this.joParamMain[`joChannel${nrIndex}`].idChannel,
					idGroup: this.joParamMain.joGroup.idGroup
				}
			}
			TestEntity.itReg(RoutesEnum.channelGroup, this.u, ChannelGroup, customResponse2, joCustom2)
		}

		const customResponse3 = (res: Response) => { this.joParamMain[`joContent${nrIndex}`] = res.body }
		TestEntity.itReg(RoutesEnum.content, this.u, Content, customResponse3, { isPlaybook: isPlaybook })

		const customResponse4 = (res: Response) => { this.joParamMain[`joContentChannel${nrIndex}`] = res.body }
		const joCustom4 = () => {
			return {
				idChannel: this.joParamMain[`joChannel${nrIndex}`].idChannel,
				idContent: this.joParamMain[`joContent${nrIndex}`].idContent
			}
		}
		TestEntity.itReg(RoutesEnum.contentChannel, this.u, ContentChannel, customResponse4, joCustom4)

		if (!isPlaybook) {
			it(TestShould.dsText({ dsPreparation: `It should link tag to the channel` }), (done) => {
				const idChannel = this.joParamMain[`joChannel${nrIndex}`].idChannel
				const idTag = this.joParamMain.idTag
				const query = `insert into channelTag (idChannel, idTag) values (${idChannel}, ${idTag})`
				ConnDao.staticQueryPromise(query)
					.then((result) => {
						TestUtil.freeEnd(done)
					}).catch(done)
			})
		}
	}

	private testBasics() {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = {}
			done()
		})

		it(TestShould.exist(), (done) => {
			this.joParamMain = {}
			TestCaseItem.callEvalExistence(done, RoutesEnum.channelStories, this.mGet)
		})

		it(TestShould.acceptBothTokens(), (done) => {
			TestCaseItem.callEvalAcceptBothTokens(done, RoutesEnum.channelStories, this.mGet, this.u)
		})

		it(TestShould.failNoTokens(), (done) => {
			TestCaseItem.callEvalFailNoTokens(done, RoutesEnum.channelStories, this.mGet)
		})

		it("It should bring only the expected attributes", (done) => {
			const expectedAttr = ["nmChannel", "idChannel", "piChannel", "vlSort", "isPlaybook", "idPublisher",
				"idCtUserGroupAccess", "piIcon", "dsChannel", "idCtChannelView", "dhPublish", "keyCtContentState",
				"nmPublisher", "dhLastConversion", "isActive", "dhUpdateContent", "dhPublishContent"]
			TestCaseItem.callEvalExpectedAttributes(
				done, RoutesEnum.channelStories, this.mGet, this.u, expectedAttr, undefined, true)
		})
	}
}
