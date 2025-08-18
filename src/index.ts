import { DiscordBot } from './discord';

class MCPackTracker {
	static async start() {
		const discordBot = new DiscordBot();
		await discordBot.login();
	}
}

MCPackTracker.start();
