import {
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
} from 'discord.js';

import CommandBase from './CommandBase';
import { DiscordBot } from '..';

export default class extends CommandBase {
	metadata = new SlashCommandBuilder()
		.setName('check')
		.setDescription(
			'[DEV ONLY] Force an update check on all stored trackers.'
		)
		.toJSON();

	async handle(i: ChatInputCommandInteraction) {
		const discordBot = DiscordBot.getInstance();
		if (i.user.id !== discordBot.BOT_OWNER_ID) {
			await i.editReply(`You cannot use this command.`);
			return;
		}

		i.editReply({
			content: 'Coming soon!',
		});
	}
}
