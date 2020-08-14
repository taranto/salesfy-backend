import { RoutesEnum, SConst } from "salesfy-shared";
import { TestUtil, TestShould, TestCaseItem } from "../../barrel/Barrel.spec";

export class ContactRteSpec {

	public static test() {
		describe(TestShould.describeTitle(RoutesEnum.contact), () => {
			ContactRteSpec.testContactPost()
		})
	}

	private static testContactPost() {
		const r = RoutesEnum.contact
		const m = SConst.HTTP_METHOD_POST

		const joParam = {
			nmContact : "nome",
			emContact : "emailcontatoteste@hatchers.com",
			snTelephone : "00 9 9999 9999",
			dsContact : "descrição"
		}

		it(TestShould.exist(), (done) => {
			TestCaseItem.callEvalExistence(done, r, m)
		})

		it(TestShould.failMissingAllParams(), (done) => {
			TestCaseItem.callEvalFailMissingAllParams(done, r, m, undefined)
		})

		const keys = ["nmContact", "emContact"]
		keys.forEach(key => {
			it(TestShould.failMissingAParam(key), (done) => {
				TestCaseItem.callEvalFailMissingAParam(done, r, m, undefined, joParam, key)
			})
		})

		it("It should send a contact email", (done) => {
			TestUtil.customCall(done, r, m, undefined, joParam)
		})
	}
}
