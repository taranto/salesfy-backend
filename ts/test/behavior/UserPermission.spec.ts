import { RoutesEnum, SConst, TUserTest, DateUtil, CtHttpStatus, StringUtil, KeyEnum, CtExcep } from "salesfy-shared";
import { LayerDao } from "app/layers_template/LayerDao";
import { TestUtil, TestShould, TestUserManager, TestCaseItem } from "../barrel/Barrel.spec";
import { Response } from "superagent";
import { ConnDao } from "app/structure/ConnDao";
import { Content } from "app/modules/content/Content";
import { TestEntity } from "../support/TestEntity.spec";

export class UserPermissionSpec {

	public static test() {
		describe(TestShould.describeTitle(RoutesEnum.userMe), () => {
			describe(TestShould.describeTitle(RoutesEnum.userMe, "Permission general"), () => {
				UserPermissionSpec.testPermission()
			})
			describe(TestShould.describeTitle(RoutesEnum.userMe, "Permission canPostSeContent"), () => {
				UserPermissionSpec.testCanPostSeContent()
			})
			describe(TestShould.describeTitle(RoutesEnum.userMe, "Permission canPostSeChannel"), () => {
				UserPermissionSpec.testCanPostSeChannel()
			})
			describe(TestShould.describeTitle(RoutesEnum.userMe, "Permission canSimulateSomeone"), () => {
				UserPermissionSpec.testCanSimulateSomeone()
			})
		})
	}

	private static testPermission() {
		const r = RoutesEnum.userMe
		const m = SConst.HTTP_METHOD_GET
		const u = SConst.TEST_ROLE_NORMAL_USER

		const joParamMain: any = {}

		it("It should also bring permissions", (done) => {
			const joParam = {
			}
			const customResponse = (res: Response) => {
				const body: any[] = res.body
				const hasAllExpectedProperties =
					"canPostSeContent" in body &&
					"canPostSeChannel" in body &&
					"canSimulateSomeone" in body &&
					"canPostWorkspace" in body
				if (!hasAllExpectedProperties) {
					throw new Error("Some permission properties are missing")
				}
			}
			const joResult = {
				customResponse: customResponse,
			}
			TestUtil.customCall(done, r, m, u, joParam, joResult)
		})
	}

	private static testCanPostSeContent() {
		const r = RoutesEnum.content
		const mGet = SConst.HTTP_METHOD_GET
		const mPost = SConst.HTTP_METHOD_POST
		const mPut = SConst.HTTP_METHOD_PUT
		const uA = SConst.TEST_ROLE_NORMAL_USER
		const joParamMain: any = {}

		/*
		make uA CanPostSeContent = false
		uA: post content isPlaybook = false and FAIL
		uA: post content(A) isPlaybook = true and SUCCEED
		uA: get content isPlaybook = true and should find content A
		uA: put content(A) isPlaybook = false and FAIL
		uA: get content isPlaybook = true and should find content A
		*/

		TestCaseItem.itShouldEditUserPermission(uA, false, false, false, false)

		it("uA: post content isPlaybook = false and FAIL", (done) => {
			const joParam = TestEntity.gen(Content, { isPlaybook: false })
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus:CtExcep.userNotAuthorized.nmMsg
			}
			TestUtil.customCall(done, r, mPost, uA, joParam, joResult)
		})

		it("uA: post content(A) isPlaybook = true and SUCCEED", (done) => {
			const joParam = TestEntity.gen(Content, { isPlaybook: true })
			const customResponse = (res: Response) => {
				joParamMain.joContentA = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mPost, uA, joParam, joResult)
		})

