import { RoutesEnum, SConst, TUserTest, DateUtil, THttpMethod, CtCardState } from "salesfy-shared";
import { LayerDao } from "app/layers_template/LayerDao";
import { TestUtil, TestShould, TestCaseItem, TestUserManager, should } from "../barrel/Barrel.spec";
import { ConnDao } from "app/structure/ConnDao";
import { Channel } from "app/modules/channel/Channel";
import { TestEntity } from "../support/TestEntity.spec";
import { Response } from "supertest";
import { Content } from "app/modules/content/Content";
import { ContentChannel } from "app/modules/content_channel/ContentChannel";
import { TestRouteSpec } from "../support/TestRoute.spec";
import { Group } from "app/modules/group/Group";
import { UserGroup } from "app/modules/user_group/UserGroup";
import { ChannelGroup } from "app/modules/channel_group/ChannelGroup";
import { EnvTest } from "../support/EnvTest.spec";

export class ChannelContentsAccessedSpec extends TestRouteSpec {

	public test() {
		describe(TestShould.dsText({
			nmRoute: [RoutesEnum.content, RoutesEnum.channel].join(), nmMethod: this.mGet,
			nmClass: "ChannelContentsAccessedSpec"
		}), () => {
			describe(TestShould.dsText({ dsText: "testing data update over usage in content playbook" }), () => {
				this.testDataUpdateOverUsageInContent(true)
			})
			describe(TestShould.dsText({ dsText: "testing data update over usage in channel playbook" }), () => {
				this.testDataUpdateOverUsageInChannel(true)
			})
			describe(TestShould.dsText({ dsText: "testing data update over usage in content LC" }), () => {
				this.testDataUpdateOverUsageInContent(false)
			})
			describe(TestShould.dsText({ dsText: "testing data update over usage in channel LC" }), () => {
				this.testDataUpdateOverUsageInChannel(false)
			})
		})
	}

