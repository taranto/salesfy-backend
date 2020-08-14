import { TestUtil, TestShould, TestCaseItem } from "../../barrel/Barrel.spec";

import { RoutesEnum, SConst } from "salesfy-shared";
import { LayerDao } from "app/layers_template/LayerDao";
import { ConnDao } from "app/structure/ConnDao";

export class TagRteSpec {

	public static test() {
		describe(TestShould.describeTitle(RoutesEnum.tag), () => {
			TagRteSpec.testTag()
		})
	}

	private static testTag() {
		const r = RoutesEnum.tag
		const m = SConst.HTTP_METHOD_GET

		let qtTagAvailable = -1

		it(TestShould.exist(), (done) => {
			TestCaseItem.callEvalExistence(done, r, m)
		})

		it("It should bring only the expected attributes", (done) => {
			const expectedAttr = ["idTag", "nmTag", "idCtTag", "piTag"]
			TestCaseItem.callEvalExpectedAttributes(done, r, m, undefined, expectedAttr, undefined, true)
		})

		it(`It should count the quantity of tags available to the user`, (done) => {
			const query = `select count(*) as \"qtTag\" from tag`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					qtTagAvailable = +result[0][0].qtTag
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it("It should get the available tags", (done) => {
			TestUtil.call(r, m, undefined)
				.expect(200)
				.expect((res: Response) => {
					const body: any = res.body
					if (body.length != qtTagAvailable) {
						throw Error("It is bringing the wrong counting")
					}
				})
				.end(TestUtil.end(done))
		})
	}
}
