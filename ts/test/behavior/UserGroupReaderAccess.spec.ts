import { TestRouteSpec } from "../support/TestRoute.spec";
import { Response } from "superagent";
import { TestShould, TestUserManager, TestUtil } from "../barrel/Barrel.spec";
import { TestEntity } from "../support/TestEntity.spec";
import { EnvTest } from "../support/EnvTest.spec";
import { RoutesEnum, CtUserGroupAccess, CtHttpStatus, CtExcep, StringUtil } from "salesfy-shared";
import { Group } from "app/modules/group/Group";
import { Channel } from "app/modules/channel/Channel";
import { Content } from "app/modules/content/Content";
import { UserGroup } from "app/modules/user_group/UserGroup";
import { ConnDao } from "app/structure/ConnDao";

export class UserGroupReaderAccess extends TestRouteSpec {

	public test() {
		describe(TestShould.dsText({ nmBehavior: "ContentChannelRteSpec" }), () => {
			describe(TestShould.dsText({ nmRoute: RoutesEnum.userGroup, dsText: "Reader access" }), () => {
				this.testUserGroupReaderAccess()
			})
			describe(TestShould.dsText({
				nmRoute: [RoutesEnum.content, RoutesEnum.contentChannel, RoutesEnum.channel].join(),
				dsText: "userGroup reader cannot interact with content, contentChannel nor channel. But he can see it"
			}), () => {
				this.testReaderInteractionWithContentAndChannel()
			})
			describe(TestShould.dsText({
				nmRoute: [RoutesEnum.userGroup, RoutesEnum.userNetwork].join(), dsText: "Reader access"
			}), () => {
				this.testUserGroupReaderNetwork()
			})
		})
	}

