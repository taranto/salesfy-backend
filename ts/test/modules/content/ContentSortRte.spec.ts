import { THttpMethod, SConst, RoutesEnum, TUserTest, NumberUtil, GeneralUtil } from "salesfy-shared";
import { TestShould, TestUtil, TestCaseItem } from "../../barrel/Barrel.spec";
import { TestEntity } from "../../support/TestEntity.spec";
import { Content } from "app/modules/content/Content";
import { ContentChannel } from "app/modules/content_channel/ContentChannel";
import { Channel } from "app/modules/channel/Channel";
import { Response } from "supertest";
import { EC2MetadataCredentials } from "aws-sdk";

export class ContentSortRteSpec {

	private mGet: THttpMethod = SConst.HTTP_METHOD_GET
	private mPut: THttpMethod = SConst.HTTP_METHOD_PUT
	private mPost: THttpMethod = SConst.HTTP_METHOD_POST
	private u: TUserTest = SConst.TEST_ROLE_NORMAL_USER
	private r = RoutesEnum.content
	private joParamMain: any = {}

	public test() {
		describe(TestShould.dsText({
			nmRoute: RoutesEnum.content, nmMethod: SConst.HTTP_METHOD_GET,
			nmClass: "ContentSortRteSpec"
		}), () => {
			this.testSort()
		})
	}

	public testSort() {
		it(TestShould.dsText({ dsPreparation: "Register channel" }), (d) => {
			const joParam = TestEntity.gen(Channel, { isPlaybook: true })
			const customResponse = (res: Response) => {
				this.joParamMain.joChannel = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.channel, this.mPost, this.u, joParam, joResult)
		})

		this.createContentLinked("A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L")

		it(TestShould.dsText({ dsPreparation: `User evaluates content` }), (d) => {
			const joParam = {
				arJoBulk: [
					{ idContent: this.joParamMain.joContentA.idContent, vlEval: 5 },
					{ idContent: this.joParamMain.joContentB.idContent, vlEval: 4 },
					{ idContent: this.joParamMain.joContentC.idContent, vlEval: 3 },
					{ idContent: this.joParamMain.joContentD.idContent, vlEval: 2 },
					{ idContent: this.joParamMain.joContentE.idContent, vlEval: 1 },
					{ idContent: this.joParamMain.joContentF.idContent, vlEval: 5 },
					{ idContent: this.joParamMain.joContentG.idContent, vlEval: 4 },
					{ idContent: this.joParamMain.joContentH.idContent, vlEval: 3 },
					{ idContent: this.joParamMain.joContentI.idContent, vlEval: 2 },
					{ idContent: this.joParamMain.joContentJ.idContent, vlEval: 1 },
				]
			}
			TestUtil.customCall(d, RoutesEnum.userContent, this.mPut, this.u, joParam)
		})

		this.evalSort("nmContent", "nmContent", (c1: any, c2: any) => {
			return c1["nmContent"].localeCompare(c2["nmContent"])
		})
		this.evalSort("dhPublish", "dhPublish", (c1: any, c2: any) => {
			return new Date(c2["dhPublish"]).getTime() - new Date(c1["dhPublish"]).getTime()
		})
		this.evalSort("dhUpdate", "dhUpdate", (c1: any, c2: any) => {
			return new Date(c2["dhUpdate"]).getTime() - new Date(c1["dhUpdate"]).getTime()
		})
		this.evalSort("dhLastConversion", "dhLastConversion", (c1: any, c2: any) => {
			return new Date(c2["dhLastConversion"]).getTime() - new Date(c1["dhLastConversion"]).getTime()
		})
		this.evalSort("vlEval", "vlEval", (c1: any, c2: any) => {
			const isC1Evaluated = (c1["vlEval"] != undefined && c1["vlEval"] != null)
			const vlC1Meta = isC1Evaluated ? parseFloat(c1["vlEval"]) : -1
			const isC2Evaluated = (c2["vlEval"] != undefined && c2["vlEval"] != null)
			const vlC2Meta = isC2Evaluated ? parseFloat(c2["vlEval"]) : -1
			const isC1LowerThanC2 = vlC1Meta < vlC2Meta
			return isC1LowerThanC2 ? 1 : -1
		})

		//keyCtContentState is tested in the 'Accessed' class

		describe(TestShould.dsText({ dsText: "Test qtViewUser" }), () => {
			this.contentView("A", "A", "A", "A", "B", "B", "B", "C", "C", "D")
			it(TestShould.dsText({
				dsWhatsBeingTested: `qtViewUser sorting in content`,
				dsCircumstances: `A viewed 4x, B 3, C 2, D 1, E 0 and all others will be out of context`,
				dsExpected: `To be sorted as E D C B A`
			}), (d) => {
				const joParam: any = {
					nmSort: "qtViewUser",
					arIdContentNotIn: [
						this.joParamMain.joContentF.idContent,
						this.joParamMain.joContentG.idContent,
						this.joParamMain.joContentH.idContent,
						this.joParamMain.joContentI.idContent,
						this.joParamMain.joContentJ.idContent,
						this.joParamMain.joContentK.idContent,
						this.joParamMain.joContentL.idContent
					],
					idChannel: this.joParamMain.joChannel.idChannel
				}
				const customResponse = (res: Response) => {
					const arContent: any[] = GeneralUtil.copy(res.body)
					const isSortingWrong =
						arContent[0].idContent != this.joParamMain.joContentE.idContent ||
						arContent[1].idContent != this.joParamMain.joContentD.idContent ||
						arContent[2].idContent != this.joParamMain.joContentC.idContent ||
						arContent[3].idContent != this.joParamMain.joContentB.idContent ||
						arContent[4].idContent != this.joParamMain.joContentA.idContent
					if (isSortingWrong) {
						throw Error(`Wrong sorting of qtViewUser`)
					}
				}
				const joResult = { customResponse: customResponse }
				TestUtil.customCall(d, this.r, this.mGet, this.u, joParam, joResult)
			})
		})

		describe(TestShould.dsText({ dsText: "Test default sort (equals to qtViewUser)" }), () => {
			this.contentView("F", "F", "F", "F", "G", "G", "G", "H", "H", "I")
			it(TestShould.dsText({
				dsWhatsBeingTested: `default sorting in content`,
				dsCircumstances: `A viewed 4x, B 3, C 2, D 1, E 0 and all others will be out of context`,
				dsExpected: `To be sorted as E D C B A`
			}), (d) => {
				const joParam: any = {
					arIdContentNotIn: [
						this.joParamMain.joContentA.idContent,
						this.joParamMain.joContentB.idContent,
						this.joParamMain.joContentC.idContent,
						this.joParamMain.joContentD.idContent,
						this.joParamMain.joContentE.idContent,
						this.joParamMain.joContentK.idContent,
						this.joParamMain.joContentL.idContent
					],
					idChannel: this.joParamMain.joChannel.idChannel
				}
				const customResponse = (res: Response) => {
					const arContent: any[] = GeneralUtil.copy(res.body)
					const isSortingWrong =
						arContent[0].idContent != this.joParamMain.joContentJ.idContent ||
						arContent[1].idContent != this.joParamMain.joContentI.idContent ||
						arContent[2].idContent != this.joParamMain.joContentH.idContent ||
						arContent[3].idContent != this.joParamMain.joContentG.idContent ||
						arContent[4].idContent != this.joParamMain.joContentF.idContent
					if (isSortingWrong) {
						throw Error(`Wrong default sorting`)
					}
				}
				const joResult = { customResponse: customResponse }
				TestUtil.customCall(d, this.r, this.mGet, this.u, joParam, joResult)
			})
		})
	}

