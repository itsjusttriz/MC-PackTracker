import type {
	ChatInputCommandInteraction,
	Client,
	Collection,
	SlashCommandBuilder,
} from 'discord.js';

export type DiscordReadyClient = Client<true>;

export type CommandData = {
	metadata: ReturnType<SlashCommandBuilder['toJSON']>;
	handle: (i: ChatInputCommandInteraction) => void;
};

export type CommandCollection = Collection<string, CommandData>;

export type HandlerContext = {
	client: Client;
	commands: CommandCollection;
};
