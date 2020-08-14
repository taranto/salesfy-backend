import { LayerBusiness } from "app/layers_template/LayerBusiness";
import { UserTagDao } from "app/modules/user_tag/UserTagDao";
import { IUserTag, KeyEnum, CtExcep } from "salesfy-shared";
import { ValUtil } from "app/util/ValUtil";
import { HExcep } from "app/util/status/HExcep";

export class UserTagBsn extends LayerBusiness {

	public async post(joParam: any): Promise<IUserTag> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idUser", "idTag")
		delete joParam.idUserTag
		const userTagDao = new UserTagDao(this.t)
		const arUserTag = await userTagDao.get(joParam)
		if (arUserTag.length > 0) {
			throw new HExcep({ ctStatus:CtExcep.nmKeyAlreadyExists, joExtraContent: { nmKey:KeyEnum.bond } })
		}
		joParam.dtRegister = new Date()
		const userTag = await userTagDao.insert(joParam)
		return userTag
	}

	public async delete(joParam: any): Promise<void> {
		ValUtil.throwArNmKeyMissingInJoParam(joParam, "idUser", "idTag")
		const userTagDao = new UserTagDao(this.t)
		await userTagDao.delete({idTag:joParam.idTag, idUser:joParam.idUser})
		return
	}

	public async get(joParam: any): Promise<IUserTag[]> {
		const userTagDao = new UserTagDao(this.t)
		const userTags = await userTagDao.get(joParam)
		return userTags
	}
}
