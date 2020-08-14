import { StringUtil, TUserTest, SConst, RoutesEnum } from "salesfy-shared";
import { Log, Server, TestUserManager, TestUser, Done, Response, TestShould, TestCaseItem, TestUtil } from "../barrel/Barrel.spec";
import { EnvTest } from "./EnvTest.spec";
import { TestUserBox } from "./TestUserBox.spec";
import { ConnDao } from "app/structure/ConnDao";

export class TestConfig {

	public static startTime: number
	public static endTime: number
	public static joParamMain: any = {}

	public static beforeAllTest() {

		before(``, done => {
			TestConfig.startTime = new Date().getTime();
			Server.start(done)
		})

		if (EnvTest.getShDoTest()) {
			TestConfig.integrateUsersToTest(EnvTest.getJoUserAdmin(), "a")

			TestConfig.prepareWorkspace()

			TestConfig.prepareUsers()

			it("@none", done => {
				done()
			})
		}
	}

	public static prepareWorkspace() {
		if (!EnvTest.getIdWorkspaceDefault()) {
			before(`Guarantee existence of test workspace`, done => {
				const joParam = {
					nmWorkspace : StringUtil.random(),
					b64PiWorkspace : EnvTest.getB64Image()
				}
				const customResponse = (res: Response) => {
					EnvTest.setIdWorkspaceDefault(res.body.idWorkspace)
				}
				const joResult = { customResponse : customResponse }
				TestUtil.customCall(done, RoutesEnum.workspace, SConst.HTTP_METHOD_POST, TestUserBox.getAdmin(), joParam, joResult)
			})
		}
	}

	public static prepareUsers() {
		TestConfig.integrateUsersToTest(EnvTest.getJoUserGmail(), "f", TestUserBox.getAdmin())
		TestConfig.integrateUsersToTest(EnvTest.getJoUserFacebook(), "g", TestUserBox.getAdmin())
		const arJoUser = EnvTest.getArJoUser()
		for (let i = 0; i < arJoUser.length; i++) {
			const joUser = arJoUser[i]
			TestConfig.integrateUsersToTest(joUser, i, TestUserBox.getAdmin())
		}
		for (let i = arJoUser.length; i < arJoUser.length+EnvTest.getQtUserAddNew(); i++) {
			TestConfig.integrateUsersToTest(undefined, i, TestUserBox.getAdmin())
		}
	}

	public static integrateUsersToTest(joUser: any, ltIndex?: any, joUserAuthor?: TestUser) {
		if ((ltIndex == "f" || ltIndex == "g") && (!joUser || !joUser.dsToken)) {
			return
		}
		if (!joUser) {
			joUser = TestUserManager.genJoUser(joUser)
		}
		before(`Verify user existence`, done => {
			const query = `select * from usr where emUser ilike '${joUser.emUser}'`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					let isRegistered = true
					if (result[0][0] == undefined) {
						isRegistered = false
					}
					this.joParamMain[ltIndex] = {}
					this.joParamMain[ltIndex].isRegistered = isRegistered
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		before(`Register`, done => {
			if (this.joParamMain[ltIndex].isRegistered) {
				done()
			} else {
				TestUserManager.register(done, joUser, undefined, ltIndex, joUserAuthor)
			}
		})

		before(`Force password to simplify login`, done => {
			const unKeyPassword =  joUser.unKeyPassword || EnvTest.getUnPwDefault()
			TestUserManager.setUserPassword(joUser.emUser, unKeyPassword).then(()=>done())
		})

		before(`Log user in`, done => {
			if (!this.joParamMain[ltIndex].isRegistered) {
				done()
			} else {
				const joParam = {
					emUser: joUser.emUser,
					unKeyPassword: joUser.unKeyPassword || EnvTest.getUnPwDefault()
				}
				TestUserManager.login(done, joParam, undefined, ltIndex)
			}
		})

		before(`Update user permissions`, done => {
			if (ltIndex == "a") {
				TestCaseItem.callEditUserPermission(done, TestUserBox.getUser(ltIndex), true, true, true, true)
			} else {
				done()
			}
		})
	}

	public static afterAllTest() {
		after(done => {
			TestConfig.endTime = new Date().getTime();
			Log.console("------------ TEST EXECUTION TIME: " + (TestConfig.endTime - TestConfig.startTime) + "ms")
			if (EnvTest.getShShutdownAfterTest()) {
				Server.tryClose("Test ended", undefined, done)
			} else {
				this.neverEndingTimeout()
			}
		})
	}

	private static neverEndingTimeout() {
		setTimeout(() => {
			TestConfig.neverEndingTimeout()
		}, SConst.MILI_SEC * 10);
	}
}
