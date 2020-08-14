import { RoutesEnum, ILoggedUser, TUserTest, SConst, StringUtil } from "salesfy-shared";
import { DbConn, TestUser, Done, Log, supertest, TestUtil } from "../barrel/Barrel.spec";
import { AuthDao } from "../../app/modules/auth/AuthDao";
import { AuthBsn } from "../../app/modules/auth/AuthBsn";
import { LayerDao } from "app/layers_template/LayerDao";
import { AuthTokenBsn } from "app/modules/auth/AuthTokenBsn";
import { EnvTest } from "./EnvTest.spec";
import { ConnDao } from "app/structure/ConnDao";
import { HError } from "app/util/status/HError";
import { Response } from "superagent";
import { TestHnValueGen } from "./TestHnValueGen.spec";
import { TestUserBox } from "./TestUserBox.spec";
import { deprecate } from "util";

export class TestUserManager {

	/** @deprecate */
	public static getActiveUser(nmActiveUser?: TUserTest | TestUser | number | "g" | "f" | "a", ): TestUser {
		if (nmActiveUser instanceof TestUser) {
			return nmActiveUser
		} else {
			let active: TestUser
			switch (nmActiveUser) {
				case SConst.TEST_ROLE_NORMAL_USER: active = TestUserManager.getUser(); break;
				case SConst.TEST_ROLE_NEW_USER: active = TestUserManager.getNewUser(); break;
				case SConst.TEST_ROLE_ADMIN_USER: active = TestUserManager.getAdminUser(); break;
				default: active = TestUserManager.getUser(nmActiveUser)
			}
			return active
		}
	}

	/** @deprecate */
	public static getNewUser(): TestUser {
		const u = TestUserBox.getActiveUser()
		return u
	}

	/** @deprecate */
	public static getUser(iTestUser?: number | "g" | "f" | "a"): TestUser {
		const u = TestUserBox.getUser(iTestUser || 0)
		return u
	}

	/** @deprecate */
	public static getAdminUser(): TestUser {
		return TestUserBox.getAdmin()
	}

	public static async setUserPassword(emUser: string, obKeyPasswordNew: string, isPlain = true): Promise<string> {
		let obKeyPassword = obKeyPasswordNew
		if (isPlain) {
			obKeyPassword = await AuthBsn.encrypt(obKeyPasswordNew)
		}
		const query = `update usr set crKeyPassword = '${obKeyPassword}' where emUser like '${emUser}'`
		await ConnDao.staticQueryPromise(query)
		return obKeyPassword
	}

	public static genJoUser(
		joParam?: { nmUser?: string, emUser?: string, unKeyPassword?: string, idWorkspace?: number }) {
		if (joParam == undefined) {
			joParam = {}
		}
		joParam.nmUser = joParam.nmUser || TestHnValueGen.genString()
		joParam.unKeyPassword = joParam.unKeyPassword || EnvTest.getUnPwDefault()
		joParam.emUser = joParam.emUser || TestHnValueGen.genEmail()
		const joParamUser = {
			nmUser: joParam.nmUser,
			unKeyPassword: joParam.unKeyPassword || EnvTest.getUnPwDefault(),
			emUser: joParam.emUser,
			idWorkspace: joParam.idWorkspace || EnvTest.getIdWorkspaceDefault() || 0
		}
		return joParamUser
	}

	public static defaultResponse = (
		res: Response, customResponse?: (res: Response) => any,
		iTestUser?: number | "g" | "f" | "a"
	) => {
		if (customResponse) {
			customResponse(res)
		}
		const mtSetUser = TestUserBox.getMtSetUser(iTestUser)
		if (mtSetUser && res.status == 200) {
			const tokens = {
				accessToken: res.header[SConst.X_ACCESS_TOKEN],
				refreshToken: res.header[SConst.X_REFRESH_TOKEN]
			}
			const iUserLogged: ILoggedUser = {
				user: res.body,
				tokens: tokens
			}
			const testUser = new TestUser(iUserLogged)
			const i = mtSetUser(testUser, iTestUser)
			Log.console(`[emUser ${testUser.user.emUser}][idUser ${testUser.user.idUser}][TestUserBoxIndex ${i}]
					[x-access-token: ${testUser.userAccessToken}]
					[x-refresh-token: ${testUser.userRefreshToken}]`)
		}
	}

	public static async register(d?: Done,
		joParam?: { nmUser: string, emUser: string, unKeyPassword: string, idWorkspace: number, dsToken?: string },
		customResponse?: (res: Response) => any, iTestUser?: number | "g" | "f" | "a", joUserAuthor?: TestUser
	) {
		const isImpossibleToRegister = (iTestUser == "g" || iTestUser == "f") && (!joParam || joParam.dsToken == undefined)
		if (isImpossibleToRegister) {
			if (d) {
				d(`User ${iTestUser} is impossible to login due to lack of token`)
			}
			return
		}
		const onResponse = (res: Response) => {
			TestUserManager.defaultResponse(res, customResponse, iTestUser)
		}
		const joResult = { customResponse: onResponse }
		joParam = TestUserManager.genJoUser(joParam)
		TestUtil.customCall(d, RoutesEnum.userRegister, SConst.HTTP_METHOD_POST, joUserAuthor, joParam, joResult)
	}

	public static async login(d?: Done, joParam?: { emUser?: string, unKeyPassword?: string, dsToken?: string },
		customResponse?: (res: Response) => any, iTestUser?: number | "g" | "f" | "a"
	) {
		const isImpossibleToLogin = (iTestUser == "g" || iTestUser == "f") && (!joParam || joParam.dsToken == undefined)
		if (isImpossibleToLogin) {
			if (d) {
				d(`User ${iTestUser} is impossible to login due to lack of token`)
			}
			return
		}
		const onResponse = (res: Response) => {
			TestUserManager.defaultResponse(res, customResponse, iTestUser)
		}
		const r = TestUserManager.getLoginRoute(iTestUser);
		const joResult = { customResponse: onResponse }
		TestUtil.customCall(d, r, SConst.HTTP_METHOD_POST, undefined, joParam, joResult)
	}

	private static getLoginRoute(iTestUser?: number | "g" | "f" | "a") {
		let r = RoutesEnum.userLogin;
		if (iTestUser == "g") {
			r = RoutesEnum.userLoginGmail;
		}
		if (iTestUser == "f") {
			r = RoutesEnum.userLoginFacebook;
		}
		return r;
	}
}
