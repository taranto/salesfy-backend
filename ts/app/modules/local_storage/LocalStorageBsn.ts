import { LayerBusiness } from "app/layers_template/LayerBusiness";
import { BackendUtil } from "app/util/BackendUtil";
import { ValUtil } from "app/util/ValUtil";
import { LocalStorageDao } from "./LocalStorageDao";
import { ILocalStorage } from "./ILocalStorage";
import { StringUtil, CtError } from 'salesfy-shared';
import { HError } from 'app/util/status/HError';


export class LocalStorageBsn extends LayerBusiness {

    public async get(joParam: any): Promise<ILocalStorage[]> {
        joParam = BackendUtil.defaultDaoListParam(joParam)
        const localStorageDao = new LocalStorageDao(this.t)
        const arLocalStorage = await localStorageDao.get(joParam)
        return arLocalStorage
    }

    public async post(joParam: any): Promise<ILocalStorage> {
        ValUtil.throwArNmKeyMissingInJoParam(joParam, "nmKey", "dsValue")
        const localStorageDao = new LocalStorageDao(this.t)
        const localStorage = await localStorageDao.post(joParam)
        return localStorage
    }

    public async upsert(joParam: any): Promise<ILocalStorage> {
        ValUtil.throwArNmKeyMissingInJoParam(joParam, "nmKey", "dsValue")
        const contentDao = new LocalStorageDao(this.t)
        const content = await contentDao.upsert(joParam)
        return content
    }

    public async put(joParam: any): Promise<ILocalStorage> {
        ValUtil.throwArNmKeyMissingInJoParam(joParam, "nmKey", "dsValue")
        const localStorageDao = new LocalStorageDao(this.t)
        const localStorage = await localStorageDao.put(joParam)
        return localStorage
    }

    public async delete(joParam: any): Promise<void> {
        ValUtil.throwArNmKeyMissingInJoParam(joParam, "nmKey")
        const localStorageDao = new LocalStorageDao(this.t)
        await localStorageDao.delete(joParam)
    }

    public async get1(nmKey: number): Promise<ILocalStorage> {
        const arLocalStorage = await this.get({ nmKey: nmKey })
        if (arLocalStorage.length > 1) {
            throw new HError({ ctStatus: CtError.parametersAreMissing })
        }
        return arLocalStorage[0]
    }
}
