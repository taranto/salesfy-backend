import { GeneralUtil, StringUtil, BooleanUtil, CtHttpStatus } from "salesfy-shared";
import { THttpMethod, SConst, TUserTest } from "salesfy-shared";
import { supertest, Log, Done, TestUserManager, Env, TestShould, TestCaseItem, TestUser } from "../barrel/Barrel.spec";
import { Server } from "../../app/structure/Server";
import { Response } from "superagent";
import { Test } from "supertest";
import { LayerDao } from "app/layers_template/LayerDao";
import { ConnDao } from "app/structure/ConnDao";

export class TestUtil {

	public static call(r: string, m: THttpMethod, u: TUserTest | TestUser | number | "g" | "f" | "a",
		joParam?: any): Test {
		let queryString = ""
		if (joParam) {
			queryString = StringUtil.jsonToQueryString(joParam)
		}
		let mtDefaultStart
		if (m == SConst.HTTP_METHOD_POST) {
			mtDefaultStart = supertest(Server.app).post(r).send(joParam)
		} else if (m == SConst.HTTP_METHOD_PUT) {
			mtDefaultStart = supertest(Server.app).put(r).send(joParam)
		} else if (m == SConst.HTTP_METHOD_DELETE) {
			mtDefaultStart = supertest(Server.app).delete(r).send(joParam)
		} else if (m == SConst.HTTP_METHOD_PATCH) {
			mtDefaultStart = supertest(Server.app).patch(r).send(joParam)
		} else {
			mtDefaultStart = supertest(Server.app).get(r + queryString)
		}
		if (u) {
			mtDefaultStart
				.set(SConst.X_ACCESS_TOKEN, TestUserManager.getActiveUser(u).userAccessToken)
				.set(SConst.X_REFRESH_TOKEN, TestUserManager.getActiveUser(u).userRefreshToken)
		}
		return mtDefaultStart
	}

	public static end(d: Done, sayIt = false): supertest.CallbackHandler | undefined {
		return (err: any, res: Response) => {
			return TestUtil.endExec(d, err, res, sayIt)
		}
	}

	public static endExec(d: Done, err: any, res: Response, sayIt = false) {
		if (err) {
			Log.warn(TestUtil.say(err.message))
			return d("\n[TEST ERROR " + err.message + "]\n" + TestUtil.say(res))
		}
		if (sayIt) {
			Log.info(TestUtil.say(res))
		}
		d();
		return res
	}

	public static freeEnd(d: Done, message?: string) {
		if (message) {
			Log.info(TestUtil.say(message))
		}
		d()
	}

	private static say(toSay: Response | string): string {
		let dsMsg = ""
		if (typeof toSay == "string") {
			dsMsg = `${dsMsg}[MSG ${toSay}]`
			//TODO normalizar: se for um erro, nao poderia ser chamado isso aqui direto, para assim anotar [TEST ERROR]
		} else if (toSay && toSay.header) {
			const dsSm = toSay.header.statusmessage ? `${JSON.stringify(toSay.header.statusmessage)}` : ""
			const dsEc = toSay.header.extracontent ? `${JSON.stringify(toSay.header.extracontent)}` : ""
			const dsBody = JSON.stringify(toSay.body).substring(0, Env.getLogMsgCharLimiter())
			let qtBodyTotalItems = 0
			if (toSay.body.constructor == Array) {
				qtBodyTotalItems = toSay.body.length
			} else if (toSay.body != undefined && toSay.body != "") {
				qtBodyTotalItems = 1
			}
			const toSayRequest: any = toSay
			let toSayRequestData = ""
			if (toSayRequest["request"] && toSayRequest["request"]._data) {
				toSayRequestData = toSayRequest["request"]._data
			} else
			if (toSayRequest["request"] && toSayRequest["request"].url) {
				toSayRequestData = toSayRequest["request"].url
			}
			const dsBodyExtra = JSON.stringify(toSay.body).length < Env.getLogMsgCharLimiter() ? "" : `... and more`
			dsMsg = `${dsMsg}\n` +
				`[joParam ${JSON.stringify(toSayRequestData)}]\n` +
				`[HEADER SM ${dsSm}]\n` +
				`[HEADER EC ${dsEc}]\n` +
				`[ITEMS ${qtBodyTotalItems}]\n` +
				`[BODY ${dsBody}${dsBodyExtra}]`
		}
		return dsMsg
	}

	public static customCall(d: Done | undefined, r: string, m: THttpMethod,
		u: TUserTest | TestUser | number | "g" | "f" | "a", joParam?: any, joExpect?: {
			customResponse?: (res: Response) => any,
			nrStatus?: number, dsStatus?: string, joExtraContent?: any
		}) {
		const defaultStart = TestUtil.call(r, m, u, joParam)
		if (joExpect) {
			if (joExpect.customResponse) {
				defaultStart.expect(joExpect.customResponse)
			}
			if (joExpect.nrStatus) {
				defaultStart.expect(joExpect.nrStatus)
			} else {
				defaultStart.expect(CtHttpStatus.status200.keyCtHttpStatus)
			}
			if (joExpect.dsStatus) {
				defaultStart.expect(SConst.STATUS_MESSAGE, joExpect.dsStatus)
			}
			if (joExpect.joExtraContent) {
				defaultStart.expect(
					(res: Response) => {
						if (res.header[SConst.EXTRA_CONTENT] != JSON.stringify(joExpect.joExtraContent)) {
							throw Error(`Expected ${SConst.EXTRA_CONTENT + ""} = ${joExpect.joExtraContent + ""}`)
						}
					}
				)
			}
		} else {
			defaultStart.expect(CtHttpStatus.status200.keyCtHttpStatus)
		}
		if (d) {
			defaultStart.end(TestUtil.end(d))
		} else {
			defaultStart.end((err) => { })
		}
	}

	public static query(d: Done, query: string, customResponse: (res: Response) => any) {
		ConnDao.staticQueryPromise(query)
			.then(customResponse)
			.then(() => TestUtil.freeEnd(d))
			.catch(d)
	}
}
