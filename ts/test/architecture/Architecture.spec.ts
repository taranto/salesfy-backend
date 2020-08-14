import { RoutesEnum, SConst, THttpMethod, TUserTest } from "salesfy-shared";
import { TestCaseItem, TestUserManager, TestUtil, TestShould } from "../barrel/Barrel.spec";
import { LayerDao } from "app/layers_template/LayerDao";
import { ConnDao } from "app/structure/ConnDao";

export class ArchitectureSpec {

	public static async test() { //TODO melhorar em como faço isso
		describe("Test SqlInjection", () => {
			describe("Test SqlInjection content robust", () => {
				ArchitectureSpec.testContentList()
			})
			describe("Test SqlInjection group", () => {
				ArchitectureSpec.testGroup()
			})
			describe("Test SqlInjection channel", () => {
				ArchitectureSpec.testChannel()
			})
		})
	}

	private static testChannel() {
		ArchitectureSpec.testTemplate(RoutesEnum.channel, "nmChannel", "idChannel", "nmChannel")
	}

	private static testGroup() {
		ArchitectureSpec.testTemplate(RoutesEnum.group, "nmGroup", "idGroup", "nmGroup")
	}

	public static testTemplate(r:string, nmKeyFilter:string, nmIdentifyer:string, ...nmFilteredKeys:string[]) {
		const m = SConst.HTTP_METHOD_GET
		ArchitectureSpec.testDefaultFast(r, m, nmKeyFilter, nmIdentifyer, nmFilteredKeys)
	}

	public static testDefaultFast(r: string, m: THttpMethod,
		nmKeyFilter: string, nmIdentifyer:string, nmFilteredKeys: string[]) {
		describe(TestShould.descRouteMethod(r,m), () => {
			const u = SConst.TEST_ROLE_NORMAL_USER
			it(`It should return a list of NOTHING. filtered by a sql injection keyword.`, (done) => {
				const idUser = TestUserManager.getUser().loggedUser.user.idUser
				const keywordSqlInjection = ArchitectureSpec.dsInjection(idUser)
				TestCaseItem.callEvalFilter(done, r, m, u, nmKeyFilter, keywordSqlInjection, nmIdentifyer, ...nmFilteredKeys);
			})

			it("It should bring the users", (done) => {
				const loggedUser = TestUserManager.getUser().loggedUser
				const query = `select idUser as \"idUser\" from usr where idUser = ${loggedUser.user.idUser}`
				ConnDao.staticQueryPromise(query)
					.then((result) => {
						const idUser = +result[0][0].idUser
						if (!idUser) {
							throw Error("User not found. Probably deleted by the sqlinjection test")
						}
						TestUtil.freeEnd(done)
					}).catch(done)
			})
		})
	}

	private static dsInjection(idUser: any): string {
		return `Conheça'; delete from usr where iduser = ${idUser};--`
	}

	private static testContentList() {
		const r = RoutesEnum.content
		const m = SConst.HTTP_METHOD_GET
		const u = SConst.TEST_ROLE_NORMAL_USER

		const nmFilteredKeys = ["nmContent", "dsContent", "nmCtContent"]

		const keyword = "Conheça"
		const nmKeyFilter = "dsSearch"
		const joParam = { dsSearch: keyword }
		const expectedAttr = ["idContent"]

		it("It should bring nothing. If something's brought, " +
			"it should be the set of attributes of the content list, not user", (done) => {
				TestCaseItem.callEvalExpectedAttributes(done, r, m, u, expectedAttr, joParam, true, true)
			})

		it("It should bring the users", (done) => {
			const loggedUser = TestUserManager.getUser().loggedUser
			const query = `select idUser as \"idUser\" from usr where idUser = ${loggedUser.user.idUser}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					const idUser = +result[0][0].idUser
					if (!idUser) {
						throw Error("User not found. Probably deleted by the sqlinjection test")
					}
					TestUtil.freeEnd(done)
				}).catch(done)
		})
	}
}
