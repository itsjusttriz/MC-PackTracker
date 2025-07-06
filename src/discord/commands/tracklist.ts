import * as Discord from 'discord.js';
import * as Drizzle from '../../drizzle';
export default {
	metadata: new Discord.SlashCommandBuilder()
		.setName('tracklist')
		.setDescription('View the list of tracked modpacks in this server.')
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
		const trackedModpacks = await Drizzle.getTrackedModpacks(
			interaction.guild!.id
		);
		const formatted = trackedModpacks.map((mp) => [
			mp.id,
			mp.modpackId,
			mp.channelId,
		]);
		const embed = new Discord.EmbedBuilder()
			.setAuthor({ name: 'Tracker List' })
			.setDescription(
				'View the list of tracked modpacks for this server.'
			)
			.addFields([
				{
					name: 'Tracker ID',
					value: formatted.map(([trackerId]) => trackerId).join('\n'),
					inline: true,
				},
				{
					name: 'Modpack ID',
					value: formatted
						.map(([, modpackId]) => modpackId)
						.join('\n'),
					inline: true,
				},
				{
					name: 'Channel',
					value: formatted
						.map(([, , channelId]) => `<#${channelId}>`)
						.join('\n'),
					inline: true,
				},
			]);
		await interaction.editReply({
			embeds: [embed],
		});
	},
};
