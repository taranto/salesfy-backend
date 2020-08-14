import { TestHnValueGen } from "./TestHnValueGen.spec";
import { TestShould } from "./TestShould.spec";
import { TestUtil } from "./TestUtil.spec";
import { Response } from "supertest";
import { THttpMethod, TUserTest, SConst, RoutesEnum } from "salesfy-shared";
import { Content } from "app/modules/content/Content";
import { Channel } from "app/modules/channel/Channel";
import { ContentChannel } from "app/modules/content_channel/ContentChannel";
import { TestUser } from "./TestUser.spec";
import { Done } from "mocha";

export class TestEntity {

	public static gen<T extends any>(entityClass: T, joCustom?: any): T {
		const arJoField = entityClass["rawAttributes"]
		const arNmField = Object.keys(arJoField)
		let joGenerated: any = {}
		arNmField.forEach((nmField: string) => {
			const obAValueGen = TestHnValueGen.generate(nmField)
			joGenerated[nmField] = obAValueGen
		})
		joGenerated = { ...joGenerated, ...joCustom }
		return joGenerated
	}

	public static itReg<T extends any>(r: string, u: TUserTest | TestUser | number | "g" | "f" | "a",
		entityClass: T, customResponse: (res: Response) => any, joCustom?: any) {
		it(TestShould.dsText({ dsPreparation: `Register ${entityClass.name}` }), (d) => {
			TestEntity.reg<T>(d, r, u, entityClass, customResponse, joCustom)
		})
	}

	public static reg<T extends any>(d: Done, r: string, u: TUserTest | TestUser | number | "g" | "f" | "a",
		entityClass: T, customResponse?: (res: Response) => any, joCustom?: any) {
		let joCustom1 = joCustom
		if (typeof joCustom === 'function') {
			joCustom1 = joCustom()
		}
		const joParam = TestEntity.gen(entityClass, joCustom1)
		const joResult = { customResponse: customResponse }
		TestUtil.customCall(d, r, SConst.HTTP_METHOD_POST, u, joParam, joResult)
	}
}
