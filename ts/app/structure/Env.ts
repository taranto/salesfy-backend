import { BConst } from "../structure/BConst";
import { EnvStructure } from "../structure/server_comp/EnvStructure";
import { Log } from "./Log";

export class Env extends EnvStructure {

	public static isLoaded = false

	/** it will notify on console for faster devops interruption */
	public static evaluateAll() {
		EnvStructure.isCounting = true
		// Log.console(`Started environment variables presence verification`)
		Env.getEncryptSecret()
		Env.getEncryptionSaltRounds()
		Env.getLogFolder()
		Env.getNodeEnv()
		Env.getLogLevelConsole()
		Env.getLogLevelFile()
		Env.getLogLevelErrorFile()
		Env.getLogLevelStream()
		Env.getLogLevelConsign()
		Env.getLogLevelDatabase()//10
		Env.getLocale()
		Env.getSessionSecret()
		Env.getCookieSessionName()
		Env.getNodeEnvPort()
		Env.getLimiterInstanceTotal()
		Env.getBodyParserType()
		Env.getDbDatabase()
		Env.getDbDialect()
		Env.getDbUsername()
		Env.getDbPassword()//20
		Env.getDbHost()
		Env.getDbPort()
		Env.getLogFileMaxsize()
		Env.getLogMaxFiles()
		Env.getAccessTokenTimeMili()
		Env.getRefreshTokenTimeMili()
		Env.getRedisPort()
		Env.getRedisAddress()
		Env.getEmailNmHost()
		Env.getEmailNmService()//30
		Env.getEmailNmEmailToTest()
		Env.getEmailNmUserFrom()
		Env.getEmailNmEmailFrom()
		Env.getEmailPwEmailFrom()
		Env.getEmailNuPort()
		Env.getEmailShutdownServerOnNoMail()
		Env.getEmailWorkDevEmail()
		Env.getEmailUseErrorEmail()
		Env.getEmailNmEmailToError()
		Env.getEmailVerifyAtStartup()//40
		Env.getUserResetPwTimeWindow()
		Env.getEmailMaxRetries()
		Env.getEmailRetryTimeWindow()
		Env.getEmailMaxMessagesPerConn()
		Env.getEmailMaxConn()
		Env.getEmailRateDelta()
		Env.getEmailRateLimit()
		Env.getEmailMaxTimeoutInMin()
		Env.getEmailMinTimeoutInMin()
		Env.getEmailIncrementalBackoffFactor()//50
		Env.getEmailWorkEmail()
		Env.getLogIsColored()
		Env.getLogMsgCharLimiter()
		Env.getAdminIdUsers()
		Env.getClusterCpusDesired()
		Env.getClusterAcWorkers()
		Env.getTestIdUsers()
		Env.getLkWebsite()
		Env.getLkS3()
		Env.getEmailNmDevLeader()//60
		Env.getEmailEmCurator()
		Env.getLoginLkFbVal()
		Env.getLoginLkFbUserData()
		Env.getLoginArNmClientGmail()
		Env.getLoginArNmClientFB()
		Env.getEmailEmContact()
		Env.getTimezone()
		Env.getBsnArIdHiddenChannels()
		Env.getBsnArIdHiddenTagsInterests()
		Env.getBsnArIdAutoTagsStories() //70
		Env.getEnvQtLimitFetchDefault()
		Env.getLkWebApp()
		Env.getEmailArEmAdmin()
		Env.getCorsExposedHeaders()
		Env.getLimiterPath()
		Env.getLimiterMethod()
		Env.getLimiterLookup()
		Env.getLogShPrintToken()
		Env.getLkAppleStore()
		Env.getLkPlayStore() //80
		Env.getLoginNmClientDrive()
		Env.getLoginKeySecretDrive()
		Env.getEmailEmContactPublic()
		Env.getEmailEmContactInternal()
		Env.getS3NmContentDir()
		Env.getS3NmBucket()
		Env.getS3NmRegion()
		Env.getS3CrAccessKey()
		Env.getS3CrSecretKey()
		Env.getS3NmApiVersion() //90
		Env.getDbPoolMax()
		Env.getDbPoolMin()
		Env.getDbPoolAcquire()
		Env.getDbPoolIdle()
		Env.shSupportLegacy()
		Env.piContentDefault()
		Env.piChannelDefault()
		Env.lkTermsOfUse()
		Env.getRedisIsAvailable()
		Env.getLimiterMsTime() //100
		Env.getSessionStorageHandler()
		Env.getSessionStorageMiExpiration()
		Env.getSessionStorageMiExpirationCheckInterval()
		Env.isLoaded = true
		EnvStructure.isCounting = false
		// Log.console(`Ended environment variables presence verification`)
	}

