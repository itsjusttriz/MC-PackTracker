import {
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
} from 'discord.js';

import CommandBase from './CommandBase';

export default class extends CommandBase {
	metadata = new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Invite the bot to a server of your choosing.')
		.toJSON();

	handle(i: ChatInputCommandInteraction) {
		i.editReply({
			content: 'Coming soon!',
		});
	}
}
