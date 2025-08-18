import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';

import { DiscordReadyEvent } from './events/onReady';
import { DiscordInteractionCreateEvent } from './events/onInteractionCreate';

import type { MCPackTracker } from '..';
import type { CommandCollection, CommandData } from './types';

// TODO: Remove the old imports.
import Env from '../env';

export class DiscordBot {
	private _commands: CommandCollection = new Collection<
		string,
		CommandData
	>();

	private _client = new Client({
		intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
	});

	constructor(private _app: MCPackTracker) {}

	// TODO: Maybe remove 'async'?
	async login() {
		this._client.on(
			Events.ClientReady,
			(c) => new DiscordReadyEvent(c, this._commands)
		);

		this._client.on(
			Events.InteractionCreate,
			(i) => new DiscordInteractionCreateEvent(this._commands, i)
		);

		await this._client.login(Env.DISCORD_TOKEN);
	}
}
