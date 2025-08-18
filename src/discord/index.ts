import { Client, Collection, GatewayIntentBits } from 'discord.js';
import type { CommandData } from './types';

// TODO: Remove the old imports.
import * as Handlers from './handlers';
import Env from '../env';

export class DiscordBot {
	private _commands = new Collection<string, CommandData>();
	private _client = new Client({
		intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
	});

	// TODO: Maybe remove 'async'?
	async login() {
		// TODO: Change this to a class.
		await Handlers.onReady({
			client: this._client,
			commands: this._commands,
		});
		// TODO: Change this to a class.
		await Handlers.onInteractionCreate({
			client: this._client,
			commands: this._commands,
		});

		await this._client.login(Env.DISCORD_TOKEN);
	}
}
