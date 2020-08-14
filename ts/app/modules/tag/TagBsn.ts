import { LayerBusiness } from "app/layers_template/LayerBusiness";
import { ITag } from "salesfy-shared";
import { TagDao } from "app/modules/tag/TagDao";

export class TagBsn extends LayerBusiness {

	public async get(joParam: any): Promise<ITag[]> {
		const tagDao = new TagDao(this.t);
		const tags = await tagDao.get(joParam);
		return tags
	}
}
