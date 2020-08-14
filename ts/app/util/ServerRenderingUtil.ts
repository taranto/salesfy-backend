import { Env } from "app/structure/Env";
import { I18n } from "salesfy-shared/js/EntryPoint";

export function getEnvelopedHtml(keyEnum: string, joParam?: any, nrLanguage?: string | number): string {
	const bodyMessage = I18n.t(keyEnum, joParam, nrLanguage)
	return `<html>
				<head><link rel="icon" type="image/png"
					href="${Env.getLkS3()}/hatchers-website/website/images/favicon.png">
				<head>
				<body>${bodyMessage}</body>
			</html>`
}
