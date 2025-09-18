import { DiscordBot } from './discord';

export class MCPackTracker {
	static async start() {
		const discordBot = DiscordBot.getInstance();
		await discordBot.login();
	}
}

MCPackTracker.start();
