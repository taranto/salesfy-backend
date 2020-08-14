import { RoutesEnum, SConst, TUserTest, StringUtil, CtHttpStatus, KeyEnum, CtWarn, CtExcep } from "salesfy-shared";
import { TestCaseItem, TestUserManager, TestShould, TestUtil, should } from "../../barrel/Barrel.spec";
import { LayerDao } from "app/layers_template/LayerDao";
import { Response } from "superagent";
import { ConnDao } from "app/structure/ConnDao";
import { Content } from "app/modules/content/Content";
import { TestEntity } from "../../support/TestEntity.spec";
import { TestRouteSpec } from "../../support/TestRoute.spec";
import { EnvTest } from "../../support/EnvTest.spec";

export class FileRteSpec extends TestRouteSpec {

	public test() {
		describe(TestShould.dsText({ nmRoute: RoutesEnum.file }), () => {
			this.testExistence()
		})
		describe(TestShould.dsText({ nmRoute: RoutesEnum.file }), () => {
			this.testLink()
		})
		describe(TestShould.dsText({ nmRoute: RoutesEnum.file }), () => {
			this.testBase64()
		})
	}

	private testExistence() {
		it(TestShould.exist(), (done) => {
			TestCaseItem.callEvalExistence(done, RoutesEnum.file, this.mDel)
		})
		it(TestShould.exist(), (done) => {
			TestCaseItem.callEvalExistence(done, RoutesEnum.file, this.mPost)
		})
		it(TestShould.exist(), (done) => {
			TestCaseItem.callEvalExistence(done, RoutesEnum.file, this.mGet)
		})

		it(TestShould.failMissingAllParams(), (done) => {
			TestCaseItem.callEvalFailMissingAllParams(done, RoutesEnum.file, this.mDel, this.u)
		})
		it(TestShould.failMissingAllParams(), (done) => {
			TestCaseItem.callEvalFailMissingAllParams(done, RoutesEnum.file, this.mPost, this.u)
		})
		it(TestShould.failMissingAllParams(), (done) => {
			TestCaseItem.callEvalFailMissingAllParams(done, RoutesEnum.file, this.mGet, this.u)
		})

		// const keys = ["idContent"]
		// keys.forEach(key => {
		// 	it(TestShould.failMissingAParam(key), (done) => {
		// 		const joParam: any = { idContent: this.joParamMain.joContent.idContent }
		// 		TestCaseItem.callEvalFailMissingAParam(done, RoutesEnum.file, this.mPut, this.u, joParam, key)
		// 	})
		// })

		it(TestShould.acceptBothTokens(), (done) => {
			TestCaseItem.callEvalAcceptBothTokens(done, RoutesEnum.file, this.mDel, this.u)
		})
		it(TestShould.acceptBothTokens(), (done) => {
			TestCaseItem.callEvalAcceptBothTokens(done, RoutesEnum.file, this.mPost, this.u)
		})
		it(TestShould.acceptBothTokens(), (done) => {
			TestCaseItem.callEvalAcceptBothTokens(done, RoutesEnum.file, this.mGet, this.u)
		})

		it(TestShould.failNoTokens(), (done) => {
			TestCaseItem.callEvalFailNoTokens(done, RoutesEnum.file, this.mDel)
		})
		it(TestShould.failNoTokens(), (done) => {
			TestCaseItem.callEvalFailNoTokens(done, RoutesEnum.file, this.mPost)
		})
		it(TestShould.failNoTokens(), (done) => {
			TestCaseItem.callEvalFailNoTokens(done, RoutesEnum.file, this.mGet)
		})

	}

	private testBase64() {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = {}
			done()
		})

		it(TestShould.dsText({
			dsPreparation: `Post a base64`
		}), (d) => {
			const joParam: any = {
				nmFile:"aaaaa",
				b64File:EnvTest.getB64Image(),
			}
			const customResponse = (res: Response) => {
				this.joParamMain.joFile = res.body
				should().equal(joParam.nmFile, res.body.nmFile)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.file, this.mPost, this.u, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `The possibility to override file`,
			dsCircumstances: `There's a file already added`,
			dsExpected: `Override the previously added file`
		}), (d) => {
			const joParam: any = {
				nmFile:"aaaaa",
				b64File: EnvTest.getB64Image(),
			}
			const customResponse = (res: Response) => {
				this.joParamMain.joFile = res.body
				should().equal(joParam.nmFile, res.body.nmFile)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.file, this.mPost, this.u, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Retrieve the just inserted file`,
			dsCircumstances: `To have it posted before`,
			dsExpected: `To have the same data retrieved compared to the one inserted`
		}), (d) => {
			const joParam: any = { nmFile: this.joParamMain.joFile.nmFile }
			const customResponse = (res: Response) => {
				const joFile = res.body
				should().equal(joFile.nmFile, this.joParamMain.joFile.nmFile)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.file, this.mGet, this.u, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Delete the just inserted file`,
			dsCircumstances: `To have it posted before`,
			dsExpected: `To have no errors`
		}), (d) => {
			const joParam: any = { nmFile: this.joParamMain.joFile.nmFile }
			const customResponse = (res: Response) => {
				const joFile = res.body
				should().equal(joFile.nmFile, undefined)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.file, this.mDel, this.u, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Try to retrieve the just deleted file`,
			dsCircumstances: `To have it deleted before`,
			dsExpected: `To find nothing`
		}), (d) => {
			const joParam: any = { nmFile: this.joParamMain.joFile.nmFile }
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				ctStatus: CtExcep.nmKeyNotFound,
				joExtraContent: { nmKey: joParam.nmFile }
			}
			TestUtil.customCall(d, RoutesEnum.file, this.mGet, this.u, joParam, joResult)
		})
	}

	private testLink() {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = {}
			done()
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Posting a file`,
			dsCircumstances: `No previous preparation`,
			dsExpected: `To have no errors`
		}), (d) => {
			const joParam: any = { lkFile: "https://www.google.com/images/srpr/logo3w.png" }
			const customResponse = (res: Response) => {
				this.joParamMain.joFile = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.file, this.mPost, this.u, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Retrieve the just inserted file`,
			dsCircumstances: `To have it posted before`,
			dsExpected: `To have the same data retrieved compared to the one inserted`
		}), (d) => {
			const joParam: any = { nmFile: this.joParamMain.joFile.nmFile }
			const customResponse = (res: Response) => {
				const joFile = res.body
				should().equal(joFile.nmFile, this.joParamMain.joFile.nmFile)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.file, this.mGet, this.u, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Delete the just inserted file`,
			dsCircumstances: `To have it posted before`,
			dsExpected: `To have no errors`
		}), (d) => {
			const joParam: any = { nmFile: this.joParamMain.joFile.nmFile }
			const customResponse = (res: Response) => {
				const joFile = res.body
				should().equal(joFile.nmFile, undefined)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.file, this.mDel, this.u, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Try to retrieve the just deleted file`,
			dsCircumstances: `To have it deleted before`,
			dsExpected: `To find nothing`
		}), (d) => {
			const joParam: any = { nmFile: this.joParamMain.joFile.nmFile }
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				ctStatus: CtExcep.nmKeyNotFound,
				joExtraContent: { nmKey: joParam.nmFile }
			}
			TestUtil.customCall(d, RoutesEnum.file, this.mGet, this.u, joParam, joResult)
		})
	}
}
