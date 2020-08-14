import { TestUser } from "./TestUser.spec";
import { TUserTest } from "salesfy-shared";

export class TestUserBox {

	public static adminUserContext: TestUser
	public static fbUserContext: TestUser
	public static gmailUserContext: TestUser
	public static arUserContext: TestUser[] = []
	public static iActive: number = 0

	public static getAdmin(): TestUser {
		return TestUserBox.adminUserContext
	}

	public static getFbUser(): TestUser {
		return TestUserBox.fbUserContext
	}

	public static getGmailUser(): TestUser {
		return TestUserBox.gmailUserContext
	}

	public static getUser(i?: number | "g" | "f" | "a"): TestUser {
		if (i == undefined) {
			return TestUserBox.getActiveUser()
		} else if (i == "g") {
			return TestUserBox.getGmailUser()
		} else if (i == "f") {
			return TestUserBox.getFbUser()
		} else if (i == "a") {
			return TestUserBox.getAdmin()
		} else {
			return TestUserBox.arUserContext[i]
		}
	}

	public static getActiveUser(): TestUser {
		return TestUserBox.arUserContext[TestUserBox.iActive]
	}

	public static setActiveUser(i: number): TestUser {
		TestUserBox.iActive = i
		return TestUserBox.getActiveUser()
	}

	public static setUser(user: TestUser, i?: number): number {
		if (i == undefined) {
			TestUserBox.arUserContext.push(user)
			i = TestUserBox.arUserContext.length - 1
		} else {
			TestUserBox.arUserContext[i] = user
		}
		user.i = i
		TestUserBox.iActive = i
		return i
	}

	public static setGmailUser(user: TestUser) {
		user.i = "g"
		TestUserBox.gmailUserContext = user
		return user.i
	}

	public static setFbUser(user: TestUser) {
		user.i = "f"
		TestUserBox.fbUserContext = user
		return user.i
	}

	public static setAdmin(user: TestUser) {
		user.i = "a"
		TestUserBox.adminUserContext = user
		return user.i
	}

	public static getUserIndex(obUser: TestUser | number): number | "g" | "f" | "a" {
		let i: number | "g" | "f" | "a" = -1
		if (obUser instanceof TestUser) {
			i = TestUserBox.getUserIndexByEntity(obUser)
		} else {
			i = TestUserBox.getUserIndexById(obUser)
		}
		return i
	}

	public static getUserIndexByEntity(user: TestUser): number | "g" | "f" | "a" {
		let i = -1
		for (let index = 0; index < TestUserBox.arUserContext.length; index++) {
			if (TestUserBox.arUserContext[index].user.idUser == user.user.idUser) {
				i = index
			}
		}
		if (i == -1) {
			if (TestUserBox.getAdmin() && TestUserBox.getAdmin().user.idUser == user.user.idUser) {
				return "a"
			}
			if (TestUserBox.getGmailUser() && TestUserBox.getGmailUser().user.idUser == user.user.idUser) {
				return "g"
			}
			if (TestUserBox.getFbUser() && TestUserBox.getFbUser().user.idUser == user.user.idUser) {
				return "f"
			}
		}
		return i
	}

	public static getUserIndexById(idUser: number): number | "g" | "f" | "a" {
		let i = -1
		for (let index = 0; index < TestUserBox.arUserContext.length; index++) {
			if (TestUserBox.arUserContext[index].user.idUser == idUser) {
				i = index
			}
		}
		if (i == -1) {
			if (TestUserBox.getAdmin() && TestUserBox.getAdmin().user.idUser == idUser) {
				return "a"
			}
			if (TestUserBox.getGmailUser() && TestUserBox.getGmailUser().user.idUser == idUser) {
				return "g"
			}
			if (TestUserBox.getFbUser() && TestUserBox.getFbUser().user.idUser == idUser) {
				return "f"
			}
		}
		return i
	}

	public static getMtSetUser(ltUser?: number | "g" | "f" | "a"): any {
		if (ltUser == undefined) {
			return undefined
		} else if (ltUser == "g") {
			return TestUserBox.setGmailUser
		} else if (ltUser == "f") {
			return TestUserBox.setFbUser
		} else if (ltUser == "a") {
			return TestUserBox.setAdmin
		} else {
			return TestUserBox.setUser
		}
	}

	public static getArIdUserTestUser(): number[] {
		const arIdUserTestUser: number[] = []
		if (TestUserBox.adminUserContext) {
			arIdUserTestUser.push(TestUserBox.adminUserContext.user.idUser)
		}
		if (TestUserBox.fbUserContext) {
			arIdUserTestUser.push(TestUserBox.fbUserContext.user.idUser)
		}
		if (TestUserBox.gmailUserContext) {
			arIdUserTestUser.push(TestUserBox.gmailUserContext.user.idUser)
		}
		TestUserBox.arUserContext.forEach(userContext => {
			arIdUserTestUser.push(userContext.user.idUser)
		})
		return arIdUserTestUser
	}

	public static getLast() : TestUser {
		const userTestLast = TestUserBox.arUserContext[TestUserBox.getLastIndex()]
		return userTestLast
	}

	public static getLastIndex() : number {
		return TestUserBox.arUserContext.length-1
	}
}
