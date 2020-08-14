import { RoutesEnum, SConst } from "salesfy-shared";
import { TestCaseItem, TestUtil, TestShould } from "../barrel/Barrel.spec";
import { Response } from "supertest";

export class BaseRteSpec {

	public static async test() {
		BaseRteSpec.testFalse()
		BaseRteSpec.testRoot()
	}

	private static testFalse() {
		const falseRoute = "/coquinho"
		describe(TestShould.describeTitle(falseRoute), () => {
			it("It should NOT exist (get)", (done) => {
				TestUtil.call(falseRoute, SConst.HTTP_METHOD_GET, undefined)
					.expect(404)
					.end(TestUtil.end(done))
			})
			it("It should NOT exist (post)", (done) => {
				TestUtil.call(falseRoute, SConst.HTTP_METHOD_POST, undefined)
					.expect(404)
					.end(TestUtil.end(done))
			})
			it("It should get 200", (done) => {
				const joParam = {
					dsSearch: "aaaaa"
				}
				TestUtil.customCall(done, RoutesEnum.content, SConst.HTTP_METHOD_GET, SConst.TEST_ROLE_NEW_USER, joParam)
			})
		})
	}

	private static testRoot() {
		describe(TestShould.describeTitle(RoutesEnum.root), () => {
			it("It should exist", (done) => {
				TestCaseItem.callEvalExistence(done, RoutesEnum.root, SConst.HTTP_METHOD_GET)
			})
			it("It should exist", (done) => {
				TestCaseItem.callEvalExistence(done, RoutesEnum.root, SConst.HTTP_METHOD_POST)
			})
			it("It should exist", (done) => {
				TestCaseItem.callEvalExistence(done, RoutesEnum.root, SConst.HTTP_METHOD_PUT)
			})
			it("It should exist", (done) => {
				TestCaseItem.callEvalExistence(done, RoutesEnum.root, SConst.HTTP_METHOD_DELETE)
			})
		})
	}
}
