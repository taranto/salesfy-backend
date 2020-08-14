import { SConst, RoutesEnum, DateUtil, StringUtil, CtHttpStatus, JsonUtil, NumberUtil, CtExcep, CtUserGroupAccess } from "salesfy-shared";
import { TestUtil, TestUserManager, supertest, Env } from "../../barrel/Barrel.spec";
import { TestCaseItem, TestShould } from "../../barrel/Barrel.spec";
import { LayerDao } from "app/layers_template/LayerDao";
import { Response } from "superagent";
import { ChannelDao } from "app/modules/channel/ChannelDao";
import { KeyEnum } from "salesfy-shared";
import { ConnDao } from "app/structure/ConnDao";
import { Channel } from "app/modules/channel/Channel";
import { TestEntity } from "../../support/TestEntity.spec";
import { Content } from "app/modules/content/Content";
import { Group } from "app/modules/group/Group";
import { EnvTest } from "../../support/EnvTest.spec";

export class ChannelFuncRteSpec {

	public static test() {
		describe(TestShould.dsText({ nmRoute: RoutesEnum.channel, dsText: "Functions" }), () => {
			describe(TestShould.dsText({ nmRoute: RoutesEnum.channelCopy, nmMethod: SConst.HTTP_METHOD_POST + "" }), () => {
				ChannelFuncRteSpec.testChannelCopy()
			})
			describe(TestShould.dsText(
				{ nmRoute: RoutesEnum.channelImport, nmMethod: SConst.HTTP_METHOD_POST + "" }), () => {
					ChannelFuncRteSpec.testChannelImport()
				})
		})
	}

