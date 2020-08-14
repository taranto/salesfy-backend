import { RoutesEnum, SConst, CtHttpStatus, GeneralUtil, CtExcep, CtUserGroupAccess } from "salesfy-shared";
import { KeyEnum, StringUtil, JsonUtil } from "salesfy-shared";
import { TestCaseItem, TestUserManager, TestShould, TestUtil, supertest, Env, TestConfig, should } from "../../barrel/Barrel.spec";
import { LayerDao } from "app/layers_template/LayerDao";
import { Response } from "superagent";
import { EnvTest } from "../../support/EnvTest.spec";
import { TestRouteSpec } from "../../support/TestRoute.spec";
import { TestUserBox } from "../../support/TestUserBox.spec";
import { User } from "app/modules/user/User";
import { TestEntity } from "../../support/TestEntity.spec";
import { ConnDao } from "app/structure/ConnDao";
import { DaoUtil } from "app/util/DaoUtil";

export class UserRteSpec extends TestRouteSpec {

	private r = RoutesEnum.user

	public test() {
		describe(TestShould.dsText({ nmRoute: RoutesEnum.user }), () => {
			describe(TestShould.dsText({ dsText: "basic" }), () => {
				this.testBasic()
			})
			describe(TestShould.dsText({ nmMethod: SConst.HTTP_METHOD_GET }), () => {
				this.testGet()
			})
			describe(TestShould.dsText({ nmMethod: SConst.HTTP_METHOD_PUT }), () => {
				this.testPut()
			})
		})
		describe(TestShould.descRouteMethod(RoutesEnum.userNetwork, SConst.HTTP_METHOD_GET), () => {
			this.testUserNetwork()
		})
	}

	private testBasic() {
		TestCaseItem.descItShouldEvalExistence(true, this.r, this.u, this.mGet, this.mPut)
		TestCaseItem.descItShouldEvalExistence(true, RoutesEnum.userNetwork, this.u, this.mGet)
	}

