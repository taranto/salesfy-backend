import { Transaction } from "../../structure/DbConn";
import { LayerDao } from "./../../layers_template/LayerDao";
import { IAuth, StringUtil, IUser } from "salesfy-shared";
import { UserDao } from "../user/UserDao";
import { User } from "app/modules/user/User";
import { DaoUtil } from "app/util/DaoUtil";

export class AuthDao extends UserDao {

	constructor(t: Transaction) {
		super(t);
	}

	public async setValues2(id: number, vlSet: Array<{ nmKey: string, dsValue: any }>): Promise<IAuth> {
		const setString: string[] = []
		vlSet.forEach(aValue => {
			setString.push(` ${aValue.nmKey} = ${DaoUtil.sqlFormat(aValue.dsValue)} `)
		})
		const query = `update usr set ${setString.join(", ")} where idUser = ${id}
		returning ${DaoUtil.getCsNmField(User.getArNmFieldAuth(), "usr", true)}`
		const result = await this.query(query)
		return result[0]
	}

	// public async put(joParam: any): Promise<IAuth> {
	// 	const result: any = await User.update(joParam,
	// 		{ transaction: this.t, returning: true, where: {idUser:joParam.idUser}})
	// 		.catch((err) => this.defaultCatchError(err))
	// 	const auth: IAuth = result[1][0].dataValues
	// 	return auth
	// }

	public async setValues(id: number, nmKey: string[], dsValues: string[]): Promise<IAuth> {
		let setString = ""
		for (let i = 0; i < nmKey.length; i++) {
			setString = ` ${setString} ${nmKey[i]} = ${DaoUtil.sqlFormat(dsValues[i])} `
		}
		const query = `update usr set ${setString} where idUser = ${id}`
		const result = await this.query(query)
		return result[0]
	}

	public async setValue(id: number, nmKey: string, dsValue: any): Promise<IAuth> {
		const query = `update usr set ${nmKey} = ${DaoUtil.sqlFormat(dsValue)} where idUser = ${id}`
		const result = await this.query(query)
		return result[0]
	}

	public async getUserLogin(nmKey: string, dsValue: string): Promise<IAuth> {
		const arField = [...User.getArNmFieldAuth(), ...User.getArNmFieldPrivate(), ...User.getArNmFieldPublic()]
		const query = `select ${DaoUtil.getCsNmField(arField, "usr", true)}
		from usr where ${nmKey} = ${DaoUtil.sqlFormat(dsValue)}`
		const result = await this.query(query)
		return result[0]
	}

	// public async getUserMe(nmKey: string, dsValue: string): Promise<IUser> {
	// 	const query = `select ${this.select}
	// 	from usr
	// 	where ${nmKey} = ${StringUtil.sqlFormat(dsValue)}`
	// 	const result = await this.query(query)
	// 	return result[0]
	// }

	public async getRefreshToken(idUser?: number, crKeyRefreshToken?: string): Promise<IAuth[]> {
		let query = `select idUser as \"idUser\", crKeyRefreshToken as \"crKeyRefreshToken\"
		from usr where crKeyRefreshToken is not null and crKeyRefreshToken != '' `
		if (idUser) {
			query = query + `and idUser = ${idUser} `
		}
		if (crKeyRefreshToken) {
			query = query + `and crKeyRefreshToken = ${crKeyRefreshToken} `
		}
		const result = await this.query(query)
		return result
	}

	public async updateRefreshToken(idUser: number, crKeyRefreshToken: string | undefined): Promise<any> {
		if (!crKeyRefreshToken) {
			crKeyRefreshToken = ""
		}
		const query = `update usr set crKeyRefreshToken = '${crKeyRefreshToken}', dhLastAccess = now() `+
			`where idUser = ${idUser}`
		const result = await this.query(query)
		return result
	}
}
