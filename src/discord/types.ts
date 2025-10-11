import {
	type ChatInputCommandInteraction,
	type SlashCommandBuilder,
} from 'discord.js';

export type CommandData = {
	metadata: ReturnType<SlashCommandBuilder['toJSON']>;
	handle: (i: ChatInputCommandInteraction) => void;
};
