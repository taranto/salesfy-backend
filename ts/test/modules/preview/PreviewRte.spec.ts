import { RoutesEnum, SConst, TUserTest, StringUtil, CtHttpStatus, KeyEnum, CtWarn, CtExcep } from "salesfy-shared";
import { TestCaseItem, TestUserManager, TestShould, TestUtil, should } from "../../barrel/Barrel.spec";
import { LayerDao } from "app/layers_template/LayerDao";
import { Response } from "superagent";
import { ConnDao } from "app/structure/ConnDao";
import { Content } from "app/modules/content/Content";
import { TestEntity } from "../../support/TestEntity.spec";
import { TestRouteSpec } from "../../support/TestRoute.spec";

export class PreviewRteSpec extends TestRouteSpec {

	private r = RoutesEnum.preview

	public test() {
		describe.skip(TestShould.dsText({ nmRoute: this.r }), () => {
			this.testPreview()
		})
		describe(TestShould.dsText({
			nmRoute: this.r,
			dsText: "The full test is big, so test a single preview"
		}), () => {
			this.testPreviewOnce()
		})
		describe(TestShould.dsText({ nmRoute: this.r }), () => {
			this.testExistence()
		})
	}

	private testExistence() {
		it(TestShould.exist(), (done) => {
			TestCaseItem.callEvalExistence(done, this.r, this.mGet)
		})

		it(TestShould.acceptBothTokens(), (done) => {
			TestCaseItem.callEvalAcceptBothTokens(done, this.r, this.mGet, this.u)
		})

		// it(TestShould.failNoTokens(), (done) => {
		// 	TestCaseItem.callEvalFailNoTokens(done, this.r, this.mGet)
		// })

		it(TestShould.failMissingAllParams(), (done) => {
			TestCaseItem.callEvalFailMissingAllParams(done, this.r, this.mGet, this.u)
		})

		const keys = ["lkPreview"]
		keys.forEach(key => {
			it(TestShould.failMissingAParam(key), (done) => {
				const joParam: any = { lkPreview: "www.google.com.br" }
				TestCaseItem.callEvalFailMissingAParam(done, RoutesEnum.file, this.mGet, this.u, joParam, key)
			})
		})
	}

	private testPreviewOnce() {
		this.testAllLinkPreviews("www.google.com")
	}

	private testPreview() {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = {}
			done()
		})

		this.testAllLinkPreviews("www.google.com", "https://www.google.com/", "http://www.google.com/", "google.com")
		// this.testAllLinkPreviews(
		// 	"www.salesfy.com.br", "https://www.salesfy.com.br/", "http://www.salesfy.com.br/", "salesfy.com.br")
		// this.testAllLinkPreviews("https://salesfy.com.br", "http://salesfy.com.br", "salesfy.com.br")
		this.testAllLinkPreviews("www.facebook.com", "http://facebook.com", "https://facebook.com", "facebook.com")
		// this.testAllLinkPreviews("https://www.ingaia.com.br/como-vender-quando-cliente-quer-desconto-no-imovel/")
		this.testLinkException(
			"https://soap.com.br/wp-content/uploads/2019/07/[%20SOAP%20]Template%20RH.pptx", CtExcep.notHtmlPage)

		this.testLinkException("https://material.io/", CtExcep.notAllowedToRetreiveData)
		this.testLinkExceptionAsBulk("https://material.io/", CtExcep.notAllowedToRetreiveData)
	}

	private testAllLinkPreviews(...arLkPreview: string[]) {

		arLkPreview.forEach(lkPreview => {

			it(TestShould.dsText({
				dsWhatsBeingTested: `${lkPreview}`,
				dsCircumstances: `a single call`,
				dsExpected: `to bring the some data from the server`
			}), (d) => {
				const joParam: any = { lkPreview: lkPreview }
				const customResponse = (res: Response) => {
					const arNmExpectedField = ["nmPreview", "piPreview", "lkPreview"]
					TestCaseItem.evalExpectedAttributes(res.body, arNmExpectedField, false, true, false);
				}
				const joResult = { customResponse: customResponse }
				TestUtil.customCall(d, this.r, this.mGet, this.u, joParam, joResult)
			})
		});
	}

	private testLinkException(lkPreview: string, ctExcep: any) {
		it(TestShould.dsText({
			dsWhatsBeingTested: `${lkPreview}`,
			dsCircumstances: `a single call`,
			dsExpected: `to NOT bring the some data from the server`
		}), (d) => {
			const joParam: any = { lkPreview: lkPreview }

			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus: ctExcep.nmMsg,
				joExtraContent: { lkPreview: lkPreview }
			}
			TestUtil.customCall(d, this.r, this.mGet, this.u, joParam, joResult)
		})
	}

	private testLinkExceptionAsBulk(lkPreview: string, ctExcep: any) {
		it(TestShould.dsText({
			dsWhatsBeingTested: `${lkPreview}`,
			dsCircumstances: `a single call`,
			dsExpected: `to NOT bring the some data from the server`
		}), (d) => {
			const joParam: any = { arJoBulk: [{ lkPreview: lkPreview }] }

			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus: ctExcep.nmMsg,
				joExtraContent: { lkPreview: lkPreview }
			}
			TestUtil.customCall(d, this.r, this.mGet, this.u, joParam, joResult)
		})
	}
}
