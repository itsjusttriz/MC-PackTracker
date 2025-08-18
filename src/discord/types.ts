import type {
	ChatInputCommandInteraction,
	Client,
	Collection,
	SlashCommandBuilder,
} from 'discord.js';

export type CommandData = {
	metadata: ReturnType<SlashCommandBuilder['toJSON']>;
	handle: (i: ChatInputCommandInteraction) => void;
};

export type HandlerContext = {
	client: Client;
	commands: Collection<string, CommandData>;
};