		it("uA should get content A(PB) and receive", (done) => {
			const joParam = { idContent: joParamMain.joContentA.idContent, isPlaybook:true }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joContentA, 'idContent')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uA, joParam, joResult)
		})

		it("uA should put content A(PB) as isPlaybook=false and FAIL", (done) => {
			const joParam = { idContent: joParamMain.joContentA.idContent, isPlaybook: false }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joContentA, 'idContent')
			}
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus:CtExcep.userNotAuthorized.nmMsg
			}
			TestUtil.customCall(done, r, mPut, uA, joParam, joResult)
		})

		it("uA should get content A(PB) and receive (again)", (done) => {
			const joParam = { idContent: joParamMain.joContentA.idContent, isPlaybook:true }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joContentA, 'idContent')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uA, joParam, joResult)
		})

		/*
		make uA CanPostSeContent = true
		uA: put content(A) isPlaybook = false and SUCCEED
		uA: get content isPlaybook = false and should find content A
		uA: get content isPlaybook = true and should NOT find content A
		uA: post content(B) isPlaybook = false and SUCCEED
		uA: get content isPlaybook = false and should find content B
		uA: get content isPlaybook = true and should NOT find content B
		make uA CanPostSeContent = false again.
		*/

		TestCaseItem.itShouldEditUserPermission(uA, true, false, false, false)

		it("uA should put content A(PB) as isPlaybook=false and SUCCEED", (done) => {
			const joParam = { idContent: joParamMain.joContentA.idContent, isPlaybook: false }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joContentA, 'idContent')
				if (res.body.isPlaybook!=false) {
					throw new Error("content.isPlaybook should be == false")
				}
			}
			TestUtil.customCall(done, r, mPut, uA, joParam)
		})

		it("uA get content isPlaybook = false and should find content A", (done) => {
			const joParam = { idContent: joParamMain.joContentA.idContent, isPlaybook:false }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joContentA, 'idContent')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uA, joParam, joResult)
		})

		it("uA get content isPlaybook = true and should NOT find content A", (done) => {
			const joParam = { idContent: joParamMain.joContentA.idContent, isPlaybook:true }
			const customResponse = (res: Response) => {
				TestCaseItem.shouldBringEmptyBody(res)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uA, joParam, joResult)
		})

		it("uA: post content(B) isPlaybook = false and SUCCEED", (done) => {
			const joParam = TestEntity.gen(Content, { isPlaybook: false })
			const customResponse = (res: Response) => {
				joParamMain.joContentB = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mPost, uA, joParam, joResult)
		})

		it("uA get content isPlaybook = false and should find content B", (done) => {
			const joParam = { idContent: joParamMain.joContentB.idContent, isPlaybook:false }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joContentB, 'idContent')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uA, joParam, joResult)
		})

		it("uA get content isPlaybook = true and should NOT find content B", (done) => {
			const joParam = { idContent: joParamMain.joContentB.idContent, isPlaybook:true }
			const customResponse = (res: Response) => {
				TestCaseItem.shouldBringEmptyBody(res)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uA, joParam, joResult)
		})
	}

	private static testCanPostSeChannel() {
		const r = RoutesEnum.channel
		const mGet = SConst.HTTP_METHOD_GET
		const mPost = SConst.HTTP_METHOD_POST
		const mPut = SConst.HTTP_METHOD_PUT
		const uA = SConst.TEST_ROLE_NORMAL_USER
		const joParamMain: any = {}

		/*
		make uA CanPostSeChannel = false
		uA: post channel isPlaybook = false and FAIL
		uA: post channel(A) isPlaybook = true and SUCCEED
		uA: get channel isPlaybook = true and should find channel A
		uA: put channel(A) isPlaybook = false and FAIL
		uA: get channel isPlaybook = true and should find channel A
		*/

		TestCaseItem.itShouldEditUserPermission(uA, false, false, false, false)

		it("uA: post channel isPlaybook = false and FAIL", (done) => {
			const nmBase = StringUtil.random()
			const joParam = {
				nmChannel: `channel SI ${nmBase}`,
				isPlaybook: false
			}
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus:CtExcep.userNotAuthorized.nmMsg
			}
			TestUtil.customCall(done, r, mPost, uA, joParam, joResult)
		})

		it("uA should post channel A(PB)", (done) => {
			const nmBase = StringUtil.random()
			const joParam = {
				nmChannel: `channel SI ${nmBase}`,
				isPlaybook: true
			}
			const customResponse = (res: Response) => {
				joParamMain.joChannelA = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mPost, uA, joParam, joResult)
		})

		it("uA should get channel A(PB) and receive", (done) => {
			const joParam = { idChannel: joParamMain.joChannelA.idChannel, isPlaybook:true }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joChannelA, 'idChannel')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uA, joParam, joResult)
		})

		it("uA should put channel A(PB) as isPlaybook=false and FAIL", (done) => {
			const joParam = { idChannel: joParamMain.joChannelA.idChannel, isPlaybook: false }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joChannelA, 'idChannel')
			}
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus:CtExcep.userNotAuthorized.nmMsg
			}
			TestUtil.customCall(done, r, mPut, uA, joParam, joResult)
		})

		it("uA should get Channel A(PB) and receive (again)", (done) => {
			const joParam = { idChannel: joParamMain.joChannelA.idChannel, isPlaybook:true }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joChannelA, 'idChannel')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uA, joParam, joResult)
		})

		/*
		make uA CanPostSeChannel = true
		uA: put channel(A) isPlaybook = false and SUCCEED
		uA: get channel isPlaybook = false and should find channel A
		uA: get channel isPlaybook = true and should NOT find channel A
		uA: post channel(B) isPlaybook = false and SUCCEED
		uA: get channel isPlaybook = false and should find channel B
		uA: get channel isPlaybook = true and should NOT find channel B
		make uA CanPostSechannel = false again.
		*/

		TestCaseItem.itShouldEditUserPermission(uA, false, true, false, false)

		it("uA should put channel A(PB) as isPlaybook=false and SUCCEED", (done) => {
			const joParam = { idChannel: joParamMain.joChannelA.idChannel, isPlaybook: false }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joChannelA, 'idChannel')
				if (res.body.isPlaybook!=false) {
					throw new Error("channel.isPlaybook should be == false")
				}
			}
			TestUtil.customCall(done, r, mPut, uA, joParam)
		})

		it("uA get channel isPlaybook = false and should find channel A", (done) => {
			const joParam = { idChannel: joParamMain.joChannelA.idChannel, isPlaybook:false }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joChannelA, 'idChannel')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uA, joParam, joResult)
		})

		it("uA get channel isPlaybook = true and should NOT find channel A", (done) => {
			const joParam = { idChannel: joParamMain.joChannelA.idChannel, isPlaybook:true }
			const customResponse = (res: Response) => {
				TestCaseItem.shouldBringEmptyBody(res)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uA, joParam, joResult)
		})

		it("uA should post channel A(sales intelligence)", (done) => {
			const nmBase = StringUtil.random()
			const joParam = {
				nmChannel: `channel SI ${nmBase}`,
				isPlaybook: false
			}
			const customResponse = (res: Response) => {
				joParamMain.joChannelB = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mPost, uA, joParam, joResult)
		})

		it("uA get Channel isPlaybook = false and should find Channel B", (done) => {
			const joParam = { idChannel: joParamMain.joChannelB.idChannel, isPlaybook:false }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joChannelB, 'idChannel')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uA, joParam, joResult)
		})

		it("uA get Channel isPlaybook = true and should NOT find Channel B", (done) => {
			const joParam = { idChannel: joParamMain.joChannelB.idChannel, isPlaybook:true }
			const customResponse = (res: Response) => {
				TestCaseItem.shouldBringEmptyBody(res)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uA, joParam, joResult)
		})
	}

	private static testCanSimulateSomeone() {//TODO

	}
}
