import { SConst, THttpMethod, KeyEnum, GeneralUtil, TUserTest, CtHttpStatus, JsonUtil, CtExcep, CtWarn } from "salesfy-shared";
import { StringUtil } from "salesfy-shared";
import { Done, Response } from "../TestSuite.spec";
import { supertest, TestUserManager, TestShould, TestUtil, Env, TestUser } from "../barrel/Barrel.spec";
import { LayerDao } from "app/layers_template/LayerDao";
import { ConnDao } from "app/structure/ConnDao";

export class TestCaseItem {

	public static itShouldCallEvalFilter(
		r: any, m: any, u: any, nmKeyFilter: string, obKeyWord: any, nmIdentifyer: string, nmFilteredKey: string) {
		it(`It should return a list filtered by a keyword. Keyword: ${nmKeyFilter}, value: ${obKeyWord}`, (done) => {
			TestCaseItem.callEvalFilter(done, r, m, u, nmKeyFilter, obKeyWord, nmIdentifyer, nmFilteredKey)
		})
	}

	public static callEvalMultipleParamCombinations(d: Done, r: string, m: THttpMethod, u: TUserTest,
		joParam1: any, nmIdKey?: string) {
		const arJoCombinations = TestCaseItem.genParamCombinations(joParam1)
		TestCaseItem.callEvalAParamCombination(d, r, m, u, arJoCombinations, nmIdKey)
	}

	private static genParamCombinations(joParam1: any, joParamAlways?: any): any[] {
		const arJoParamCombinations: any = []
		const arNmKeys = Object.keys(joParam1)
		arNmKeys.forEach(nmKey => {
			const joParamCombination: any = {
				...joParamAlways
			}
			joParamCombination[nmKey] = joParam1[nmKey]
			arJoParamCombinations.push(joParamCombination)
		})
		return arJoParamCombinations
	}

	private static callEvalAParamCombination(d: Done, r: string, m: THttpMethod, u: TUserTest,
		arJoCombinations: any[], nmIdKey?: string) {
		if (arJoCombinations.length == 0) {
			return
		}
		const joParam = arJoCombinations.pop()
		const customResponse = (res: Response) => {
			if (nmIdKey) {
				TestCaseItem.evalIsListNotDuplicated(res, nmIdKey)
			}
			TestCaseItem.callEvalAParamCombination(d, r, m, u, arJoCombinations)
		}
		const joResult = { customResponse: customResponse }
		const isLastCall = arJoCombinations.length == 0
		const dLastCall = isLastCall ? d : undefined
		TestUtil.customCall(dLastCall, r, m, u, joParam, joResult)
	}

	public static callEvalFilter(d: Done, r: string, m: THttpMethod, u: TUserTest,
		nmKeyFilter: string, obFilterWord: any, nmIdentifyer: string, ...arNmKeyResult: string[]) {
		let obFilterWordAdjusted = obFilterWord
		if (StringUtil.isString(obFilterWord)) {
			obFilterWordAdjusted = obFilterWord.toLowerCase()
		}
		const joParam: any = {}
		joParam[nmKeyFilter] = obFilterWordAdjusted
		TestUtil.call(r, m, u, joParam)
			.expect(200)
			.expect((res: supertest.Response) => {
				const body = res.body
				if (res.body) {
					const isFilterWorking = JsonUtil.isFilterWorking(body, arNmKeyResult, obFilterWord);
					if (!isFilterWorking) {
						throw new Error("It is returning wrong parameters");
					}
					TestCaseItem.evalIsListNotDuplicated(res, nmIdentifyer)
				}
			})
			.end(TestUtil.end(d))
	}

	public static callEvalOffsetSequence(done: Done, r: string, m: THttpMethod, u: TUserTest,
		nmKey: string, joParamFirstOffset: { qtOffset: number; qtLimit: SConst; },
		joParamSecOffset: { qtOffset: number; qtLimit: SConst; }) {
		TestUtil.call(r, m, u, joParamFirstOffset)
			.expect(200)
			.end((err: any, res: supertest.Response) => {
				TestUtil.call(r, m, u)
					.send(joParamSecOffset)
					.expect(200)
					.expect((res2: supertest.Response) => {
						const ids1stCall = GeneralUtil.extractArrayValueFromJson(res.body, nmKey)
						const ids2ndCall = GeneralUtil.extractArrayValueFromJson(res2.body, nmKey)
						const idsDifference = GeneralUtil.differenceBetweenArrays(ids2ndCall, ids1stCall)
						if (idsDifference.length != 1) {
							throw new Error("wrong offset");
						}
					})
					.end(TestUtil.end(done));
			});
	}

