import { LayerBusiness } from "app/layers_template/LayerBusiness";
import { IAuth } from "salesfy-shared";
import { AuthDao } from "app/modules/auth/AuthDao";

export abstract class AuthIntegrationAbstractBsn extends LayerBusiness {

	public abstract async getAuthTokenData(joParam: any): Promise<any>;

	public async getRegisterData(joParam: any): Promise<any>{}

	public async maybeMergeUserData(joParamToMerge:any, auth:IAuth) : Promise<any>{
		if (this.isMergeMade(auth)) {
			return auth
		}
		const authUpserted = await this.mergeUserData(joParamToMerge, auth)
		return authUpserted
	}

	public async mergeUserData(joParam:any, auth:IAuth) : Promise<IAuth>{
		const joUser = await this.userDataToMerge(joParam, auth)
		const authDao = new AuthDao(this.t)
		const authUpserted = await authDao.update(joUser)
		return authUpserted
	}

	public abstract async userDataToMerge(joParam:any, auth:IAuth) : Promise<any>

	public abstract isMergeMade(auth:IAuth) : boolean

}
