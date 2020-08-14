import { LayerDao } from "app/layers_template/LayerDao";
import { Transaction } from "app/structure/DbConn";
import { UserTag } from "app/modules/user_tag/UserTag";
import { IUserTag } from "salesfy-shared";
import { DaoUtil } from "app/util/DaoUtil";

export class UserTagDao extends LayerDao<UserTag, IUserTag> {

	constructor(t: Transaction) {
		super(t);
		// this.select = DaoUtil.toSelect("userTag", "idUserTag", "idTag", "idUser")
	}

	public async get(joParam: { idUser?: number, idTag?: number }): Promise<IUserTag[]> {
		const base = `select ${DaoUtil.getCsNmField(UserTag.getArNmField(), "userTag", true)},
			${DaoUtil.toSelect("tag", "nmTag", "piTag", "idCtTag")}
			from userTag join tag using(idTag) where true `
		const dsUserFilter = joParam.idUser != undefined ? ` and idUser = ${joParam.idUser}` : ""
		const dsTagFilter = joParam.idTag != undefined ? ` and idTag = ${joParam.idTag}` : ""
		const query = base + dsUserFilter + dsTagFilter
		const userTags : IUserTag[] = await this.query(query)
		return userTags
	}

	public async insert(joParam: any): Promise<IUserTag> {
		const result: any = await UserTag.create(joParam, { transaction: this.t, returning: true })
			.catch((err:any) => this.defaultCatchError(err))
		const userTag: IUserTag = result
		return userTag
	}

	public async delete(joParam:any): Promise<void> {
		await super.delete(UserTag, {idTag:joParam.idTag, idUser:joParam.idUser})
		return
		// return result

		// const query = `delete from userTag where idTag = ${joParam.idTag} and idUser = ${joParam.idUser} returning *`
		// const result: any = await this.query(query)
		// 	.catch((err) => this.defaultCatchError(err))
		// return
	}
}
