import { RoutesEnum, SConst, TUserTest, DateUtil, StringUtil, CtHttpStatus, KeyEnum, CtExcep, CtUserGroupAccess } from "salesfy-shared";
import { LayerDao } from "app/layers_template/LayerDao";
import { TestUtil, TestShould, TestUserManager, TestCaseItem } from "../barrel/Barrel.spec";
import { Response } from "superagent";
import { ConnDao } from "app/structure/ConnDao";
import { TestEntity } from "../support/TestEntity.spec";
import { Content } from "app/modules/content/Content";
import { EnvTest } from "../support/EnvTest.spec";

export class GroupScopeForContentsSpec {

	public static test() {
		describe("Behavior group scope for contents", () => {
			GroupScopeForContentsSpec.testContentAccess()
		})
	}

	private static testContentAccess() {
		const r = RoutesEnum.content
		const mDel = SConst.HTTP_METHOD_DELETE
		const mGet = SConst.HTTP_METHOD_GET
		const mPut = SConst.HTTP_METHOD_PUT
		const mPost = SConst.HTTP_METHOD_POST
		const uA = SConst.TEST_ROLE_NORMAL_USER
		const uB = SConst.TEST_ROLE_NEW_USER

		TestCaseItem.itShouldEditUserPermission(uA, true, true, false, false)
		TestCaseItem.itShouldEditUserPermission(uB, true, true, false, false)

		/**
		uA: post content A (sales intelligence)
		uA: post content B (playbook)
		uB: get content A(SI) and receive
		uB: get content B(PB) and not receive
		uA: get content A(SI) and receive
		uA: get content B(PB) and receive
		*/
		const joParamMain: any = {}
		it("uA should post content A(sales intelligence)", (done) => {
			const joParam = TestEntity.gen(Content, { isPlaybook: false })
			const customResponse = (res: Response) => {
				joParamMain.joContentA = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mPost, uA, joParam, joResult)
		})

		it("uA should post content B (playbook)", (done) => {
			const joParam = TestEntity.gen(Content, { isPlaybook: true })
			const customResponse = (res: Response) => {
				joParamMain.joContentB = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mPost, uA, joParam, joResult)
		})

		it("uB should get content A(SI) and receive", (done) => {
			const joParam = { idContent: joParamMain.joContentA.idContent }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joContentA, 'idContent')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uB, joParam, joResult)
		})

		it("uB should get content B(PB) and NOT receive", (done) => {
			const joParam = { idContent: joParamMain.joContentB.idContent }
			const customResponse = (res: Response) => {
				TestCaseItem.shouldBringEmptyBody(res)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uB, joParam, joResult)
		})

		it("uA should get content A(SI) and receive", (done) => {
			const joParam = { idContent: joParamMain.joContentA.idContent }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joContentA, 'idContent')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uA, joParam, joResult)
		})

		it("uA should get content B(PB) and receive", (done) => {
			const joParam = { idContent: joParamMain.joContentB.idContent }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joContentB, 'idContent')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uA, joParam, joResult)
		})

		/**
		uA: create channel A (sales intelligence)
		uA: create channel B (playbook)
		uA: link content A to channel A 
		uA: link content B to channel B 
		uB: get content A(SI) and receive
		uB: get content B(PB) and not receive
		uA: get content A(SI) and receive
		uA: get content B(PB) and receive
		*/
		it("uA should post channel A(sales intelligence)", (done) => {
			const nmBase = StringUtil.random()
			const joParam = {
				nmChannel: `channel SI ${nmBase}`,
				isPlaybook: false
			}
			const customResponse = (res: Response) => {
				joParamMain.joChannelA = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.channel, mPost, uA, joParam, joResult)
		})

		it("uA should post channel B(playbook)", (done) => {
			const nmBase = StringUtil.random()
			const joParam = {
				nmChannel: `channel PB ${nmBase}`,
				isPlaybook: true
			}
			const customResponse = (res: Response) => {
				joParamMain.joChannelB = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.channel, mPost, uA, joParam, joResult)
		})

		it("uA should link content A to channel A", (done) => {
			const joParam = {
				idChannel: joParamMain.joChannelA.idChannel,
				idContent: joParamMain.joContentA.idContent
			}
			const customResponse = (res: Response) => {
				joParamMain.joContentChannelA = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.contentChannel, mPost, uA, joParam, joResult)
		})

		it("uA should link content B to channel B", (done) => {
			const joParam = {
				idChannel: joParamMain.joChannelB.idChannel,
				idContent: joParamMain.joContentB.idContent
			}
			const customResponse = (res: Response) => {
				joParamMain.joContentChannelB = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.contentChannel, mPost, uA, joParam, joResult)
		})

		it("uB should get content A(SI) and receive", (done) => {
			const joParam = { idContent: joParamMain.joContentA.idContent }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joContentA, 'idContent')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uB, joParam, joResult)
		})

		it("uB should get content B(PB) and NOT receive", (done) => {
			const joParam = { idContent: joParamMain.joContentB.idContent }
			const customResponse = (res: Response) => {
				TestCaseItem.shouldBringEmptyBody(res)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uB, joParam, joResult)
		})

		it("uA should get content A(SI) and receive", (done) => {
			const joParam = { idContent: joParamMain.joContentA.idContent }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joContentA, 'idContent')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uA, joParam, joResult)
		})

		it("uA should get content B(PB) and receive", (done) => {
			const joParam = { idContent: joParamMain.joContentB.idContent }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joContentB, 'idContent')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uA, joParam, joResult)
		})

		/**
		uA: unlink content A from channel A 
		uA: unlink content B from channel B 
		uA: link content B(PB) to channel A(SI)
		uA: link content A(SI) to channel B(PB)
		uB: get content A and receive
		uB: get content B and not receive
		uA: get content A and receive
		uA: get content B and receive
		*/
		it("uA should unlink content A from channel A", (done) => {
			const joParam = {
				idContentChannel: joParamMain.joContentChannelA.idContentChannel,
			}
			TestUtil.customCall(done, RoutesEnum.contentChannel, mDel, uA, joParam)
		})

		it("uA should unlink content B from channel B", (done) => {
			const joParam = {
				idContentChannel: joParamMain.joContentChannelB.idContentChannel,
			}
			TestUtil.customCall(done, RoutesEnum.contentChannel, mDel, uA, joParam)
		})

		it("uA should link content A to channel B", (done) => {
			const joParam = {
				idChannel: joParamMain.joChannelB.idChannel,
				idContent: joParamMain.joContentA.idContent
			}
			const customResponse = (res: Response) => {
				joParamMain.joContentChannelAB = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.contentChannel, mPost, uA, joParam, joResult)
		})

		it("uA should link content B to channel A", (done) => {
			const joParam = {
				idChannel: joParamMain.joChannelA.idChannel,
				idContent: joParamMain.joContentB.idContent
			}
			const customResponse = (res: Response) => {
				joParamMain.joContentChannelBA = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.contentChannel, mPost, uA, joParam, joResult)
		})

		it("uB should get content A(SI) and receive", (done) => {
			const joParam = { idContent: joParamMain.joContentA.idContent }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joContentA, 'idContent')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uB, joParam, joResult)
		})