	private testDataUpdateOverUsageInChannel(isPlaybook: boolean) {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = {}
			done()
		})

		if (!isPlaybook) {
			TestCaseItem.itShouldEditUserPermission(this.u, true, true, true, true)
		}

		const customResponse1 = (res: Response) => { this.joParamMain.joChannel = res.body }
		TestEntity.itReg(RoutesEnum.channel, this.u, Channel, customResponse1, { isPlaybook: isPlaybook })
		const customResponse2 = (res: Response) => { this.joParamMain.joContent1 = res.body }
		TestEntity.itReg(RoutesEnum.content, this.u, Content, customResponse2, { isPlaybook: isPlaybook })
		const customResponse4 = (res: Response) => { this.joParamMain.joContentChannel1 = res.body }
		const joCustom4 = () => {
			return {
				idChannel: this.joParamMain.joChannel.idChannel,
				idContent: this.joParamMain.joContent1.idContent
			}
		}
		TestEntity.itReg(RoutesEnum.contentChannel, this.u, ContentChannel, customResponse4, joCustom4)

		if (isPlaybook) {
			const customResponse6 = (res: Response) => { this.joParamMain.joGroup = res.body }
			const joCustom6 = () => {
				return { idWorkspace:EnvTest.getIdWorkspaceDefault() }
			}
			TestEntity.itReg(RoutesEnum.group, this.u, Group, customResponse6, joCustom6)
			const customResponse7 = (res: Response) => { this.joParamMain.joUserGroup = res.body }
			const joCustom7 = () => {
				return {
					idUser: TestUserManager.getNewUser().user.idUser,
					idGroup: this.joParamMain.joGroup.idGroup
				}
			}
			TestEntity.itReg(RoutesEnum.userGroup, this.u, UserGroup, customResponse7, joCustom7)
			const customResponse8 = (res: Response) => { this.joParamMain.joChannelGroup = res.body }
			const joCustom8 = () => {
				return {
					idChannel: this.joParamMain.joChannel.idChannel,
					idGroup: this.joParamMain.joGroup.idGroup
				}
			}
			TestEntity.itReg(RoutesEnum.channelGroup, this.u, ChannelGroup, customResponse8, joCustom8)
		}

		it(TestShould.dsText({
			dsWhatsBeingTested: `Is the channel under the right state?`,
			dsCircumstances: `Everything is registered and there's no viewing by U2`,
			dsExpected: `The channel must be at 'notViewed' state`
		}), (d) => {
			const joParam: any = { idChannel: this.joParamMain.joChannel.idChannel, sbContentState: true }
			const customResponse = (res: Response) => {
				const channel = res.body[0]
				if (channel.keyCtContentState != CtCardState.notViewed.key) {
					throw Error(`Channel is in the wrong state: ${channel.keyCtContentState}`)
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.channel, this.mGet, this.u2, joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: `U2 gets all the contents of the channel` }), (d) => {
			const joParam: any = { idChannel: this.joParamMain.joChannel.idChannel }
			TestUtil.customCall(d, RoutesEnum.content, this.mGet, this.u2, joParam)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Is the channel under the right state?`,
			dsCircumstances: `Everything is registered and the u2 viewed the content once`,
			dsExpected: `The channel must be at 'notConverted' state`
		}), (d) => {
			const joParam: any = { idChannel: this.joParamMain.joChannel.idChannel, sbContentState: true }
			const customResponse = (res: Response) => {
				const channel = res.body[0]
				if (channel.keyCtContentState != CtCardState.notConverted.key) {
					throw Error(`Channel is in the wrong state: ${channel.keyCtContentState}`)
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.channel, this.mGet, this.u2, joParam, joResult)
		})

		const customResponse3 = (res: Response) => { this.joParamMain.joContent2 = res.body }
		TestEntity.itReg(RoutesEnum.content, this.u, Content, customResponse3, { isPlaybook: isPlaybook })
		const customResponse5 = (res: Response) => { this.joParamMain.joContentChannel2 = res.body }
		const joCustom5 = () => {
			return {
				idChannel: this.joParamMain.joChannel.idChannel,
				idContent: this.joParamMain.joContent2.idContent
			}
		}
		TestEntity.itReg(RoutesEnum.contentChannel, this.u, ContentChannel, customResponse5, joCustom5)

		it(TestShould.dsText({
			dsWhatsBeingTested: `Is the channel under the right state?`,
			dsCircumstances: `Everything is registered and there's 1 content not viewed by U2`,
			dsExpected: `The channel must be at 'notViewed' state`
		}), (d) => {
			const joParam: any = { idChannel: this.joParamMain.joChannel.idChannel, sbContentState: true }
			const customResponse = (res: Response) => {
				const channel = res.body[0]
				if (channel.keyCtContentState != CtCardState.notViewed.key) {
					throw Error(`Channel is in the wrong state: ${channel.keyCtContentState}`)
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.channel, this.mGet, this.u2, joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: `U2 gets all the contents of the channel` }), (d) => {
			const joParam: any = { idChannel: this.joParamMain.joChannel.idChannel }
			TestUtil.customCall(d, RoutesEnum.content, this.mGet, this.u2, joParam)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Is the channel under the right state?`,
			dsCircumstances: `Everything is registered and the u2 viewed all the contents once`,
			dsExpected: `The channel must be at 'notConverted' state`
		}), (d) => {
			const joParam: any = { idChannel: this.joParamMain.joChannel.idChannel, sbContentState: true }
			const customResponse = (res: Response) => {
				const channel = res.body[0]
				if (channel.keyCtContentState != CtCardState.notConverted.key) {
					throw Error(`Channel is in the wrong state: ${channel.keyCtContentState}`)
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.channel, this.mGet, this.u2, joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: `U2 converts c2` }), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent2.idContent }
			TestUtil.customCall(d, RoutesEnum.contentConversion, this.mGet, this.u2, joParam)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Is the channel under the right state?`,
			dsCircumstances: `Everything is registered and the u2 still has not seen one content`,
			dsExpected: `The channel must be at 'notConverted' state`
		}), (d) => {
			const joParam: any = { idChannel: this.joParamMain.joChannel.idChannel, sbContentState: true }
			const customResponse = (res: Response) => {
				const channel = res.body[0]
				if (channel.keyCtContentState != CtCardState.notConverted.key) {
					throw Error(`Channel is in the wrong state: ${channel.keyCtContentState}`)
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.channel, this.mGet, this.u2, joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: `U2 converts c1` }), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent1.idContent }
			TestUtil.customCall(d, RoutesEnum.contentConversion, this.mGet, this.u2, joParam)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Is the channel under the right state?`,
			dsCircumstances: `Everything is registered and the u2 has converted all`,
			dsExpected: `The channel must be at 'allConverted' state`
		}), (d) => {
			const joParam: any = { idChannel: this.joParamMain.joChannel.idChannel, sbContentState: true }
			const customResponse = (res: Response) => {
				const channel = res.body[0]
				if (channel.keyCtContentState != CtCardState.allConverted.key) {
					throw Error(`Channel is in the wrong state: ${channel.keyCtContentState}`)
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.channel, this.mGet, this.u2, joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: `U1 updates c1` }), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent1.idContent, shNotifyUpdate: true }
			TestUtil.customCall(d, RoutesEnum.content, this.mPut, this.u, joParam)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Is the channel under the right state?`,
			dsCircumstances: `Everything is registered and the u2 has a content to see it's update`,
			dsExpected: `The channel must be at 'notConvertedUpdate' state`
		}), (d) => {
			const joParam: any = { idChannel: this.joParamMain.joChannel.idChannel, sbContentState: true }
			const customResponse = (res: Response) => {
				const channel = res.body[0]
				if (channel.keyCtContentState != CtCardState.notConvertedUpdate.key) {
					throw Error(`Channel is in the wrong state: ${channel.keyCtContentState}`)
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.channel, this.mGet, this.u2, joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: `U2 converts c1` }), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent1.idContent }
			TestUtil.customCall(d, RoutesEnum.contentConversion, this.mGet, this.u2, joParam)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Is the channel under the right state?`,
			dsCircumstances: `Everything is registered and the u2 has converted all`,
			dsExpected: `The channel must be at 'allConverted' state`
		}), (d) => {
			const joParam: any = { idChannel: this.joParamMain.joChannel.idChannel, sbContentState: true }
			const customResponse = (res: Response) => {
				const channel = res.body[0]
				if (channel.keyCtContentState != CtCardState.allConverted.key) {
					throw Error(`Channel is in the wrong state: ${channel.keyCtContentState}`)
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.channel, this.mGet, this.u2, joParam, joResult)
		})
	}

	private testDataUpdateOverUsageInContent(isPlaybook: boolean) {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = {}
			done()
		})

		if (!isPlaybook) {
			TestCaseItem.itShouldEditUserPermission(this.u, true, true, true, true)
		}

		const customResponse1 = (res: Response) => { this.joParamMain.joChannel = res.body }
		TestEntity.itReg(RoutesEnum.channel, this.u, Channel, customResponse1, { isPlaybook: isPlaybook })
		const customResponse2 = (res: Response) => { this.joParamMain.joContent1 = res.body }
		TestEntity.itReg(RoutesEnum.content, this.u, Content, customResponse2, { isPlaybook: isPlaybook })
		const customResponse3 = (res: Response) => { this.joParamMain.joContent2 = res.body }
		TestEntity.itReg(RoutesEnum.content, this.u, Content, customResponse3, { isPlaybook: isPlaybook })
		const customResponse22 = (res: Response) => { this.joParamMain.joContent3 = res.body }
		TestEntity.itReg(RoutesEnum.content, this.u, Content, customResponse22, { isPlaybook: isPlaybook })
		const customResponse4 = (res: Response) => { this.joParamMain.joContentChannel1 = res.body }
		const joCustom4 = () => {
			return {
				idChannel: this.joParamMain.joChannel.idChannel,
				idContent: this.joParamMain.joContent1.idContent
			}
		}
		TestEntity.itReg(RoutesEnum.contentChannel, this.u, ContentChannel, customResponse4, joCustom4)
		const customResponse5 = (res: Response) => { this.joParamMain.joContentChannel2 = res.body }
		const joCustom5 = () => {
			return {
				idChannel: this.joParamMain.joChannel.idChannel,
				idContent: this.joParamMain.joContent2.idContent
			}
		}
		TestEntity.itReg(RoutesEnum.contentChannel, this.u, ContentChannel, customResponse5, joCustom5)
		const customResponse42 = (res: Response) => { this.joParamMain.joContentChannel3 = res.body }
		const joCustom42 = () => {
			return {
				idChannel: this.joParamMain.joChannel.idChannel,
				idContent: this.joParamMain.joContent3.idContent
			}
		}
		TestEntity.itReg(RoutesEnum.contentChannel, this.u, ContentChannel, customResponse42, joCustom42)

		if (isPlaybook) {
			const customResponse6 = (res: Response) => { this.joParamMain.joGroup = res.body }
			const joCustom6 = () => {
				return { idWorkspace:EnvTest.getIdWorkspaceDefault() }
			}
			TestEntity.itReg(RoutesEnum.group, this.u, Group, customResponse6, joCustom6)
			const customResponse7 = (res: Response) => { this.joParamMain.joUserGroup = res.body }
			const joCustom7 = () => {
				return {
					idUser: TestUserManager.getNewUser().user.idUser,
					idGroup: this.joParamMain.joGroup.idGroup
				}
			}
			TestEntity.itReg(RoutesEnum.userGroup, this.u, UserGroup, customResponse7, joCustom7)
			const customResponse8 = (res: Response) => { this.joParamMain.joChannelGroup = res.body }
			const joCustom8 = () => {
				return {
					idChannel: this.joParamMain.joChannel.idChannel,
					idGroup: this.joParamMain.joGroup.idGroup
				}
			}
			TestEntity.itReg(RoutesEnum.channelGroup, this.u, ChannelGroup, customResponse8, joCustom8)
		}

		it(TestShould.dsText({ dsPreparation: "Register dhLastView of contents" }), (d) => {
			const joParam: any = { idChannel: this.joParamMain.joChannel.idChannel, nmSort: "dhPublish" }
			const customResponse = (res: Response) => {
				this.joParamMain.joContent1 = res.body[0]
				this.joParamMain.joContent2 = res.body[1]
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.content, this.mGet, this.u, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Content state`,
			dsCircumstances: `U2 have never seen the contents of the channel`,
			dsExpected: `They all must be at notViewed state`
		}), (d) => {
			const joParam: any = { idChannel: this.joParamMain.joChannel.idChannel, nmSort: "dhPublish" }
			const customResponse = (res: Response) => {
				const content1 = res.body[0]
				const content2 = res.body[1]
				const ctCardState1 = CtCardState.getContentState(content1)
				const ctCardState2 = CtCardState.getContentState(content2)
				should().equal(ctCardState1, CtCardState.notViewed)
				should().equal(ctCardState2, CtCardState.notViewed)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.content, this.mGet, this.u2, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Content state`,
			dsCircumstances: `U2 have seen the contents of the channel once`,
			dsExpected: `They all must be at notConverted state`
		}), (d) => {
			const joParam: any = { idChannel: this.joParamMain.joChannel.idChannel, nmSort: "dhPublish" }
			const customResponse = (res: Response) => {
				const content1 = res.body[0]
				const content2 = res.body[1]
				const ctCardState1 = CtCardState.getContentState(content1)
				const ctCardState2 = CtCardState.getContentState(content2)
				should().equal(ctCardState1, CtCardState.notConverted)
				should().equal(ctCardState2, CtCardState.notConverted)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.content, this.mGet, this.u2, joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: "Will set a datetime which last reading must be after" }), (d) => {
			const dhAfterRegister = new Date()
			this.joParamMain.dhAfterRegister = dhAfterRegister
			setTimeout(() => {
				d()
			}, SConst.MILI_SEC)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `dhLastView of content`,
			dsCircumstances: `dhAfterRegister was BEFORE this route get`,
			dsExpected: `The comparison must result in dhAfterRegister < dhLastView`
		}), (d) => {
			const joParam: any = { idChannel: this.joParamMain.joChannel.idChannel, nmSort: "dhPublish" }
			const customResponse = (res: Response) => {
				const a = new Date().getTime()
				if (new Date(this.joParamMain.joContent1.dhLastView).getTime() > new Date(res.body[0].dhLastView).getTime()) {
					throw Error(`Wrong setting of dhLastView content1`)
				}
				if (new Date(this.joParamMain.joContent2.dhLastView).getTime() > new Date(res.body[1].dhLastView).getTime()) {
					throw Error(`Wrong setting of dhLastView content2`)
				}
				const dhAfterRegister = this.joParamMain.dhAfterRegister
				if (dhAfterRegister.getTime() > new Date(res.body[0].dhLastView).getTime()) {
					throw Error(`Wrong setting of dhLastView content1`)
				}
				if (dhAfterRegister.getTime() > new Date(res.body[1].dhLastView).getTime()) {
					throw Error(`Wrong setting of dhLastView content2`)
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.content, this.mGet, this.u, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Content state`,
			dsCircumstances: `U2 have seen the contents of the channel once`,
			dsExpected: `U2 converts c1. c1 must be at allConverted state`
		}), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent1.idContent }
			const customResponse = (res: Response) => {
				const content1 = res.body
				const ctCardState1 = CtCardState.getContentState(content1)
				should().equal(ctCardState1, CtCardState.allConverted)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.contentConversion, this.mGet, this.u2, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `dhUpdate of content1`,
			dsCircumstances: `shNotifyUpdate will be called`,
			dsExpected: `The new content dhUpdated must be higher than the previous stored`
		}), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent1.idContent, shNotifyUpdate: true }
			const customResponse = (res: Response) => {
				const dhUpdateStored = this.joParamMain.joContent1.dhUpdate
				const dhUpdateRenewed = res.body.dhUpdate
				if (new Date(dhUpdateStored).getTime() == new Date(dhUpdateRenewed).getTime()) {
					throw Error(`dhUpdate not updated on put call`)
				}
				if (new Date(dhUpdateStored).getTime() > new Date(dhUpdateRenewed).getTime()) {
					throw Error(`dhUpdate stored is not higher than the new one`)
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.content, this.mPut, this.u, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Content state`,
			dsCircumstances: `U1 notified update on content 1`,
			dsExpected: `For u2, c2 must be at allConverted state. c1 notConvertedUpdate`
		}), (d) => {
			const joParam: any = { idChannel: this.joParamMain.joChannel.idChannel, nmSort: "dhPublish" }
			const customResponse = (res: Response) => {
				const content1 = res.body[0]
				const content2 = res.body[1]
				const ctCardState1 = CtCardState.getContentState(content1)
				const ctCardState2 = CtCardState.getContentState(content2)
				should().equal(ctCardState1, CtCardState.notConvertedUpdate, 'c1 in the wrong state')
				should().equal(ctCardState2, CtCardState.notConverted, 'c2 in the wrong state')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.content, this.mGet, this.u2, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `dhUpdate of content2`,
			dsCircumstances: `shNotifyUpdate variable will not be called`,
			dsExpected: `The new content dhUpdated must be EQUALS than the previous stored`
		}), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent2.idContent }
			const customResponse = (res: Response) => {
				const dhUpdateStored = this.joParamMain.joContent2.dhUpdate
				const dhUpdateRenewed = res.body.dhUpdate
				if (new Date(dhUpdateStored).getTime() != new Date(dhUpdateRenewed).getTime()) {
					throw Error(`dhUpdate not updated on put call`)
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.content, SConst.HTTP_METHOD_PUT, this.u, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `dhUpdate of content2`,
			dsCircumstances: `shNotifyUpdate variable will be called as false`,
			dsExpected: `The new content dhUpdated must be EQUALS than the previous stored`
		}), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent2.idContent, shNotifyUpdate: false }
			const customResponse = (res: Response) => {
				const dhUpdateStored = this.joParamMain.joContent2.dhUpdate
				const dhUpdateRenewed = res.body.dhUpdate
				if (new Date(dhUpdateStored).getTime() != new Date(dhUpdateRenewed).getTime()) {
					throw Error(`dhUpdate not updated on put call`)
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.content, SConst.HTTP_METHOD_PUT, this.u, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Content sorting`,
			dsCircumstances: `There's a content of each state`,
			dsExpected: `keyCtContentState to be sorted`
		}), (d) => {
			const arIdContent = [
				this.joParamMain.joContent1.idContent,
				this.joParamMain.joContent2.idContent,
				this.joParamMain.joContent3.idContent
			]
			const joParam: any = { arIdContent: arIdContent, nmSort:"keyCtContentState" }
			const customResponse = (res: Response) => {
				const mtSort = (c1:any, c2:any) => {
					return c2["keyCtContentState"] - c1["keyCtContentState"]
				}
				const nmProp = "keyCtContentState"
				TestCaseItem.evalSort(res, mtSort, nmProp)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.content, this.mGet, this.u, joParam, joResult)
		})
	}
}
