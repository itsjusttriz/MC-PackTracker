import * as Discord from 'discord.js';
import * as Drizzle from '../../drizzle';
import * as Fetcher from '../../fetcher';
export default {
	metadata: new Discord.SlashCommandBuilder()
		.setName('track')
		.setDescription('Track an FTB modpack')
		.addIntegerOption((option) =>
			option
				.setName('modpack-id')
				.setRequired(true)
				.setDescription(
					"You'll find this ID in the lower-right area of the modpack's project page on the FTB Website."
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
		const modpackId = interaction.options.getInteger('modpack-id', true);
		const req = await Fetcher.fetch(String(modpackId));
		if (
			String(req === null || req === void 0 ? void 0 : req.id) !==
			String(modpackId)
		) {
			await interaction.editReply(
				`:x: Could not find a modpack with the id: ${modpackId}`
			);
			return;
		}
		const converted = Fetcher.Helpers.convertRequestData(req);
		const foundExisting = await Drizzle.getTrackedModpack(
			String(converted.id),
			interaction.channel!.id,
			interaction.guild!.id
		);
		if (foundExisting.length) {
			await interaction.editReply(
				`:x: ERROR: This tracker is already running...`
			);
			return;
		}
		const addedToDb = await Drizzle.addTrackedModpack(
			String(converted.id),
			interaction.channel!.id,
			interaction.guild!.id,
			interaction.user.id
		);
		if (!addedToDb) {
			await interaction.editReply(
				`:x: ERROR: Failed to store this Modpack Id in the database. Have you already registered it?`
			);
			return;
		}
		const [dbItem] = await Drizzle.getTrackedModpack(
			String(converted.id),
			interaction.channel!.id,
			interaction.guild!.id
		);
		Fetcher.testForVersionChange(
			interaction.client,
			dbItem,
			converted,
			Date.now()
		);
		await interaction.editReply(
			`Tracking project ${converted.id}: ${converted.name}...`
		);
		return;
	},
};
