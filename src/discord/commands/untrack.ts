import * as Discord from 'discord.js';
import * as Drizzle from '../../drizzle';
const CommandOptionLabels = {
	TRACKER_ID: 'tracker-id',
};
exports.default = {
	metadata: new Discord.SlashCommandBuilder()
		.setName('untrack')
		.setDescription('Remove a tracked modpack.')
		.addStringOption((option) =>
			option
				.setName(CommandOptionLabels.TRACKER_ID)
				.setRequired(true)
				.setDescription(
					"Use `/tracklist` to find the trackerId you'd like to remove."
				)
		)
		.toJSON(),
	handle: async (interaction: Discord.ChatInputCommandInteraction) => {
		const [guildSettings] = await Drizzle.getGuildSettings(
			interaction.guild!.id
		);
		const userRoles = (interaction.member! as Discord.GuildMember).roles;
		const canEditTrackers =
			(guildSettings?.editorRoleId &&
				userRoles.cache.has(guildSettings.editorRoleId)) ??
			interaction.guild!.ownerId === interaction.user.id;
		if (!canEditTrackers) {
			await interaction.editReply(
				'You do not have permission to do this.'
			);
		}
		const trackerId = interaction.options.getString(
			CommandOptionLabels.TRACKER_ID,
			true
		);
		const foundTrackers = await Drizzle.getTrackedModpackById(trackerId);
		if (!foundTrackers.length) {
			await interaction.editReply(
				`:x: ERROR: Unable to find a stored tracker with this ID. Does it exist?`
			);
			return;
		}
		const [tracker] = foundTrackers;
		const deleted = await Drizzle.deleteTrackedModpackById(tracker.id);
		if (!deleted) {
			await interaction.editReply(
				`Failed to delete this tracker (${tracker.id}). Please contact support about this...`
			);
			return;
		}
		await interaction.editReply(`Deleted Tracker#${tracker.id}!`);
		return;
	},
};
