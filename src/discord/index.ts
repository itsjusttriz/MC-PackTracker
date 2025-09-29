import {
	ActivityType,
	Client,
	Collection,
	EmbedBuilder,
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

	static getInstance() {
		if (!DiscordBot.instance) DiscordBot.instance = new DiscordBot();
		return DiscordBot.instance;
	}

	commands: CommandCollection = new Collection<string, CommandData>();
	readonly OWNER_ID = '228167686293553164';
	readonly _client = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.GuildMembers,
		],
	});

	private readonly _token: string;

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

	private async _getUniqueUserIds() {
		const guilds = await this._client.guilds.fetch();

		const uniqueUserIds = new Set();

		for (const [, guild] of guilds) {
			try {
				const fullGuild = await guild.fetch();
				const members = await fullGuild.members.fetch();

				members.forEach((member: any) => {
					uniqueUserIds.add(member.user.id);
				});
			} catch (error) {
				console.error(
					`Failed to fetch members for guild "${guild.name}:"`,
					error
				);
			}
		}

		return uniqueUserIds.size;
	}

	startPresenceLoop() {
		// TODO: Add more options to this.
		const snippets = [
			'Watching feed-the-beast.com',
			'Watching curseforge.com',
		];

		this._getUniqueUserIds().then((userCount) => {
			snippets.push(`Serving ${userCount} users!`);
		});

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

	async dmOwner(message: string) {
		const MAX_CHAR = 4096;
		const text =
			message.length >= MAX_CHAR
				? message.slice(0, MAX_CHAR - 3) + '...'
				: message;

		const embed = new EmbedBuilder()
			.setTitle('Uh oh!')
			.setDescription(text)
			.setColor('Red');

		const msgSent = await this._client.users.send(this.OWNER_ID, {
			embeds: [embed],
		});
		console.log('DM sent to Triz ->', msgSent.id);
	}
}
