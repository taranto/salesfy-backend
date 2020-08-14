import { RoutesEnum, SConst, CtHttpStatus, CtExcep } from "salesfy-shared";
import { TestShould, TestCaseItem, TestUserManager, TestUtil } from "../../barrel/Barrel.spec";
import { TestRouteSpec } from "../../support/TestRoute.spec";
import { Response } from "supertest";
import { TestEntity } from "../../support/TestEntity.spec";
import { Workspace } from "app/modules/workspace/Workspace";

export class WorkspaceUserRteSpec extends TestRouteSpec {

	private r = ""

	public test() {
		describe(TestShould.dsText({ nmRoute: "" }), () => {
			describe(TestShould.dsText({ dsText: "basic" }), () => {
				this.testBasic()
			})
			describe(TestShould.dsText({ dsText: "" }), () => {
				this.testAllMethods()
			})
			// describe(TestShould.dsText({ nmMethod: SConst.HTTP_METHOD_GET }), () => {
			// 	this.testGet()
			// })
			// describe(TestShould.dsText({ nmMethod: SConst.HTTP_METHOD_POST }), () => {
			// 	this.testPost()
			// })
			// describe(TestShould.dsText({ nmMethod: SConst.HTTP_METHOD_PUT }), () => {
			// 	this.testPut()
			// })
			// describe(TestShould.dsText({ nmMethod: SConst.HTTP_METHOD_DELETE }), () => {
			// 	this.testDelete()
			// })
		})
	}

	private testBasic() {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = {}
			done()
		})
		TestCaseItem.descItShouldEvalExistence(true, this.r, this.u, this.mGet, this.mPut, this.mPost, this.mDel)
	}

	private testAllMethods() {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = {}
			done()
		})

		// TestCaseItem.itShouldEditUserPermission(this.u, false, false, false, true)

		// it(TestShould.dsText({ dsPreparation: "Register workspace" }), (d) => {
		// 	const idUserResponsible = TestUserManager.getNewUser().user.idUser
		// 	const joParam = TestEntity.gen(Workspace, { idUserResponsible: idUserResponsible, b64PiWorkspace: BTConst.b64Image })
		// 	const customResponse = (res: Response) => {
		// 		this.joParamMain.joWorkspace1 = res.body
		// 	}
		// 	const joResult = { customResponse: customResponse }
		// 	TestUtil.customCall(d, RoutesEnum.workspace, this.mPost, this.u, joParam, joResult)
		// })

		// it("It should bring only the expected attributes", (done) => {
		// 	const expectedAttr = ["idWorkspace", "nmWorkspace", "piWorkspace", "idUserResponsible", "idWorkspaceUser", "idUser",
		// 		"nmUserResponsible", "isActive", "nmUser", "piAvatar", "nmCompany", "nmCargo", "dsTestimony", "lkWebsite"]
		// 	TestCaseItem.callEvalExpectedAttributes(done, this.r, this.mGet, this.u, expectedAttr, undefined, true)
		// })

		// it(TestShould.execute(0), (done) => {
		// 	const joParam = {
		// 		qtOffset: 5,
		// 		qtLimit: 5,
		// 		idWorkspace: this.joParamMain.joWorkspace1.idWorkspace,
		// 		idUserResponsible: TestUserManager.getUser().user.idUser,
		// 		isActive: true,
		// 		nmWorkspace: this.joParamMain.joWorkspace1.nmWorkspace,
		// 		nmUserResponsible: TestUserManager.getUser().user.nmUser,
		// 		arIdWorkspace: [this.joParamMain.joWorkspace1.idWorkspace],
		// 		arIdUserResponsible: [TestUserManager.getUser().user.idUser],
		// 		idUser: TestUserManager.getUser().user.idUser
		// 	}
		// 	TestCaseItem.callEvalMultipleParamCombinations(done, this.r, this.mGet, this.u, joParam, "idWorkspaceUser")
		// })

		// it(TestShould.dsText({
		// 	dsWhatsBeingTested: `Removing the auth of a responsible`,
		// 	dsCircumstances: `U1 removes U2(the responsible). Both are authorized`,
		// 	dsExpected: `U1 can't remove U2`
		// }), (d) => {
		// 	const idUserResponsible = TestUserManager.getNewUser().user.idUser
		// 	const joParam: any = {
		// 		idWorkspace: this.joParamMain.joWorkspace1.idWorkspace,
		// 		idUser: idUserResponsible
		// 	}
		// 	const joResult = {
		// 		nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
		// 		dsStatus: CtExcep.userNotAuthorized.nmMsg
		// 	}
		// 	TestUtil.customCall(d, RoutesEnum.workspaceUser, this.mDel, this.u, joParam, joResult)
		// })

		// it(TestShould.dsText({
		// 	dsWhatsBeingTested: `Removing the auth of a member`,
		// 	dsCircumstances: `U2(the responsible) removes U1. Both are authorized`,
		// 	dsExpected: `U2 can remove U1`
		// }), (d) => {
		// 	const idUser = TestUserManager.getUser().user.idUser
		// 	const joParam: any = {
		// 		idWorkspace: this.joParamMain.joWorkspace1.idWorkspace,
		// 		idUser: idUser
		// 	}
		// 	TestUtil.customCall(d, RoutesEnum.workspaceUser, this.mDel, this.u2, joParam)
		// })
	}

	// private testGet() {
	// 	before(TestShould.startTest(), (done) => {
	// 		this.joParamMain = {}
	// 		done()
	// 	})
	// }

	// private testPost() {
	// 	before(TestShould.startTest(), (done) => {
	// 		this.joParamMain = {}
	// 		done()
	// 	})
	// }

	// private testPut() {
	// 	before(TestShould.startTest(), (done) => {
	// 		this.joParamMain = {}
	// 		done()
	// 	})
	// }

	// private testDelete() {
	// 	before(TestShould.startTest(), (done) => {
	// 		this.joParamMain = {}
	// 		done()
	// 	})
	// }
}
