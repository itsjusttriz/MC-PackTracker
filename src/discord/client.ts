import * as Discord from 'discord.js';

import Env from '../env';

import * as Handlers from './handlers';

type CommandData = {
	metadata: ReturnType<Discord.SlashCommandBuilder['toJSON']>;
	handle: (i: Discord.ChatInputCommandInteraction) => void;
};

export type HandlerContext = {
	client: Discord.Client;
	commands: Discord.Collection<string, CommandData>;
};

export const client = new Discord.Client({
	intents: [
		Discord.GatewayIntentBits.Guilds,
		Discord.GatewayIntentBits.GuildMessages,
	],
});

const commands = new Discord.Collection<string, CommandData>();

export const login = async () => {
	await Handlers.onReady({ client, commands });
	await Handlers.onInteractionCreate({
		client,
		commands,
	});

	await client.login(Env.DISCORD_TOKEN);
};