	private static testChannelImport() {
		const r = RoutesEnum.channelImport
		const mPost = SConst.HTTP_METHOD_POST
		const mGet = SConst.HTTP_METHOD_GET
		const uA = SConst.TEST_ROLE_NORMAL_USER
		const joParamMain: any = {}

		it(TestShould.exist(), (done) => {
			TestCaseItem.callEvalExistence(done, r, mPost)
		})

		it(TestShould.acceptBothTokens(), (done) => {
			TestCaseItem.callEvalAcceptBothTokens(done, r, mPost, uA)
		})

		it(TestShould.failNoTokens(), (done) => {
			TestCaseItem.callEvalFailNoTokens(done, r, mPost)
		})

		it(TestShould.dsText({
			dsPreparation: "Post channel A"
		}), (done) => {
			const joParam = TestEntity.gen(Channel, { isPlaybook: true })
			const customResponse = (res: Response) => {
				joParamMain.joChannelA = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.channel, mPost, uA, joParam, joResult)
		})

		it.skip(TestShould.dsText({ //WE DONT DO LIKE THIS ANYMORE
			dsWhatsBeingTested: "send token and a specific folder of drive",
			dsCircumstances: "user has just logged drive in",
			dsExpected: "200. there will be a need to retrieve the contents in the next test to verify"
		}), (done) => {
			const joParam = {
				idChannel: joParamMain.joChannelA.idChannel,
				//tslint:disable
				joToken: ""
				//tslint:enable
				,
				arIdFile: [
					, '1mXc9ka856Oa2U5GYsHAaSFXbK1k8I4fCuouSH6UD8kA'
					, '1mXc9ka856Oa2U5GYsHAaSFXbK1k8I4fCuouSH6UD8kA'
					, '1mXc9ka856Oa2U5GYsHAaSFXbK1k8I4fCuouSH6UD8kA'
					, '1mXc9ka856Oa2U5GYsHAaSFXbK1k8I4fCuouSH6UD8kA'
					, '1mXc9ka856Oa2U5GYsHAaSFXbK1k8I4fCuouSH6UD8kA'
					, '1mXc9ka856Oa2U5GYsHAaSFXbK1k8I4fCuouSH6UD8kA'
					, '1mXc9ka856Oa2U5GYsHAaSFXbK1k8I4fCuouSH6UD8kA'
					, '1mXc9ka856Oa2U5GYsHAaSFXbK1k8I4fCuouSH6UD8kA'
					, '1mXc9ka856Oa2U5GYsHAaSFXbK1k8I4fCuouSH6UD8kA'
					, '1mXc9ka856Oa2U5GYsHAaSFXbK1k8I4fCuouSH6UD8kA'
					, '1mXc9ka856Oa2U5GYsHAaSFXbK1k8I4fCuouSH6UD8kA'
					, '1mXc9ka856Oa2U5GYsHAaSFXbK1k8I4fCuouSH6UD8kA'
					, '1mXc9ka856Oa2U5GYsHAaSFXbK1k8I4fCuouSH6UD8kA'
					, '1mXc9ka856Oa2U5GYsHAaSFXbK1k8I4fCuouSH6UD8kA'
					, '1mXc9ka856Oa2U5GYsHAaSFXbK1k8I4fCuouSH6UD8kA'
					, '1mXc9ka856Oa2U5GYsHAaSFXbK1k8I4fCuouSH6UD8kA'
					, '1mXc9ka856Oa2U5GYsHAaSFXbK1k8I4fCuouSH6UD8kA'
					, '1mXc9ka856Oa2U5GYsHAaSFXbK1k8I4fCuouSH6UD8kA'
					, '1mXc9ka856Oa2U5GYsHAaSFXbK1k8I4fCuouSH6UD8kA'
					, '1mXc9ka856Oa2U5GYsHAaSFXbK1k8I4fCuouSH6UD8kA'
					, '1mXc9ka856Oa2U5GYsHAaSFXbK1k8I4fCuouSH6UD8kA'
					, '1mXc9ka856Oa2U5GYsHAaSFXbK1k8I4fCuouSH6UD8kA'
					, '1mXc9ka856Oa2U5GYsHAaSFXbK1k8I4fCuouSH6UD8kA'
					, '1mXc9ka856Oa2U5GYsHAaSFXbK1k8I4fCuouSH6UD8kA'
					, '1mXc9ka856Oa2U5GYsHAaSFXbK1k8I4fCuouSH6UD8kA']
			}
			const customResponse = (res: Response) => {
				joParamMain.joChannelA = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.channelImport, mPost, uA, joParam, joResult)
		})

		const arJoFile = [
			{ name: "a", iconLink: "b", mimeType: "c", webViewLink: "www.google.com" },
			{ name: "a", iconLink: "b", mimeType: "c", webViewLink: "www.google.com" },
			{ name: "a", iconLink: "b", mimeType: "c", webViewLink: "www.google.com" }
		]

		it(TestShould.dsText({
			dsWhatsBeingTested: "send some specific file data from drive",
			dsCircumstances: "user has just retrieved data from drive and has sent to the backend",
			dsExpected: "200. there will be a need to retrieve the contents in the next test to verify"
		}), (done) => {
			const joParam = {
				idChannel: joParamMain.joChannelA.idChannel,
				arJoFile: arJoFile
			}
			TestUtil.customCall(done, RoutesEnum.channelImport, mPost, uA, joParam)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: "verify the presence of the content data in the channel",
			dsCircumstances: "user has just integrated data from drive",
			dsExpected: "200. it is expected to find the contents just inserted"
		}), (done) => {
			const joParam = {
				idChannel: joParamMain.joChannelA.idChannel,
			}
			const customResponse = (res: Response) => {
				if (res.body.length != arJoFile.length) {
					done("Wrong content counting in channel")
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.content, mGet, uA, joParam, joResult)
		})
	}

