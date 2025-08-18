import { DiscordBot } from './discord';

export class MCPackTracker {
	_discordBot = new DiscordBot(this);

	async start() {
		await this._discordBot.login();
	}
}

const app = new MCPackTracker();
app.start();
