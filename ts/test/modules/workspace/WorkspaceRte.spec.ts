import { RoutesEnum, SConst, CtHttpStatus, CtExcep, StringUtil } from "salesfy-shared";
import { TestShould, TestCaseItem, TestUserManager, TestUtil, should } from "../../barrel/Barrel.spec";
import { TestRouteSpec } from "../../support/TestRoute.spec";
import { Response } from "supertest";
import { TestEntity } from "../../support/TestEntity.spec";
import { Workspace } from "app/modules/workspace/Workspace";
import { EnvTest } from "../../support/EnvTest.spec";
import { TestUserBox } from "../../support/TestUserBox.spec";

export class WorkspaceRteSpec extends TestRouteSpec {

	private r = RoutesEnum.workspace

	public test() {
		describe(TestShould.dsText({ nmRoute: RoutesEnum.workspace }), () => {
			describe(TestShould.dsText({ dsText: "basic" }), () => {
				this.testBasic()
			})
			describe(TestShould.dsText({ nmMethod: SConst.HTTP_METHOD_GET }), () => {
				this.testGet()
			})
			describe(TestShould.dsText({ nmMethod: SConst.HTTP_METHOD_POST }), () => {
				this.testPost()
			})
			describe(TestShould.dsText({ nmMethod: SConst.HTTP_METHOD_PUT }), () => {
				this.testPut()
			})
			describe(TestShould.dsText({ nmMethod: SConst.HTTP_METHOD_DELETE }), () => {
				this.testDelete()
			})
			describe(TestShould.dsText({ nmBehavior: "Workspace in menu" }), () => {
				this.testWorkspaceInMenu()
			})
		})
	}