	public static callEvalReturnUnderLimit(d: Done, r: string, m: THttpMethod, u: TUserTest,
		joParam: { qtOffset: number; qtLimit: SConst; }) {
		TestUtil.call(r, m, u, joParam)
			.expect(200)
			.expect((res: Response) => {
				const body = GeneralUtil.copy(res.body);
				let qtLimitExpected = +joParam.qtLimit
				if (!qtLimitExpected || qtLimitExpected > Env.getEnvQtLimitFetchDefault()) {
					qtLimitExpected = Env.getEnvQtLimitFetchDefault()
				}

				const returnedSomething = body[0] != undefined;
				if (!returnedSomething) {
					throw Error("Empty");
				}
				const returnedSomethingUntilLimit = body[(qtLimitExpected) - 1] != undefined;
				if (!returnedSomethingUntilLimit) {
					throw Error("Returned less than limit");
				}
				const returnedOnLimit = body[qtLimitExpected] == undefined;
				if (!returnedOnLimit) {
					throw Error("Returned more than limit");
				}
			})
			.end(TestUtil.end(d));
	}

	public static callEvalReturnSameThingTwice(d: Done, r: string, m: THttpMethod, u: TUserTest,
		joParam: { qtOffset: number; qtLimit: SConst; }, nmKeyEvaluation: string) {
		TestUtil.call(r, m, u)
			.expect(200)
			.end((err: any, res: supertest.Response) => {
				TestUtil.call(r, m, u, joParam)
					.expect(200)
					.expect((res2: supertest.Response) => {
						const bodyIntersection = GeneralUtil.intersection(nmKeyEvaluation, res.body, res2.body);
						if (bodyIntersection.length != Env.getEnvQtLimitFetchDefault()) {
							throw new Error("contents were not the same");
						}
					})
					.end(TestUtil.end(d));
			});
	}

	public static callEvalReturnAllDiffTwice(d: Done, r: string, m: THttpMethod, u: TUserTest,
		joParam: { qtOffset: number; qtLimit: SConst; }, nmKeyEvaluation: string) {
		TestUtil.call(r, m, u)
			.expect(200)
			.end((err: any, res: supertest.Response) => {
				TestUtil.call(r, m, u, joParam)
					.expect(200)
					.expect((res2: supertest.Response) => {
						const bodyIntersection = GeneralUtil.intersection(nmKeyEvaluation, res.body, res2.body);
						if (bodyIntersection.length != 0) {
							throw new Error("something came again");
						}
					})
					.end(TestUtil.end(d));
			});
	}

	public static callEvalLimitExpected(done: Done, r: string, m: THttpMethod, u: TUserTest,
		joParam: { qtOffset: number; qtLimit: SConst; }) {
		TestUtil.call(r, m, u, joParam)
			.expect(200)
			.expect((res: supertest.Response) => {
				const returnedSomething = res.body[0] != undefined;
				if (!returnedSomething) {
					throw Error("Empty");
				}
				const returnedSomethingUntilLimit = res.body[(+joParam.qtLimit) - 1] != undefined;
				if (!returnedSomethingUntilLimit) {
					throw Error("Returned less than limit");
				}
				const returnedOnLimit = res.body[joParam.qtLimit] == undefined;
				if (!returnedOnLimit) {
					throw Error("Returned more than limit");
				}
			})
			.end(TestUtil.end(done));
	}

	public static evalIsListNotDuplicated(res: Response, nmIdentifyer: string) {
		const body: any[] = res.body.slice(0)
		res.body.forEach((anItem: any) => {
			const nrItemIndex: any = body.findIndex((anItemToFind) => {
				return anItem[nmIdentifyer] == anItemToFind[nmIdentifyer]
			})
			body.splice(nrItemIndex, 1)
			const theItemAgain: any = body.find((anItemToFindAgain) => {
				return anItem[nmIdentifyer] == anItemToFindAgain[nmIdentifyer]
			})
			if (theItemAgain) {
				throw Error(`There's an item listed twice: nmIdentifyer: ${nmIdentifyer}, value: ${theItemAgain[nmIdentifyer]}`);
			}
		})
	}