	public static getSessionStorageMiExpiration(): number {
		return this.verifyVar(process.env.SESSION_STORAGE_MI_EXPIRATION)
	}
	public static getSessionStorageMiExpirationCheckInterval(): number {
		return this.verifyVar(process.env.SESSION_STORAGE_MI_EXPIRATION_CHECK_INTERVAL)
	}
	public static isEnvLoaded(): boolean {
		return Env.isLoaded
	}
	public static getSessionStorageHandler(): string {
		return this.verifyVar(process.env.SESSION_STORAGE_HANDLER)
	}
	public static getLimiterMsTime(): number {
		return this.verifyVar(process.env.LIMITER_MS_TIME)
	}
	public static getRedisIsAvailable(): boolean {
		return this.verifyVar(process.env.REDIS_IS_AVAILABLE)
	}
	public static lkTermsOfUse(): string {
		return this.verifyVar(process.env.LK_TERMS_OF_USE)
	}
	public static piChannelDefault(): string {
		return this.verifyVar(process.env.PI_CHANNEL_DEFAULT)
	}
	public static piContentDefault(): string {
		return this.verifyVar(process.env.PI_CONTENT_DEFAULT)
	}
	public static shSupportLegacy(): boolean {
		return this.verifyVar(process.env.SH_SUPPORT_LEGACY)
	}
	public static getDbPoolMax(): number {
		return this.verifyVar(process.env.DB_POOL_MAX)
	}
	public static getDbPoolMin(): number {
		return this.verifyVar(process.env.DB_POOL_MIN)
	}
	public static getDbPoolAcquire(): number {
		return this.verifyVar(process.env.DB_POOL_ACQUIRE)
	}
	public static getDbPoolIdle(): number {
		return this.verifyVar(process.env.DB_POOL_IDLE)
	}
	public static getS3NmContentDir(): string {
		return this.verifyVar(process.env.S3_NM_CONTENT_DIR)
	}
	public static getS3NmApiVersion(): string {
		return this.verifyVar(process.env.S3_NM_API_VERSION)
	}
	public static getS3NmBucket(): string {
		return this.verifyVar(process.env.S3_NM_BUCKET)
	}
	public static getS3NmRegion(): string {
		return this.verifyVar(process.env.S3_NM_REGION)
	}
	public static getS3CrAccessKey(): string {
		return this.verifyVar(process.env.S3_CR_ACCESS_KEY)
	}
	public static getS3CrSecretKey(): string {
		return this.verifyVar(process.env.S3_CR_SECRET_KEY)
	}
	public static getEmailEmContactPublic(): string {
		return this.verifyVar(process.env.EMAIL_EM_CONTACT_PUBLIC)
	}
	public static getEmailEmContactInternal(): string {
		return this.verifyVar(process.env.EMAIL_EM_CONTACT_INTERNAL)
	}
	public static getLoginNmClientDrive(): string {
		return this.verifyVar(process.env.LOGIN_NM_CLIENT_DRIVE)
	}
	public static getLoginKeySecretDrive(): string {
		return this.verifyVar(process.env.LOGIN_KEY_SECRET_DRIVE)
	}
	public static getLkAppleStore(): string {
		return this.verifyVar(process.env.LK_APPLE_STORE)
	}
	public static getLkPlayStore(): string {
		return this.verifyVar(process.env.LK_PLAY_STORE)
	}
	public static getLogShPrintToken(): string {
		return this.verifyVar(process.env.LOG_SH_PRINT_TOKEN)
	}
	public static getLimiterLookup(): string {
		return this.verifyVar(process.env.LIMITER_LOOKUP)
	}
	public static getLimiterMethod(): string {
		return this.verifyVar(process.env.LIMITER_METHOD)
	}
	public static getLimiterPath(): string {
		return this.verifyVar(process.env.LIMITER_PATH)
	}
	public static getCorsExposedHeaders(): string {
		return this.verifyVar(process.env.CORS_EXPOSED_HEADERS)
	}
	public static getLkWebApp(): string {
		return this.verifyVar(process.env.LK_WEBAPP)
	}
	public static getEnvQtLimitFetchDefault(): number {
		return this.verifyVar(process.env.ENV_QT_LIMIT_FETCH_DEFAULT)
	}
	public static getBsnArIdHiddenTagsInterests(): string {
		return this.verifyVar(process.env.BSN_AR_ID_HIDDEN_TAGS_INTERESTS)
	}
	public static getBsnArIdAutoTagsStories(): string {
		return this.verifyVar(process.env.BSN_AR_ID_AUTO_TAGS_STORIES)
	}
	public static getBsnArIdHiddenChannels(): string {
		return this.verifyVar(process.env.BSN_AR_ID_HIDDEN_CHANNELS)
	}
	public static getTimezone(): string {
		return this.verifyVar(process.env.TZ)
	}
	public static getEmailEmContact(): string {
		return this.verifyVar(process.env.EMAIL_EM_CONTACT)
	}
	public static getLoginArNmClientFB(): string {
		return this.verifyVar(process.env.LOGIN_AR_NM_CLIENT_FB)
	}
	public static getLoginLkFbUserData(): string {
		return this.verifyVar(process.env.LOGIN_LK_FB_USER_DATA)
	}
	public static getLoginArNmClientGmail(): string {
		return this.verifyVar(process.env.LOGIN_AR_NM_CLIENT_GMAIL)
	}
	public static getLoginLkFbVal(): string {
		return this.verifyVar(process.env.LOGIN_LK_FB_VAL)
	}
	public static getEmailEmCurator(): string {
		return this.verifyVar(process.env.EMAIL_EM_CURATOR)
	}
	public static getEmailArEmAdmin(): string {
		return this.verifyVar(process.env.EMAIL_AR_EM_ADMIN)
	}
	public static getEmailNmDevLeader(): string {
		return this.verifyVar(process.env.EMAIL_NM_DEV_LEADER)
	}
	public static getLkS3(): string {
		return this.verifyVar(process.env.LK_S3)
	}
	public static getLkWebsite(): string {
		return this.verifyVar(process.env.LK_WEBSITE)
	}
	public static getTestIdUsers(): string {
		return this.verifyVar(process.env.TEST_ID_USERS)
	}

