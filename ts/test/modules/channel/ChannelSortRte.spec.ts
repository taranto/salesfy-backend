import { THttpMethod, SConst, RoutesEnum, TUserTest, NumberUtil, GeneralUtil } from "salesfy-shared";
import { TestShould, TestUtil, TestUserManager } from "../../barrel/Barrel.spec";
import { TestEntity } from "../../support/TestEntity.spec";
import { Content } from "app/modules/content/Content";
import { ContentChannel } from "app/modules/content_channel/ContentChannel";
import { Channel } from "app/modules/channel/Channel";
import { Response } from "supertest";
import { Group } from "app/modules/group/Group";
import { UserGroup } from "app/modules/user_group/UserGroup";
import { ChannelGroup } from "app/modules/channel_group/ChannelGroup";
import { TestRouteSpec } from "../../support/TestRoute.spec";
import { EnvTest } from "../../support/EnvTest.spec";

export class ChannelSortRteSpec extends TestRouteSpec {

	private r = RoutesEnum.channel

	public test() {
		describe(TestShould.dsText({
			nmRoute: RoutesEnum.channel, nmMethod: SConst.HTTP_METHOD_GET,
			nmClass: "ChannelSortRteSpec"
		}), () => {
			this.testSort()
		})
	}

	public testSort() {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = {}
			done()
		})

		const customResponse1 = (res: Response) => { this.joParamMain.joChannel1 = res.body }
		TestEntity.itReg(RoutesEnum.channel, this.u, Channel, customResponse1, { nmChannel: "a", isPlaybook: true })

		const customResponse2 = (res: Response) => { this.joParamMain.joChannel2 = res.body }
		TestEntity.itReg(RoutesEnum.channel, this.u, Channel, customResponse2, { nmChannel: "b", isPlaybook: true })

		const customResponse3 = (res: Response) => { this.joParamMain.joChannel3 = res.body }
		TestEntity.itReg(RoutesEnum.channel, this.u, Channel, customResponse3, { nmChannel: "c", isPlaybook: true })

		const customResponse4 = (res: Response) => { this.joParamMain.joContent1 = res.body }
		TestEntity.itReg(RoutesEnum.content, this.u, Content, customResponse4, { isPlaybook: true })
		const customResponse5 = (res: Response) => { this.joParamMain.joContentChannel1 = res.body }
		const joCustom5 = () => {
			return {
				idChannel: this.joParamMain.joChannel1.idChannel,
				idContent: this.joParamMain.joContent1.idContent
			}
		}
		TestEntity.itReg(RoutesEnum.contentChannel, this.u, ContentChannel, customResponse5, joCustom5)

		const customResponse6 = (res: Response) => { this.joParamMain.joContent2 = res.body }
		TestEntity.itReg(RoutesEnum.content, this.u, Content, customResponse6, { isPlaybook: true })
		const customResponse7 = (res: Response) => { this.joParamMain.joContentChannel2 = res.body }
		const joCustom7 = () => {
			return {
				idChannel: this.joParamMain.joChannel2.idChannel,
				idContent: this.joParamMain.joContent2.idContent
			}
		}
		TestEntity.itReg(RoutesEnum.contentChannel, this.u, ContentChannel, customResponse7, joCustom7)

		const customResponse8 = (res: Response) => { this.joParamMain.joContent3 = res.body }
		TestEntity.itReg(RoutesEnum.content, this.u, Content, customResponse8, { isPlaybook: true })
		const customResponse9 = (res: Response) => { this.joParamMain.joContentChannel3 = res.body }
		const joCustom9 = () => {
			return {
				idChannel: this.joParamMain.joChannel3.idChannel,
				idContent: this.joParamMain.joContent3.idContent
			}
		}
		TestEntity.itReg(RoutesEnum.contentChannel, this.u, ContentChannel, customResponse9, joCustom9)

		const customResponse10 = (res: Response) => { this.joParamMain.joGroup = res.body }
		const joCustom10 = () => {
			return { idWorkspace:EnvTest.getIdWorkspaceDefault() }
		}
		TestEntity.itReg(RoutesEnum.group, this.u, Group, customResponse10, joCustom10)
		const customResponse11 = (res: Response) => { this.joParamMain.joUserGroup = res.body }
		const joCustom11 = () => {
			return {
				idUser: TestUserManager.getNewUser().user.idUser,
				idGroup: this.joParamMain.joGroup.idGroup
			}
		}
		TestEntity.itReg(RoutesEnum.userGroup, this.u, UserGroup, customResponse11, joCustom11)

		const customResponse12 = (res: Response) => { this.joParamMain.joChannelGroup1 = res.body }
		const joCustom12 = () => {
			return {
				idChannel: this.joParamMain.joChannel1.idChannel,
				idGroup: this.joParamMain.joGroup.idGroup
			}
		}
		TestEntity.itReg(RoutesEnum.channelGroup, this.u, ChannelGroup, customResponse12, joCustom12)
		const customResponse13 = (res: Response) => { this.joParamMain.joChannelGroup2 = res.body }
		const joCustom13 = () => {
			return {
				idChannel: this.joParamMain.joChannel2.idChannel,
				idGroup: this.joParamMain.joGroup.idGroup
			}
		}
		TestEntity.itReg(RoutesEnum.channelGroup, this.u, ChannelGroup, customResponse13, joCustom13)
		const customResponse14 = (res: Response) => { this.joParamMain.joChannelGroup3 = res.body }
		const joCustom14 = () => {
			return {
				idChannel: this.joParamMain.joChannel3.idChannel,
				idGroup: this.joParamMain.joGroup.idGroup
			}
		}
		TestEntity.itReg(RoutesEnum.channelGroup, this.u, ChannelGroup, customResponse14, joCustom14)

		it(TestShould.dsText({ dsPreparation: `Access channel1 once to register a dhLastConversion value` }), (d) => {
			const joParam: any = { idChannel: this.joParamMain.joChannel1.idChannel }
			TestUtil.customCall(d, RoutesEnum.channel, this.mGet, this.u2, joParam)
		})

		it(TestShould.dsText({ dsPreparation: `Access channel3 once to register a dhLastConversion value` }), (d) => {
			const joParam: any = { idChannel: this.joParamMain.joChannel3.idChannel }
			TestUtil.customCall(d, RoutesEnum.channel, this.mGet, this.u2, joParam)
		})

		it(TestShould.dsText({ dsPreparation: `Access channel2 once to register a dhLastConversion value` }), (d) => {
			const joParam: any = { idChannel: this.joParamMain.joChannel2.idChannel }
			TestUtil.customCall(d, RoutesEnum.channel, this.mGet, this.u2, joParam)
		})

		it(TestShould.dsText({ dsPreparation: `u2 converts content3 once to register a keyCtContentState value` }), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent3.idContent }
			TestUtil.customCall(d, RoutesEnum.content, this.mGet, this.u2, joParam)
		})

		it(TestShould.dsText({ dsPreparation: `u2 converts content2 once to register a keyCtContentState value` }), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent2.idContent }
			TestUtil.customCall(d, RoutesEnum.content, this.mGet, this.u2, joParam)
		})

		it(TestShould.dsText({ dsPreparation: `u1 notify content2 update` }), (d) => {
			const joParam: any = { idContent: this.joParamMain.joContent2.idContent, shNotifyUpdate:true }
			TestUtil.customCall(d, RoutesEnum.content, this.mPut, this.u, joParam)
		})

		this.evalSort("nmChannel", "nmChannel", (c1: any, c2: any) => {
			return c1["nmChannel"].localeCompare(c2["nmChannel"])
		})
		this.evalSort("dhPublish", "dhPublish", (c1: any, c2: any) => {
			return new Date(c2["dhPublish"]).getTime() - new Date(c1["dhPublish"]).getTime()
		})
		this.evalSort("keyCtContentState", "keyCtContentState", (c1: any, c2: any) => {
			return c2["keyCtContentState"] > c1["keyCtContentState"] ? -1 : 1
		})
		this.evalSort("dhLastConversion", "dhLastConversion", (c1: any, c2: any) => {
			return new Date(c2["dhLastConversion"]).getTime() - new Date(c1["dhLastConversion"]).getTime()
		})
	}

	private evalSort(nmProp: string, nmSort: string, mtSort: any) {
		it(TestShould.dsText({
			dsWhatsBeingTested: `${nmProp} sort`,
			dsCircumstances: `There's a dozen of contents registered`,
			dsExpected: `It to be sorted`
		}), (d) => {
			const joParam: any = {
				nmSort: nmSort,
				sbContentState:true,
				arIdChannel: [
					this.joParamMain.joChannel1.idChannel,
					this.joParamMain.joChannel2.idChannel,
					this.joParamMain.joChannel3.idChannel
				]
			}
			const customResponse = (res: Response) => {
				const arEntity: any[] = GeneralUtil.copy(res.body)
				const arEntityManuallySorted = arEntity.sort(mtSort)
				for (let i = 0; i < arEntity.length; i++) {
					if (res.body[i][nmProp] != arEntityManuallySorted[i][nmProp]) {
						throw Error(`Wrong sorting of ${nmProp}`)
					}
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, this.r, this.mGet, this.u2, joParam, joResult)
		})
	}

}
