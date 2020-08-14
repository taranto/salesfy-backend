import { Log } from "../Log";
import { HError } from "../../util/status/HError";
import { CtError } from "salesfy-shared";
import { isNumber } from "util";

interface IEnvVarTypes { envVar: string | number | boolean }

export class EnvStructure {

	private static count = 0
	protected static isCounting = false

	protected static verifyVar(envVar: IEnvVarTypes | any): IEnvVarTypes | any {
		EnvStructure.toCountIncrement();
		let obVerifiedEnvVar
		if (envVar != "" && envVar == undefined) {
			EnvStructure.throwMissingEnvVar()
		}
		if (envVar == "true") {
			obVerifiedEnvVar = true
		}
		if (envVar == "false") {
			obVerifiedEnvVar = false
		}
		if (!isNaN(envVar)) {
			obVerifiedEnvVar = +envVar
		}
		if (obVerifiedEnvVar == undefined && typeof envVar == "string") {
			obVerifiedEnvVar = envVar + ""
		}
		if (obVerifiedEnvVar != "" && !obVerifiedEnvVar) {
			EnvStructure.throwWrongTypeEnvVar()
		}
		return obVerifiedEnvVar
	}

	private static throwWrongTypeEnvVar() {
		const dsMissingVarText = EnvStructure.getDsWrongTypeVarText();
		throw new HError({ ctStatus: CtError.envVarProblem, dsConsole: dsMissingVarText })
	}

	private static throwMissingEnvVar() {
		const dsMissingVarText = EnvStructure.getDsMissingVarIndexText();
		throw new HError({ ctStatus: CtError.envVarProblem, dsConsole: dsMissingVarText })
	}

	private static toCountIncrement() {
		if (EnvStructure.isCounting) {
			EnvStructure.count++;
		}
	}
	
	private static getDsWrongTypeVarText(): string {
		let dsMissingVarIndexText = "";
		if (EnvStructure.isCounting) {
			dsMissingVarIndexText = "There's a wrong type of env var. The env var index is: " + EnvStructure.count;
		}
		return dsMissingVarIndexText;
	}

	private static getDsMissingVarIndexText(): string {
		let dsMissingVarIndexText = "";
		if (EnvStructure.isCounting) {
			dsMissingVarIndexText = "There's a missing env var. The env var index is: " + EnvStructure.count;
		}
		return dsMissingVarIndexText;
	}

	public static getEnvModePath(): string | undefined {
		if (process.env.NODE_ENV_PATH) {
			return process.env.NODE_ENV_PATH;
		}
		throw new HError({ ctStatus: CtError.envVarProblem, dsConsole: "You must define a NODE_ENV_PATH on startup" })
	}
}
