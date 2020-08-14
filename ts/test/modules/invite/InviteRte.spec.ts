import { RoutesEnum, SConst, StringUtil, CtHttpStatus, KeyEnum, CtWarn, CtExcep } from "salesfy-shared";
import { LayerDao } from "app/layers_template/LayerDao";
import { TestUtil, TestCaseItem, TestShould, TestUserManager } from "../../barrel/Barrel.spec";
import { Response } from "superagent";
import { EnvTest } from "../../support/EnvTest.spec";

export class InviteRteSpec {

	public static test() {
		describe(TestShould.dsText({ nmRoute: RoutesEnum.invite }), () => {
			InviteRteSpec.testInvitePost()
		})
		describe(TestShould.dsText({ nmRoute: RoutesEnum.invite, dsText: "DirectGroupAttach" }), () => {
			InviteRteSpec.testInvitePostDirectGroup()
		})
	}

	private static testInvitePostDirectGroup() {
		const r = RoutesEnum.invite
		const mPost = SConst.HTTP_METHOD_POST
		const mGet = SConst.HTTP_METHOD_GET
		const u = SConst.TEST_ROLE_NORMAL_USER

		const joParamMain: any = {
			emUserInvite: StringUtil.random() + EnvTest.getDsEmHostDefault()
		}

		it("It should add a group to test", (done) => {
			const joParam = {
				nmGroup: "grupo " + StringUtil.random(),
				idWorkspace: EnvTest.getIdWorkspaceDefault()
			}
			const customResponse = (res: any) => {
				TestCaseItem.evalIsTheOne(res, joParam, "nmGroup")
				joParamMain.group = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.group, mPost, u, joParam, joResult)
		})

		it("It should send an email to someone inviting to Salesfy WITH a group attached", (done) => {
			const joParam = {
				idGroup: joParamMain.group.idGroup,
				emUserInvite: joParamMain.emUserInvite,
			}
			const customResponse = (res: Response) => {
				joParamMain.userInvited = res.body
				const arExpectedFields = ["nmGroup", "idGroup", "emUser", "idUser", "idUserGroup", "idCtUserGroupAccess",
					"nmUser", "piAvatar", "isFavorite"]
				TestCaseItem.evalExpectedAttributes(res.body, arExpectedFields)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mPost, u, joParam, joResult)
		})

		it("It should FAIL to add the new user to the group", (done) => {
			const joParam = {
				idGroup: joParamMain.group.idGroup,
				idUser: joParamMain.userInvited.idUser
			}
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus: CtExcep.nmKeyAlreadyExists.nmMsg,
				joExtraContent: { nmKey: KeyEnum.bond }
			}
			TestUtil.customCall(done, RoutesEnum.userGroup, mPost, u, joParam, joResult)
		})
	}

	private static testInvitePost() {
		const r = RoutesEnum.invite
		const mPost = SConst.HTTP_METHOD_POST
		const mGet = SConst.HTTP_METHOD_GET
		const u = SConst.TEST_ROLE_NORMAL_USER

		const joParamMain: any = {
			emUserInvite: StringUtil.random() + EnvTest.getDsEmHostDefault()
		}

		it(TestShould.exist(), (done) => {
			TestCaseItem.callEvalExistence(done, r, mPost)
		})

		it(TestShould.acceptBothTokens(), (done) => {
			TestCaseItem.callEvalAcceptBothTokens(done, r, mPost, u)
		})

		it(TestShould.failNoTokens(), (done) => {
			TestCaseItem.callEvalFailNoTokens(done, r, mPost)
		})

		it(TestShould.failMissingAllParams(), (done) => {
			TestCaseItem.callEvalFailMissingAllParams(done, r, mPost, u)
		})

		const keys = ["emUserInvite"]
		keys.forEach(key => {
			it(TestShould.failMissingAParam(key), (done) => {
				TestCaseItem.callEvalFailMissingAParam(done, r, mPost, u, joParamMain, key)
			})
		})

		it("It should send an email to someone inviting to Salesfy", (done) => {
			const customResponse = (res: Response) => {
				joParamMain.userInvited = res.body
				const arExpectedFields = ["idUser", "dsTestimony", "emUser", "lkWebsite", "nmCargo", "nmCompany",
					"nmUser", "piAvatar", "lkLinkedin", "idWorkspaceDefault"]
				TestCaseItem.evalExpectedAttributes(res.body, arExpectedFields)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mPost, u, joParamMain, joResult)
		})

		it("It should fail to invite someone who already has an email registered", (done) => {
			const emUserAlreadyIn = TestUserManager.getNewUser().user.emUser
			const joParam = { emUserInvite: emUserAlreadyIn }
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus: CtExcep.nmKeyAlreadyExists.nmMsg,
				joExtraContent: { nmKey: KeyEnum.email },
			}
			TestUtil.customCall(done, r, mPost, u, joParam, joResult)
		})

		it("It should NOT find this newly invited person at the network route", (done) => {
			const joParam = { emUser: joParamMain.emUserInvite }
			const customResponse = (res: any) => {
				TestCaseItem.evalIsNotTheOneAmong(res, joParam.emUser, 'emUser')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.userNetwork, mGet, u, undefined, joResult)
		})

		it("It should find the invited user by typing the exact email", (done) => {
			const joParam = { emUser: joParamMain.emUserInvite }
			const customResponse = (res: any) => {
				if (res.body[0].idUser != joParamMain.userInvited.idUser) {
					throw new Error("User not found")
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.user, mGet, u, joParam, joResult)
		})

		it("It should add a group to test", (done) => {
			const joParam = {
				nmGroup: "grupo " + StringUtil.random(),
				idWorkspace: EnvTest.getIdWorkspaceDefault()
			}
			const customResponse = (res: any) => {
				TestCaseItem.evalIsTheOne(res, joParam, "nmGroup")
				joParamMain.group = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.group, mPost, u, joParam, joResult)
		})

		it("It should add the new user to the group", (done) => {
			const joParam = {
				idGroup: joParamMain.group.idGroup,
				idUser: joParamMain.userInvited.idUser
			}
			const customResponse = (res: any) => {
				TestCaseItem.evalIsTheOne(res, joParam, "idGroup")
				TestCaseItem.evalIsTheOne(res, joParam, "idUser")
				joParamMain.group = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.userGroup, mPost, u, joParam, joResult)
		})

		it("It should find this newly invited person at the network route", (done) => {
			const joParam = { emUser: joParamMain.emUserInvite }
			const customResponse = (res: any) => {
				TestCaseItem.evalIsTheOneAmong(res, joParam, "emUser")
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.userNetwork, mGet, u, undefined, joResult)
		})
	}
}
