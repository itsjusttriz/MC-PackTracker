import * as Discord from './discord';

class MCPackTracker {
	static async start() {
		await Discord.Client.login();
	}
}

MCPackTracker.start();
