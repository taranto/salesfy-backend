import { THttpMethod, SConst, TUserTest } from "salesfy-shared";

export class TestRouteSpec {

	protected mDel: THttpMethod = SConst.HTTP_METHOD_DELETE
	protected mGet: THttpMethod = SConst.HTTP_METHOD_GET
	protected mPost: THttpMethod = SConst.HTTP_METHOD_POST
	protected mPut: THttpMethod = SConst.HTTP_METHOD_PUT
	protected u: TUserTest = SConst.TEST_ROLE_NORMAL_USER
	protected u2: TUserTest = SConst.TEST_ROLE_NEW_USER
	protected joParamMain: any = {}

}
