import { LayerDao } from "app/layers_template/LayerDao";
import { Transaction } from "app/structure/DbConn";
import { ITag } from "salesfy-shared";
import { Env } from "app/structure/Env";
import { DaoUtil } from "app/util/DaoUtil";
import { Tag } from "app/modules/tag/Tag";

export class TagDao extends LayerDao<Tag, ITag> {

	constructor(t: Transaction) {
		super(t);
		// this.select = DaoUtil.toSelect("tag", "idTag", "nmTag", "idCtTag", "piTag")
	}

	public async get(joParam: any): Promise<ITag[]> {
		const query = `select ${DaoUtil.getCsNmField(Tag.getArNmField(), "tag", true)} from tag`
		const where = ` where idtag is not in (${Env.getBsnArIdHiddenTagsInterests})`
		const result = await this.query(query)
		return result
	}
}
