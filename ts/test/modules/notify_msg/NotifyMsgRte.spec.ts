import { TestUtil, TestShould, TestCaseItem } from "../../barrel/Barrel.spec";
import { RoutesEnum, SConst, KeyEnum, CtSystem, CtLocale } from "salesfy-shared";
import { LayerDao } from "app/layers_template/LayerDao";
import { NotifyMsg } from "app/modules/notify_msg/NotifyMsg";
import { ConnDao } from "app/structure/ConnDao";
import { Response } from "superagent";

export class NotifyMsgRteSpec {

	public static test() {
		describe(TestShould.describeTitle(RoutesEnum.notifyMsg), () => {
			NotifyMsgRteSpec.testNotifyMsg()
		})
	}

	private static getDefaultjoNotifyMsg(joCustomParams?: any): any {
		const joNotifyMsg = {
			snVersionMin: "0.0.1",
			snVersionMax: "0.0.2",
			ctSystem: CtSystem.android.key,
			keyMsg: undefined,
			dsMsgRawEn: "Hello",
			dsMsgRawPt: "Olá",
			isBlockable: true,
			isUpdatable: false,
			dhStart: new Date(new Date().getTime() - (SConst.MILI_SEC)),
			dhEnd: new Date(new Date().getTime() + (SConst.MILI_SEC * 10)),
			...joCustomParams
		}
		return joNotifyMsg
	}

	private static testNotifyMsg() {
		const r = RoutesEnum.notifyMsg
		const m = SConst.HTTP_METHOD_GET

		before("Should prepare the version in the database for the test 1 (Android, blockable, raw)", (done) => {
			const joParam = NotifyMsgRteSpec.getDefaultjoNotifyMsg()
			ConnDao.staticUpsertPromise(NotifyMsg, joParam)
				.then((result) => {
					done()
				})
		})

		before("Should prepare the version in the database for the test(iPhone, updatable, keyed, english", (done) => {
			const joCustomParam = NotifyMsgRteSpec.getDefaultjoNotifyMsg({
				snVersionMin: "0.0.3",
				snVersionMax: "0.0.4",
				ctSystem: CtSystem.iphone.key,
				keyMsg: KeyEnum.updateVersionSoft,
				dsMsgRawEn: "Hello",
				dsMsgRawPt: "oi",
				isBlockable: false,
				isUpdatable: true,
			})
			const joParam = NotifyMsgRteSpec.getDefaultjoNotifyMsg(joCustomParam)
			ConnDao.staticUpsertPromise(NotifyMsg, joParam)
				.then((result) => {
					done()
				})
		})

		it(TestShould.exist(), (done) => {
			TestCaseItem.callEvalExistence(done, r, m)
		})

		it(TestShould.failMissingAllParams(), (done) => {
			TestCaseItem.callEvalFailMissingAllParams(done, r, m)
		})

		const joMissingParam = {
			snVersion: "0.0.9",
			nmCtSystem: CtSystem.android.nm,
			keyCtLocale: CtLocale.english.keyCtLocale
		}
		const keys = ["snVersion", "nmCtSystem"]
		keys.forEach(key => {
			it(TestShould.failMissingAParam(key), (done) => {
				TestCaseItem.callEvalFailMissingAParam(done, r, m, undefined, joMissingParam, key)
			})
		})

		it("It should get NO message", (done) => {
			const joParam = {
				snVersion: "0.0.9",
				nmCtSystem: CtSystem.android.nm,
				nmCtLocale: CtLocale.english.nmCtLocale
			}
			TestUtil.call(r, m, SConst.TEST_ROLE_NORMAL_USER, joParam)
				.expect(200)
				.expect((res: Response) => {
					const body: any = res.body
					if (body.keyMsg || body.dsMsgRaw || body.isBlocked != undefined || body.isUpdate != undefined) {
						throw Error("An unexpected message were notified by the backend")
					}
				})
				.end(TestUtil.end(done))
		})

		it("It should say something with message raw, Android, blockeable, and in english", (done) => {
			const joParam = {
				snVersion: "0.0.2",
				nmCtSystem: CtSystem.android.nm,
				nmCtLocale: CtLocale.english.nmCtLocale
			}
			TestUtil.call(r, m, undefined, joParam)
				.expect(200)
				.expect((res: Response) => {
					const body: any = res.body
					if (body.keyMsg != undefined || body.dsMsgRaw != "Hello" ||
						body.isBlocked != true || body.isUpdate != false) {
						throw Error("The wrong message came from the server")
					}
				})
				.end(TestUtil.end(done))
		})

		it(TestShould.execute(), (done) => {
			const joParam = {
				nmChannel: "A"
			}
			const customResponse = (res: Response) => {
				const a = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.channel, SConst.HTTP_METHOD_GET, SConst.TEST_ROLE_NORMAL_USER,
				joParam, joResult)
		})

		it("It should say something with message Keyed, IPhone OS, updateable", (done) => {
			const joParam = {
				snVersion: "0.0.3",
				nmCtSystem: CtSystem.iphone.nm,
				nmCtLocale: CtLocale.portuguese.nmCtLocale
			}
			TestUtil.call(r, m, undefined, joParam)
				.expect(200)
				.expect((res: Response) => {
					const body: any = res.body
					if (body.keyMsg != KeyEnum.updateVersionSoft || body.dsMsgRaw != undefined ||
						body.isBlocked != false || body.isUpdate != true) {
						throw Error("The wrong message came from the server")
					}
				})
				.end(TestUtil.end(done))
		})

		it("It should get NO message", (done) => {
			const joParam = {
				snVersion: "0.0.3",
				nmCtSystem: CtSystem.android.nm,
				keyCtLocale: CtLocale.portuguese.keyCtLocale
			}
			TestUtil.call(r, m, undefined, joParam)
				.expect(200)
				.expect((res: Response) => {
					const body: any = res.body
					if (body.keyMsg || body.dsMsgRaw || body.isBlocked != undefined || body.isUpdate != undefined) {
						throw Error("An unexpected message were notified by the backend")
					}
				})
				.end(TestUtil.end(done))
		})
	}
}
