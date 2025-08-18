import { DiscordBot } from './discord';
import { EnvService } from './env';

export class MCPackTracker {
	_discordBot = new DiscordBot(this);
	_env = new EnvService();

	async start() {
		await this._discordBot.login();
	}
}

const app = new MCPackTracker();
app.start();