	private testUserGroupReaderNetwork() {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = {}
			done()
		})

		const customResponse1 = (res: Response) => { this.joParamMain.joGroup1 = res.body }
		const joCustom1 = () => {
			return { idWorkspace: EnvTest.getIdWorkspaceDefault() }
		}
		TestEntity.itReg(RoutesEnum.group, this.u, Group, customResponse1, joCustom1)

		it("It should register a new user", (done) => {
			const joRegisterParam = TestUserManager.genJoUser()
			TestUserManager.register(done, joRegisterParam, undefined, undefined)
		})

		const customResponse2 = (res: Response) => { this.joParamMain.joUserGroup1 = res.body }
		const joCustom2 = () => {
			return {
				idUser: TestUserManager.getNewUser().user.idUser,
				idGroup: this.joParamMain.joGroup1.idGroup,
				idCtUserGroupAccess: undefined
			}
		}
		TestEntity.itReg(RoutesEnum.userGroup, this.u, UserGroup, customResponse2, joCustom2)

		it(TestShould.dsText({
			dsWhatsBeingTested: `Can reader see someone in network?`,
			dsCircumstances: `U2 has only one group and is a reader in it`,
			dsExpected: `To see no one`
		}), (d) => {
			const joParam: any = {}
			const customResponse = (res: Response) => {
				const userNetwork = res.body
				if (userNetwork.length > 0) {
					throw Error(`User reader should've not been able to see other users through network`)
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.userNetwork, this.mGet, this.u2, joParam, joResult)
		})

		it(TestShould.dsText({
			dsPreparation: `Make u2 a member`
		}), (d) => {
			const joParam: any = {
				idUserGroup: this.joParamMain.joUserGroup1.idUserGroup,
				idCtUserGroupAccess: CtUserGroupAccess.member.key
			}
			TestUtil.customCall(d, RoutesEnum.userGroup, this.mPut, this.u, joParam)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Can reader see someone in network?`,
			dsCircumstances: `U2 has only one group and is a member in it`,
			dsExpected: `To see one user (the admin)`
		}), (d) => {
			const joParam: any = {}
			const customResponse = (res: Response) => {
				const userNetwork = res.body
				if (userNetwork.length != 1) {
					throw Error(`User reader should've not been able to see ONE user through network`)
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.userNetwork, this.mGet, this.u2, joParam, joResult)
		})

		// const customResponse3 = (res: Response) => { this.joParamMain.joGroup2 = res.body }
		// const joCustom3 = () => {
		// 	return { idWorkspace: EnvTest.getIdWorkspaceDefault() }
		// }
		// TestEntity.itReg(RoutesEnum.group, this.u, Group, customResponse3, joCustom3)

		// const customResponse4 = (res: Response) => { this.joParamMain.joUserGroup2 = res.body }
		// const joCustom4 = () => {
		// 	return {
		// 		idUser: TestUserManager.getNewUser().user.idUser,
		// 		idGroup: this.joParamMain.joGroup2.idGroup,
		// 		idCtUserGroupAccess: undefined
		// 	}
		// }
		// TestEntity.itReg(RoutesEnum.userGroup, this.u, UserGroup, customResponse4, joCustom4)
	}

	private testUserGroupReaderAccess() {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = {}
			done()
		})

		const customResponse1 = (res: Response) => { this.joParamMain.joGroup1 = res.body }
		const joCustom1 = () => {
			return { idWorkspace: EnvTest.getIdWorkspaceDefault() }
		}
		TestEntity.itReg(RoutesEnum.group, this.u, Group, customResponse1, joCustom1)

		const customResponse2 = (res: Response) => { this.joParamMain.joUserGroup2 = res.body }
		const joCustom2 = () => {
			return {
				idUser: TestUserManager.getNewUser().user.idUser,
				idGroup: this.joParamMain.joGroup1.idGroup,
				idCtUserGroupAccess: undefined
			}
		}
		TestEntity.itReg(RoutesEnum.userGroup, this.u, UserGroup, customResponse2, joCustom2)

		it(TestShould.dsText({
			dsWhatsBeingTested: `Is user added as reader when no specification is made?`,
			dsCircumstances: `The group admin did not tell anything`,
			dsExpected: `The u2 must be a reader`
		}), (d) => {
			const joParam: any = { idUserGroup: this.joParamMain.joUserGroup2.idUserGroup }
			const customResponse = (res: Response) => {
				const userGroup = res.body[0]
				if (userGroup.idCtUserGroupAccess != CtUserGroupAccess.reader.key) {
					throw Error(`User is with a wrong group access: ${userGroup.idCtUserGroupAccess}`)
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.userGroup, this.mGet, this.u2, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Can user reader remove himself from the group?`,
			dsCircumstances: `User 2 is the reader`,
			dsExpected: `User 2 can remove himself from the group`
		}), (d) => {
			const joParam: any = { idUserGroup: this.joParamMain.joUserGroup2.idUserGroup }
			TestUtil.customCall(d, RoutesEnum.userGroup, this.mDel, this.u2, joParam)
		})

		const customResponse3 = (res: Response) => { this.joParamMain.joUserGroup3 = res.body }
		const joCustom3 = () => {
			return {
				idUser: TestUserManager.getNewUser().user.idUser,
				idGroup: this.joParamMain.joGroup1.idGroup,
				idCtUserGroupAccess: CtUserGroupAccess.reader.key
			}
		}
		TestEntity.itReg(RoutesEnum.userGroup, this.u, UserGroup, customResponse3, joCustom3)

		it(TestShould.dsText({
			dsWhatsBeingTested: `Can admin add someone specifically telling he is a reader?`,
			dsCircumstances: `The group admin told he is a reader before. This is the verification`,
			dsExpected: `The u2 must be a reader`
		}), (d) => {
			const joParam: any = { idUserGroup: this.joParamMain.joUserGroup3.idUserGroup }
			const customResponse = (res: Response) => {
				const userGroup = res.body[0]
				if (userGroup.idCtUserGroupAccess != CtUserGroupAccess.reader.key) {
					throw Error(`User is with a wrong group access: ${userGroup.idCtUserGroupAccess}`)
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.userGroup, this.mGet, this.u, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `The reader tries to change his access`,
			dsCircumstances: `The u2 is reader`,
			dsExpected: `u2 cannot change his access`
		}), (d) => {
			const joParam: any = {
				idUserGroup: this.joParamMain.joUserGroup3.idUserGroup,
				idCtUserGroupAccess: CtUserGroupAccess.member.key
			}
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus: CtExcep.userNotAuthorized.nmMsg
			}
			TestUtil.customCall(d, RoutesEnum.userGroup, this.mPut, this.u2, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `The admin tries to change u2's access`,
			dsCircumstances: `The u2 is reader`,
			dsExpected: `admin can change u2's access`
		}), (d) => {
			const joParam: any = {
				idUserGroup: this.joParamMain.joUserGroup3.idUserGroup,
				idCtUserGroupAccess: CtUserGroupAccess.member.key
			}
			TestUtil.customCall(d, RoutesEnum.userGroup, this.mPut, this.u, joParam)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `The reader put himself into reading access again`,
			dsCircumstances: `The u2 is a member`,
			dsExpected: `u2 can change u2's access`
		}), (d) => {
			const joParam: any = {
				idUserGroup: this.joParamMain.joUserGroup3.idUserGroup,
				idCtUserGroupAccess: CtUserGroupAccess.reader.key
			}
			TestUtil.customCall(d, RoutesEnum.userGroup, this.mPut, this.u2, joParam)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `U2 cant see the other members of the group`,
			dsCircumstances: `The u2 is a reader`,
			dsExpected: `To bring only the u2`
		}), (d) => {
			const joParam: any = { idGroup: this.joParamMain.joUserGroup3.idGroup }
			const customResponse = (res: Response) => {
				const arUserGroup = res.body
				if (arUserGroup.length > 1 || arUserGroup[0].idUser != TestUserManager.getNewUser().user.idUser) {
					throw Error(`A reader user is currently being able to see the other members of the group. He shouldn't`)
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.userGroup, this.mGet, this.u2, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `admin can see all the userGroup`,
			dsCircumstances: `There's the reader and the admin`,
			dsExpected: `To bring the two userGroup`
		}), (d) => {
			const joParam: any = { idGroup: this.joParamMain.joUserGroup3.idGroup }
			const customResponse = (res: Response) => {
				const arUserGroup = res.body
				if (arUserGroup.length != 2) {
					throw Error(`The admin should've seen the two users`)
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.userGroup, this.mGet, this.u, joParam, joResult)
		})
	}

	public testReaderInteractionWithContentAndChannel() {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = {}
			done()
		})

		const customResponse1 = (res: Response) => { this.joParamMain.joGroup1 = res.body }
		const joCustom1 = () => {
			return { idWorkspace: EnvTest.getIdWorkspaceDefault() }
		}
		TestEntity.itReg(RoutesEnum.group, this.u, Group, customResponse1, joCustom1)

		const customResponse2 = (res: Response) => { this.joParamMain.joChannel1 = res.body }
		const joCustom2 = () => {
			return { isPlaybook: true }
		}
		TestEntity.itReg(RoutesEnum.channel, this.u, Channel, customResponse2, joCustom2)

		const customResponse3 = (res: Response) => { this.joParamMain.joChannelGroup1 = res.body }
		const joCustom3 = () => {
			return {
				idGroup: this.joParamMain.joGroup1.idGroup,
				idChannel: this.joParamMain.joChannel1.idChannel
			}
		}
		TestEntity.itReg(RoutesEnum.channelGroup, this.u, Content, customResponse3, joCustom3)

		const customResponse4 = (res: Response) => { this.joParamMain.joContent1 = res.body }
		const joCustom4 = () => {
			return { arIdChannel: [this.joParamMain.joChannel1.idChannel], isPlaybook: true }
		}
		TestEntity.itReg(RoutesEnum.content, this.u, Content, customResponse4, joCustom4)

		const customResponse5 = (res: Response) => { this.joParamMain.joUserGroup2 = res.body }
		const joCustom5 = () => {
			return {
				idUser: TestUserManager.getNewUser().user.idUser,
				idGroup: this.joParamMain.joGroup1.idGroup,
				idCtUserGroupAccess: CtUserGroupAccess.reader.key
			}
		}
		TestEntity.itReg(RoutesEnum.userGroup, this.u, UserGroup, customResponse5, joCustom5)

		it(TestShould.dsText({
			dsWhatsBeingTested: `User reader cannot post+link a content to the channel`,
			dsCircumstances: `User 2 is the reader`,
			dsExpected: `User 2 cant link`
		}), (d) => {
			const joParam = TestEntity.gen(Content, { arIdChannel: [this.joParamMain.joChannel1.idChannel], isPlaybook: true })
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus: CtExcep.userNotAuthorized.nmMsg
			}
			TestUtil.customCall(d, RoutesEnum.content, this.mPost, this.u2, joParam, joResult)
		})

		it(TestShould.dsText({
			dsPreparation: `Admin changes the authorization of u2 from reader to memeber`,
		}), (d) => {
			const joParam = {
				idUserGroup: this.joParamMain.joUserGroup2.idUserGroup,
				idCtUserGroupAccess: CtUserGroupAccess.member.key
			}
			TestUtil.customCall(d, RoutesEnum.userGroup, this.mPut, this.u, joParam)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `User member can post+link a content to the channel`,
			dsCircumstances: `User 2 is the member`,
			dsExpected: `User 2 can link`
		}), (d) => {
			const joParam = TestEntity.gen(Content, { arIdChannel: [this.joParamMain.joChannel1.idChannel], isPlaybook: true })
			TestUtil.customCall(d, RoutesEnum.content, this.mPost, this.u2, joParam)
		})

		it(TestShould.dsText({
			dsPreparation: `Admin changes the authorization of u2 from member to reader`,
		}), (d) => {
			const joParam = {
				idUserGroup: this.joParamMain.joUserGroup2.idUserGroup,
				idCtUserGroupAccess: CtUserGroupAccess.reader.key
			}
			TestUtil.customCall(d, RoutesEnum.userGroup, this.mPut, this.u, joParam)
		})

		it("It should query the contentChannel record", (done) => {
			const query =
				`select idContentChannel as \"idContentChannel\", idContent as \"idContent\",
				idChannel as \"idChannel\", vlSort as \"vlSort\"
			from contentChannel cch
				where idContent = ${this.joParamMain.joContent1.idContent}
				and idChannel = ${this.joParamMain.joChannel1.idChannel}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					const joContentChannelDb = result[0][0]
					if (joContentChannelDb == undefined) {
						throw Error("contentChannel not found")
					}
					this.joParamMain.joContentChannel1 = joContentChannelDb
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `User reader cant change the link of a content/channel`,
			dsCircumstances: `User 2 is the reader`,
			dsExpected: `User 2 cant change the link`
		}), (d) => {
			const joParam = {
				idContentChannel: this.joParamMain.joContentChannel1.idContentChannel,
				vlSort: 999
			}
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus: CtExcep.userNotAuthorized.nmMsg
			}
			TestUtil.customCall(d, RoutesEnum.contentChannel, this.mPut, this.u2, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `User reader cant delete the link of a content/channel`,
			dsCircumstances: `User 2 is the reader`,
			dsExpected: `User 2 cant unlink`
		}), (d) => {
			const joParam = {
				idContentChannel: this.joParamMain.joContentChannel1.idContentChannel
			}
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus: CtExcep.userNotAuthorized.nmMsg
			}
			TestUtil.customCall(d, RoutesEnum.contentChannel, this.mDel, this.u2, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `User reader cant update the name of the content`,
			dsCircumstances: `User 2 is the reader`,
			dsExpected: `User 2 cant update content itself`
		}), (d) => {
			const joParam = {
				idContent: this.joParamMain.joContent1.idContent,
				nmContent: StringUtil.random()
			}
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus: CtExcep.userNotAuthorized.nmMsg
			}
			TestUtil.customCall(d, RoutesEnum.content, this.mPut, this.u2, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `User reader cant update the name of the channel`,
			dsCircumstances: `User 2 is the reader`,
			dsExpected: `User 2 cant update channel itself`
		}), (d) => {
			const joParam = {
				idChannel: this.joParamMain.joChannel1.idChannel,
				nmChannel: StringUtil.random()
			}
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus: CtExcep.userNotAuthorized.nmMsg
			}
			TestUtil.customCall(d, RoutesEnum.channel, this.mPut, this.u2, joParam, joResult)
		})
	}
}
