import { RoutesEnum, SConst } from "salesfy-shared";
import { TestShould, TestCaseItem } from "../../barrel/Barrel.spec";
import { TestRouteSpec } from "../../support/TestRoute.spec";
import { Response } from "supertest";

export class WorkspaceGroupRteSpec extends TestRouteSpec {

	private r = ""

	public test() {
		describe(TestShould.dsText({ nmRoute: "" }), () => {
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
		})
	}

	private testBasic() {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = {}
			done()
		})
		TestCaseItem.descItShouldEvalExistence(true, this.r, this.u, this.mGet, this.mPut, this.mPost, this.mDel)
	}

	private testGet() {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = {}
			done()
		})
	}

	private testPost() {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = {}
			done()
		})
	}

	private testPut() {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = {}
			done()
		})
	}

	private testDelete() {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = {}
			done()
		})
	}
}