	private static testChannelCopy() {
		const r = RoutesEnum.channelCopy
		const mPost = SConst.HTTP_METHOD_POST
		const mGet = SConst.HTTP_METHOD_GET
		const uA = SConst.TEST_ROLE_NORMAL_USER
		const uB = SConst.TEST_ROLE_NEW_USER
		const joParamMain: any = {}

		it(TestShould.exist(), (done) => {
			TestCaseItem.callEvalExistence(done, r, mPost)
		})

		it(TestShould.acceptBothTokens(), (done) => {
			TestCaseItem.callEvalAcceptBothTokens(done, r, mPost, uA)
		})

		it(TestShould.failNoTokens(), (done) => {
			TestCaseItem.callEvalFailNoTokens(done, r, mPost)
		})

		it(TestShould.dsText({ dsPreparation: "Post channel A" }), (done) => {
			const joParam = TestEntity.gen(Channel, { isPlaybook: true })
			const customResponse = (res: Response) => {
				joParamMain.joChannelA = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.channel, mPost, uA, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: "copy channel A by user B shouldn't work",
			dsCircumstances: "user B has NO access in a group of channel A", dsExpected: "status 400"
		}), (done) => {
			const joParam = { idChannel: joParamMain.joChannelA.idChannel }
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus: CtExcep.userNotAuthorized.nmMsg
			}
			TestUtil.customCall(done, RoutesEnum.channelCopy, mPost, uB, joParam, joResult)
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

		it(TestShould.dsText({ dsPreparation: "Mark content A1 as viewed" }), (done) => {
			const joParam = {
				idContent: joParamMain.joContentA1.idContent
			}
			TestUtil.customCall(done, RoutesEnum.content, mGet, uA, joParam)
		})
		it(TestShould.dsText({ dsPreparation: "Mark content A1 as converted" }), (done) => {
			const joParam = {
				idContent: joParamMain.joContentA1.idContent
			}
			TestUtil.customCall(done, RoutesEnum.contentConversion, mGet, uA, joParam)
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
			dsWhatsBeingTested: "copy channel A by user B",
			dsCircumstances: "user B has access in a group of channel A", dsExpected: "status 200"
		}), (done) => {
			const joParam = { idChannel: joParamMain.joChannelA.idChannel }
			const customResponse = (res: Response) => {
				joParamMain.joChannelB = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.channelCopy, mPost, uB, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: "channel copy", dsCircumstances: "1 channel A will be copied",
			dsExpected: "should bring back channel B with the same attributes of A, only with some differences"
		}), (done) => {
			const joChannelA = joParamMain.joChannelA
			const joChannelB = joParamMain.joChannelB
			const arNmFieldCompare = ["nmChannel", "piChannel", "dsChannel", "isPlaybook"]
			const isSameJo = JsonUtil.isSameJoKeys(joChannelA, joChannelB, true, ...arNmFieldCompare)
			if (!isSameJo) {
				done("The channel copied resulted differently from the original")
			}
			if (joChannelA.qtConversion != joChannelB.qtConversion) {
				done("The channel copied should've resulted in a zero conversion")
			}
			const user = TestUserManager.getNewUser().loggedUser.user
			if (joChannelB.idPublisher != user.idUser) {
				done("The channel copied should've resulted in user B as publisher")
			}

			if (!joChannelB.isPlaybook) {
				done("The channel copied should've resulted in isPlaybook = true")
			}
			done()
		})

		it(TestShould.dsText({ dsPreparation: "get contents from channel B" }), (done) => {
			const joParam = { idChannel: joParamMain.joChannelB.idChannel }
			const customResponse = (res: Response) => {
				joParamMain.joChannelB.arJoContent = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.content, mGet, uB, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: "contents of the channel copied", dsCircumstances: "contents are NOT changed",
			dsExpected: "the contents should be equals in the basic data. Resetted at others"
		}), (done) => {
			const joContentA = joParamMain.joContentA1
			const joContentB = joParamMain.joContentA2
			const joContentC = joParamMain.joChannelB.arJoContent[0]
			const joContentD = joParamMain.joChannelB.arJoContent[1]
			if (joParamMain.joChannelB.arJoContent.length != 2) {
				done("There were more or less contents than expected")
			}
			const arNmFieldCompare = ["nmContent", "piContent", "dsContent", "lkContent", "idCtContent",
				"shShowTitle", "shShowDescription", "shShowShortCard", "shShowPublisher", "shShowFullscreenImage",
				"shShowActionButtons", "shShowShareButton", "nrLanguage"]
			const isSameJoAC = JsonUtil.isSameJoKeys(joContentA, joContentC, true, ...arNmFieldCompare)
			const isSameJoBD = JsonUtil.isSameJoKeys(joContentB, joContentD, true, ...arNmFieldCompare)
			if (!isSameJoAC || !isSameJoBD) {
				done("Content jsons were not the same at expected attributes")
			}
			const joContentResetted = {
				qtLike: 0,
				qtFavorite: 0,
				qtView: 0,
				qtConversion: 0,
				isPlaybook: true
			}
			const isSameJoResettedC = JsonUtil.isSameJoKeys(joContentResetted, joContentC, true, ...arNmFieldCompare)
			const isSameJoResettedD = JsonUtil.isSameJoKeys(joContentResetted, joContentD, true, ...arNmFieldCompare)
			if (!isSameJoResettedC || !isSameJoResettedD) {
				done("Content jsons had not resetted some of their values")
			}
			done()
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: "copy channel A by user B changing the attributes",
			dsCircumstances: "user B has access in a group of channel A", dsExpected: "status 200"
		}), (done) => {
			const joParam = TestEntity.gen(Channel, { idChannel: joParamMain.joChannelA.idChannel })
			const customResponse = (res: Response) => {
				joParamMain.joChannelC = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.channelCopy, mPost, uB, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: "channel copy", dsCircumstances: "1 channel A was be copied",
			dsExpected: "should compare channels A and C differences, only with some differences"
		}), (done) => {
			const joChannelA = joParamMain.joChannelA
			const joChannelC = joParamMain.joChannelC
			const isAllDifferent =
				joChannelA.nmChannel != joChannelC.nmChannel &&
				joChannelA.piChannel != joChannelC.piChannel &&
				joChannelA.dsChannel != joChannelC.dsChannel
			if (!isAllDifferent) {
				throw Error("The channel copied should've resulted differently from the original")
			}
			if (joChannelA.qtConversion != joChannelC.qtConversion) {
				throw Error("The channel copied should've resulted in a zero conversion")
			}
			const user = TestUserManager.getNewUser().loggedUser.user
			if (joChannelC.idPublisher != user.idUser) {
				throw Error("The channel copied should've resulted in user B as publisher")
			}
			if (!joChannelC.isPlaybook) {
				throw Error("The channel copied should've resulted in isPlaybook = true")
			}
			done()
		})

