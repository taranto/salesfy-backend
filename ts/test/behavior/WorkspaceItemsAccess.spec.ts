import { TestRouteSpec } from "../support/TestRoute.spec";
import { TestShould, TestUtil, should, TestUserManager, TestCaseItem } from "../barrel/Barrel.spec";
import { TestEntity } from "../support/TestEntity.spec";
import { RoutesEnum, CtUserGroupAccess } from "salesfy-shared";
import { TestUserBox } from "../support/TestUserBox.spec";
import { Workspace } from "app/modules/workspace/Workspace";
import { Response } from "supertest";
import { EnvTest } from "../support/EnvTest.spec";
import { Group } from "app/modules/group/Group";
import { Channel } from "app/modules/channel/Channel";
import { Content } from "app/modules/content/Content";

export class WorkspaceItemsAccess extends TestRouteSpec {

	public test() {
		describe(TestShould.dsText({ nmBehavior: "WorkspaceItemsAccess" }), () => {
			describe(TestShould.dsText({
				nmRoute:
					[RoutesEnum.workspace, RoutesEnum.group, RoutesEnum.userGroup, RoutesEnum.channel, RoutesEnum.content].join()
			}), () => {
				this.testWorkspace()
			})
		})
	}

	private testWorkspace() {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = {}
			done()
		})

		it(TestShould.dsText({ dsPreparation: `post test workspace` }), (d) => {
			const joCustom = {
				idUserResponsible: TestUserBox.getUser(0).user.idUser,
				b64PiWorkspace: EnvTest.getB64Image()
			}
			const customResponse = (res: Response) => {
				this.joParamMain.joWorkspace = res.body
			}
			TestEntity.reg(d, RoutesEnum.workspace, TestUserBox.getAdmin(), Workspace, customResponse, joCustom)
		})

		it(TestShould.dsText({ dsPreparation: `post external workspace` }), (d) => {
			const joCustom = {
				idUserResponsible: TestUserBox.getAdmin().user.idUser,
				b64PiWorkspace: EnvTest.getB64Image()
			}
			const customResponse = (res: Response) => {
				this.joParamMain.joWorkspaceExternal = res.body
			}
			TestEntity.reg(d, RoutesEnum.workspace, TestUserBox.getAdmin(), Workspace, customResponse, joCustom)
		})

		it(TestShould.dsText({ dsPreparation: `get test group` }), (d) => {
			const joParam = { idWorkspace: this.joParamMain.joWorkspace.idWorkspace }
			const customResponse = (res: Response) => {
				this.joParamMain.joGroup = res.body[0]
				should().equal(1, res.body.length)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.group, this.mGet, TestUserBox.getAdmin(), joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Workspace access`,
			dsCircumstances: `U0 is in it. U1 is not`,
			dsExpected: `u0 to find`
		}), (d) => {
			const joParam = { idWorkspace: this.joParamMain.joWorkspace.idWorkspace }
			const customResponse = (res: Response) => {
				const joWorkspace = res.body[0]
				should().equal(joWorkspace.nmWorkspace, this.joParamMain.joWorkspace.nmWorkspace)
				should().equal(1, res.body.length)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.workspace, this.mGet, TestUserBox.getUser(0), joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Workspace access`,
			dsCircumstances: `U0 is in it. U1 is not`,
			dsExpected: `u1 NOT to find`
		}), (d) => {
			const joParam = { idWorkspace: this.joParamMain.joWorkspace.idWorkspace }
			const customResponse = (res: Response) => {
				should().equal(0, res.body.length)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.workspace, this.mGet, TestUserBox.getUser(1), joParam, joResult)
		})

		it(TestShould.dsText({
			dsPreparation: `adds an extra external group to help testing (by making errors) the idWorkspace filtering` +
				`(with the external workspace)`
		}), (d) => {
			const customResponse = (res: Response) => {
				this.joParamMain.joGroupExternal = res.body
			}
			const joCustom = { idWorkspace: this.joParamMain.joWorkspaceExternal.idWorkspace }
			TestEntity.reg(d, RoutesEnum.group, TestUserBox.getAdmin(), Group, customResponse, joCustom)
		})

		it(TestShould.dsText({ dsPreparation: `add u0 in this extra external group` }), (d) => {
			const customResponse = (res: Response) => {
				this.joParamMain.joUserGroupExternal0 = res.body
			}
			const joParam = {
				idGroup: this.joParamMain.joGroupExternal.idGroup,
				idUser: TestUserBox.getUser(0).user.idUser,
				idCtUserGroupAccess : CtUserGroupAccess.member.key
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.userGroup, this.mPost, TestUserBox.getAdmin(), joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: `add u1 in this extra external group` }), (d) => {
			const customResponse = (res: Response) => {
				this.joParamMain.joUserGroupExternal1 = res.body
			}
			const joParam = {
				idGroup: this.joParamMain.joGroupExternal.idGroup,
				idUser: TestUserBox.getUser(1).user.idUser,
				idCtUserGroupAccess : CtUserGroupAccess.member.key
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.userGroup, this.mPost, TestUserBox.getAdmin(), joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `U1 tries to get the test group, idWorkspace filtered`,
			dsCircumstances: `U1 is not in the test group`,
			dsExpected: `fail`
		}), (d) => {
			const customResponse = (res: Response) => {
				should().equal(0, res.body.length)
			}
			const joParam = {
				idWorkspace: this.joParamMain.joWorkspace.idWorkspace
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.group, this.mGet, TestUserBox.getUser(1), joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `U0 tries to get the test group, idWorkspace filtered`,
			dsCircumstances: `U0 is in the test group`,
			dsExpected: `success`
		}), (d) => {
			const customResponse = (res: Response) => {
				should().equal(1, res.body.length)
			}
			const joParam = {
				idWorkspace: this.joParamMain.joWorkspace.idWorkspace
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.group, this.mGet, TestUserBox.getUser(0), joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `U0 tries to get the test user group, idWorkspace filtered`,
			dsCircumstances: `U0 is in the test user group`,
			dsExpected: `to get a list of two users (himself and the admin)`
		}), (d) => {
			const customResponse = (res: Response) => {
				should().equal(2, res.body.length)
			}
			const joParam = {
				idWorkspace: this.joParamMain.joWorkspace.idWorkspace
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.userGroup, this.mGet, TestUserBox.getUser(0), joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `U1 tries to get the test user group, idWorkspace filtered`,
			dsCircumstances: `U1 is not in the test user group`,
			dsExpected: `fail`
		}), (d) => {
			const customResponse = (res: Response) => {
				should().equal(0, res.body.length)
			}
			const joParam = {
				idWorkspace: this.joParamMain.joWorkspace.idWorkspace
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.userGroup, this.mGet, TestUserBox.getUser(1), joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: `U0 adds U1 to the test group` }), (d) => {
			const customResponse = (res: Response) => {
				this.joParamMain.joUserGroup1 = res.body
			}
			const joParam = {
				idGroup: this.joParamMain.joGroup.idGroup,
				idUser: TestUserBox.getUser(1).user.idUser,
				idCtUserGroupAccess : CtUserGroupAccess.member.key
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.userGroup, this.mPost, TestUserBox.getUser(0), joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `U1 tries to get the test user group, idWorkspace filtered`,
			dsCircumstances: `U1 is in the test user group`,
			dsExpected: `to get a list of three users (U0, U1, and the admin)`
		}), (d) => {
			const customResponse = (res: Response) => {
				should().equal(3, res.body.length)
			}
			const joParam = {
				idWorkspace: this.joParamMain.joWorkspace.idWorkspace
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.userGroup, this.mGet, TestUserBox.getUser(1), joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: `add u2 to test if it doesnt exists` }), (d) => {
			if (TestUserBox.getUser(2) == undefined) {
				const joUser = TestUserManager.genJoUser()
				TestUserManager.register(d, joUser, undefined, 2, TestUserBox.getAdmin())
			} else {
				d()
			}
		})

		it(TestShould.dsText({ dsPreparation: `add u2 in the extra external group` }), (d) => {
			const customResponse = (res: Response) => {
				this.joParamMain.joUserGroup1 = res.body
			}
			const joParam = {
				idGroup: this.joParamMain.joGroupExternal.idGroup,
				idUser: TestUserBox.getUser(2).user.idUser
			}
			const a = this.joParamMain
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.userGroup, this.mPost, TestUserBox.getAdmin(), joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `U1 tries to get the user network, NOT idWorkspace filtered`,
			dsCircumstances: `Bring all`,
			dsExpected: `to get at least the users (U0, U2, and the admin)`
		}), (d) => {
			const customResponse = (res: Response) => {
				const arIdUserDesired: any = [
					TestUserBox.getUser(0).user.idUser,
					TestUserBox.getUser(2).user.idUser,
					TestUserBox.getAdmin().user.idUser
				]
				const arJoUser: any[] = res.body
				let i = 0
				arJoUser.forEach((joUser: any) => {
					const idUser = joUser.idUser
					if (arIdUserDesired.includes(idUser)) {
						i++
					}
				})
				should().equal(i, arIdUserDesired.length)
			}
			const joParam = {}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.userNetwork, this.mGet, TestUserBox.getUser(1), joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `U1 tries to get the user network, idWorkspace filtered`,
			dsCircumstances: `idWorkspace filtered`,
			dsExpected: `to get a list of three users (U0, and the admin). U2 should not be there`
		}), (d) => {
			const customResponse = (res: Response) => {
				const arIdUserDesired: any = [
					TestUserBox.getUser(0).user.idUser,
					TestUserBox.getAdmin().user.idUser
				]
				const arJoUser: any[] = res.body
				let i = 0
				arJoUser.forEach((joUser: any) => {
					const idUser = joUser.idUser
					if (arIdUserDesired.includes(idUser)) {
						i++
					}
				})
				should().equal(i, arIdUserDesired.length)
			}
			const joParam = {
				idWorkspace: this.joParamMain.joWorkspace.idWorkspace
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.userNetwork, this.mGet, TestUserBox.getUser(1), joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: `Register the test channel` }), (d) => {
			const customResponse = (res: Response) => {
				this.joParamMain.joChannel = res.body
			}
			TestEntity.reg(d, RoutesEnum.channel, TestUserBox.getAdmin(), Channel, customResponse, { isPlaybook: true })
		})

		it(TestShould.dsText({ dsPreparation: `Register the channel external` }), (d) => {
			const customResponse = (res: Response) => {
				this.joParamMain.joChannelExternal = res.body
			}
			TestEntity.reg(d, RoutesEnum.channel, TestUserBox.getAdmin(), Channel, customResponse, { isPlaybook: true })
		})

		it(TestShould.dsText({ dsPreparation: `Register the channel to the test group` }), (d) => {
			const customResponse = (res: Response) => {
				this.joParamMain.joChannelGroup = res.body
			}
			const joParam = {
				idChannel: this.joParamMain.joChannel.idChannel,
				idGroup: this.joParamMain.joGroup.idGroup
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.channelGroup, this.mPost, TestUserBox.getAdmin(), joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: `Register the channel to the external group` }), (d) => {
			const customResponse = (res: Response) => {
				this.joParamMain.joChannelGroupExternal = res.body
			}
			const joParam = {
				idChannel: this.joParamMain.joChannelExternal.idChannel,
				idGroup: this.joParamMain.joGroupExternal.idGroup
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.channelGroup, this.mPost, TestUserBox.getAdmin(), joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Channel filtering`,
			dsCircumstances: `bring all`,
			dsExpected: `to find test channel and external channel`
		}), (d) => {
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOneAmong(res, this.joParamMain.joChannel, "idChannel")
				TestCaseItem.evalIsTheOneAmong(res, this.joParamMain.joChannelExternal, "idChannel")
			}
			const joParam = {}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.channel, this.mGet, TestUserBox.getUser(0), joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Channel filtering`,
			dsCircumstances: `to filter by externalworkspace`,
			dsExpected: `to find external channel but not find test channel`
		}), (d) => {
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOneAmong(res, this.joParamMain.joChannelExternal, "idChannel")
				TestCaseItem.evalIsNotTheOneAmong(res, this.joParamMain.joChannel, "idChannel")
			}
			const joParam = {
				idWorkspace: this.joParamMain.joWorkspaceExternal.idWorkspace
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.channel, this.mGet, TestUserBox.getUser(0), joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Channel filtering`,
			dsCircumstances: `to filter by test workspace`,
			dsExpected: `to find test channel but not find external channel`
		}), (d) => {
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOneAmong(res, this.joParamMain.joChannel, "idChannel")
				TestCaseItem.evalIsNotTheOneAmong(res, this.joParamMain.joChannelExternal, "idChannel")
			}
			const joParam = {
				idWorkspace: this.joParamMain.joWorkspace.idWorkspace
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.channel, this.mGet, TestUserBox.getUser(0), joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: `Register the test content` }), (d) => {
			const customResponse = (res: Response) => {
				this.joParamMain.joContent = res.body
			}
			TestEntity.reg(d, RoutesEnum.content, TestUserBox.getAdmin(), Content, customResponse, { isPlaybook: true })
		})

		it(TestShould.dsText({ dsPreparation: `Register the external content` }), (d) => {
			const customResponse = (res: Response) => {
				this.joParamMain.joContentExternal = res.body
			}
			TestEntity.reg(d, RoutesEnum.content, TestUserBox.getAdmin(), Content, customResponse, { isPlaybook: true })
		})

		it(TestShould.dsText({ dsPreparation: `Register the test content to the test channel` }), (d) => {
			const customResponse = (res: Response) => {
				this.joParamMain.joContentChannel = res.body
			}
			const joParam = {
				idChannel: this.joParamMain.joChannel.idChannel,
				idContent: this.joParamMain.joContent.idContent
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.contentChannel, this.mPost, TestUserBox.getAdmin(), joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: `Register the external content to the external channel` }), (d) => {
			const customResponse = (res: Response) => {
				this.joParamMain.joContentChannel = res.body
			}
			const joParam = {
				idChannel: this.joParamMain.joChannelExternal.idChannel,
				idContent: this.joParamMain.joContentExternal.idContent
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.contentChannel, this.mPost, TestUserBox.getAdmin(), joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Content filtering`,
			dsCircumstances: `bring all`,
			dsExpected: `to find test content and external content`
		}), (d) => {
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOneAmong(res, this.joParamMain.joContent, "idContent")
				TestCaseItem.evalIsTheOneAmong(res, this.joParamMain.joContentExternal, "idContent")
			}
			const joParam = {
				arIdContent: [
					this.joParamMain.joContent.idContent,
					this.joParamMain.joContentExternal.idContent
				]
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.content, this.mGet, TestUserBox.getUser(0), joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Content filtering`,
			dsCircumstances: `to filter by external workspace`,
			dsExpected: `to find external content but not find test content`
		}), (d) => {
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsNotTheOneAmong(res, this.joParamMain.joContent, "idContent")
				TestCaseItem.evalIsTheOneAmong(res, this.joParamMain.joContentExternal, "idContent")
			}
			const joParam = {
				idWorkspace: this.joParamMain.joWorkspaceExternal.idWorkspace,
				arIdContent: [
					this.joParamMain.joContent.idContent,
					this.joParamMain.joContentExternal.idContent
				]
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.content, this.mGet, TestUserBox.getUser(0), joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Content filtering`,
			dsCircumstances: `to filter by test workspace`,
			dsExpected: `to find test content but not find external content`
		}), (d) => {
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOneAmong(res, this.joParamMain.joContent, "idContent")
				TestCaseItem.evalIsNotTheOneAmong(res, this.joParamMain.joContentExternal, "idContent")
			}
			const joParam = {
				idWorkspace: this.joParamMain.joWorkspace.idWorkspace,
				arIdContent: [
					this.joParamMain.joContent.idContent,
					this.joParamMain.joContentExternal.idContent
				]
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.content, this.mGet, TestUserBox.getUser(0), joParam, joResult)
		})

	}
}
