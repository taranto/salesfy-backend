import { RoutesEnum, SConst, StringUtil, CtHttpStatus, CtUserGroupAccess } from "salesfy-shared";
import { TestUtil, TestShould, TestCaseItem, TestUserManager } from "../../barrel/Barrel.spec";
import { LayerDao } from "app/layers_template/LayerDao";
import { ConnDao } from "app/structure/ConnDao";
import { EnvTest } from "../../support/EnvTest.spec";
import { TestEntity } from "../../support/TestEntity.spec";
import { Workspace } from "app/modules/workspace/Workspace";
import { Response } from "supertest";
import { TestUserBox } from "../../support/TestUserBox.spec";

export class GroupRteSpec {

	public static test() {
		describe(TestShould.describeTitle(RoutesEnum.group), () => {
			describe(TestShould.dsText({ dsText: "exists" }), () => {
				GroupRteSpec.testExists()
			})
			describe(TestShould.descRouteMethod(RoutesEnum.group, SConst.HTTP_METHOD_POST), () => {
				GroupRteSpec.testGroupPost()
			})
			describe(TestShould.descRouteMethod(RoutesEnum.group, SConst.HTTP_METHOD_GET), () => {
				GroupRteSpec.testGroupGet()
			})
			describe(TestShould.descRouteMethod(RoutesEnum.group, SConst.HTTP_METHOD_PUT), () => {
				GroupRteSpec.testGroupPut()
			})
			describe(TestShould.descRouteMethod(RoutesEnum.group, SConst.HTTP_METHOD_DELETE), () => {
				GroupRteSpec.testGroupDelete()
			})
		})
	}

	private static testExists() {
		TestCaseItem.descItShouldEvalExistence(true, RoutesEnum.group, SConst.TEST_ROLE_NORMAL_USER,
			SConst.HTTP_METHOD_POST, SConst.HTTP_METHOD_GET, SConst.HTTP_METHOD_DELETE, SConst.HTTP_METHOD_PUT)
	}

