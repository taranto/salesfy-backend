import { Env } from "../Env";
import { StringUtil } from "salesfy-shared";
import { DaoUtil } from "app/util/DaoUtil";

export class LogComp {

	private _joConfig : any

	constructor(isConsole : boolean, ctLevel : string, nmFile? : string) {
		this.joConfig = {}
		this.joConfig.name = nmFile,
		this.joConfig.level = ctLevel,
		this.joConfig.handleExceptions = true,
		this.joConfig.json = false,
		this.joConfig.colorize = Env.isLoaded && Env.getLogIsColored(),
		this.joConfig.prettyPrint = true,
		this.joConfig.timestamp = () => DaoUtil.sqlDateformat(new Date(), "DateMili")

		if (!isConsole) {
			this.joConfig.filename = nmFile
			this.joConfig.maxsize = Env.getLogFileMaxsize()
			// this.joConfig.maxFiles = Env.getLogMaxFiles()
		}
	}
	public set joConfig(joConfig : any) {
		this._joConfig = joConfig
	}
	public get joConfig()  : any {
		return this._joConfig;
	}
	public set level(level : string) {
		this.joConfig.level = level;
	}
	public set filename(filename : string | undefined) {
		this.joConfig.filename = filename;
	}
	public set handleExceptions(handleExceptions : boolean) {
		this.joConfig.handleExceptions = handleExceptions;
	}
	public set json(json : boolean) {
		this.joConfig.json = json;
	}
	public set maxsize(maxsize : number) {
		this.joConfig.maxsize = maxsize;
	}
	public set maxFiles(maxFiles : number) {
		this.joConfig.maxFiles = maxFiles;
	}
	public set colorize(colorize : boolean) {
		this.joConfig.colorize = colorize;
	}
	public set timestamp(timestamp : number) {
		this.joConfig.timestamp = timestamp;
	}
	public set prettyPrint(prettyPrint : boolean) {
		this.joConfig.prettyPrint = prettyPrint;
	}
}
