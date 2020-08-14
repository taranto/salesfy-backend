import * as AWS from 'aws-sdk';
import { Env } from 'app/structure/Env';

export class AWSConfigLoader {

	public static load() {
		AWS.config.update({
			secretAccessKey: Env.getS3CrSecretKey(),
			accessKeyId: Env.getS3CrAccessKey(),
			region: Env.getS3NmRegion()
		})
	}
}