		it(TestShould.dsText({ dsPreparation: "get contents from channel C" }), (done) => {
			const joParam = { idChannel: joParamMain.joChannelB.idChannel }
			const customResponse = (res: Response) => {
				joParamMain.joChannelC.arJoContent = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.content, mGet, uB, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: "contents of the channel copied", dsCircumstances: "contents are NOT changed",
			dsExpected: "the contents should be equals in the basic data. Resetted at others"
		}), (done) => {
			const joContentA = joParamMain.joContentA1
			const joContentB = joParamMain.joContentA2
			const joContentE = joParamMain.joChannelC.arJoContent[0]
			const joContentF = joParamMain.joChannelC.arJoContent[1]
			if (joParamMain.joChannelB.arJoContent.length != 2) {
				throw Error("There were more or less contents than expected")
			}
			const arNmFieldCompare = ["nmContent", "piContent", "dsContent", "lkContent", "idCtContent",
				"shShowTitle", "shShowDescription", "shShowShortCard", "shShowPublisher", "shShowFullscreenImage",
				"shShowActionButtons", "shShowShareButton", "nrLanguage"]
			const isSameJoAE = JsonUtil.isSameJoKeys(joContentA, joContentE, true, ...arNmFieldCompare)
			const isSameJoBF = JsonUtil.isSameJoKeys(joContentB, joContentF, true, ...arNmFieldCompare)
			if (!isSameJoAE || !isSameJoBF) {
				throw Error("Content jsons were not the same at expected attributes")
			}
			const joContentResetted = {
				qtLike: 0,
				qtFavorite: 0,
				qtView: 0,
				qtConversion: 0,
				isPlaybook: true
			}
			const isSameJoResettedE = JsonUtil.isSameJoKeys(joContentResetted, joContentE, true, ...arNmFieldCompare)
			const isSameJoResettedF = JsonUtil.isSameJoKeys(joContentResetted, joContentF, true, ...arNmFieldCompare)
			if (!isSameJoResettedE || !isSameJoResettedF) {
				throw Error("Content jsons had not resetted some of their values")
			}
			done()
		})

		TestCaseItem.itShouldEditUserPermission(uA, true, true, false, false)

		it(TestShould.dsText({ dsPreparation: "Post channel D" }), (done) => {
			const joParam = TestEntity.gen(Channel, { isPlaybook: false })
			const customResponse = (res: Response) => {
				joParamMain.joChannelD = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.channel, mPost, uA, joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: "Post content D1" }), (done) => {
			const joParam = TestEntity.gen(Content, { isPlaybook: false })
			const customResponse = (res: Response) => {
				joParamMain.joContentD1 = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.content, mPost, uA, joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: "Link content D1 to channel D" }), (done) => {
			const joParam = {
				idContent: joParamMain.joContentD1.idContent,
				idChannel: joParamMain.joChannelD.idChannel,
			}
			TestUtil.customCall(done, RoutesEnum.contentChannel, mPost, uA, joParam)
		})

