import { DrizzleDB } from '../../drizzle';
import {
	type ChatInputCommandInteraction,
	type GuildMember,
	EmbedBuilder,
	SlashCommandBuilder,
} from 'discord.js';
import CommandBase from './CommandBase';

export default class extends CommandBase {
	metadata = new SlashCommandBuilder()
		.setName('tracklist')
		.setDescription('View the list of tracked modpacks in this server.')
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

		let trackedModpacks = (await db.getTrackedModpacks(i.guild!.id)).map(
			(mp) => [mp.id, mp.modpackId, mp.channelId]
		);

		const embed = new EmbedBuilder()
			.setAuthor({ name: 'Tracker List' })
			.setDescription(
				'View the list of tracked modpacks for this server.'
			)
			.addFields([
				{
					name: 'Tracker ID',
					value: trackedModpacks.map(([id, ,]) => id).join('\n'),
					inline: true,
				},
				{
					name: 'Modpack ID',
					value: trackedModpacks.map(([, mpId]) => mpId).join('\n'),
					inline: true,
				},
				{
					name: 'Channel',
					value: trackedModpacks
						.map(([, , channelId]) => `<#${channelId}>`)
						.join('\n'),
					inline: true,
				},
			]);

		await i.editReply({ embeds: [embed] });
	}
}