	public static getClusterCpusDesired(): number {
		return this.verifyVar(process.env.CLUSTER_CPUS_DESIRED)
	}

	public static getClusterAcWorkers(): boolean {
		return this.verifyVar(process.env.CLUSTER_AC_WORKERS)
	}

	public static getAdminIdUsers(): string {
		return this.verifyVar(process.env.ADMIN_ID_USERS)
	}

	public static getLogMsgCharLimiter(): number {
		return this.verifyVar(process.env.LOG_MSG_CHAR_LIMITER)
	}

	public static getLogIsColored(): boolean {
		return this.verifyVar(process.env.LOG_IS_COLORED)
	}

	public static getEmailWorkEmail(): boolean {
		return this.verifyVar(process.env.EMAIL_WORK_EMAIL)
	}

	public static getEmailIncrementalBackoffFactor(): number {
		return this.verifyVar(process.env.EMAIL_INCREMENTAL_BACKOFF_FACTOR)
	}

	public static getEmailMinTimeoutInMin(): number {
		return this.verifyVar(process.env.EMAIL_MIN_TIMEOUT_IN_MIN)
	}

	public static getEmailMaxTimeoutInMin(): number {
		return this.verifyVar(process.env.EMAIL_MAX_TIMEOUT_IN_MIN)
	}

	public static getEmailRateLimit(): number {
		return this.verifyVar(process.env.EMAIL_RATE_LIMIT)
	}

	public static getEmailRateDelta(): number {
		return this.verifyVar(process.env.EMAIL_RATE_DELTA)
	}

	public static getEmailMaxConn(): number {
		return this.verifyVar(process.env.EMAIL_MAX_CONN)
	}

	public static getEmailMaxMessagesPerConn(): number {
		return this.verifyVar(process.env.EMAIL_MAX_MESSAGES_PER_CONN)
	}

	public static getEmailRetryTimeWindow(): number {
		return this.verifyVar(process.env.EMAIL_RETRY_TIME_WINDOW)
	}

	public static getEmailMaxRetries(): number {
		return this.verifyVar(process.env.EMAIL_MAX_RETRIES)
	}

	public static getUserResetPwTimeWindow(): number {
		return this.verifyVar(process.env.USER_RESET_PW_TIME_WINDOW)
	}

	public static getEmailVerifyAtStartup(): boolean {
		return this.verifyVar(process.env.EMAIL_VERIFY_AT_STARTUP)
	}

	public static getEmailNmHost(): string {
		return this.verifyVar(process.env.EMAIL_NM_HOST)
	}

	public static getEmailNmService(): string {
		return this.verifyVar(process.env.EMAIL_NM_SERVICE)
	}

	public static getEmailNmEmailToTest(): string {
		return this.verifyVar(process.env.EMAIL_NM_EMAIL_TO_TEST)
	}

	public static getEmailNmUserFrom(): string {
		return this.verifyVar(process.env.EMAIL_NM_USER_FROM)
	}

	public static getEmailNmEmailFrom(): string {
		return this.verifyVar(process.env.EMAIL_NM_EMAIL_FROM)
	}

