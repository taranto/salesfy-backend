import { TestUtil, TestShould, TestCaseItem, TestUserManager } from "../../barrel/Barrel.spec";

import { RoutesEnum, SConst, KeyEnum, DateUtil, StringUtil, CtExcep } from "salesfy-shared";
import { LayerDao } from "app/layers_template/LayerDao";
import { ConnDao } from "app/structure/ConnDao";
import { DaoUtil } from "app/util/DaoUtil";

export class UserTagRteSpec {

	public static test() {
		describe("Test userTag", () => {
			describe(TestShould.descRouteMethod(RoutesEnum.userTag, SConst.HTTP_METHOD_POST), () => {
				UserTagRteSpec.testUserTagPost()
			})
			describe(TestShould.descRouteMethod(RoutesEnum.userTag, SConst.HTTP_METHOD_GET), () => {
				UserTagRteSpec.testUserTagGet()
			})
			describe(TestShould.descRouteMethod(RoutesEnum.userTag, SConst.HTTP_METHOD_DELETE), () => {
				UserTagRteSpec.testUserTagDelete()
			})
		})
	}

	private static testUserTagPost() {
		const r = RoutesEnum.userTag
		const m = SConst.HTTP_METHOD_POST
		const u = SConst.TEST_ROLE_NORMAL_USER

		const joParam = { idTag: 0 }
		let dhRegisterLaterThan : Date

		it(TestShould.exist(), (done) => {
			TestCaseItem.callEvalExistence(done, r, m)
		})

		it(TestShould.acceptBothTokens(), (done) => {
			TestCaseItem.callEvalAcceptBothTokens(done, r, m, u)
		})

		it(TestShould.failNoTokens(), (done) => {
			TestCaseItem.callEvalFailNoTokens(done, r, m)
		})

		it(TestShould.failMissingAllParams(), (done) => {
			TestCaseItem.callEvalFailMissingAllParams(done, r, m, u)
		})

		const keys = ["idTag"]
		keys.forEach(key => {
			it(TestShould.failMissingAParam(key), (done) => {
				TestCaseItem.callEvalFailMissingAParam(done, r, m, u, joParam, key)
			})
		})

		it(`It should erase any tag linked to user A`, (done) => {
			const loggedUser = TestUserManager.getUser().loggedUser
			const query = `delete from usertag where iduser = ${loggedUser.user.idUser}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it(`It should get any tag to use as an example`, (done) => {
			const loggedUser = TestUserManager.getUser().loggedUser
			const query = `select idTag as \"idTag\" from tag where idTag not in
				(select idTag from userTag where idUser = ${loggedUser.user.idUser})`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					joParam.idTag = +result[0][0].idTag
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it("Set start date limit", (done) => {
			dhRegisterLaterThan = new Date(new Date().getTime() - SConst.MILI_HOUR)
			done()
		})

		it("It should add a tag to the user", (done) => {
			setTimeout(()=>{
				TestUtil.customCall(done, r, m, u, joParam)
			},SConst.MILI_SEC)
		})

		it(`It should find the specific tag as an user tag`, (done) => {
			const loggedUser = TestUserManager.getUser().loggedUser
			const query = `select idTag as \"idTag\" from userTag
				where idTag = ${joParam.idTag} and idUser = ${loggedUser.user.idUser}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					if (joParam.idTag != +result[0][0].idTag) {
						throw Error("The userTag was not found. Probably it wasn't added to the user")
					}
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it(`It should consider the dhRegister under the range`, (done) => {
			const loggedUser = TestUserManager.getUser().loggedUser
			const query = `select idTag as \"idTag\" from userTag
				where idTag = ${joParam.idTag} and idUser = ${loggedUser.user.idUser}
				and '${DaoUtil.sqlDateformat(dhRegisterLaterThan)}' < dhRegister
				and dhRegister > '${DaoUtil.sqlDateformat(new Date(new Date().getTime() - SConst.MILI_HOUR))}'`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					if (result[0][0] == undefined) {
						throw Error(`idTag shouldn't have been undefined. Expected: ${joParam.idTag}
							query: ${query}`)
					}
					if (joParam.idTag != +result[0][0].idTag && result[0].length == 1) {
						throw Error("The userTag is out of Date register margin")
					}
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it("It should fail to add an already added tag to the user", (done) => {
			TestUtil.call(r, m, u, joParam)
			.expect(400)
			.expect(SConst.STATUS_MESSAGE, CtExcep.nmKeyAlreadyExists.nmMsg )
			.expect(SConst.EXTRA_CONTENT, JSON.stringify({ nmKey : KeyEnum.bond }))
			.end(TestUtil.end(done))
		})
	}

	private static testUserTagGet() {
		const r = RoutesEnum.userTag
		const m = SConst.HTTP_METHOD_GET
		const u = SConst.TEST_ROLE_NORMAL_USER

		it(TestShould.exist(), (done) => {
			TestCaseItem.callEvalExistence(done, r, m)
		})

		it(TestShould.acceptBothTokens(), (done) => {
			TestCaseItem.callEvalAcceptBothTokens(done, r, m, u)
		})

		it(TestShould.failNoTokens(), (done) => {
			TestCaseItem.callEvalFailNoTokens(done, r, m)
		})

		it("It should bring only the expected attributes", (done) => {
			const expectedAttr = ["idTag", "nmTag", "idUser", "idUserTag", "piTag", "idCtTag", "dhRegister"]
			TestCaseItem.callEvalExpectedAttributes(done, r, m, u, expectedAttr, u, true)
		})
	}

	private static testUserTagDelete() {
		const r = RoutesEnum.userTag
		const m = SConst.HTTP_METHOD_DELETE
		const u = SConst.TEST_ROLE_NORMAL_USER

		const joParam = { idTag: 0, idUser: 0 }

		it(TestShould.exist(), (done) => {
			TestCaseItem.callEvalExistence(done, r, m)
		})

		it(TestShould.acceptBothTokens(), (done) => {
			TestCaseItem.callEvalAcceptBothTokens(done, r, m, u)
		})

		it(TestShould.failNoTokens(), (done) => {
			TestCaseItem.callEvalFailNoTokens(done, r, m)
		})

		it(TestShould.failMissingAllParams(), (done) => {
			TestCaseItem.callEvalFailMissingAllParams(done, r, m, u)
		})

		const keys = ["idTag"]
		keys.forEach(key => {
			it(TestShould.failMissingAParam(key), (done) => {
				TestCaseItem.callEvalFailMissingAParam(done, r, m, u, joParam, key)
			})
		})

		it(`It should find a tag from the user`, (done) => {
			const loggedUser = TestUserManager.getUser().loggedUser
			const query = `select idTag as \"idTag\" from userTag
				where idUser = ${loggedUser.user.idUser} limit 1`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					joParam.idTag = +result[0][0].idTag
					TestUtil.freeEnd(done)
				}).catch(done)
		})

		it("It should delete a tag from the user", (done) => {
			TestUtil.customCall(done, r, m, u, joParam)
		})

		it(`It should not find that tag linked to the user anymore`, (done) => {
			const loggedUser = TestUserManager.getUser().loggedUser
			const query = `select idTag as \"idTag\" from userTag
				where idTag = ${joParam.idTag} and idUser = ${loggedUser.user.idUser}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					if (result[0].length > 0) {
						throw Error("The tag was found linked to the user")
					}
					TestUtil.freeEnd(done)
				}).catch(done)
		})
	}
}