	public static evalIsListOnlyWithIdsExpected(res: Response, nmIdentifyer: string, arIdExpected: number[]) {
		if (res.body.length != arIdExpected.length) {
			throw Error(`There's a difference in the returned quantity than expected. ` +
				`Returned: ${res.body.length}. Expected: ${arIdExpected.length}`);
		}
		const body: any[] = res.body.slice(0)
		res.body.forEach((anItem: any) => {
			const nrItemIndex: any = body.findIndex((anItemToFind) => {
				return anItem[nmIdentifyer] == anItemToFind[nmIdentifyer]
			})
			body.splice(nrItemIndex, 1)
		})
		if (body.length != 0) {
			throw Error(`The quantity is the expected, but the items are not the ones`);
		}
	}

	public static evalIsTheOneAmong(res: Response, joParam: any, nmIdentifyer: string) {
		let hasCame = false
		res.body.forEach((anItem: any) => {
			if (hasCame && anItem[nmIdentifyer] == joParam[nmIdentifyer]) {
				throw Error(`Item of id ${joParam[nmIdentifyer]} should've been received by the user ONCE`)
			}
			if (anItem[nmIdentifyer] == joParam[nmIdentifyer]) {
				hasCame = true
			}
		})
		if (!hasCame) {
			throw Error(`Item of id ${joParam[nmIdentifyer]} should've been received by the user`)
		}
	}

	public static evalIsNotTheOneAmong(res: Response, joParam: any, nmIdentifyer: string) {
		res.body.forEach((anItem: any) => {
			if (anItem[nmIdentifyer] == joParam[nmIdentifyer]) {
				throw Error(`Item of id ${joParam[nmIdentifyer]} should've NOT been received by the user`)
			}
		})
	}

	public static shouldBringEmptyBody(res: Response) {
		if (res.body.length > 0) {
			throw Error(`No items should've been brought to the user`)
		}
	}

	public static evalIsTheOne(res: Response, joParam: any, nmIdentifyer: string) {
		const isBroughtAsList = res.body[0] != undefined && res.body[0][nmIdentifyer] == joParam[nmIdentifyer]
		const isBroughtSingle = res.body[0] == undefined && res.body[nmIdentifyer] == joParam[nmIdentifyer]
		try {
			if (!isBroughtAsList && !isBroughtSingle) {
				throw Error(`Item of id ${joParam[nmIdentifyer]} should've been received by the user`)
			}
		} catch {
			throw Error(`Item of id ${joParam[nmIdentifyer]} should've been received by the user`)
		}
	}

	public static descItShouldEvalExistence(isAuthRoute: boolean, r: string, u: TUserTest, ...arM: THttpMethod[]) {
		describe("Test basic", () => {
			arM.forEach(m => {
				it(TestShould.exist(), (done) => {
					TestCaseItem.callEvalExistence(done, r, m)
				})
				if (isAuthRoute) {
					it(TestShould.acceptBothTokens(), (done) => {
						TestCaseItem.callEvalAcceptBothTokens(done, r, m, u)
					})

					it(TestShould.failNoTokens(), (done) => {
						TestCaseItem.callEvalFailNoTokens(done, r, m)
					})
				}
			})
		})
	}

	public static callEvalSort(r: string, m: THttpMethod, u: TUserTest,
		joParam: any, nmProp: string, nmSort: string, mtSort: any) {
		it(TestShould.dsText({
			dsWhatsBeingTested: `${nmProp} sort`,
			dsCircumstances: `There's a dozen of items registered`,
			dsExpected: `It to be sorted`
		}), (d) => {
			const joParamEvalSort: any = { nmSort: nmSort, ...joParam }
			const customResponse = (res: Response) => {
				TestCaseItem.evalSort(res, mtSort, nmProp)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, r, m, u, joParamEvalSort, joResult)
		})
	}

	public static evalSort(res: Response, mtSort: any, nmProp: string) {
		const arItem: any[] = GeneralUtil.copy(res.body)
		const arItemSorted = arItem.sort(mtSort)
		for (let i = 0; i < arItem.length; i++) {
			if (res.body[i][nmProp] != arItemSorted[i][nmProp]) {
				throw Error(`Wrong sorting of ${nmProp}`)
			}
		}
	}

