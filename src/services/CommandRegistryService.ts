import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

import { REST, Routes } from 'discord.js';

import { DiscordBot } from '../discord';
import { EnvService } from '../services/EnvService';

export class CommandRegistryService {
	private static instance: CommandRegistryService;

	public static getInstance() {
		if (!CommandRegistryService.instance)
			CommandRegistryService.instance = new CommandRegistryService();
		return CommandRegistryService.instance;
	}

	private rest = new REST();
	private readonly DIRECTORY_PATH = join(__dirname, '../discord/commands');
	private readonly APP_ID: string;

	constructor() {
		const env = EnvService.getInstance();
		this.APP_ID = env.discordAppId;
		this.rest.setToken(env.discordToken);
	}

	async sync() {
		const discordBot = DiscordBot.getInstance();
		const commandFiles = await readdir(this.DIRECTORY_PATH).then((files) =>
			files.filter(
				(file) =>
					file.endsWith('.js') && !file.startsWith('CommandBase')
			)
		);

		for (const file of commandFiles) {
			const FILE_PATH = join(this.DIRECTORY_PATH, file);
			const { default: Command } = await import(FILE_PATH);

			const cmd = new Command();

			const isRunnable = ['metadata', 'handle'].every(
				(prop) => prop in cmd
			);
			if (isRunnable) discordBot.commands.set(cmd.metadata.name, cmd);
		}
	}

	async register() {
		const discordBot = DiscordBot.getInstance();
		console.log(`Registering ${discordBot.commands.size} commands.`);

		try {
			const guilds = await discordBot._client.guilds.fetch();

			for (const [guildId, guild] of guilds.entries()) {
				let data: any = await this.rest.put(
					Routes.applicationGuildCommands(this.APP_ID, guildId),
					{
						body: Array.from(
							discordBot.commands.values(),
							(v) => v.metadata
						),
					}
				);

				console.log(
					`Finished registering ${data.length} in [${guildId}:${guild.name}]`
				);
			}
			console.log(`Finished registering commands.`);
			return Promise.resolve(true);
		} catch (error) {
			console.error('Failed to register commands.', error);
			return Promise.resolve(false);
		}
	}
}
