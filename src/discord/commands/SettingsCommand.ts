import {
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
} from 'discord.js';
import { DrizzleDB } from '../../drizzle';
import CommandBase from './CommandBase';
import { DiscordBot } from '..';

export default class extends CommandBase {
	metadata = new SlashCommandBuilder()
		.setName('settings')
		.setDescription(
			'Configure your preferences for how the bot interacts with your server.'
		)
		.addSubcommand((subcmd) => {
			return subcmd
				.setName('set')
				.setDescription('Set a value to a config property.')
				.addRoleOption((role) => {
					return role
						.setName('editor-role')
						.setDescription('The role used to manage trackers.');
				});
		})
		.toJSON();

	async handle(i: ChatInputCommandInteraction) {
		const isGuildOwner = i.user.id === i.guild!.ownerId;
		// TODO: Fix this later.
		const isBotOwner = i.user.id === '228167686293553164';
		if (!isGuildOwner && !isBotOwner) {
			await i.editReply(
				`Sorry. Only the server's owner can interact with this.`
			);
			return;
		}

		const subcmd = i.options.getSubcommand(true);
		if (subcmd !== 'set') {
			await i.editReply(
				':x: Error! You should not see this. Contact support.'
			);
			return;
		}

		const role = i.options.getRole('editor-role', true);
		const db = DrizzleDB.getInstance();

		const newGuildSettings = db.createGuildSettings(i.guild!.id, role.id);
		if (!newGuildSettings) {
			await i.editReply(
				'Failed to update this role in the database. Try again, or contact support.'
			);
			return;
		}

		await i.editReply(
			"Updated 'editor-role' for this server! You may start tracking modpacks!"
		);
	}
}
