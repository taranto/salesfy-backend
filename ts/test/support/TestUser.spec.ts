import { ILoggedUser, IAuth } from "salesfy-shared";

export class TestUser {

	public loggedUser: ILoggedUser
	public user: IAuth
	public userAccessToken: string
	public userRefreshToken: string
	public i: number | "g" | "f" | "a"

	constructor(loggedUser: ILoggedUser) {
		this.loggedUser = loggedUser;
		this.user = loggedUser.user;
		this.userAccessToken = loggedUser.tokens.accessToken;
		this.userRefreshToken = loggedUser.tokens.refreshToken;
	}

	public setAccessToken(dsAccessToken: string) {
		this.loggedUser.tokens.accessToken = dsAccessToken
		this.userAccessToken = dsAccessToken
	}

	public setRefreshToken(dsRefreshToken: string) {
		this.loggedUser.tokens.refreshToken = dsRefreshToken
		this.userRefreshToken = dsRefreshToken
	}
}