	public static evalChange(joExpected : any, joResult : any, isExpectedEquals : boolean,
		...arNmKey : string[]) {
		arNmKey.forEach((nmKey:string) => {
			if (isExpectedEquals && joExpected[nmKey] != joResult[nmKey]) {
				throw Error(`Expected same values. Field: ${nmKey}, `+
				`Result: ${joResult[nmKey]}, Expected: ${joExpected[nmKey]}`)
			}
			if (!isExpectedEquals && joExpected[nmKey] == joResult[nmKey]) {
				throw Error(`Expected values to be different. Field: ${nmKey}, `+
				`Result: ${joResult[nmKey]}, Expected: ${joExpected[nmKey]}`)
			}
		})
	}

	public static callEvalExistence(d: Done, r: string, m: THttpMethod) {
		TestUtil.call(r, m, undefined, undefined)
			.expect((res: supertest.Response) => {
				if (res.status == 404) {
					throw new Error("It does not exist. It expects the status to be different from 404")
				}
			})
			.end(TestUtil.end(d))
	}

	public static callEvalFailNoTokens(d: Done, r: string, m: THttpMethod) {
		TestUtil.call(r, m, undefined)
			.expect(400)
			.expect(SConst.STATUS_MESSAGE, CtExcep.refreshTokenUndefined.nmMsg)
			.end(TestUtil.end(d))
	}

	public static callEvalFailMissingAllParams(d: Done, r: string, m: THttpMethod, u?: TUserTest) {
		TestUtil.call(r, m, u)
			.expect(SConst.STATUS_MESSAGE, CtWarn.nmKeyRequired.nmMsg)
			.end(TestUtil.end(d))
	}

	public static callEvalFailMissingAParam(
		d: Done, r: string, m: THttpMethod, u: TUserTest, joParam: any, key: string) {
		const joParamCopy = GeneralUtil.copy(joParam)
		delete joParamCopy[key]
		TestUtil.call(r, m, u, joParamCopy)
			.expect(SConst.STATUS_MESSAGE, CtWarn.nmKeyRequired.nmMsg)
			.expect(400)
			.end(TestUtil.end(d))
	}

	public static callEvalAcceptBothTokens(d: Done, r: string, m: THttpMethod, u: TUserTest) {
		TestUtil.call(r, m, undefined)
			.set(SConst.X_ACCESS_TOKEN, TestUserManager.getActiveUser(u).userAccessToken)
			.set(SConst.X_REFRESH_TOKEN, TestUserManager.getActiveUser(u).userRefreshToken)
			.expect((res: supertest.Response) => {
				if (res.header.statusmessage == KeyEnum.refreshTokenUndefined) {
					throw Error("It is throwing an error through undefined refresh token")
				}
				if (res.header.statusmessage == KeyEnum.refreshTokenExpired) {
					throw Error("It is throwing an error through expired refresh token")
				}
				if (res.header.statusmessage == KeyEnum.refreshTokenInvalid) {
					throw Error("It is throwing an error through invalid refresh token")
				}
			})
			.end(TestUtil.end(d));
	}

	public static callEvalAcceptAccessTokenOnly(d: Done, r: string, m: THttpMethod, u: TUserTest) {
		TestUtil.call(r, m, undefined)
			.set(SConst.X_ACCESS_TOKEN, TestUserManager.getActiveUser(u).userAccessToken)
			.expect((res: supertest.Response) => {
				if (res.header.statusmessage == KeyEnum.refreshTokenUndefined) {
					throw Error("It is throwing an error through undefined refresh token")
				}
				if (res.header.statusmessage == KeyEnum.refreshTokenExpired) {
					throw Error("It is throwing an error through expired refresh token")
				}
				if (res.header.statusmessage == KeyEnum.refreshTokenInvalid) {
					throw Error("It is throwing an error through invalid refresh token")
				}
			})
			.end(TestUtil.end(d))
	}

	public static callEvalFailWrongTokens(d: Done, r: string, m: THttpMethod) {
		TestUtil.call(r, m, undefined)
			.set(SConst.X_ACCESS_TOKEN, '')
			.set(SConst.X_REFRESH_TOKEN, '')
			.expect(400)
			.expect(SConst.STATUS_MESSAGE, KeyEnum.refreshTokenInvalid)
			.end(TestUtil.end(d))
	}

