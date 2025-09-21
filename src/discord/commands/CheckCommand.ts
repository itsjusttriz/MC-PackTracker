import {
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
} from 'discord.js';

import CommandBase from './CommandBase';

export default class extends CommandBase {
	metadata = new SlashCommandBuilder()
		.setName('check')
		.setDescription(
			'[DEV ONLY] Force an update check on all stored trackers.'
		)
		.toJSON();

	handle(i: ChatInputCommandInteraction) {
		i.editReply({
			content: 'Coming soon!',
		});
	}
}
