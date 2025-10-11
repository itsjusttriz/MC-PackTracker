import {
	type ChatInputCommandInteraction,
	type Collection,
	type SlashCommandBuilder,
} from 'discord.js';

export type CommandData = {
	metadata: ReturnType<SlashCommandBuilder['toJSON']>;
	handle: (i: ChatInputCommandInteraction) => void;
};

export type CommandCollection = Collection<string, CommandData>;