	public static getEmailPwEmailFrom(): string {
		return this.verifyVar(process.env.EMAIL_PW_EMAIL_FROM)
	}

	public static getEmailNuPort(): number {
		return this.verifyVar(process.env.EMAIL_NU_PORT)
	}

	public static getEmailShutdownServerOnNoMail(): boolean {
		return this.verifyVar(process.env.EMAIL_SHUTDOWN_SERVER_ON_NO_MAIL)
	}

	public static getEmailWorkDevEmail(): boolean {
		return this.verifyVar(process.env.EMAIL_WORK_DEV_EMAIL)
	}

	public static getEmailUseErrorEmail(): boolean {
		return this.verifyVar(process.env.EMAIL_USE_ERROR_EMAIL)
	}

	public static getEmailNmEmailToError(): string {
		return this.verifyVar(process.env.EMAIL_NM_EMAIL_TO_ERROR)
	}

	public static getRedisAddress(): string {
		return this.verifyVar(process.env.REDIS_ADDRESS)
	}

	public static getRedisPort(): number {
		return this.verifyVar(process.env.REDIS_PORT)
	}

	public static getAccessTokenTimeMili(): number {
		return this.verifyVar(process.env.ACCESS_TOKEN_TIME_MILI)
	}

	public static getRefreshTokenTimeMili(): number {
		return this.verifyVar(process.env.REFRESH_TOKEN_TIME_MILI)
	}

	public static isProdMode(): boolean {
		return this.getNodeEnv() == BConst.NODE_ENV_MODE_PROD
	}

	public static isDevMode(): boolean {
		return this.getNodeEnv() == BConst.NODE_ENV_MODE_DEV
	}

	public static isTestMode(): boolean {
		return this.getNodeEnv() == BConst.NODE_ENV_MODE_TEST
	}

	public static getEncryptSecret(): string {
		return this.verifyVar(process.env.ENCRYPT_SECRET)
	}

	public static getEncryptionSaltRounds(): number {
		return this.verifyVar(process.env.ENCRYPTION_SALT_ROUNDS)
	}

	public static getLogFolder(): string {
		return this.verifyVar(process.env.LOG_FOLDER)
	}

	public static getNodeEnv(): string {
		return this.verifyVar(process.env.NODE_ENV)
	}

	public static getLogLevelConsole(): string {
		return this.verifyVar(process.env.LOG_LEVEL_CONSOLE)
	}

	public static getLogLevelFile(): string {
		return this.verifyVar(process.env.LOG_LEVEL_FILE)
	}

	public static getLogLevelErrorFile(): string {
		return this.verifyVar(process.env.LOG_LEVEL_ERROR_FILE)
	}

	public static getLogLevelStream(): string {
		return this.verifyVar(process.env.LOG_STREAM_LEVEL)
	}

	public static getLogLevelConsign(): string {
		return this.verifyVar(process.env.LOG_LEVEL_CONSIGN)
	}

	public static getLogLevelDatabase(): string {
		return this.verifyVar(process.env.LOG_DATABASE_LEVEL)
	}

	public static getLocale(): string {
		return this.verifyVar(process.env.LOCALE)
	}

	public static getSessionSecret(): string {
		return this.verifyVar(process.env.SESSION_SECRET)
	}

	public static getCookieSessionName(): string {
		return this.verifyVar(process.env.COOKIE_SESSION_NAME)
	}

	public static getNodeEnvPort(): number {
		return this.verifyVar(process.env.NODE_ENV_PORT)
	}

	public static getLimiterInstanceTotal(): number {
		return this.verifyVar(process.env.LIMITER_INSTANCE_TOTAL)
	}

	public static getBodyParserType(): string {
		return this.verifyVar(process.env.BODY_PARSER_TYPE)
	}

	public static getDbDatabase(): string {
		return this.verifyVar(process.env.DB_DATABASE)
	}

	public static getDbDialect(): string {
		return this.verifyVar(process.env.DB_DIALECT)
	}

	public static getDbUsername(): string {
		return this.verifyVar(process.env.DB_USERNAME)
	}

	public static getDbPassword(): string {
		return this.verifyVar(process.env.DB_PASSWORD)
	}

	public static getDbHost(): string {
		return this.verifyVar(process.env.DB_HOST)
	}

	public static getDbPort(): number {
		return this.verifyVar(process.env.DB_PORT)
	}

	public static getLogFileMaxsize(): number {
		return this.verifyVar(process.env.LOG_FILE_MAXSIZE)
	}

	public static getLogMaxFiles(): number {
		return this.verifyVar(process.env.LOG_MAX_FILES)
	}
}