	private testWorkspaceInMenu() {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = {}
			done()
		})
	}

	private testBasic() {
		TestCaseItem.descItShouldEvalExistence(true, this.r, this.u, this.mGet, this.mPut, this.mPost, this.mDel)
	}

	private testGet() {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = {}
			done()
		})

		TestCaseItem.itShouldEditUserPermission(this.u, false, false, false, true)

		it(TestShould.dsText({ dsPreparation: "Register workspace" }), (d) => {
			const joParam = TestEntity.gen(Workspace, { b64PiWorkspace: EnvTest.getB64Image() })
			const customResponse = (res: Response) => {
				this.joParamMain.joWorkspace1 = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.workspace, this.mPost, this.u, joParam, joResult)
		})

		it("It should bring only the expected attributes", (done) => {
			const expectedAttr = ["idWorkspace", "nmWorkspace", "piWorkspace", "idUserResponsible",	"nmUserResponsible",
				"isActive"]
			TestCaseItem.callEvalExpectedAttributes(done, this.r, this.mGet, this.u, expectedAttr, undefined, true)
		})

		it(TestShould.execute(0), (done) => {
			const joParam = {
				qtOffset: 5,
				qtLimit: 5,
				idWorkspace: this.joParamMain.joWorkspace1.idWorkspace,
				idUserResponsible: TestUserManager.getUser().user.idUser,
				isActive: true,
				nmWorkspace: this.joParamMain.joWorkspace1.nmWorkspace,
				nmUserResponsible: TestUserManager.getUser().user.nmUser,
				arIdWorkspace: [this.joParamMain.joWorkspace1.idWorkspace],
				arIdUserResponsible: [TestUserManager.getUser().user.idUser],
			}
			TestCaseItem.callEvalMultipleParamCombinations(done, this.r, this.mGet, this.u, joParam, "idWorkspace")
		})
	}

	private testPost() {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = {}
			done()
		})

		TestCaseItem.itShouldEditUserPermission(this.u, false, false, false, false)

		it(TestShould.dsText({
			dsWhatsBeingTested: `Can user post workspace?`,
			dsCircumstances: `u1 was set as NOT permitted to post workspaces`,
			dsExpected: `Failing`
		}), (d) => {
			const joParam: any = { nmWorkspace: StringUtil.random(), b64PiWorkspace: EnvTest.getB64Image() }
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus: CtExcep.userNotAuthorized.nmMsg
			}
			TestUtil.customCall(d, RoutesEnum.workspace, this.mPost, this.u, joParam, joResult)
		})

		TestCaseItem.itShouldEditUserPermission(this.u, false, false, false, true)

		it(TestShould.dsText({
			dsWhatsBeingTested: `Can user post workspace?`,
			dsCircumstances: `u1 was set as permitted to post workspaces`,
			dsExpected: `Success`
		}), (d) => {
			const joParam: any = { nmWorkspace: StringUtil.random(), b64PiWorkspace: EnvTest.getB64Image() }
			const customResponse = (res: Response) => {
				this.joParamMain.joWorkspace1 = res.body
				should().equal(joParam.nmWorkspace, res.body.nmWorkspace)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.workspace, this.mPost, this.u, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Workspace access by the one who posted`,
			dsCircumstances: `Workspace was posted by u1. u1 is also the responsible`,
			dsExpected: `To find the workspace`
		}), (d) => {
			const joParam: any = {
				idWorkspace: this.joParamMain.joWorkspace1.idWorkspace
			}
			const customResponse = (res: Response) => {
				should().equal(res.body[0].idWorkspace, this.joParamMain.joWorkspace1.idWorkspace, "Workspace not found")
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.workspace, this.mGet, this.u, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Workspace access by a random user (u2)`,
			dsCircumstances: `Workspace was posted by u1. u1 is also the responsible. u2 has no access`,
			dsExpected: `To NOT find the workspace`
		}), (d) => {
			const joParam: any = {
				idWorkspace: this.joParamMain.joWorkspace1.idWorkspace
			}
			const customResponse = (res: Response) => {
				should().equal(res.body.length, 0, "Workspace not found")
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.workspace, this.mGet, this.u2, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Posting a workspace with a different Responsible than author`,
			dsCircumstances: `Simple posting`,
			dsExpected: `Success`
		}), (d) => {
			const idUserResponsible = TestUserManager.getNewUser().user.idUser
			const joParam: any = {
				nmWorkspace: StringUtil.random(),
				idUserResponsible: idUserResponsible,
				b64PiWorkspace: EnvTest.getB64Image()
			}
			const customResponse = (res: Response) => {
				this.joParamMain.joWorkspace2 = res.body
				should().equal(joParam.idUserResponsible, this.joParamMain.joWorkspace2.idUserResponsible)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.workspace, this.mPost, this.u, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Workspace access by the one who posted`,
			dsCircumstances: `Workspace was posted by u1. u2 is the responsible`,
			dsExpected: `To find the workspace`
		}), (d) => {
			const joParam: any = {
				idWorkspace: this.joParamMain.joWorkspace2.idWorkspace
			}
			const customResponse = (res: Response) => {
				should().equal(res.body[0].idWorkspace, this.joParamMain.joWorkspace2.idWorkspace, "Workspace not found")
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.workspace, this.mGet, this.u, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Workspace access by the responsible`,
			dsCircumstances: `Workspace was posted by u1. u2 is the responsible`,
			dsExpected: `To find the workspace`
		}), (d) => {
			const joParam: any = {
				idWorkspace: this.joParamMain.joWorkspace2.idWorkspace
			}
			const customResponse = (res: Response) => {
				should().equal(res.body[0].idWorkspace, this.joParamMain.joWorkspace2.idWorkspace, "Workspace not found")
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.workspace, this.mGet, this.u2, joParam, joResult)
		})
	}

	private testPut() {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = {}
			done()
		})

		TestCaseItem.itShouldEditUserPermission(this.u, false, false, false, true)
		TestCaseItem.itShouldEditUserPermission(this.u2, false, false, false, false)

		it(TestShould.dsText({ dsPreparation: `post a workspace` }), (d) => {
			const joParam: any = { nmWorkspace: StringUtil.random(), b64PiWorkspace: EnvTest.getB64Image() }
			const customResponse = (res: Response) => {
				this.joParamMain.joWorkspace = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.workspace, this.mPost, this.u, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `workspace put`,
			dsCircumstances: `u1 just posted a workspace`,
			dsExpected: `To change the attributes`
		}), (d) => {
			const joParam: any = {
				nmWorkspace: StringUtil.random(),
				b64PiWorkspace: EnvTest.getB64Image(),
				idWorkspace: this.joParamMain.joWorkspace.idWorkspace
			}
			const customResponse = (res: Response) => {
				should().equal(joParam.nmWorkspace, res.body.nmWorkspace)
				should().not.equal(res.body.piWorkspace, undefined)
				this.joParamMain.joWorkspace1 = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.workspace, this.mPut, this.u, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `u1 workspace put`,
			dsCircumstances: `u1 just posted a workspace`,
			dsExpected: `To change the attributes`
		}), (d) => {
			const joParam: any = {
				nmWorkspace: StringUtil.random(),
				b64PiWorkspace: EnvTest.getB64Image(),
				idWorkspace: this.joParamMain.joWorkspace.idWorkspace
			}
			const customResponse = (res: Response) => {
				should().equal(joParam.nmWorkspace, res.body.nmWorkspace)
				should().not.equal(this.joParamMain.joWorkspace.piWorkspace, res.body.piWorkspace)
				should().not.equal(this.joParamMain.joWorkspace.piWorkspace, undefined)
				this.joParamMain.joWorkspace = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.workspace, this.mPut, this.u, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `u2 workspace put`,
			dsCircumstances: `u1 just posted a workspace. u2 is not authorized`,
			dsExpected: `To NOT change the attributes`
		}), (d) => {
			const joParam: any = {
				nmWorkspace: StringUtil.random(),
				b64PiWorkspace: EnvTest.getB64Image(),
				idWorkspace: this.joParamMain.joWorkspace.idWorkspace
			}
			const customResponse = (res: Response) => {
				should().not.equal(this.joParamMain.joWorkspace.nmWorkspace, res.body.nmWorkspace)
				should().not.equal(this.joParamMain.joWorkspace.piWorkspace, res.body.piWorkspace)
			}
			const joResult = {
				customResponse: customResponse,
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus: CtExcep.userNotAuthorized.nmMsg
			}
			TestUtil.customCall(d, RoutesEnum.workspace, this.mPut, this.u2, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `u2 workspace put`,
			dsCircumstances: `u2 is now authorized in workspace (normal user)`,
			dsExpected: `To NOT change the attributes`
		}), (d) => {
			const joParam: any = {
				nmWorkspace: StringUtil.random(),
				b64PiWorkspace: EnvTest.getB64Image(),
				idWorkspace: this.joParamMain.joWorkspace.idWorkspace
			}
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus: CtExcep.userNotAuthorized.nmMsg
			}
			TestUtil.customCall(d, RoutesEnum.workspace, this.mPut, this.u2, joParam, joResult)
		})

		it(TestShould.dsText({
			dsPreparation: `u1 makes u2 responsible for the workspace`
		}), (d) => {
			const idUserResponsible = TestUserManager.getNewUser().user.idUser
			const joParam: any = {
				idUserResponsible: idUserResponsible,
				idWorkspace: this.joParamMain.joWorkspace.idWorkspace
			}
			const customResponse = (res: Response) => {
				this.joParamMain.joWorkspace = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.workspace, this.mPut, this.u, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `u2 workspace put`,
			dsCircumstances: `u2 is responsible for the workspace`,
			dsExpected: `To change the attributes (and give back the responsibility to u1)`
		}), (d) => {
			const joParam: any = {
				nmWorkspace: StringUtil.random(),
				b64PiWorkspace: EnvTest.getB64Image(),
				idWorkspace: this.joParamMain.joWorkspace.idWorkspace
			}
			const customResponse = (res: Response) => {
				should().equal(joParam.nmWorkspace, res.body.nmWorkspace)
				should().not.equal(this.joParamMain.joWorkspace.piWorkspace, res.body.piWorkspace)
				should().not.equal(this.joParamMain.joWorkspace.piWorkspace, undefined)
				this.joParamMain.joWorkspaceUser2 = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.workspace, this.mPut, this.u2, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `u2 workspace put`,
			dsCircumstances: `u2 is responsible for the workspace`,
			dsExpected: `To give back the responsibility to u1 (and loose access)`
		}), (d) => {
			const idUserResponsible = TestUserManager.getUser().user.idUser
			const joParam: any = {
				idUserResponsible: idUserResponsible,
				idWorkspace: this.joParamMain.joWorkspace.idWorkspace
			}
			const customResponse = (res: Response) => {
				should().equal("", res.body)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.workspace, this.mPut, this.u2, joParam, joResult)
		})
	}

	private testDelete() {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = {}
			done()
		})

		TestCaseItem.itShouldEditUserPermission(this.u, false, false, false, true)

		it(TestShould.dsText({
			dsPreparation: `u1 posts a workspace. u2 is the responsible`
		}), (d) => {
			const idUserResponsible = TestUserManager.getNewUser().user.idUser
			const joParam: any = {
				nmWorkspace: StringUtil.random(),
				idUserResponsible: idUserResponsible,
				b64PiWorkspace: EnvTest.getB64Image()
			}
			const customResponse = (res: Response) => {
				this.joParamMain.joWorkspace1 = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.workspace, this.mPost, this.u, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `u1 tries to delete the workspace`,
			dsCircumstances: `u1 is NOT the responsible`,
			dsExpected: `to fail`
		}), (d) => {
			const joParam: any = { idWorkspace: this.joParamMain.joWorkspace1.idWorkspace }
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus: CtExcep.userNotAuthorized.nmMsg
			}
			TestUtil.customCall(d, RoutesEnum.workspace, this.mDel, this.u, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `u2 tries to delete the workspace`,
			dsCircumstances: `u2 is the responsible`,
			dsExpected: `to succeed`
		}), (d) => {
			const joParam: any = { idWorkspace: this.joParamMain.joWorkspace1.idWorkspace }
			const customResponse = (res: Response) => {
				should().equal(res.body, "")
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.workspace, this.mDel, this.u2, joParam, joResult)
		})
	}
}
