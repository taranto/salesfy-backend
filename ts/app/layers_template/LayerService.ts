import { DbConn, Transaction } from "../structure/DbConn";
import { Request, Response } from "express";
import { HError } from "app/util/status/HError";
import { CtError } from "salesfy-shared";

export abstract class LayerService {

	protected _t: Transaction
	protected _req: Request
	protected _res: Response

	constructor(req?: Request, res?: Response, t?:Transaction) {
		this.setReqResTrans(req, res, t);
	}

	public newLayerBusiness() :void {}

	public async openTrs(): Promise<Transaction> {
		try {
			this._t = await DbConn.promiseStartConn()
			const t = this._t
			return new Promise<Transaction>((rsl, rej) => {
				rsl(t)
				return t
			})
		} catch (err) {
			return new Promise<Transaction>((rsl, rej) => {
				rej(err)
				throw new HError({ctStatus: CtError.databaseProblem,
					dsConsole:"Error! could not open connection. Reason: " + err});
			})
		}
	}

	public async closeTrs(err?: Error) {
		if (err) {
			await DbConn.performRollback(err, this._t)
		} else {
			await DbConn.performCommit(this._t)
		}
	}

	public get t(): Transaction {
		return this._t;
	}

	public set req(req: Request) {
		this._req = req
	}

	public set res(res: Response) {
		this._res = res
	}

	public get req(): Request {
		return this._req
	}

	public get res(): Response {
		return this._res
	}

	public set t(t: Transaction) {
		this._t = t
	}

	public setReqResTrans(req?: Request, res?: Response, t?:Transaction) {
		if (req) {
			this._req = req;
		}
		if (res) {
			this._res = res;
		}
		if (t) {
			this._t = t;
		}
	}

}
