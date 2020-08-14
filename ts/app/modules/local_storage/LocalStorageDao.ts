import { LayerDao } from "app/layers_template/LayerDao";
import { Transaction } from "sequelize";
import { ILocalStorage } from "./ILocalStorage";
import { LocalStorage } from "./LocalStorage";
import { DaoUtil } from "app/util/DaoUtil";
import { Log } from "app/structure/Log";

export class LocalStorageDao extends LayerDao<LocalStorage, ILocalStorage> {

    constructor(t: Transaction) {
        super(t);
    }

    public async post(joParam: any | ILocalStorage): Promise<ILocalStorage> {
        const result = await super.create(LocalStorage, joParam)
        return result
    }

    public async put(joParam: any): Promise<ILocalStorage> {
        const result = await super.update(LocalStorage, joParam, { nmKey: joParam.nmKey })
        return result
    }

    public async upsert(joParam: any): Promise<ILocalStorage> {
        const result = await super.upsert(LocalStorage, joParam)
        return result
    }

    public async get(joParam: any): Promise<ILocalStorage[]> {
        const query = this.getQuery(joParam)
        const qtLimitQtOffsetFilter = DaoUtil.qtLimitQtOffsetFilter(joParam)
        const dsQueryLimited = `${query} ${qtLimitQtOffsetFilter}`
        const result = await this.query(dsQueryLimited)
        return result
    }

    public getQuery(joParam: any): string {
        const dsSelect = this.getSelect(joParam)
        const dsWhere = this.getWhere(joParam)
        const query = `
			select distinct ${dsSelect}
			from localstorage ls
			where true
			${dsWhere}
		`
        return query
    }

    private getSelect(joParam: any): string {
        const isSelectQuoted = LayerDao.isSelectQuoted(joParam)
        let dsSelect = `${DaoUtil.getCsNmField(LocalStorage.getArNmField(), "ls", isSelectQuoted)}`
        return dsSelect
    }

    private getWhere(joParam: any): string {
        const joParamWhere = DaoUtil.escapeStrings(joParam)
        const nmKeyWhere = joParamWhere.nmKey != undefined ? ` and nmKey like ${joParamWhere.nmKey} ` : ""
        const dsWhere = `${nmKeyWhere}`
        return dsWhere
    }

    public async delete(joParam: any): Promise<void> {
        const joWhere = joParam.nmKey != undefined ? { nmKey: joParam.nmKey } : { nmKey: joParam.idLocalStorage }
        const result: any = await LocalStorage.destroy(
            { transaction: this.t, where: joWhere }
        )
            .catch((err: any) => this.defaultCatchError(err))
        return
    }
}
