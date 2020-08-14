import { StringUtil } from "salesfy-shared";
import { EnvTest } from "./EnvTest.spec";

export class TestHnValueGen {

	public static generate(nmField: string): any {
		if (nmField == "isActive") {
			return true
		}
		if (nmField.startsWith("idCt")) {
			return 1
		}
		if (StringUtil.startsWithAny(nmField, ["nm", "ds", "key"])) {
			return TestHnValueGen.genString()
		}
		if (StringUtil.startsWithAny(nmField, ["cr"])) {
			return TestHnValueGen.genCrypted()
		}
		if (StringUtil.startsWithAny(nmField, ["sn"])) {
			return TestHnValueGen.genNumberFormatted()
		}
		if (StringUtil.startsWithAny(nmField, ["is", "has", "sh", "ac", "re", "us"])) {
			return TestHnValueGen.genBoolean()
		}
		if (StringUtil.startsWithAny(nmField, ["nr", "qt", "vl", "pc", "cd"])) {
			return TestHnValueGen.genNumber()
		}
		if (StringUtil.startsWithAny(nmField, ["hr", "dh", "dt"])) {
			return TestHnValueGen.genDate()
		}
		if (nmField.startsWith("em")) {
			return TestHnValueGen.genEmail()
		}
		if (nmField.startsWith("pi")) {
			return TestHnValueGen.genPicture()
		}
		if (nmField.startsWith("lk")) {
			return TestHnValueGen.genLink()
		}
		return undefined
	}

	public static genNumberFormatted(): string {
		const aNumberFormatted =
			TestHnValueGen.genNumber() + "," +
			TestHnValueGen.genNumber() + "," +
			TestHnValueGen.genNumber()
		return aNumberFormatted
	}

	public static genString(): string {
		const aString = StringUtil.random()
		return aString
	}

	public static genCrypted(): string {
		const aCrypted = "$" + TestHnValueGen.genString()
		return aCrypted
	}

	public static genBoolean(): boolean {
		const aBoolean = Math.random() <= 0.5
		return aBoolean
	}

	public static genNumber(): number {
		const aNumber = Math.floor(Math.random() * 11)
		return aNumber
	}

	public static genDate(): Date {
		const nrNowTimestamp = Date.now()
		const aDate = new Date(nrNowTimestamp)
		return aDate
	}

	public static genEmail(): string {
		const aPicture = StringUtil.random() + EnvTest.getDsEmHostDefault()
		return aPicture
	}

	public static genPicture(): string {
		const aPicture = StringUtil.random() + ".png"
		return aPicture
	}

	public static genLink(): string {
		const aLink = "https://www.google.com/search?q=" + StringUtil.random()
		return aLink
	}
}
