import { THttpMethod, SConst } from "salesfy-shared";

export class TestShould {

	/**
	 * State in the test name what is being tested (unit under test), 
	 * under what circumstances and 
	 * what is the expected result
	 */
	public static dsText(joParam: {
		dsText?: string, nmClass?: string, nmLayer?: string, nmBehavior?: string,
		arNmTag?: string[], nmRoute?: string, nmMethod?: string|THttpMethod|SConst, dsPreparation?:string,
		dsWhatsBeingTested?:string, dsCircumstances?:string, dsExpected?:string
	}): string {
		let dsTextComplete = ""
		dsTextComplete += this.dsTextFormatter("Test", joParam.dsText)
		dsTextComplete += this.dsTextFormatter("Behavior", joParam.nmBehavior)
		dsTextComplete += this.dsTextFormatter("Route", joParam.nmRoute)
		dsTextComplete += this.dsTextFormatter("Layer", joParam.nmLayer)
		dsTextComplete += this.dsTextFormatter("Class", joParam.nmClass)
		dsTextComplete += this.dsTextFormatter("Method", joParam.nmMethod!=undefined?joParam.nmMethod+"":undefined)
		dsTextComplete += this.dsTextFormatter("Preparation", joParam.dsPreparation, false)
		dsTextComplete += this.dsTextFormatter("WhatsBeingTested", joParam.dsWhatsBeingTested, false)
		dsTextComplete += this.dsTextFormatter("Circumstances", joParam.dsCircumstances, false)
		dsTextComplete += this.dsTextFormatter("Expected", joParam.dsExpected, false)
		dsTextComplete += (joParam.arNmTag && joParam.arNmTag.length > 0 ? "[Tags " + joParam.arNmTag.join(" @") + "]" : "")
		return dsTextComplete
	}

	private static dsTextFormatter(nmIdentifyer: string, dsText?: string, hasAtSign=true) {
		return dsText ? `[${nmIdentifyer} ${hasAtSign?"@":""}${dsText}]` : ""
	}
	/** @deprecated */ //TODO eliminar 
	public static mainDescribeTitle(className: string, layerName: string, ...tags: string[]) {
		return this.dsText({nmClass: className, nmLayer:layerName, arNmTag:tags})
	}
	/** @deprecated */ //TODO eliminar 
	public static describeTitle2(route: string, ...tags: string[]) {
		return this.dsText({nmRoute: route, arNmTag:tags})
	}
	/** @deprecated */ //TODO eliminar 
	public static descRouteMethod(nmRoute: string, nmMethod: string, ...greps: string[]): string {
		return this.dsText({nmMethod : nmMethod, nmRoute: nmRoute, arNmTag:greps})
	}
	/** @deprecated */ //TODO eliminar 
	public static describeTitle(route: string, ...greps: string[]) {
		return this.dsText({dsText : route, arNmTag:greps})
	}

	public static IT_SHOULD = "It should @generic "

	public static startTest() {
		return `Prepare to start`
	}

	public static exist() {
		return `${this.IT_SHOULD}@exist`
	}

	public static failMissingAllParams() {
		return `${this.IT_SHOULD}@fail @missing @missingAllParams`
	}

	public static failMissingAParam(nmKey: string) {
		return `${this.IT_SHOULD}@fail @missing @missingAParam (@${nmKey})`
	}

	public static acceptBothTokens() {
		return `${this.IT_SHOULD}@accept @both @token`
	}

	public static acceptAccessTokenOnly() {
		return `${this.IT_SHOULD}@accept @access @token @only`
	}

	public static failRefreshTokenOnly() {
		return `${this.IT_SHOULD}@fail @refresh @token @only`
	}

	public static failWrongTokens() {
		return `${this.IT_SHOULD}@fail @wrong @token`
	}

	public static failNoTokens() {
		return `${this.IT_SHOULD}@fail @missing @token`
	}

	public static execute(n?: number) {
		return `${this.IT_SHOULD}@execute${n != undefined ? ` ${n}` : ``}`
	}
}
