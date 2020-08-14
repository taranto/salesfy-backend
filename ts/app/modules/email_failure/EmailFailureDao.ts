import { Transaction } from "../../structure/DbConn";
import { LayerDao } from "../../layers_template/LayerDao";
import { EmailFailure } from "./EmailFailure";
import { IEmailFailure, StringUtil } from "salesfy-shared";
import { DaoUtil } from "app/util/DaoUtil";

export class EmailFailureDao extends LayerDao<EmailFailure, IEmailFailure> {

	private authSelect: string

	constructor(t: Transaction) {
		super(t);
		this.authSelect = `idEmailFailure as \"idEmailFailure\", emTo as \"emTo\",
		 emFrom as \"emFrom\", dsHtml as \"dsHtml\", dsSubject as \"dsSubject\",
		 cdErrorResponse as \"cdErrorResponse\", dsErrorStack as \"dsErrorStack\", dhLastRetry as \"dhLastRetry\",
		 dhFailure as \"dhFailure\", qtRetry as \"qtRetry\", isSent as \"isSent\"`
	}

	public async insert(joParam: any): Promise<EmailFailure | undefined> {
		const emailFailure = await EmailFailure.create(joParam, { transaction: this.t })
			.catch((err:any) => this.defaultCatchError(err))
		return emailFailure ? emailFailure : undefined
	}

	public async setValue(id: number, nmKey: string, dsValue: any): Promise<IEmailFailure> {
		const query = `update EmailFailure set ${nmKey} = ${DaoUtil.sqlFormat(dsValue)} where idEmailFailure = ${id}`
		const result = await this.query(query)
		return result[0]
	}

	public async get(
		joParam: { isSent?: boolean, maxTries?: number, dhUnderTimeWindow: Date }): Promise<IEmailFailure[]> {
		let whereCondition = ""
		if (joParam) {
			whereCondition += joParam.isSent != null? ` and isSent = ${joParam.isSent} `:""
			whereCondition += joParam.maxTries != null? ` and qtRetry <= ${joParam.maxTries} `:""
			whereCondition += joParam.dhUnderTimeWindow != null ?
				` and dhFailure >= ${DaoUtil.sqlFormat(joParam.dhUnderTimeWindow)} `:""
		}
		const query = `select ${this.authSelect} from emailfailure where true ${whereCondition}`
		const result = await this.query(query)
		return result
	}

	public async registerARetry(
		idEmailFailure: number, cdErrorResponse: number, dsErrorStack: string): Promise<IEmailFailure> {
		const cdErrorResponseWhere = cdErrorResponse ? ` cdErrorResponse = ${cdErrorResponse},` : ""
		const query = `update emailFailure
			 set qtRetry = qtRetry+1,
			 dhLastRetry = ${DaoUtil.sqlFormat(new Date())},
			 ${cdErrorResponseWhere}
			 dsErrorStack = ${DaoUtil.sqlFormat(dsErrorStack)}
			 where idEmailFailure = ${idEmailFailure}`
		const result = await this.query(query)
		return result[0]
	}
}
