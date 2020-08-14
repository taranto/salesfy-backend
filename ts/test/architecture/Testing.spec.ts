import { should } from "chai";
import { describe } from "mocha";

export class TestingSpec {

	public static test() {
		describe("Is the test testable? @basic", () => {
			it("should succeed!", (done) => {
				should().equal(1, 1)
				done()
			});
		});

		describe("Cover unintended lines to test @basic", () => {
			it("should succeed!", (done) => {
				should().equal(1, 1)
				done()
			});
		});
	}
}
