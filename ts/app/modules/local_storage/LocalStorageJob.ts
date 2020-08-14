import { DbConn } from "../../structure/DbConn";
import { HStatus } from "app/util/status/HStatus";
import { ValUtil } from "app/util/ValUtil";
import { LocalStorageBsn } from "app/modules/local_storage/LocalStorageBsn";
import { Log } from "app/structure/Log";

export class LocalStorageJob {

    public async clearPreviousWorkers(): Promise<void> {
        await this.delete({ nmKey: "nrPidMainWorker" })
        return
    }

    public async get(joParam: any): Promise<HStatus> {
        const t = await DbConn.startConn()
        const localStorageBsn = new LocalStorageBsn(t)
        const arLocalStorage = await localStorageBsn.get(joParam)
        await DbConn.performCommit(t)
        return new HStatus({ joResult: arLocalStorage })
    }

    public async upsert(joParam: any): Promise<HStatus> {
        ValUtil.throwArNmKeyMissingInJoParam(joParam, "nmKey", "dsValue")
        const t = await DbConn.startConn()
        const localStorageBsn = new LocalStorageBsn(t)
        const localStorage = await localStorageBsn.upsert(joParam)
        await DbConn.performCommit(t)
        return new HStatus({ joResult: localStorage })
    }

    public async post(joParam: any): Promise<HStatus> {
        ValUtil.throwArNmKeyMissingInJoParam(joParam, "nmKey", "dsValue")
        const t = await DbConn.startConn()
        const localStorageBsn = new LocalStorageBsn(t)
        const localStorage = await localStorageBsn.post(joParam)
        await DbConn.performCommit(t)
        return new HStatus({ joResult: localStorage })
    }

    public async put(joParam: any): Promise<HStatus> {
        ValUtil.throwArNmKeyMissingInJoParam(joParam, "nmKey", "dsValue")
        const t = await DbConn.startConn()
        const localStorageBsn = new LocalStorageBsn(t)
        const localStorage = await localStorageBsn.put(joParam)
        await DbConn.performCommit(t)
        return new HStatus({ joResult: localStorage })
    }

    public async delete(joParam: any): Promise<HStatus> {
        ValUtil.throwArNmKeyMissingInJoParam(joParam, "nmKey")
        const t = await DbConn.startConn()
        const localStorageBsn = new LocalStorageBsn(t)
        await localStorageBsn.delete(joParam)
        await DbConn.performCommit(t)
        return new HStatus({})
    }

}