	private contentView(...arLtItem: string[]) {
		arLtItem.forEach((ltItem) => {
			it(TestShould.dsText({ dsPreparation: `mark content ${arLtItem} as viewed` }), (d) => {
				const joParam: any = { idContent: this.joParamMain[`joContent${ltItem}`].idContent }
				TestUtil.customCall(d, this.r, this.mGet, this.u, joParam)
			})
		})
	}

	private evalSort(nmProp: string, nmSort: string, mtSort: any) {
		it(TestShould.dsText({
			dsWhatsBeingTested: `${nmProp} sort`,
			dsCircumstances: `There's a dozen of contents registered`,
			dsExpected: `It to be sorted`
		}), (d) => {
			const joParam: any = { nmSort: nmSort, idChannel: this.joParamMain.joChannel.idChannel }
			const customResponse = (res: Response) => {
				TestCaseItem.evalSort(res, mtSort, nmProp)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, this.r, this.mGet, this.u, joParam, joResult)
		})
	}

	private createContentLinked(...arLtItem: string[]) {
		arLtItem.forEach((ltItem) => {
			it(TestShould.dsText({ dsPreparation: `Register content${ltItem}` }), (d) => {
				const joParam = TestEntity.gen(Content, { isPlaybook: true })
				const customResponse = (res: Response) => {
					this.joParamMain[`joContent${ltItem}`] = res.body
				}
				const joResult = { customResponse: customResponse }
				TestUtil.customCall(d, this.r, this.mPost, this.u, joParam, joResult)
			})
			it(TestShould.dsText({ dsPreparation: `Register contentChannel${ltItem}` }), (d) => {
				const joParam = TestEntity.gen(ContentChannel, {
					idContent: this.joParamMain[`joContent${ltItem}`].idContent,
					idChannel: this.joParamMain.joChannel.idChannel
				})
				const customResponse = (res: Response) => {
					this.joParamMain[`joContentChannel${ltItem}`] = res.body
				}
				const joResult = { customResponse: customResponse }
				TestUtil.customCall(d, RoutesEnum.contentChannel, this.mPost, this.u, joParam, joResult)
			})
		})
	}
}
