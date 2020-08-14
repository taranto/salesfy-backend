
import { RoutesEnum, SConst, KeyEnum, StringUtil, CtHttpStatus, CtExcep, CtWarn, CtUserGroupAccess } from "salesfy-shared";
import { TestUtil, TestShould, TestCaseItem, TestUserManager } from "../../barrel/Barrel.spec";
import { LayerDao } from "app/layers_template/LayerDao";
import { Response } from "superagent";
import { ConnDao } from "app/structure/ConnDao";
import { TestRouteSpec } from "../../support/TestRoute.spec";
import { EnvTest } from "../../support/EnvTest.spec";
import { Group } from "app/modules/group/Group";
import { TestEntity } from "../../support/TestEntity.spec";
import { UserGroup } from "app/modules/user_group/UserGroup";

export class UserGroupRteSpec extends TestRouteSpec {

	private r = RoutesEnum.userGroup

	public test() {
		describe(TestShould.dsText({ nmRoute: RoutesEnum.userGroup }), () => {
			describe(TestShould.dsText({ dsText: "exists" }), () => {
				this.testExists()
			})
			describe(TestShould.descRouteMethod(RoutesEnum.userGroup, SConst.HTTP_METHOD_POST), () => {
				this.testUserGroupPost()
			})
			describe(TestShould.descRouteMethod(RoutesEnum.userGroup, SConst.HTTP_METHOD_PUT), () => {
				this.testUserGroupPut()
			})
			describe(TestShould.descRouteMethod(RoutesEnum.userGroup, SConst.HTTP_METHOD_GET), () => {
				this.testUserGroupGet()
			})
			describe(TestShould.descRouteMethod(RoutesEnum.userGroup, SConst.HTTP_METHOD_DELETE), () => {
				this.testUserGroupDelete()
			})
		})
	}

	private testExists() {
		TestCaseItem.descItShouldEvalExistence(true, this.r, this.u, this.mGet, this.mPut, this.mPost, this.mDel)
	}

