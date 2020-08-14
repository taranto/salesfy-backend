import { DbConn, should } from "../barrel/Barrel.spec";

export class DbConnSpec {

	public static async test() {
		describe("Connection Tests @basic", () => {
			it("should connect sequelize", (done) => {
				DbConn.sq
					.authenticate()
					.then(() => {
						should().exist("Connection has been established successfully.");
						done();
					})
					.catch(() => {
						should().not.exist("Unable to connect to the database:");
						done();
					});
			});
		});
	}
}