	private testUserNetwork() {
		const r = RoutesEnum.userNetwork
		before(TestShould.startTest(), (done) => {
			this.joParamMain = {}
			done()
		})

		/*
		get user network users (list A)
		get no-filtered list (list 'all')
		create group A
		get any user (B) not in list A but in list 'all'
		add user B in group A
		get user network users again (list B)
		list B must have:
			+1 user
			this extra user must be user B
		remove user B from group A
		get user network users again (list C)
		list C must be equals to list A
		create group B
		add user B in group B
		get user network users again (list D)
		list D must be equals to list B
		delete group B
		get user network users again (list E)
		list E must be equals to list A
		*/

		it("It should get user network users (list A)", (done) => {
			const joParam = {}
			const customResponse = (res: Response) => {
				this.joParamMain.arJoUserNetworkA = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, this.mGet, this.u, joParam, joResult)
		})

		it("It should get the list of all id users", (done) => {
			const query = `select idUser \"idUser\" from usr where isActive`
			const customResponse = (res: any) => {
				this.joParamMain.arIdUserAll = res[0]
			}
			TestUtil.query(done, query, customResponse)
		})

		it("It should create group A", (done) => {
			const joParam = {
				nmGroup: "group test user network A " + StringUtil.random(),
				idWorkspace: EnvTest.getIdWorkspaceDefault()
			}
			const customResponse = (res: Response) => {
				this.joParamMain.joGroupA = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.group, this.mPost, this.u, joParam, joResult)
		})

		it("It should add to the group A an user that's not already in the user network (user B)", (done) => {
			const arIdUserA = GeneralUtil.extractArrayValueFromJson(this.joParamMain.arJoUserNetworkA, "idUser")
			const userMe = TestUserManager.getUser().loggedUser.user
			const arIdUserAPlusMe = arIdUserA
			arIdUserAPlusMe.push(+userMe.idUser)
			const arIdUserAllMinusA = this.joParamMain.arIdUserAll.filter((idUser: number) => {
				return arIdUserAPlusMe.indexOf(idUser) == -1
			})
			const idUserB = arIdUserAllMinusA[0].idUser
			const joParam = {
				idUser: idUserB,
				idGroup: this.joParamMain.joGroupA.idGroup,
				idCtUserGroupAccess: CtUserGroupAccess.member.key
			}
			const customResponse = (res: Response) => {
				this.joParamMain.idUserBGroupA = res.body.idUserGroup
				this.joParamMain.idUserB = res.body.idUser
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.userGroup, this.mPost, this.u, joParam, joResult)
		})

		it("It should get user network users (list B)", (done) => {
			const joParam = {}
			const customResponse = (res: Response) => {
				this.joParamMain.arJoNetworkUsersB = res.body
				const qtUsersListA = this.joParamMain.arJoUserNetworkA.length
				const qtUsersListB = this.joParamMain.arJoNetworkUsersB.length
				if (qtUsersListA != qtUsersListB - 1) {
					throw Error("There should've been one more user in the user A network")
				}
				const arIdUsersA = GeneralUtil.extractArrayValueFromJson(this.joParamMain.arJoUserNetworkA, "idUser")
				const arIdUsersB = GeneralUtil.extractArrayValueFromJson(this.joParamMain.arJoNetworkUsersB, "idUser")
				const arIdUsersBMinusA = arIdUsersB.filter(idUser => arIdUsersA.indexOf(idUser) == -1)
				const idUserBMaybe = arIdUsersBMinusA[0]
				if (idUserBMaybe != this.joParamMain.idUserB) {
					throw Error("There should've been the user B the new one at the user A network")
				}
				this.joParamMain.idUserB = idUserBMaybe
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, this.mGet, this.u, joParam, joResult)
		})

		it("It should remove user B from the group A", (done) => {
			const joParam = { idUserGroup: this.joParamMain.idUserBGroupA }
			TestUtil.customCall(done, RoutesEnum.userGroup, this.mDel, this.u, joParam)
		})

		it("It should get user network users (list C)", (done) => {
			const joParam = {}
			const customResponse = (res: Response) => {
				this.joParamMain.arJoNetworkUsersC = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, this.mGet, this.u, joParam, joResult)
		})

		it("It should be equals: list C and list A", (done) => {
			const joParam = {}
			const customResponse = (res: Response) => {
				this.joParamMain.arJoNetworkUsersC = res.body
				const isSameList = JsonUtil.isSameArJoKeys(
					this.joParamMain.arJoNetworkUsersC, this.joParamMain.arJoUserNetworkA, true, "idUser")
				if (!isSameList) {
					throw Error("The list of users in A and C should be the same")
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, this.mGet, this.u, joParam, joResult)
		})

		it("It should create group B", (done) => {
			const joParam = {
				nmGroup: "group test user network B " + StringUtil.random(),
				idWorkspace: EnvTest.getIdWorkspaceDefault()
			}
			const customResponse = (res: Response) => {
				this.joParamMain.joGroupB = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.group, this.mPost, this.u, joParam, joResult)
		})

		it("It should add to the user B to the group B", (done) => {
			const joParam = {
				idUser: this.joParamMain.idUserB,
				idGroup: this.joParamMain.joGroupA.idGroup,
				idCtUserGroupAccess: CtUserGroupAccess.member.key
			}
			const customResponse = (res: Response) => {
				this.joParamMain.idUserBGroupB = res.body.idUserGroup
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.userGroup, this.mPost, this.u, joParam, joResult)
		})

		it("It should get user network users (list D)", (done) => {
			const joParam = {}
			const customResponse = (res: Response) => {
				this.joParamMain.arJoNetworkUsersD = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, this.mGet, this.u, joParam, joResult)
		})

		it("It should be equals: list B and list D", (done) => {
			const joParam = {}
			const customResponse = (res: Response) => {
				this.joParamMain.arJoNetworkUsersD = res.body
				const isSameList = JsonUtil.isSameArJoKeys(
					this.joParamMain.arJoNetworkUsersD, this.joParamMain.arJoNetworkUsersB, true, "idUser")
				if (!isSameList) {
					throw Error("The list of users in B and D should be the same")
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, this.mGet, this.u, joParam, joResult)
		})

		it("It should remove group B", (done) => {
			const joParam = { idGroup: this.joParamMain.joGroupB.idGroup }
			const customResponse = (res: Response) => {
				this.joParamMain.idUserBGroupB = res.body.idUserGroup
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.group, this.mDel, this.u, joParam, joResult)
		})

		it("It should get user network users (list E)", (done) => {
			const joParam = {}
			const customResponse = (res: Response) => {
				this.joParamMain.arJoNetworkUsersE = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, this.mGet, this.u, joParam, joResult)
		})

		it("It should be equals: list A and list E", (done) => {
			const joParam = {}
			const customResponse = (res: Response) => {
				this.joParamMain.arJoNetworkUsersE = res.body
				const isSameList = JsonUtil.isSameArJoKeys(
					this.joParamMain.arJoUserNetworkA, this.joParamMain.arJoNetworkUsersE, true, "idUser")
				if (!isSameList) {
					throw Error("The list of users in A and E should be the same")
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, this.mGet, this.u, joParam, joResult)
		})

		it("testing raw filters 1", (done) => {
			const loggedUser = TestUserManager.getNewUser().loggedUser
			const joParam = {
				qtOffset: 5,
				qtLimit: 5,
				emUser: loggedUser.user.emUser,
				isLimitFree: true,
				idUserInNetworkSpecific: loggedUser.user.idUser,
				idWorkspace: EnvTest.getIdWorkspaceDefault(),
				hasMe: true
			}
			TestCaseItem.callEvalMultipleParamCombinations(done, this.r, this.mGet, this.u, joParam, "idUser")
		})

		it("testing raw filters 2", (done) => {
			const loggedUser = TestUserManager.getUser().loggedUser
			const joParam = {
				qtOffset: 5,
				qtLimit: 5,
				emUser: loggedUser.user.emUser,
				isLimitFree: false,
				idUserInNetworkSpecific: loggedUser.user.idUser,
				idWorkspace: EnvTest.getIdWorkspaceDefault(),
				hasMe: false
			}
			TestCaseItem.callEvalMultipleParamCombinations(done, this.r, this.mGet, this.u, joParam, "idUser")
		})
	}

	private testPut() {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = {}
			done()
		})

		it(TestShould.dsText({ dsPreparation: "register user to interact" }), d => {
			const joUser = TestUserManager.genJoUser()
			const customResponse = (res: any) => {
				this.joParamMain.joUser = res.body
			}
			TestUserManager.register(d, joUser, customResponse, undefined, TestUserBox.getAdmin())
		})

		it(TestShould.dsText({ dsPreparation: `Log user in` }), d => {
			const joParam = {
				emUser: this.joParamMain.joUser.emUser,
				unKeyPassword: EnvTest.getUnPwDefault()
			}
			TestUserManager.login(d, joParam)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Can an user update another one?`,
			dsCircumstances: `It should not allow some other user to update an user`,
			dsExpected: `Failing`
		}), d => {
			const joParam: any = {
				idUser: TestUserBox.getLast().user.idUser,
				nmUser: "aaa"
			}
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus: CtExcep.userNotAuthorized.nmMsg
			}
			TestUtil.customCall(d, RoutesEnum.user, this.mPut, TestUserBox.getAdmin(), joParam, joResult)
		})

		it(TestShould.dsText({
			dsPreparation: `To update only a couple of fields`
		}), d => {
			this.joParamMain.joUserNewFields = TestEntity.gen(User, { isEmailConfirmed: true })
			const joParam: any = {
				...this.joParamMain.joUserNewFields,
				idUser: TestUserBox.getLast().user.idUser
			}
			const customResponse = (res: any) => {
				this.joParamMain.joUserUpdated = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.user, this.mPut, TestUserBox.getLast(), joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Can an user update himself?`,
			dsCircumstances: `A normal user updates himself`,
			dsExpected: `To update only a couple of fields`
		}), d => {

			const query = `select ${DaoUtil.getCsNmField(User.getArNmFieldAuth(), "u", true)}
				from usr u where idUser = ${TestUserBox.getLast().user.idUser}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					if (+result[0][0].idUser == undefined) {
						throw Error("Upsert failed")
					}
					const joUserStored = result[0][0]
					TestCaseItem.evalChange(joUserStored, this.joParamMain.joUserNewFields, false,
						"crKeyPassword", "emUser", "dhRegister",
						"crKeyRefreshToken", "crKeyResetPassword", "dhKeyResetPasswordExpiration", "crKeyEmailConfirmation",
						"isEmailConfirmed", "dhLastAccess", "keyFacebook", "keyGoogle")
					TestCaseItem.evalChange(joUserStored, this.joParamMain.joUserNewFields, true,
						"nmUser", "snTelephone", "nrlanguage", "idWorkspaceDefault",
						"snWhatsapp", "piAvatar", "nmCompany", "nmCargo",
						"lkFacebook", "lkLinkedin", "dsTestimony", "lkWebsite")
					TestUtil.freeEnd(d)
				}).catch(d)
		})
	}

	private testGet() {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = {}
			done()
		})

		const expectedAttr = ["idUser", "nmUser", "piAvatar", "nmCompany", "nmCargo", "dsTestimony", "lkWebsite",
			"lkLinkedin", "idWorkspaceDefault"]
		it("It should bring only the expected attributes", (done) => {
			TestCaseItem.callEvalExpectedAttributes(done, this.r, this.mGet, this.u, expectedAttr, undefined, true, false, false)
		})
		it("It should bring only the expected attributes again, " +
			"event if it were sent the 'isPrivateSelect' attribute", (done) => {
				const joParam = { isPrivateSelect: true }
				TestCaseItem.callEvalExpectedAttributes(
					done, this.r, this.mGet, this.u, expectedAttr, undefined, true, false, false)
			})

		it("It should find the new user by id", (done) => {
			const user = TestUserManager.getNewUser().loggedUser.user
			const joParam = { idUser: user.idUser }
			const customResponse = (res: any) => {
				if (res.body[0] == undefined) {
					throw Error("user not found")
				}
				if (res.body[0] != undefined && res.body[0].idUser != user.idUser) {
					throw Error("wrong user found")
				}
				if (res.body[1] != undefined) {
					throw Error("more than one user user found")
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, this.r, this.mGet, this.u, joParam, joResult)
		})

		it("It should find the new user by email", (done) => {
			const user = TestUserManager.getNewUser().loggedUser.user
			const joParam = { emUser: user.emUser }
			const customResponse = (res: any) => {
				if (res.body[0] == undefined) {
					throw Error("user not found")
				}
				if (res.body[0] != undefined && res.body[0].idUser != user.idUser) {
					throw Error("wrong user found")
				}
				if (res.body[1] != undefined) {
					throw Error("more than one user user found")
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, this.r, this.mGet, this.u, joParam, joResult)
		})

		it("It should NOT find the new user by A SLICE OF email", (done) => {
			const user = TestUserManager.getNewUser().loggedUser.user
			const dsSliceEmUSer = user.emUser.slice(2)
			const joParam = { emUser: dsSliceEmUSer }
			const customResponse = (res: any) => {
				if (res.body[1] != undefined) {
					throw Error("more than one user user found")
				}
				if (res.body[0] != undefined && res.body[0].idUser == user.idUser) {
					throw Error("That user shouldn't have been found")
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, this.r, this.mGet, this.u, joParam, joResult)
		})

		it(`Get the total number of users to test`, (done) => {
			const joParam = { isLimitFree: false }
			const customResponse = (res: any) => {
				this.joParamMain.qtUsers = res.body.length
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, this.r, this.mGet, this.u, joParam, joResult)
		})

		it("It should validate the isLimitFree attribute", (done) => {
			const joParam = { isLimitFree: true }
			const customResponse = (res: any) => {
				if (res.body.length > this.joParamMain.qtUsers) {
					throw Error("There should've been brought all users (at least more than the fetch list limit)")
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, this.r, this.mGet, this.u, joParam, joResult)
		})

		it(TestShould.execute(1), (done) => {
			const user = TestUserManager.getNewUser().loggedUser.user
			const joParam = {
				qtOffset: 5,
				qtLimit: 5,
				isActive: true,
				idUser: user.idUser
			}
			TestCaseItem.callEvalMultipleParamCombinations(done, this.r, this.mGet, this.u, joParam, "idUser")
		})
	}
}
