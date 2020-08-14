import { Log } from './../Log'

export class LogLoader {

	public static load() {
		Log.startWinston();
	}

	public static printSample(){
		Log.printSample();
	}
}