		it(TestShould.dsText({ dsPreparation: "Post content D2" }), (done) => {
			const joParam = TestEntity.gen(Content, { isPlaybook: false })
			const customResponse = (res: Response) => {
				joParamMain.joContentD2 = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.content, mPost, uA, joParam, joResult)
		})

		it(TestShould.dsText({ dsPreparation: "Link content D2 to channel D" }), (done) => {
			const joParam = {
				idContent: joParamMain.joContentD2.idContent,
				idChannel: joParamMain.joChannelD.idChannel,
			}
			TestUtil.customCall(done, RoutesEnum.contentChannel, mPost, uA, joParam)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: "copy channel D by user B changing the attributes",
			dsCircumstances: "the channel D is LC", dsExpected: "status 200"
		}), (done) => {
			const joParam = TestEntity.gen(Channel, { idChannel: joParamMain.joChannelD.idChannel })
			const customResponse = (res: Response) => {
				joParamMain.joChannelE = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.channelCopy, mPost, uB, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: "channel copy", dsCircumstances: "1 channel D was be copied",
			dsExpected: "should compare channels D and E differences (including isPlaybook difference)"
		}), (done) => {
			const joChannelD = joParamMain.joChannelD
			const joChannelE = joParamMain.joChannelE
			const isAllDifferent =
				joChannelD.nmChannel != joChannelE.nmChannel &&
				joChannelD.piChannel != joChannelE.piChannel &&
				joChannelD.dsChannel != joChannelE.dsChannel
			if (!isAllDifferent) {
				throw Error("The channel copied should've resulted differently from the original")
			}
			if (joChannelD.qtConversion != joChannelE.qtConversion) {
				throw Error("The channel copied should've resulted in a zero conversion")
			}
			const user = TestUserManager.getUser().loggedUser.user
			if (joChannelD.idPublisher != user.idUser) {
				throw Error("The channel copied should've resulted in user B as publisher")
			}
			if (!joChannelE.isPlaybook) {
				throw Error("The channel copied should've resulted in isPlaybook = true")
			}
			done()
		})

		it(TestShould.dsText({ dsPreparation: "get contents from channel E" }), (done) => {
			const joParam = { idChannel: joParamMain.joChannelB.idChannel }
			const customResponse = (res: Response) => {
				joParamMain.joChannelE.arJoContent = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.content, mGet, uB, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: "contents of the channel copied", dsCircumstances: "contents are NOT changed",
			dsExpected: "the contents should be equals in the basic data. Resetted at others (BUT isPlaybook=true"
		}), (done) => {
			const joContentD1 = joParamMain.joContentD1
			const joContentD2 = joParamMain.joContentD2
			const joContentE = joParamMain.joChannelC.arJoContent[0]
			const joContentF = joParamMain.joChannelC.arJoContent[1]
			if (joParamMain.joChannelB.arJoContent.length != 2) {
				throw Error("There were more or less contents than expected")
			}
			const arNmFieldCompare = ["nmContent", "piContent", "dsContent", "lkContent", "idCtContent",
				"shShowTitle", "shShowDescription", "shShowShortCard", "shShowPublisher", "shShowFullscreenImage",
				"shShowActionButtons", "shShowShareButton", "nrLanguage"]
			const isSameJoAE = JsonUtil.isSameJoKeys(joContentD1, joContentE, true, ...arNmFieldCompare)
			const isSameJoBF = JsonUtil.isSameJoKeys(joContentD2, joContentF, true, ...arNmFieldCompare)
			if (!isSameJoAE || !isSameJoBF) {
				throw Error("Content jsons were not the same at expected attributes")
			}
			const joContentResetted = {
				qtLike: 0,
				qtFavorite: 0,
				qtView: 0,
				qtConversion: 0,
				isPlaybook: true
			}
			const isSameJoResettedE = JsonUtil.isSameJoKeys(joContentResetted, joContentE, true, ...arNmFieldCompare)
			const isSameJoResettedF = JsonUtil.isSameJoKeys(joContentResetted, joContentF, true, ...arNmFieldCompare)
			if (!isSameJoResettedE || !isSameJoResettedF) {
				throw Error("Content jsons had not resetted some of their values")
			}
			done()
		})
	}
	// tslint:disable-next-line:max-file-line-count
}
