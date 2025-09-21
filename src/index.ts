import { DiscordBot } from './discord';

//TODO: Refactor this.
const oldLog = console.log;
console.log = function (...args) {
	oldLog(new Date().toISOString(), '|', ...args);
};

export class MCPackTracker {
	static async start() {
		const discordBot = DiscordBot.getInstance();
		await discordBot.login();
	}
}

MCPackTracker.start();
