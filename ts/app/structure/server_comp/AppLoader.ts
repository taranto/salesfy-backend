import * as bodyParser from "body-parser";
import * as express from "express";
import * as cookieParser from 'cookie-parser'
import * as passport from 'passport' //TODO remover passport
import * as expressSession from "express-session";
import * as cors from "cors"
import { IUser, SConst } from "salesfy-shared"
import { Env } from "../Env";
import { Application, Request, Response } from "express";
import { Log } from "app/structure/Log";
import { Sys } from "app/structure/Sys";
import { LocalStorage } from "app/structure/LocalStorage";
import { AuthTokenBsn } from "app/modules/auth/AuthTokenBsn";
import { AuthEmailBsn } from "app/modules/auth/AuthEmailBsn";
// import * as csurf from 'csurf'
const helmet = require('helmet');
const consign = require("consign");
const compression = require('compression')
const limiterThroughRedis = require('express-limiter')
import * as limiterMemCached from 'express-rate-limit';
import { DbConn } from "../DbConn";
import { LocalStorageRedis } from "../LocalStorageRedis";
const connectRedis = require('connect-redis')
const SequelizeStore = require('connect-session-sequelize')(expressSession.Store);
// const sqlinjection = require('sql-injection');

export class AppLoader {

	public static load(): Application {
		return express();
	}

	public static loadConfig(app: Application, onStarted: any) {
		AppLoader.appUsages(app)
		AppLoader.configConsign(app)
		AppLoader.configLimiter(app)
		AppLoader.configPort(app, onStarted)
	}

	private static configPort(app: express.Application, onStarted: any) {
		if (Sys.isClusterWorker()) {
			const port = Env.getNodeEnvPort()
			app.listen(port, () => {
				Log.console(`Port ${port} is being listened`);
				if (Sys.isClusterMainWorker()) {
					onStarted()
				}
			})
		}
	}

	private static configLimiter(app: express.Application) {
		if (!Env.getRedisIsAvailable()) {
			AppLoader.memoryCachedLimiter(app);
		} else {
			AppLoader.redisCachedLimiter(app);
		}
	}

	private static redisCachedLimiter(app: express.Application) {
		const limiterInstance = limiterThroughRedis(app, LocalStorageRedis.instance);
		limiterInstance({
			path: Env.getLimiterPath(),
			method: Env.getLimiterMethod(),
			lookup: Env.getLimiterLookup().split(','),
			total: Env.getLimiterInstanceTotal(),
			expire: Env.getLimiterMsTime(),
			// whitelist: (req: any) => {
			// 	return false
			// },
			onRateLimited: AppLoader.onLimiterLimitReached,
			log: true
		});
	}

	private static memoryCachedLimiter(app: express.Application) {
		const limiter = limiterMemCached({
			windowMs: Env.getLimiterMsTime(),
			max: Env.getLimiterInstanceTotal(), // limit each IP to xxx requests per windowMs
			onLimitReached: AppLoader.onLimiterLimitReached
		});
		app.use(limiter);
	}

	private static onLimiterLimitReached = (req: Request, res: Response) => {
		Log.warn(AppLoader.onRateLimitedText(req).join(""));
		AuthEmailBsn.sendAdminLimiterProblemEmail(AppLoader.onRateLimitedText(req).join("<br/>"));
	}

	private static configConsign(app: express.Application) {
		consign({
			locale: Env.getLocale(),
			logger: Log,
			loggingType: Env.getLogLevelConsign(),
		})
			.into(app);
	}

	private static appUsages(app: express.Application) {
		let joExpressSession = AppLoader.expressSessionStorageHandler();

		app
			.use(bodyParser.urlencoded({ extended: true }))
			.use(bodyParser.json({ type: Env.getBodyParserType() }))
			.use(compression())
			.use(helmet())
			.use(cookieParser(Env.getSessionSecret())) //should be the same secret as expressSession
			.use(expressSession(joExpressSession))
			.use(cors({
				exposedHeaders: Env.getCorsExposedHeaders().split(',')
			}))
		// .use(sqlinjection)
		// .use(csurf({ cookie: true }))
	}

	private static expressSessionStorageHandler(): expressSession.SessionOptions {
		// Warning: connect.session() MemoryStore is not
		// designed for a production environment, as it will leak
		// memory, and will not scale past a single process.
		let joExpressSession: expressSession.SessionOptions = {
			secret: Env.getSessionSecret(),
			resave: false,
			saveUninitialized: true,
			name: Env.getCookieSessionName(),
		}

		if (Env.getRedisIsAvailable() && Env.getSessionStorageHandler() == 'redis') {
			const redisOptions = {
				client: LocalStorageRedis.instance,
				no_ready_check: true,
				ttl: 600,
				logErrors: true
			}
			const redisStore = connectRedis(expressSession)
			const theRedisStore = new redisStore(redisOptions)
			joExpressSession.store = theRedisStore
			return joExpressSession
		}

		if (Env.getSessionStorageHandler() == 'sequelize') {
			const sequelize = DbConn.sq;
			const sequelizeStore = new SequelizeStore({
				db: sequelize,
				checkExpirationInterval: Env.getSessionStorageMiExpirationCheckInterval(), // The interval at which to cleanup expired sessions in milliseconds.
				expiration: Env.getSessionStorageMiExpiration() // The maximum age (in milliseconds) of a valid session.
			})
			sequelizeStore.sync()
			joExpressSession.store = sequelizeStore
		}

		return joExpressSession;
	}

	public static onRateLimitedText(req: Request): string[] {
		let textArray = [
			`[req.cookies: ${JSON.stringify(req.cookies)}]`,
			`[req.ip: ${req.ip}]`,
			`[req.hostname: ${req.hostname}]`,
			`[req.baseUrl: ${req.baseUrl}]`,
			`[req.headers: ${JSON.stringify(req.headers)}]`,
			`[req.headers.x-access-token.idUser: ${AuthTokenBsn.getIdUserFromRequest(req)}]`,
			`[req.httpVersion: ${req.httpVersion}]`,
			`[req.method: ${req.method}]`,
			`[req.path: ${req.path}]`,
			`[req.params: ${JSON.stringify(req.params)}]`,
			`[req.protocol: ${req.protocol}]`,
			// `req.rawHeaders ${req.rawHeaders}]`,
			`[req.rawTrailers: ${req.rawTrailers}]`,
			// `req.route ${JSON.stringify(req.route)}]`,
			`[req.secure: ${req.secure}]`,
			`[req.url: ${req.url}]`,
			`[req.sessionID: ${req.sessionID}]`,
			`[req.signedCookies: ${JSON.stringify(req.signedCookies)}]`,
			`[req.stale: ${req.stale}]`,
			`[req.statusCode: ${req.statusCode}]`,
			`[req.statusMessage: ${req.statusMessage}]`,
			`[req.subdomains: ${req.subdomains}]`,
			`[req.trailers: ${JSON.stringify(req.trailers)}]`,
		]
		if (req.session != null) {
			textArray = [
				`[req.session.id ${req.session.id}]`,
				...textArray
			]
		}

		return [
			`[User ${AuthTokenBsn.getIdUserFromRequest(req)}]`,
			`[Exception: Exceeding the request rate limit]`,
			...textArray
		]
	}
}
