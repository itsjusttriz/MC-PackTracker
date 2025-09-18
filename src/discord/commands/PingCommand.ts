import {
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
} from 'discord.js';
import CommandBase from './CommandBase';

export default class extends CommandBase {
	metadata = new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Ping the bot to check if it is online.')
		.toJSON();

	handle(i: ChatInputCommandInteraction) {
		i.editReply({
			content: 'Pong! 🏓',
		});
	}
}
