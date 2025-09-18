import { DrizzleDB } from '../../drizzle';
import {
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
	type GuildMember,
} from 'discord.js';
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
			(guildSettings?.editorRoleId &&
				userRoles.cache.has(guildSettings.editorRoleId)) ??
			i.guild!.ownerId === i.user.id;

		if (!canEditTrackers) {
			await i.editReply('You do not have permission to do this.');
			return;
		}

		const trackerId = i.options.getString(this.TRACKER_ID_OPTION, true);

		const [foundTracker] = await db.getTrackedModpackById(trackerId);
		if (!foundTracker) {
			await i.editReply(
				':x: Could not find an existing tracker with this ID. Does it exist?'
			);
			return;
		}

		const wasDeleted = await db.deleteTrackedModpackById(foundTracker.id);
		if (!wasDeleted) {
			await i.editReply(
				'Failed to delete this tracker. Please contact support.'
			);
			return;
		}

		await i.editReply('Tracker deleted!');
		return;
	}
}
