import {
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
	type GuildMember,
} from 'discord.js';

import { DrizzleDB } from '../../drizzle';

import CommandBase from './CommandBase';

export default class extends CommandBase {
	private readonly TRACKER_ID_OPTION = 'tracker-id';

	metadata = new SlashCommandBuilder()
		.setName('untrack')
		.setDescription('Remove a tracked modpack.')
		.addStringOption((option) => {
			return option
				.setName(this.TRACKER_ID_OPTION)
				.setRequired(true)
				.setDescription(
					"Use `/tracklist` to find the trackerId you'd like to remove."
				);
		})
		.toJSON();

	async handle(i: ChatInputCommandInteraction) {
		const db = DrizzleDB.getInstance();
		const [guildSettings] = await db.getGuildSettings(i.guild!.id);

		const { roles: userRoles } = i.member! as GuildMember;
		const canEditTrackers =
			guildSettings?.editorRoleId &&
			userRoles.cache.has(guildSettings.editorRoleId) &&
			i.guild!.ownerId === i.user.id;

		if (!canEditTrackers) {
			await i.editReply('You do not have permission to do this.');
			return;
		}

		const trackerId = i.options.getString(this.TRACKER_ID_OPTION, true);

		const storedTrackers = await db.getTrackedModpackById(trackerId);
		if (!storedTrackers.length) {
			const err = `:x: Could not find an existing tracker with an ID of \`${trackerId}\`. Does it exist?`;
			await i.editReply(err);
			return;
		}

		const tracker = storedTrackers[0];
		const wasDeleted = await db.deleteTrackedModpackById(tracker.id);
		if (!wasDeleted) {
			const err = `Failed to delete tracker with ID of \`${tracker.id}\`. Try again or contact support.`;
			await i.editReply(err);
			return;
		}

		await i.editReply('Tracker deleted!');
		return;
	}
}
