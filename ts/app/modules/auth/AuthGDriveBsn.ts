import { LayerBusiness } from "app/layers_template/LayerBusiness";
import { Transaction } from "sequelize";
import { CtDriveMimeType } from "salesfy-shared";
import { Env } from "app/structure/Env";

export class AuthGDriveBsn extends LayerBusiness {

	constructor(t: Transaction) {
		super(t);
	}

	public normalizeArJoFileData(arJoFile : any) : any {
		const arJoFileNormalized : any[] = []
		arJoFile.forEach((joFile:any) => {
			const joFileNormalized = this.normalizeJoFileData(joFile)
			arJoFileNormalized.push(joFileNormalized)
		})
		return arJoFileNormalized
	}

	public normalizeJoFileData(joFile:any) : any {
		const joFileNormalized : any = {}
		joFileNormalized.nmContent = joFile.name
		joFileNormalized.piContent = joFile.iconLink
		joFileNormalized.lkContent = joFile.webViewLink
		const ctDriveMimeType = CtDriveMimeType.get(joFile.mimeType)
		const ctContent = ctDriveMimeType.toCtContent()
		joFileNormalized.idCtContent = ctContent.key
		return joFileNormalized
	}
}
