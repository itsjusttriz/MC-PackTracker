import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';

import { DiscordReadyEvent } from './events/onReady';
import { DiscordInteractionCreateEvent } from './events/onInteractionCreate';

import type { MCPackTracker } from '..';
import type { CommandCollection, CommandData } from './types';

export class DiscordBot {
	private readonly _token: string;
	private readonly _client = new Client({
		intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
	});
	private _commands: CommandCollection = new Collection<
		string,
		CommandData
	>();

	constructor(private _app: MCPackTracker) {
		this._token = _app._env.discordToken;
	}

	login() {
		this._client.on(
			Events.ClientReady,
			(c) => new DiscordReadyEvent(c, this._commands)
		);

		this._client.on(
			Events.InteractionCreate,
			(i) => new DiscordInteractionCreateEvent(this._commands, i)
		);

		return this._client.login(this._token);
	}
}
