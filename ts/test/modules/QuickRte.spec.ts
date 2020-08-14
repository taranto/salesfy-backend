import { RoutesEnum, SConst, KeyEnum, CtHttpStatus, } from "salesfy-shared";
import { StringUtil, CtContent, CtChannelView, CtWarn, CtExcep } from "salesfy-shared";
import { TestCaseItem, TestUtil, TestShould, TestUserManager, DbConn } from "../barrel/Barrel.spec";
import { LayerDao } from "app/layers_template/LayerDao";
import { Response } from "superagent";
import { ConnDao } from "app/structure/ConnDao";
import { TestRouteSpec } from "../support/TestRoute.spec";
import { Content } from "app/modules/content/Content";
import { TestEntity } from "../support/TestEntity.spec";
import { Channel } from "app/modules/channel/Channel";
import { ContentDao } from "app/modules/content/ContentDao";
import { ChannelDao } from "app/modules/channel/ChannelDao";
import { Group } from "app/modules/group/Group";
import { EnvTest } from "../support/EnvTest.spec";
import { UserGroup } from "app/modules/user_group/UserGroup";

export class QuickRteSpec extends TestRouteSpec {

	public joParamMain: any = {}

	public test() {
		describe(TestShould.describeTitle("Quick test!"), () => {
			this.test1()
		})
	}

	public test1() {
		// const joParamMain: any = {}
		const r = RoutesEnum.userNetwork

		// TestCaseItem.itShouldEditUserPermission(this.u, true, true, true)

		it.skip(TestShould.execute(), (done) => {
			const joParam = { hasMe: true }

			const customResponse = (res: Response) => {
				const a = res.body
				this.joParamMain.joContent1 = a[0]
			}
			const joResult = { customResponse: customResponse }
			TestUtil.customCall(done, r, this.mGet, this.u, joParam, joResult)
		})
	}
}
