import { TestRouteSpec } from "../support/TestRoute.spec";
import { TestShould, TestUtil, should, TestCaseItem } from "../barrel/Barrel.spec";
import { TestEntity } from "../support/TestEntity.spec";
import { RoutesEnum, CtHttpStatus } from "salesfy-shared";
import { TestUserBox } from "../support/TestUserBox.spec";
import { Content } from "app/modules/content/Content";
import { Response } from "supertest";

export class BulkSpec extends TestRouteSpec {

	public test() {
		describe(TestShould.dsText({
			nmMethod: [this.mPost, this.mDel, this.mPut, this.mGet].join(", "), nmClass: "BulkSpec"
		}), () => {
			describe(TestShould.dsText({ dsText: "Test single call with a bulk of data" }), () => {
				this.testBulk()
			})
			describe(TestShould.dsText({ dsText: "Test bulk on failing leaf call" }), () => {
				this.testBulkLeafFail()
			})
		})

	}

	private testBulkLeafFail() {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = {}
			done()
		})

		const qtTestItems = 2

		it(TestShould.dsText({
			dsWhatsBeingTested: `Post ${qtTestItems} contents`,
			dsCircumstances: `by bulk call`,
			dsExpected: `${qtTestItems} new contents`
		}), (d) => {
			const arJoContent: any[] = this.genJoContent(qtTestItems)
			const joParam: any = {
				arJoBulk: [
					...arJoContent
				]
			}
			joParam.arJoBulk[0].nmContent = undefined
			// const customResponse = (res: Response) => {
			// 	should().equal(qtTestItems, res.body.length)
			// 	this.evalEachContent(res, ...arJoContent)
			// 	this.storeEachContent(res)
			// }
			// const joResult = { customResponse: customResponse }
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				// dsStatus: CtExcep.userNotAuthorized.nmMsg
			}
			TestUtil.customCall(d, RoutesEnum.content, this.mPost, TestUserBox.getUser(0), joParam, joResult)
		})
	}

	private testBulk() {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = {}
			done()
		})

		const qtTestItems = 50

		it(TestShould.dsText({
			dsWhatsBeingTested: `Post ${qtTestItems} contents`,
			dsCircumstances: `by bulk call`,
			dsExpected: `${qtTestItems} new contents`
		}), (d) => {
			const arJoContent: any[] = this.genJoContent(qtTestItems)
			const joParam: any = {
				arJoBulk: [
					...arJoContent
				]
			}
			const customResponse = (res: Response) => {
				should().equal(qtTestItems, res.body.length)
				this.evalEachContent(res, ...arJoContent)
				this.storeEachContent(res)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.content, this.mPost, TestUserBox.getUser(0), joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Put ${qtTestItems} contents`,
			dsCircumstances: `by bulk call`,
			dsExpected: `${qtTestItems} edited content names`
		}), (d) => {
			const arJoContent = this.genJoContent(qtTestItems)
			arJoContent.forEach((joContent: any, i: number) => {
				arJoContent[i].idContent = this.joParamMain["joContent"+i].idContent
			})
			const joParam: any = { arJoBulk: [ ...arJoContent ] }
			const customResponse = (res: Response) => {
				should().equal(qtTestItems, res.body.length)
				this.evalEachContent(res, ...arJoContent)
				this.storeEachContent(res)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.content, this.mPut, TestUserBox.getUser(0), joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Get ${qtTestItems} contents by nmContent criteria`,
			dsCircumstances: `by bulk call`,
			dsExpected: `to bring ${qtTestItems} contents`
		}), (d) => {
			const arJoParam : any[] = new Array(qtTestItems)
			for (let i = 0; i < qtTestItems; i++) {
				arJoParam[i] = {}
				arJoParam[i].nmContent = this.joParamMain["joContent"+i].nmContent
			}
			const joParam: any = { arJoBulk: [ ...arJoParam ] }
			const customResponse = (res: Response) => {
				should().equal(qtTestItems, res.body.length)
				res.body.forEach((joContent:any) => {
					let isFound = false
					const a = arJoParam.find((joParam2:any) => {
						if (!isFound && joParam2.nmContent == joContent[0].nmContent) {
							isFound = true
						}
						return isFound
					})
					if (!isFound) {
						throw Error(`Content not found in bulk get request`)
					}
				})
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.content, this.mGet, TestUserBox.getUser(0), joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Get ${qtTestItems} contents by nmContent criteria`,
			dsCircumstances: `by normal call`,
			dsExpected: `to bring ${qtTestItems} contents`
		}), (d) => {
			const arIdContent : number[] = []
			for (let i = 0; i < qtTestItems; i++) {
				const idContent = this.joParamMain["joContent"+i].idContent
				arIdContent.push(idContent)
			}
			const joParam: any = { arIdContent: [ ...arIdContent ] }
			const customResponse = (res: Response) => {
				should().equal(qtTestItems, res.body.length)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.content, this.mGet, TestUserBox.getUser(0), joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Delete ${qtTestItems} contents`,
			dsCircumstances: `by bulk call`,
			dsExpected: `${qtTestItems} edited content names`
		}), (d) => {
			const arJoContent = this.genJoContent(qtTestItems)
			arJoContent.forEach((joContent: any, i: number) => {
				arJoContent[i].idContent = this.joParamMain["joContent"+i].idContent
			})
			const joParam: any = { arJoBulk: [ ...arJoContent ] }
			const customResponse = (res: Response) => {
				should().equal(qtTestItems, res.body.length)
				res.body.forEach((ret:any) => {
					if (ret!=undefined) {
						throw Error(`Content were not deleted`)
					}
				})
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.content, this.mDel, TestUserBox.getUser(0), joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Get ${qtTestItems} contents by nmContent criteria`,
			dsCircumstances: `by normal call`,
			dsExpected: `to bring ZERO contents`
		}), (d) => {
			const arIdContent : number[] = []
			for (let i = 0; i < qtTestItems; i++) {
				const idContent = this.joParamMain["joContent"+i].idContent
				arIdContent.push(idContent)
			}
			const joParam: any = { arIdContent: [ ...arIdContent ] }
			const customResponse = (res: Response) => {
				should().equal(0, res.body.length)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.content, this.mGet, TestUserBox.getUser(0), joParam, joResult)
		})

	}

	private genJoContent(qtTestItems: number): any[] {
		const arJoContent: any[] = []
		for (let i = 0; i < qtTestItems; i++) {
			const joContent = TestEntity.gen(Content, { isPlaybook: true })
			arJoContent.push(joContent)
		}
		return arJoContent
	}

	private evalEachContent(res: Response, ...arJoContent: any[]) {
		arJoContent.forEach((joContent: Content) => {
			TestCaseItem.evalIsTheOneAmong(res, joContent, "nmContent")
		})
	}

	private storeEachContent(res: Response) {
		res.body.forEach((joContent: Content, i: number) => {
			this.joParamMain["joContent" + i] = res.body[i]
		})
	}
}