	private static testGroupPost() {
		const r = RoutesEnum.group
		const m = SConst.HTTP_METHOD_POST
		const u = SConst.TEST_ROLE_NORMAL_USER

		const joParamMain: any = {}
		before(TestShould.startTest(), (done) => {
			joParamMain.joGroup = {
				nmGroup: "grupo " + StringUtil.random(),
				idWorkspace: EnvTest.getIdWorkspaceDefault()
			}
			done()
		})
		let qtGroup = -1

		const keys = ["nmGroup"]
		keys.forEach(key => {
			it(TestShould.failMissingAParam(key), (done) => {
				TestCaseItem.callEvalFailMissingAParam(done, r, m, u, joParamMain.joGroup, key)
			})
		})

		before(`It should get the number of existent groups`, (done) => {
			const query = `select count(*) as \"qtGroup\" from grp`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					qtGroup = +result[0][0].qtGroup
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it("It should add a new group", (done) => {
			TestUtil.customCall(done, r, m, u, joParamMain.joGroup)
		})

		it(`It should get that exact group added`, (done) => {
			const query = `select idGroup as \"idGroup\", nmGroup as \"nmGroup\" from grp
				where nmGroup like '${joParamMain.joGroup.nmGroup}'`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					const nmGroupAdded = result[0][0].nmGroup
					if (!nmGroupAdded) {
						throw new Error("Specific group not found")
					}
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it(`It should count one group more`, (done) => {
			const query = `select count(*) as \"qtGroup\" from grp`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					const qtGroupAfter = +result[0][0].qtGroup
					if (qtGroupAfter - 1 != qtGroup) {
						throw new Error("Group not added correctly")
					}
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it(`It should find the specific group as an user group (the creator of the group must belong it)`, (done) => {
			const loggedUser = TestUserManager.getUser().loggedUser
			const query = `select idUserGroup as \"idUserGroup\", idCtUserGroupAccess as \"idCtUserGroupAccess\"
				from userGroup join grp using(idGroup)
				where nmGroup like '${joParamMain.joGroup.nmGroup}' and idUser = ${loggedUser.user.idUser}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					const idUserGroup = result[0][0].idUserGroup
					if (idUserGroup == undefined) {
						throw Error("The userGroup was not found. Probably it wasn't added to the user")
					}
					const idCtUserGroupAccess = result[0][0].idCtUserGroupAccess
					if (idCtUserGroupAccess != CtUserGroupAccess.admin.key) {
						throw Error("This specific user must be the group admin")
					}
					TestUtil.freeEnd(done)
				}).catch(done)
		})
	}

	private static testGroupGet() {
		const r = RoutesEnum.group
		const m = SConst.HTTP_METHOD_GET
		const u = SConst.TEST_ROLE_NORMAL_USER

		let joParamMain: any = {}
		before(TestShould.startTest(), (done) => {
			joParamMain = {
				nmGroup: "grupo " + StringUtil.random(),
				idWorkspace: EnvTest.getIdWorkspaceDefault()
			}
			done()
		})

		it("It should bring only the expected attributes", (done) => {
			const expectedAttr = ["idGroup", "nmGroup", "idCtUserGroupAccess", "idUserGroup", "isActive", "idUser", "isFavorite",
				"idWorkspace"]
			TestCaseItem.callEvalExpectedAttributes(done, r, m, u, expectedAttr, undefined, true)
		})

		it("It should add a new group", (done) => {
			TestUtil.customCall(done, r, m, u, joParamMain)
		})

		it(TestShould.execute(0), (done) => {
			const joParam = {
				qtOffset: 5,
				qtLimit: 5,
				isFavorite: true,
				nmGroup: joParamMain.nmGroup,
				idGroup: 0,
				idCtUserGroupAccess: CtUserGroupAccess.admin.key
			}
			TestCaseItem.callEvalMultipleParamCombinations(done, r, m, u, joParam, "idGroup")
		})
	}

	private static testGroupPut() {
		const r = RoutesEnum.group
		const m = SConst.HTTP_METHOD_PUT
		const u = SConst.TEST_ROLE_NORMAL_USER

		const joParamNewIsAdmin: any = {
			nmGroup: "grupo new is admin " + StringUtil.random(),
		}
		const joParamNormalIsAdmin: any = {
			nmGroup: "grupo normal is admin " + StringUtil.random(),
		}
		const nmGroupAfter = "grupo " + StringUtil.random()
		const nmGroupAfter2 = "grupo " + StringUtil.random()

		const keys = ["idGroup"]
		keys.forEach(key => {
			it(TestShould.failMissingAParam(key), (done) => {
				const joParam = { idGroup: 0 }
				TestCaseItem.callEvalFailMissingAParam(done, r, m, u, joParam, key)
			})
		})

		before("It should add a group. Normal user is NOT the admin", (done) => {
			joParamNewIsAdmin.idWorkspace = EnvTest.getIdWorkspaceDefault()
			TestUtil.customCall(
				done, r, SConst.HTTP_METHOD_POST, SConst.TEST_ROLE_NEW_USER, joParamNewIsAdmin)
		})

		before("It should add a group. Normal user IS the admin", (done) => {
			joParamNormalIsAdmin.idWorkspace = EnvTest.getIdWorkspaceDefault()
			TestUtil.customCall(done, r, SConst.HTTP_METHOD_POST, u, joParamNormalIsAdmin)
		})

		before(`It should get the idGroup to use in the test`, (done) => {
			const query = `select idGroup as \"idGroup\", nmGroup as \"nmGroup\" from grp
				where nmGroup like '${joParamNewIsAdmin.nmGroup}'
				or nmGroup like '${joParamNormalIsAdmin.nmGroup}'`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					if (+result[0][0].idGroup == undefined || +result[0][1].idGroup == undefined) {
						throw Error("No sufficient groups to execute the test. The just created groups were not found")
					}
					if (result[0][0].nmGroup == joParamNewIsAdmin.nmGroup) {
						joParamNewIsAdmin.idGroup = +result[0][0].idGroup
						joParamNormalIsAdmin.idGroup = +result[0][1].idGroup
					} else {
						joParamNewIsAdmin.idGroup = +result[0][1].idGroup
						joParamNormalIsAdmin.idGroup = +result[0][0].idGroup
					}
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it("It should alter the name of this group", (done) => {
			const joParam = { idGroup: joParamNormalIsAdmin.idGroup, nmGroup: nmGroupAfter }
			TestUtil.customCall(done, r, m, u, joParam)
		})

		it(`It should verify name changing`, (done) => {
			const query = `select idGroup as \"idGroup\", nmGroup as \"nmGroup\" from grp
				where idGroup = '${joParamNormalIsAdmin.idGroup}'`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					const nmGroupQuery = result[0][0].nmGroup
					if (nmGroupQuery == joParamNormalIsAdmin.nmGroup) {
						throw new Error("The name of the group were not change")
					}

					if (nmGroupQuery != nmGroupAfter) {
						throw new Error("The name of the group is different than the expected")
					}
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it("It should NOT alter the name of this group (user is not the admin of the group)", (done) => {
			const joParam = { idGroup: joParamNewIsAdmin.idGroup, nmGroup: nmGroupAfter2 }
			const joResult = { nrStatus: CtHttpStatus.status400.keyCtHttpStatus }
			TestUtil.customCall(done, r, m, u, joParam, joResult)
		})

		it(`It should verify name changing`, (done) => {
			const query = `select idGroup as \"idGroup\", nmGroup as \"nmGroup\" from grp
				where idGroup = '${joParamNewIsAdmin.idGroup}'`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					const nmGroupQuery = result[0][0].nmGroup
					if (nmGroupQuery == nmGroupAfter2) {
						throw new Error("The name of the group was change to exacly the unexpected.")
					}
					if (nmGroupQuery != joParamNewIsAdmin.nmGroup) {
						throw new Error("The name of the group was change. It shouldn't have change")
					}

					TestUtil.freeEnd(done)
				}).catch(done)
		})

		after("It should alter the name of this group(back to the original name)", (done) => {
			const joParam2 = { idGroup: joParamNormalIsAdmin.idGroup, nmGroup: joParamNormalIsAdmin.nmGroup }
			TestUtil.customCall(done, r, m, u, joParam2)
		})
	}

	private static testGroupDelete() {
		const r = RoutesEnum.group
		const m = SConst.HTTP_METHOD_DELETE
		const u = SConst.TEST_ROLE_NORMAL_USER
		const joParamNewIsAdmin: any = {
			nmGroup: "grupo new is admin " + StringUtil.random(),
		}
		const joParamNormalIsAdmin: any = {
			nmGroup: "grupo normal is admin " + StringUtil.random(),
		}
		const nmGroupAfter = "grupo " + StringUtil.random()
		const nmGroupAfter2 = "grupo " + StringUtil.random()

		before("It should add a group. Normal user is NOT the admin", (done) => {
			joParamNewIsAdmin.idWorkspace = EnvTest.getIdWorkspaceDefault()
			TestUtil.customCall(
				done, r, SConst.HTTP_METHOD_POST, SConst.TEST_ROLE_NEW_USER, joParamNewIsAdmin)
		})

		before("It should add a group. Normal user IS the admin", (done) => {
			joParamNormalIsAdmin.idWorkspace = EnvTest.getIdWorkspaceDefault()
			TestUtil.customCall(done, r, SConst.HTTP_METHOD_POST, u, joParamNormalIsAdmin)
		})

		before(`It should get the idGroup to test`, (done) => {
			const query = `select idGroup as \"idGroup\", nmGroup as \"nmGroup\" from grp
				where nmGroup like '${joParamNewIsAdmin.nmGroup}'
				or nmGroup like '${joParamNormalIsAdmin.nmGroup}'`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					if (+result[0][0].idGroup == undefined || +result[0][1].idGroup == undefined) {
						throw Error("No sufficient groups to execute the test. The just created groups were not found")
					}
					if (result[0][0].nmGroup == joParamNewIsAdmin.nmGroup) {
						joParamNewIsAdmin.idGroup = +result[0][0].idGroup
						joParamNormalIsAdmin.idGroup = +result[0][1].idGroup
					} else {
						joParamNewIsAdmin.idGroup = +result[0][1].idGroup
						joParamNormalIsAdmin.idGroup = +result[0][0].idGroup
					}
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it("It should delete this group", (done) => {
			const joParam2 = { idGroup: joParamNormalIsAdmin.idGroup }
			TestUtil.customCall(done, r, m, u, joParam2)
		})

		it(`It should not find the group anymore`, (done) => {
			const query = `select idGroup as \"idGroup\", isActive as \"isActive\" from grp
				where idGroup = ${joParamNormalIsAdmin.idGroup}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					if (result[0].isActive) {
						throw new Error("This group should've been set as inactive")
					}
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it("It should NOT delete this group(he is not the admin of this group)", (done) => {
			const joParam2 = { idGroup: joParamNewIsAdmin.idGroup }
			const joResult = { nrStatus: CtHttpStatus.status400.keyCtHttpStatus }
			TestUtil.customCall(done, r, m, u, joParam2, joResult)
		})

		it(`It should still find the group`, (done) => {
			const query = `select idGroup as \"idGroup\", nmGroup as \"nmGroup\" from grp
				where idGroup = ${joParamNewIsAdmin.idGroup}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					if (result[0].length == 0) {
						throw new Error("The user was able to find the group. He could delete a group which he's not an admin")
					}
					TestUtil.freeEnd(done)
				}).catch(done)
		})
	}
}
