import {
	ActivityType,
	Client,
	Collection,
	Events,
	GatewayIntentBits,
	type Interaction,
} from 'discord.js';

import { DiscordReadyEvent } from './events/DiscordReadyEvent';
import { DiscordInteractionCreateEvent } from './events/DiscordInteractionCreateEvent';

import { Helpers } from '../util/helpers';

import type { CommandCollection, CommandData } from './types';
import { EnvService } from '../services/EnvService';

export class DiscordBot {
	private static instance: DiscordBot;

	private readonly _token: string;

	public commands: CommandCollection = new Collection<string, CommandData>();
	public readonly _client = new Client({
		intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
	});

	public static getInstance() {
		if (!DiscordBot.instance) DiscordBot.instance = new DiscordBot();
		return DiscordBot.instance;
	}

	private constructor() {
		const env = EnvService.getInstance();
		this._token = env.discordToken;
	}

	login() {
		const listeners = {
			[Events.ClientReady]: () => new DiscordReadyEvent(),
			[Events.InteractionCreate]: (i: Interaction) =>
				new DiscordInteractionCreateEvent(i),
		};

		Object.entries(listeners).forEach(([event, handler]) =>
			this._client.on(event, handler)
		);

		return this._client.login(this._token);
	}

	private _getUniqueUserIds() {
		const guilds = [...this._client.guilds.cache.values()];
		const guildMembers = guilds.map((guild) =>
			[...guild.members.cache.values()].map((member) => member.user.id)
		);
		return new Set(guildMembers.flat()).size;
	}

	startPresenceLoop() {
		// TODO: Add more options to this.
		const snippets = [
			'Watching feed-the-beast.com/modpacks',
			'CurseForgeAPI soonTM',
		];

		const userCount = this._getUniqueUserIds();
		snippets.push(`Serving ${userCount} users!`);

		const run = () => {
			const snippet =
				snippets[Math.floor(Math.random() * snippets.length)];

			this._client.user!.setActivity(snippet, {
				type: ActivityType.Custom,
			});

			const interval = 1000 * 30; // 30 seconds
			Helpers.wait(interval).then(run);
		};
		run();
	}
}
