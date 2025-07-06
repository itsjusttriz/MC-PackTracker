import * as Discord from 'discord.js';
import * as Path from 'node:path';
import * as FS from 'node:fs/promises';

import * as Client from '../../client';

import Env from '../../../env';

export const sync = async (commands: Client.HandlerContext['commands']) => {
	const FOLDER_PATH = Path.join(__dirname, '../../commands');
	const commandFiles = (await FS.readdir(FOLDER_PATH)).filter((file) =>
		file.endsWith('.js')
	);

	for (const file of commandFiles) {
		const FILE_PATH = Path.join(FOLDER_PATH, file);
		const { default: command } = await import(FILE_PATH);
		const isRunnable = ['metadata', 'handle'].every(
			(prop) => prop in command
		);
		if (isRunnable) commands.set(command.metadata.name, command);
	}
};

export const register = async (
	c: Client.HandlerContext['client'],
	commands: Client.HandlerContext['commands']
) => {
	const rest = new Discord.REST();
	rest.setToken(Env.DISCORD_TOKEN);

	console.log(`Registering ${commands.size} commands.`);

	try {
		const guilds = [...c.guilds.cache.values()];
		for (const g of guilds) {
			let data: any = await rest.put(
				Discord.Routes.applicationGuildCommands(
					Env.DISCORD_APP_ID,
					g.id
				),
				{
					body: [...commands.values()].map(
						({ metadata }) => metadata
					),
				}
			);
			console.log(
				`Finished registering ${data.length} in [${g.id}:${g.name}]`
			);
		}

		console.log(`Finished registering commands.`);
		return Promise.resolve(true);
	} catch (error) {
		console.error('Failed to register commands.', error);
		return Promise.resolve(false);
	}
};