	public static callEvalExpectedAttributes(d: Done, r: string, m: THttpMethod, u: TUserTest,
		arNmExpectedField: string[], joParam?: any, isList = false, acExtraAttr = false, acMissingAttr = false) {
		TestUtil.call(r, m, u, joParam)
			.expect(200)
			.expect((res: Response) => {
				TestCaseItem.evalExpectedAttributes(res.body, arNmExpectedField, isList, acExtraAttr, acMissingAttr)
			})
			.end(TestUtil.end(d))
	}

	public static evalExpectedAttributes(body: any, arNmExpectedField: string[],
		isList = false, acExtraAttr = false, acMissingAttr = false) {
		if (isList) {
			if (!acExtraAttr) {
				const arArNmExtraField = JsonUtil.getExtraParamsEach(body, arNmExpectedField)
				if (JsonUtil.isThereAnyAttrInTheItemsList(arArNmExtraField)) {
					const arNmExtraField = arArNmExtraField.length > 1 ? arArNmExtraField[0] : arArNmExtraField
					throw Error("It is bringing a list with items with EXTRA attributes: " + JSON.stringify(arNmExtraField))
				}
			}
			if (!acMissingAttr) {
				const arArNmMissingField = JsonUtil.getMissingParamsEach(body, arNmExpectedField)
				if (JsonUtil.isThereAnyAttrInTheItemsList(arArNmMissingField)) {
					const arNmMissingField = arArNmMissingField.length > 1 ? arArNmMissingField[0] : arArNmMissingField
					throw Error("It is MISSING bringing a list with items with an attribute: " + JSON.stringify(arNmMissingField))
				}
			}
		}
		else {
			if (!acExtraAttr) {
				const nmExtraField = JsonUtil.getExtraParams(body, arNmExpectedField)
				if (JsonUtil.isThereAnyAttrInTheItem(nmExtraField)) {
					throw Error("It is bringing items with EXTRA attributes: " + JSON.stringify(nmExtraField))
				}
			}
			if (!acMissingAttr) {
				const nmMissingField = JsonUtil.getMissingParams(body, arNmExpectedField)
				if (JsonUtil.isThereAnyAttrInTheItem(nmMissingField)) {
					throw Error("It is MISSING bringing items with the attributes: " + JSON.stringify(nmMissingField))
				}
			}
		}
	}

	public static queryUserPermission(idUser: number, cpsc: boolean, cpsch: boolean, css: boolean, cpw: boolean): string {
		const query = `insert into userpermission
			(idUser, canPostSeContent, canPostSeChannel, canSimulateSomeone, canPostWorkspace) values
			(${idUser}, ${cpsc}, ${cpsch}, ${css}, ${cpw})
			on conflict (idUser) do update set
			canPostSeContent = ${cpsc},
			canPostSeChannel = ${cpsch},
			canSimulateSomeone = ${css},
			canPostWorkspace = ${cpw}
			returning idUser as \"idUser\", canPostSeContent as \"canPostSeContent\",
			canPostSeChannel as \"canPostSeChannel\", canSimulateSomeone as \"canSimulateSomeone\"`
		return query
	}

	public static itShouldEditUserPermission(userTest: TUserTest | TestUser,
		cpsc: boolean, cpsch: boolean, css: boolean, cpw: boolean) {
		it(`make user ${userTest} canPostSeContent=${cpsc}, canPostSeChannel=${cpsch}, ` +
			`canSimulateSomeone=${css}, canPostWorkspace=${cpw}`, (done) => {
				TestCaseItem.callEditUserPermission(done, userTest, cpsc, cpsch, css, cpw)
		})
	}

	public static callEditUserPermission(done: Done, userTest: TUserTest | TestUser,
		cpsc: boolean, cpsch: boolean, css: boolean, cpw: boolean) {
		const user = TestUserManager.getActiveUser(userTest).loggedUser.user
		const query = TestCaseItem.queryUserPermission(user.idUser, cpsc, cpsch, css, cpw)
		ConnDao.staticQueryPromise(query)
			.then((result) => {
				if (+result[0][0].idUser == undefined) {
					throw Error("Upsert failed")
				}
				TestUtil.freeEnd(done)
			}).catch(done)
	}
}