	private testUserGroupGet() {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = { nmGroup: StringUtil.random() }
			done()
		})

		it("It should add a new group(added by normal test user)", (done) => {
			const joParam2 = {
				nmGroup: this.joParamMain.nmGroup,
				idWorkspace: EnvTest.getIdWorkspaceDefault()
			}
			TestUtil.customCall(done, RoutesEnum.group, this.mPost, this.u, joParam2)
		})

		it(`It should get the idGroup to test`, (done) => {
			const query = `select idGroup as \"idGroup\", nmGroup as \"nmGroup\", idUserGroup as \"idUserGroup\"
				from grp
				join usergroup using(idGroup)
				where nmGroup like '${this.joParamMain.nmGroup}'`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					if (+result[0][0].idGroup == undefined) {
						throw Error("No sufficient groups to execute the test. The just created groups were not found")
					}
					if (result[0][0].nmGroup == this.joParamMain.nmGroup) {
						this.joParamMain.idGroup = +result[0][0].idGroup
					} else {
						throw Error("Group was not found")
					}
					this.joParamMain.idUserGroup = result[0][0].idUserGroup
					this.joParamMain.idGroup = result[0][0].idGroup
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		const expectedAttr = ["idUserGroup", "idGroup", "idUser", "idCtUserGroupAccess", "nmUser", "piAvatar", "nmGroup",
			"emUser", "isFavorite"]
		it("It should bring only the expected attributes", (done) => {
			TestCaseItem.callEvalExpectedAttributes(done, this.r, this.mGet, this.u, expectedAttr, undefined, true)
		})

		it(TestShould.execute(0), (done) => {
			const joParam = {
				qtOffset: 5,
				qtLimit: 5,
				isFavorite: true,
				idUserGroup: this.joParamMain.idUserGroup,
				idGroup: this.joParamMain.idGroup,
				idCtUserGroupAccess: CtUserGroupAccess.admin.key
			}
			TestCaseItem.callEvalMultipleParamCombinations(done, this.r, this.mGet, this.u, joParam, "idUserGroup")
		})
	}

	private testUserGroupDelete() {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = { nmGroup: StringUtil.random() }
			done()
		})

		it("It should add a new group(added by normal test user)", (done) => {
			const joParam2 = {
				nmGroup: this.joParamMain.nmGroup,
				idWorkspace: EnvTest.getIdWorkspaceDefault()
			}
			TestUtil.customCall(done, RoutesEnum.group, this.mPost, this.u, joParam2)
		})

		it(`It should get the idGroup to test`, (done) => {
			const query = `select idGroup as \"idGroup\", nmGroup as \"nmGroup\", idUserGroup as \"idUserGroup\"
				from grp
				join usergroup using(idGroup)
				where nmGroup like '${this.joParamMain.nmGroup}'`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					if (+result[0][0].idGroup == undefined) {
						throw Error("No sufficient groups to execute the test. The just created groups were not found")
					}
					if (result[0][0].nmGroup == this.joParamMain.nmGroup) {
						this.joParamMain.idGroup = +result[0][0].idGroup
					} else {
						throw Error("Group was not found")
					}
					this.joParamMain.idUserGroupA = result[0][0].idUserGroup
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it("It should try to remove user A by someone which is not even in the group (user B) and fail", (done) => {
			const joParam2 = {
				idUserGroup: this.joParamMain.idUserGroupA,
			}
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus: CtExcep.nmKeyNotFound.nmMsg
			}
			TestUtil.customCall(done, this.r, this.mDel, this.u2, joParam2, joResult)
		})

		it("It should add user B as normal group member", (done) => {
			const user = TestUserManager.getNewUser().loggedUser.user
			const joParam2 = {
				idGroup: this.joParamMain.idGroup,
				idUser: user.idUser,
				idCtUserGroupAccess: CtUserGroupAccess.member.key
			}
			TestUtil.customCall(done, this.r, this.mPost, this.u, joParam2)
		})

		it("It should try to remove user A by someone without admin state (user B) and fail", (done) => {
			const joParam2 = {
				idUserGroup: this.joParamMain.idUserGroupA,
			}
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus: CtExcep.userNotAuthorized.nmMsg
			}
			TestUtil.customCall(done, this.r, this.mDel, this.u2, joParam2, joResult)
		})

		it("It should get the idUserGroup of user B", (done) => {
			const user = TestUserManager.getNewUser().loggedUser.user
			const query = `select idCtUserGroupAccess as \"idCtUserGroupAccess\", idUserGroup as \"idUserGroup\" from userGroup
				where idGroup = ${this.joParamMain.idGroup} and idUser = ${user.idUser}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					if (result[0].length == 0) {
						throw Error("no UserGroup found")
					}
					if (result[0][0].idUserGroup == undefined) {
						throw Error("this specific UserGroup was not found")
					}
					this.joParamMain.idUserGroupB = result[0][0].idUserGroup
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it("It should remove an user (user A removes user B)", (done) => {
			const joParam2 = {
				idUserGroup: this.joParamMain.idUserGroupB,
			}
			TestUtil.customCall(done, this.r, this.mDel, this.u, joParam2)
		})

		it("It should not find the idUserGroup of user B", (done) => {
			const user = TestUserManager.getNewUser().loggedUser.user
			const query = `select idUserGroup as \"idUserGroup\" from userGroup
				where idUserGroup = ${this.joParamMain.idUserGroupB}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					if (result[0].length != 0) {
						throw Error("The userGroup of user B was not deleted")
					}
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it("It should add user B as member", (done) => {
			const user = TestUserManager.getNewUser().loggedUser.user
			const joParam = {
				idGroup: this.joParamMain.idGroup,
				idUser: user.idUser
			}
			const customResponse = (res: Response) => {
				this.joParamMain.idUserGroupB2 = res.body.idUserGroup
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, this.r, this.mPost, this.u, joParam, joResult)
		})

		it("It should be able to remove himself if a member", (done) => {
			const joParam = {
				idUserGroup: this.joParamMain.idUserGroupB2
			}
			TestUtil.customCall(done, this.r, this.mDel, this.u, joParam)
		})

		it("It should not find the idUserGroup2 of user B", (done) => {
			const user = TestUserManager.getNewUser().loggedUser.user
			const query = `select idUserGroup as \"idUserGroup\" from userGroup
				where idUserGroup = ${this.joParamMain.idUserGroupB2}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					if (result[0].length != 0) {
						throw Error("The userGroup of user B was not deleted")
					}
					TestUtil.freeEnd(done)
				}).catch(done)
		})
	}

	private testUserGroupPut() {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = { nmGroup: StringUtil.random() }
			done()
		})

		it("It should add a new group(added by normal test user)", (done) => {
			const joParam2 = {
				nmGroup: this.joParamMain.nmGroup,
				idWorkspace: EnvTest.getIdWorkspaceDefault()
			}
			TestUtil.customCall(done, RoutesEnum.group, this.mPost, this.u, joParam2)
		})

		it(`It should get the idGroup to test`, (done) => {
			const query = `select idGroup as \"idGroup\", nmGroup as \"nmGroup\", idUserGroup as \"idUserGroup\"
				from grp
				join usergroup using(idGroup)
				where nmGroup like '${this.joParamMain.nmGroup}'`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					if (+result[0][0].idGroup == undefined) {
						throw Error("No sufficient groups to execute the test. The just created groups were not found")
					}
					if (result[0][0].nmGroup == this.joParamMain.nmGroup) {
						this.joParamMain.idGroup = +result[0][0].idGroup
					} else {
						throw Error("Group was not found")
					}
					this.joParamMain.idUserGroupA = result[0][0].idUserGroup
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it("It should add user B as admin in the group", (done) => {
			const user = TestUserManager.getNewUser().loggedUser.user
			const joParam2 = {
				idGroup: this.joParamMain.idGroup,
				idUser: user.idUser,
				idCtUserGroupAccess: CtUserGroupAccess.admin.key
			}
			TestUtil.customCall(done, this.r, this.mPost, this.u, joParam2)
		})

		it("It should verify the admin state of user B (should be true)", (done) => {
			const user = TestUserManager.getNewUser().loggedUser.user
			const query = `select idCtUserGroupAccess as \"idCtUserGroupAccess\", idUserGroup as \"idUserGroup\" from userGroup
				where idGroup = ${this.joParamMain.idGroup} and idUser = ${user.idUser}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					if (result[0].length == 0) {
						throw Error("user not found")
					}
					if (result[0][0].idCtUserGroupAccess != CtUserGroupAccess.admin.key) {
						throw Error("it should have been considered an admin (true)")
					}
					this.joParamMain.idUserGroupB = result[0][0].idUserGroup
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it("It should revoke the admin state of user A by user B", (done) => {
			const joParam2 = {
				idUserGroup: this.joParamMain.idUserGroupA,
				idCtUserGroupAccess: CtUserGroupAccess.member.key
			}
			TestUtil.customCall(done, this.r, this.mPut, this.u2, joParam2)
		})

		it("It should verify the admin state of user A (should be false)", (done) => {
			const user = TestUserManager.getUser().loggedUser.user
			const query = `select idCtUserGroupAccess as \"idCtUserGroupAccess\", idUserGroup as \"idUserGroup\" from userGroup
				where idGroup = ${this.joParamMain.idGroup} and idUser = ${user.idUser}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					if (result[0].length == 0) {
						throw Error("user not found")
					}
					if (result[0][0].idCtUserGroupAccess != CtUserGroupAccess.member.key) {
						throw Error("it should have NOT been considered an admin (false)")
					}
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it("It should try to revoke admin state of user B by user A and fail (user A is not admin right now)", (done) => {
			const joParam2 = {
				idUserGroup: this.joParamMain.idUserGroupB,
				idCtUserGroupAccess: CtUserGroupAccess.member.key
			}
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus: CtExcep.userNotAuthorized.nmMsg
			}
			TestUtil.customCall(done, this.r, this.mPut, this.u, joParam2, joResult)
		})

		it("It should try to revoke admin state of user B by user B and fail (the user B is the last admin)", (done) => {
			const joParam2 = {
				idUserGroup: this.joParamMain.idUserGroupB,
				idCtUserGroupAccess: CtUserGroupAccess.member.key
			}
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus: CtWarn.cannotRevokeLastAuth.nmMsg
			}
			TestUtil.customCall(done, this.r, this.mPut, this.u2, joParam2, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Favorite a group`,
			dsCircumstances: `There's a group unfavorited`,
			dsExpected: `Expect no errors`
		}), (d) => {
			const joParam: any = { idUserGroup: this.joParamMain.idUserGroupB, isFavorite: true }
			TestUtil.customCall(d, RoutesEnum.userGroup, this.mPut, this.u2, joParam)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Get the favorited group`,
			dsCircumstances: `There's a group just favorited`,
			dsExpected: `Expect to bring this same group`
		}), (d) => {
			const joParam: any = { idUserGroup: this.joParamMain.idUserGroupB, isFavorite: true }
			const customResponse = (res: Response) => {
				const userGroup = res.body[0]
				if (!userGroup || !userGroup.isFavorite) {
					throw Error(`UserGroup were not favorited`)
				}
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(d, RoutesEnum.userGroup, this.mGet, this.u2, joParam, joResult)
		})

		it(TestShould.dsText({
			dsWhatsBeingTested: `Favorite a group`,
			dsCircumstances: `Favorite a group for the other user`,
			dsExpected: `Expect not to work`
		}), (d) => {
			const joParam: any = { idUserGroup: this.joParamMain.idUserGroupB, isFavorite: true }
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus: CtExcep.userNotAuthorized.nmMsg
			}
			TestUtil.customCall(d, RoutesEnum.userGroup, this.mPut, this.u, joParam, joResult)
		})
	}

	private testUserGroupPost() {
		before(TestShould.startTest(), (done) => {
			this.joParamMain = {
				joParamNewGroup: { nmGroup: StringUtil.random() },
				joParamNormalGroup: { nmGroup: StringUtil.random() }
			}
			done()
		})

		const keys = ["idGroup", "idUser"]
		keys.forEach(key => {
			it(TestShould.failMissingAParam(key), (done) => {
				const joParam2 = {
					idGroup: 0,
					idUser: 0,
				}
				TestCaseItem.callEvalFailMissingAParam(done, this.r, this.mPost, this.u, joParam2, key)
			})
		})

		it("It should add a new group(added by normal test user)", (done) => {
			const joParam2 = {
				nmGroup: this.joParamMain.joParamNormalGroup.nmGroup,
				idWorkspace: EnvTest.getIdWorkspaceDefault()
			}
			TestUtil.customCall(done, RoutesEnum.group, this.mPost, this.u, joParam2)
		})

		it("It should add a new group(added by new test user)", (done) => {
			const joParam2 = {
				nmGroup: this.joParamMain.joParamNewGroup.nmGroup,
				idWorkspace: EnvTest.getIdWorkspaceDefault()
			}
			TestUtil.customCall(done, RoutesEnum.group, this.mPost, this.u2, joParam2)
		})

		it(`It should get the idGroup to test`, (done) => {
			const query = `select idGroup as \"idGroup\", nmGroup as \"nmGroup\" from grp
				where nmGroup like '${this.joParamMain.joParamNormalGroup.nmGroup}'
				or nmGroup like '${this.joParamMain.joParamNewGroup.nmGroup}'`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					if (+result[0][0].idGroup == undefined || +result[0][1].idGroup == undefined) {
						throw Error("No sufficient groups to execute the test. The just created groups were not found")
					}
					if (result[0][0].nmGroup == this.joParamMain.joParamNewGroup.nmGroup) {
						this.joParamMain.joParamNewGroup.idGroup = +result[0][0].idGroup
						this.joParamMain.joParamNormalGroup.idGroup = +result[0][1].idGroup
					} else {
						this.joParamMain.joParamNewGroup.idGroup = +result[0][1].idGroup
						this.joParamMain.joParamNormalGroup.idGroup = +result[0][0].idGroup
					}
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it("It should fail adding himself again into the normal group just created by normal user", (done) => {
			const user = TestUserManager.getUser().loggedUser.user
			const joParam2 = {
				idGroup: this.joParamMain.joParamNormalGroup.idGroup,
				idUser: user.idUser,
				idCtUserGroupAccess: CtUserGroupAccess.member.key
			}
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus: CtExcep.operationNotPermitted.nmMsg
			}
			TestUtil.customCall(done, this.r, this.mPost, this.u, joParam2, joResult)
		})

		it("It should add the new user to the group", (done) => {
			const user = TestUserManager.getNewUser().loggedUser.user
			const joParam2 = {
				idGroup: this.joParamMain.joParamNormalGroup.idGroup,
				idUser: user.idUser,
				idCtUserGroupAccess: CtUserGroupAccess.member.key
			}
			TestUtil.customCall(done, this.r, this.mPost, this.u, joParam2)
		})

		it("It should FAIL add again the new user to the group", (done) => {
			const user = TestUserManager.getNewUser().loggedUser.user
			const joParam2 = {
				idGroup: this.joParamMain.joParamNormalGroup.idGroup,
				idUser: user.idUser,
				idCtUserGroupAccess: CtUserGroupAccess.admin.key
			}

			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus: CtExcep.nmKeyAlreadyExists.nmMsg
			}
			TestUtil.customCall(done, this.r, this.mPost, this.u, joParam2, joResult)
		})

		it(`It should verify the success of linking new user to the group`, (done) => {
			const user = TestUserManager.getNewUser().loggedUser.user
			const query = `select idGroup as \"idGroup\", idUser as \"idUser\" from userGroup
				where idUser = ${user.idUser}
				and idGroup = ${this.joParamMain.joParamNormalGroup.idGroup}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					if (+result[0].length == 0) {
						throw Error("User was not found")
					}
					if (+result[0][0].idUser != +user.idUser) {
						throw Error("User has no link to the group")
					}
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it("It should fail to add the new user to the group again", (done) => {
			const user = TestUserManager.getNewUser().loggedUser.user
			const joParam2 = {
				idGroup: this.joParamMain.joParamNormalGroup.idGroup,
				idUser: user.idUser,
				idCtUserGroupAccess: CtUserGroupAccess.member.key
			}
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus: CtExcep.nmKeyAlreadyExists.nmMsg
			}
			TestUtil.customCall(done, this.r, this.mPost, this.u, joParam2, joResult)
		})

		it("It should fail at adding someone to a not authorized group (normal user to the new group)", (done) => {
			const joParam2 = {
				idGroup: this.joParamMain.joParamNewGroup.idGroup,
				idUser: 1,
				idCtUserGroupAccess: CtUserGroupAccess.member.key
			}
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus: CtExcep.userNotAuthorized.nmMsg
			}
			TestUtil.customCall(done, this.r, this.mPost, this.u, joParam2, joResult)
		})
	}
}