//////////////////////////////
		it("uB should get content B(PB) and NOT receive", (done) => {
			const joParam = { idContent: joParamMain.joContentB.idContent }
			const customResponse = (res: Response) => {
				TestCaseItem.shouldBringEmptyBody(res)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uB, joParam, joResult)
		})

		it("uA should get content A(SI) and receive", (done) => {
			const joParam = { idContent: joParamMain.joContentA.idContent }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joContentA, 'idContent')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uA, joParam, joResult)
		})

		it("uA should get content B(PB) and receive", (done) => {
			const joParam = { idContent: joParamMain.joContentB.idContent }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joContentB, 'idContent')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uA, joParam, joResult)
		})

		/**
		uA: unlink content B from channel A 
		uA: unlink content A from channel B 
		uA: link content A to channel A 
		uA: link content B to channel B 
		uA: create group B
		uA: link group B to channel B
		uB: get content B and not receive
		uA: add uB to group B
		uB: get content B and receive
		*/
		it("uA should unlink content B from channel A", (done) => {
			const nmBase = StringUtil.random()
			const joParam = {
				idContentChannel: joParamMain.joContentChannelBA.idContentChannel,
			}
			TestUtil.customCall(done, RoutesEnum.contentChannel, mDel, uA, joParam)
		})

		it("uA should unlink content A from channel B", (done) => {
			const joParam = {
				idContentChannel: joParamMain.joContentChannelAB.idContentChannel,
			}
			TestUtil.customCall(done, RoutesEnum.contentChannel, mDel, uA, joParam)
		})

		it("uA should link content A to channel A", (done) => {
			const joParam = {
				idChannel: joParamMain.joChannelA.idChannel,
				idContent: joParamMain.joContentA.idContent
			}
			const customResponse = (res: Response) => {
				joParamMain.joContentChannelA = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.contentChannel, mPost, uA, joParam, joResult)
		})

		it("uA should link content B to channel B", (done) => {
			const joParam = {
				idChannel: joParamMain.joChannelB.idChannel,
				idContent: joParamMain.joContentB.idContent
			}
			const customResponse = (res: Response) => {
				joParamMain.joContentChannelB = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.contentChannel, mPost, uA, joParam, joResult)
		})

		it("uA should post group B", (done) => {
			const nmBase = StringUtil.random()
			const joParam = {
				nmGroup: `Group B ${nmBase}`,
				idWorkspace: EnvTest.getIdWorkspaceDefault()
			}
			const customResponse = (res: Response) => {
				joParamMain.joGroupB = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.group, mPost, uA, joParam, joResult)
		})

		it("uA should link group B to channel B", (done) => {
			const joParam = {
				idGroup: joParamMain.joGroupB.idGroup,
				idChannel: joParamMain.joChannelB.idChannel
			}
			const customResponse = (res: Response) => {
				joParamMain.joChannelGroupB = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.channelGroup, mPost, uA, joParam, joResult)
		})

		it("uB should get content B(PB) and NOT receive", (done) => {
			const joParam = { idContent: joParamMain.joContentB.idContent }
			const customResponse = (res: Response) => {
				TestCaseItem.shouldBringEmptyBody(res)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uB, joParam, joResult)
		})

		it("uA should link user B to group B", (done) => {
			const user = TestUserManager.getNewUser().loggedUser.user
			const joParam = {
				idGroup: joParamMain.joGroupB.idGroup,
				idUser: user.idUser
			}
			const customResponse = (res: Response) => {
				joParamMain.joUserGroupB = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.userGroup, mPost, uA, joParam, joResult)
		})

		it("uB should get content B(PB) and receive", (done) => {
			const joParam = { idContent: joParamMain.joContentB.idContent }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joContentB, 'idContent')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uB, joParam, joResult)
		})

		/**
		uA: remove user B from group B
		uB: get content B and not receive
		uA: add uB to group B as admin
		uB: remove uA from groupB
		uB: get content B and receive
		uA: get content B and receive (he's the content's creator)
		*/
		it("uA should unlink user B from group B", (done) => {
			const joParam = {
				idUserGroup: joParamMain.joUserGroupB.idUserGroup,
			}
			TestUtil.customCall(done, RoutesEnum.userGroup, mDel, uA, joParam)
		})

		it("uB should get content B(PB) and NOT receive", (done) => {
			const joParam = { idContent: joParamMain.joContentB.idContent }
			const customResponse = (res: Response) => {
				TestCaseItem.shouldBringEmptyBody(res)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uB, joParam, joResult)
		})

		it("uA should link user B to group B as admin", (done) => {
			const user = TestUserManager.getNewUser().loggedUser.user
			const joParam = {
				idGroup: joParamMain.joGroupB.idGroup,
				idUser: user.idUser,
				idCtUserGroupAccess: CtUserGroupAccess.admin.key
			}
			const customResponse = (res: Response) => {
				joParamMain.joUserGroupB2 = res.body
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.userGroup, mPost, uA, joParam, joResult)
		})

		it("uB should unlink user A from group B", (done) => {
			const joParam = {
				idUserGroup: joParamMain.joGroupB.idUserGroup,
			}
			TestUtil.customCall(done, RoutesEnum.userGroup, mDel, uB, joParam)
		})

		it("uB should get content B(PB) and receive", (done) => {
			const joParam = { idContent: joParamMain.joContentB.idContent }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joContentB, 'idContent')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uB, joParam, joResult)
		})

		it("uA should get content B(PB) and receive", (done) => {
			const joParam = { idContent: joParamMain.joContentB.idContent }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joContentB, 'idContent')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uA, joParam, joResult)
		})

		/**
		uB: unlink group B from channel B
		uB: get content B and not receive
		uA: get content B and receive (he's the content's creator)
		*/
		it("uB should unlink group B from channel B", (done) => {
			const joParam = {
				idChannelGroup: joParamMain.joChannelGroupB.idChannelGroup,
			}
			TestUtil.customCall(done, RoutesEnum.channelGroup, mDel, uB, joParam)
		})

		it("uB should get content B(PB) and NOT receive", (done) => {
			const joParam = { idContent: joParamMain.joContentB.idContent }
			const customResponse = (res: Response) => {
				TestCaseItem.shouldBringEmptyBody(res)
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uB, joParam, joResult)
		})

		it("uA should get content B(PB) and receive", (done) => {
			const joParam = { idContent: joParamMain.joContentB.idContent }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joContentB, 'idContent')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, mGet, uA, joParam, joResult)
		})

		/**
		no-token: should convert content B(PB) and FAIL
		no-token: should like content B(PB) and FAIL
		no-token: should favorite content B(PB) and FAIL 
		uB: should convert content B(PB) and FAIL
		uB: should like content B(PB) and FAIL
		uB: should favorite content B(PB) and FAIL 
		uB: should convert content A(SI) and succeed
		uB: should like content A(SI) and succeed
		uB: should favorite content A(SI) and succeed
		uA: should convert content B(PB) and succeed
		uA: should like content B(PB) and succeed
		uA: should favorite content B(PB) and succeed
		uA: should convert content A(SI) and succeed
		uA: should like content A(SI) and succeed
		uA: should favorite content A(SI) and succeed
		*/

		it("no-token should convert content B and FAIL", (done) => {
			const joParam = { idContent: joParamMain.joContentB.idContent }
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus:CtExcep.refreshTokenUndefined.nmMsg
			}
			TestUtil.customCall(done, RoutesEnum.contentConversion, mGet, undefined, joParam, joResult)
		})

		it("no-token should like content B and FAIL", (done) => {
			const joParam = { idContent: joParamMain.joContentB.idContent, isLike:true }
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus:CtExcep.refreshTokenUndefined.nmMsg
			}
			TestUtil.customCall(done, RoutesEnum.userContent, mPut, undefined, joParam, joResult)
		})

		it("no-token should favorite content B and FAIL", (done) => {
			const joParam = { idContent: joParamMain.joContentB.idContent, isFavorite:true }
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus:CtExcep.refreshTokenUndefined.nmMsg
			}
			TestUtil.customCall(done, RoutesEnum.userContent, mPut, undefined, joParam, joResult)
		})

		it("uB should convert content B and FAIL", (done) => {
			const joParam = { idContent: joParamMain.joContentB.idContent }
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus:CtExcep.userNotAuthorized.nmMsg
			}
			TestUtil.customCall(done, RoutesEnum.contentConversion, mGet, uB, joParam, joResult)
		})

		it("uB should like content B and FAIL", (done) => {
			const joParam = { idContent: joParamMain.joContentB.idContent, isLike:true }
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus:CtExcep.userNotAuthorized.nmMsg
			}
			TestUtil.customCall(done, RoutesEnum.userContent, mPut, uB, joParam, joResult)
		})

		it("uB should favorite content B and FAIL", (done) => {
			const joParam = { idContent: joParamMain.joContentB.idContent, isFavorite:true }
			const joResult = {
				nrStatus: CtHttpStatus.status400.keyCtHttpStatus,
				dsStatus:CtExcep.userNotAuthorized.nmMsg
			}
			TestUtil.customCall(done, RoutesEnum.userContent, mPut, uB, joParam, joResult)
		})

		it("uB should convert content A and succeed", (done) => {
			const joParam = { idContent: joParamMain.joContentA.idContent }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joContentA, 'idContent')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.contentConversion, mGet, uB, joParam, joResult)
		})

		it("uB should like content A and succeed", (done) => {
			const joParam = { idContent: joParamMain.joContentA.idContent, isLike:true }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joContentA, 'idContent')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.userContent, mPut, uB, joParam, joResult)
		})

		it("uB should favorite content A and succeed", (done) => {
			const joParam = { idContent: joParamMain.joContentA.idContent, isFavorite:true }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joContentA, 'idContent')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.userContent, mPut, uB, joParam, joResult)
		})

		it("uA should convert content B and succeed", (done) => {
			const joParam = { idContent: joParamMain.joContentB.idContent }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joContentB, 'idContent')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.contentConversion, mGet, uA, joParam, joResult)
		})

		it("uA should like content B and succeed", (done) => {
			const joParam = { idContent: joParamMain.joContentB.idContent, isLike:true }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joContentB, 'idContent')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.userContent, mPut, uA, joParam, joResult)
		})

		it("uA should favorite content B and succeed", (done) => {
			const joParam = { idContent: joParamMain.joContentB.idContent, isFavorite:true }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joContentB, 'idContent')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.userContent, mPut, uA, joParam, joResult)
		})

		it("uA should convert content A and succeed", (done) => {
			const joParam = { idContent: joParamMain.joContentA.idContent }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joContentA, 'idContent')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.contentConversion, mGet, uA, joParam, joResult)
		})

		it("uA should like content A and succeed", (done) => {
			const joParam = { idContent: joParamMain.joContentA.idContent, isLike:true }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joContentA, 'idContent')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.userContent, mPut, uA, joParam, joResult)
		})

		it("uA should favorite content A and succeed", (done) => {
			const joParam = { idContent: joParamMain.joContentA.idContent, isFavorite:true }
			const customResponse = (res: Response) => {
				TestCaseItem.evalIsTheOne(res, joParamMain.joContentA, 'idContent')
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, RoutesEnum.userContent, mPut, uA, joParam, joResult)
		})
	}
// tslint:disable-next-line:max-file-line-count
}
