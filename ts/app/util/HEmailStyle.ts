export class HEmailStyle {

	public static getRawTextRow(dsHtmlText: string): string {
		return `${dsHtmlText}`
	}
	public static getImageStyle(): string {
		return "display:block; margin:0 auto;"
	}

	public static getHelloStyle(): string {
		return "font-size: 16px;"
	}

	public static getButtonStyle(): string {
		return `border-collapse:separate!important;border:2px solid #e0629a;border-radius:50px;width:200px;font-weight:bold;`+
			`line-height:200%;text-align:center;text-decoration:none;color:#e0629a;display:block;margin:0 auto;`
	}

	public static getTableDefaultStyle() : string {
		return `width:100%;`
	}

	public static getTrDefaultStyle() : string {
		return ""
	}

	public static getTdDefaultStyle() : string {
		return "padding-top: 0; padding-right: 18px; padding-bottom: 20px; padding-left: 18px; text-align: left;"
	}

	public static getSpanDefaultStyle() : string {
		return " color: #666666;"
	}

	public static getBodyDefaultStyle() : string {
		return "height:100%;margin:0;padding:0;width:100%;font-family:lato,helvetica neue,helvetica,arial,sans-serif;"+
			"font-size:16px;line-height:150%;word-break:break-word;color:#202020;"+
			"display:block;margin:0 auto;background-color:#FFFFFF;"
	}

	public static getDefaultMediaQueryWidths() : string {
		return "col-1 col-3 col-6 col-9 col-12"
	}

	public static getCssMediaQueryStyle(minWidth=768): string {
		return `
		@media only screen and (min-width: ${minWidth}px) {
			.col-1 {width: 8.33% !important;}
			.col-2 {width: 16.66% !important;}
			.col-3 {width: 25% !important;}
			.col-4 {width: 33.33% !important;}
			.col-5 {width: 41.66% !important;}
			.col-6 {width: 50% !important;}
			.col-7 {width: 58.33% !important;}
			.col-8 {width: 66.66% !important;}
			.col-9 {width: 75% !important;}
			.col-10 {width: 83.33% !important;}
			.col-11 {width: 91.66% !important;}
			.col-12 {width: 100% !important;}
		}`
	}

	public static getImageDefaultWidth() : number {
		return 512
	}
}
