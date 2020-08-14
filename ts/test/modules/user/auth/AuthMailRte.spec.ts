import { RoutesEnum, SConst, KeyEnum, StringUtil, CtHttpStatus, CtExcep } from "salesfy-shared";
import { TestCaseItem, TestUserManager, TestUtil, TestShould } from "../../../barrel/Barrel.spec";
import { AuthBsn } from "../../../../app/modules/auth/AuthBsn";
import { LayerDao } from "app/layers_template/LayerDao";
import { AuthEmailBsn } from "app/modules/auth/AuthEmailBsn";
import { ConnDao } from "app/structure/ConnDao";
import { DaoUtil } from "app/util/DaoUtil";
import { EnvTest } from "../../../support/EnvTest.spec";

export class AuthMailRteSpec {

	public static test() {
		describe(TestShould.describeTitle(RoutesEnum.userPasswordRecovery), () => {
			AuthMailRteSpec.testPasswordRecovery()
		})
		describe(TestShould.describeTitle(RoutesEnum.userGeneratePassword), () => {
			AuthMailRteSpec.testGeneratePassword()
		})
		describe(TestShould.describeTitle(RoutesEnum.userEmailConfirmation), () => {
			AuthMailRteSpec.testEmailConfirmation()
		})
	}

	private static testPasswordRecovery() {
		const r = RoutesEnum.userPasswordRecovery
		const m = SConst.HTTP_METHOD_GET

		it(TestShould.exist(), (done) => {
			TestCaseItem.callEvalExistence(done, r, m)
		})

		it(TestShould.failMissingAllParams(), (done) => {
			TestCaseItem.callEvalFailMissingAllParams(done, r, m)
		})

		const keys = ["emUser"]
		keys.forEach(key => {
			it(TestShould.failMissingAParam(key), (done) => {
				const loggedUser = TestUserManager.getUser().loggedUser
				const joParamEmUser = { emUser: loggedUser.user.emUser }
				TestCaseItem.callEvalFailMissingAParam(done, r, m, undefined, joParamEmUser, key)
			})
		})

		before("Wipe reset password keys previously generated", (done) => {
			const loggedUser = TestUserManager.getUser().loggedUser
			const query = `update usr set crKeyResetPassword = null, dhKeyResetPasswordExpiration = null`+
				` where idUser = ${loggedUser.user.idUser}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					done()
				})
		})

		before("Generate a reset password key to be sent to email (using email)", (done) => {
			const loggedUser = TestUserManager.getUser().loggedUser
			const joParamEmUser = { emUser: loggedUser.user.emUser }
			TestUtil.customCall(done, r, m, undefined, joParamEmUser)
		})

		before("Get the reset password key generated", (done) => {
			const loggedUser = TestUserManager.getUser().loggedUser
			const query = `select
				crKeyResetPassword as \"crKeyResetPassword\", dhKeyResetPasswordExpiration as \"dhKeyResetPasswordExpiration\"
				from usr where idUser = ${loggedUser.user.idUser}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					done()
				})
		})

		it("It should verify the reset password key generated", (done) => {
			const loggedUser = TestUserManager.getUser().loggedUser
			const query = `select
				crKeyResetPassword as \"crKeyResetPassword\", dhKeyResetPasswordExpiration as \"dhKeyResetPasswordExpiration\"
				from usr where idUser = ${loggedUser.user.idUser}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					if (!result[0][0].crKeyResetPassword) {
						throw Error("Reset password key not generated")
					}
					done()
				})
		})

		it("It should show success message (using email)", (done) => {
			const loggedUser = TestUserManager.getUser().loggedUser
			const joParamEmUser = { emUser: loggedUser.user.emUser }
			TestUtil.call(r, m, undefined, joParamEmUser)
				.expect(200)
				.expect(SConst.STATUS_MESSAGE, KeyEnum.anEmailWasSentToAndRecover)
				.expect(SConst.EXTRA_CONTENT, JSON.stringify({ emUser: loggedUser.user.emUser }))
				.end(TestUtil.end(done))
		})

		it("It should @fail find the email", (done) => {
			const loggedUser = TestUserManager.getUser().loggedUser
			const emUserGeneratedFake = "aasdgfgrgeg" + loggedUser.user.emUser
			const joParamEmUserFake = { emUser: emUserGeneratedFake }
			TestUtil.call(r, m, undefined, joParamEmUserFake)
				.expect(400)
				.expect(SConst.STATUS_MESSAGE, CtExcep.nmKeyNotFound.nmMsg )
				.expect(SConst.EXTRA_CONTENT, JSON.stringify({ nmKey: KeyEnum.email }))
				.end(TestUtil.end(done))
		})
	}

	private static testGeneratePassword() {
		const r = RoutesEnum.userGeneratePassword
		const m = SConst.HTTP_METHOD_GET

		let joRecSettings: any
		let crKeyPasswordOld: string
		let unKeyPasswordOldFake: string

		it(TestShould.exist(), (done) => {
			TestCaseItem.callEvalExistence(done, r, m)
		})

		it(TestShould.failMissingAllParams(), (done) => {
			TestCaseItem.callEvalFailMissingAllParams(done, r, m, undefined)
		})

		const keys = ["unKeyResetPassword", "emUser"]
		keys.forEach(key => {
			it(TestShould.failMissingAParam(key), (done) => {
				const loggedUser = TestUserManager.getUser().loggedUser
				const joParam = {
					emUser: loggedUser.user.emUser,
					unKeyResetPassword: "unKeyResetPassword"
				}
				TestCaseItem.callEvalFailMissingAParam(done, r, m, undefined, joParam, key)
			})
		})

		before("It should generate a fake joRecSettings", (done) => {
			const loggedUser = TestUserManager.getUser().loggedUser
			AuthEmailBsn.genPasswordRecoverySettings(loggedUser.user)
				.then((joRecSettings1) => {
					joRecSettings = joRecSettings1
					done()
				})
		})

		before("It should register a crKeyResetPassword and dhKeyResetPasswordExpiration", (done) => {
			const loggedUser = TestUserManager.getUser().loggedUser
			const dtFormatted = DaoUtil.sqlFormat(joRecSettings.dhKeyResetPasswordExpiration)
			const query = `update usr set crKeyResetPassword = '${joRecSettings.crKeyResetPassword}',
				dhKeyResetPasswordExpiration = ${dtFormatted}
				where idUser = ${loggedUser.user.idUser}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					done()
				})
		})

		before("It should generate a fake password to work as 'old password'", (done) => {
			const loggedUser = TestUserManager.getUser().loggedUser
			unKeyPasswordOldFake = EnvTest.getUnPwDefault()
			AuthBsn.encrypt(unKeyPasswordOldFake)
				.then((dsPasswordOldEncrypted) => {
					crKeyPasswordOld = dsPasswordOldEncrypted
					done()
				})
		})

		before("It should register the old password encrypted", (done) => {
			const loggedUser = TestUserManager.getUser().loggedUser
			const query = `update usr set crKeyPassword = '${crKeyPasswordOld}' where idUser = ${loggedUser.user.idUser}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					done()
				})
		})

		it("It should execute once and generate the new password", (done) => {
			const joParam = {
				unKeyResetPassword: joRecSettings.unKeyResetPassword,
				emUser:joRecSettings.emUser
			}
			TestUtil.call(r, m, undefined, joParam)
				.expect(CtHttpStatus.status200.keyCtHttpStatus)
				.end(TestUtil.end(done))
		})

		it("It should verify the password change (old password must be different from the new one)", (done) => {
			const loggedUser = TestUserManager.getUser().loggedUser
			const query = `select crKeyPassword \"crKeyPassword\" from usr where idUser = ${loggedUser.user.idUser}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					if (AuthBsn.isEncryptionMatch(crKeyPasswordOld, result[0][0].crKeyPassword)) {
						done(`The password was not changed`)
					} else {
						done()
					}
				})
		})

		it("It should verify the email confirmation. It must be confirmed anyways after email recovery", (done) => {
			const loggedUser = TestUserManager.getUser().loggedUser
			const query = `select isEmailConfirmed \"isEmailConfirmed\" from usr where idUser = ${loggedUser.user.idUser}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					if (result[0][0].isEmailConfirmed) {
						done()
					} else {
						done(`The email should have been considered confirmed after password generation`)
					}
				})
		})

		after("Restabilish the default password", (done) => {
			const loggedUser = TestUserManager.getUser().loggedUser
			TestUserManager.setUserPassword(loggedUser.user.emUser, unKeyPasswordOldFake, true)
				.then(() => done())
		})
	}

	private static testEmailConfirmation() {
		const r = RoutesEnum.userEmailConfirmation
		const m = SConst.HTTP_METHOD_GET

		const unKeyEmailConfirmation = "theConfirmationKey"
		let crKeyEmailConfirmationEncrypted: string

		it(TestShould.exist(), (done) => {
			TestCaseItem.callEvalExistence(done, r, m)
		})

		it(TestShould.failMissingAllParams(), (done) => {
			TestCaseItem.callEvalFailMissingAllParams(done, r, m)
		})

		const keys = ["emUser", "unKeyEmailConfirmation"]
		keys.forEach(key => {
			it(TestShould.failMissingAParam(key), (done) => {
				const loggedUser = TestUserManager.getUser().loggedUser
				const joParamEmUser = {
					emUser: loggedUser.user.emUser,
					unKeyEmailConfirmation: unKeyEmailConfirmation
				}
				TestCaseItem.callEvalFailMissingAParam(done, r, m, undefined, joParamEmUser, key)
			})
		})

		before("It should generate a forced confirmation code", (done) => {
			AuthBsn.encrypt(unKeyEmailConfirmation)
				.then((crEmailConfirmationParam) => {
					crKeyEmailConfirmationEncrypted = crEmailConfirmationParam
					done()
				})
		})

		before("It should manually set a confirmation code and email not confirmed to the database", (done) => {
			const loggedUser = TestUserManager.getUser().loggedUser
			const query = `update usr set crKeyEmailConfirmation = '${crKeyEmailConfirmationEncrypted}', isEmailConfirmed = false
				 where idUser = ${loggedUser.user.idUser}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					done()
				})
		})

		it("It should confirm email and return the right message", (done) => {
			const loggedUser = TestUserManager.getUser().loggedUser
			const joParam = {
				emUser: loggedUser.user.emUser,
				unKeyEmailConfirmation: unKeyEmailConfirmation
			}
			TestUtil.call(r, m, undefined, joParam)
				.expect(CtHttpStatus.status200.keyCtHttpStatus)
				.end(TestUtil.end(done))
		})

		//TODO fazer um teste para cada email confirmation

		it("It should verify the registration of email confirmation = true in database", (done) => {
			const loggedUser = TestUserManager.getUser().loggedUser
			const query = `select isEmailConfirmed from usr where idUser = ${loggedUser.user.idUser}`
			ConnDao.staticQueryPromise(query)
				.then((result) => {
					if (!result[0][0].isemailconfirmed) {
						done("The email was expected to be confirmed in user's registration")
					} else {
						done()
					}
				})
		})

	}
}
