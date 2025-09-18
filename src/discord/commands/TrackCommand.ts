// TODO: Refactor this to allow for CF & FTB.

import { DrizzleDB } from '../../drizzle';
import {
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
	type GuildMember,
} from 'discord.js';
import CommandBase from './CommandBase';
import { FtbApi } from '../../lib/FtbApiLibrary';

export default class extends CommandBase {
	metadata = new SlashCommandBuilder()
		.setName('track')
		.setDescription('Track an FTB modpack')
		.addIntegerOption((option) => {
			return option
				.setName('modpack-id')
				.setRequired(true)
				.setDescription(
					"You'll find this ID in the lower-right area of the modpack's project page on the FTB Website."
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

		let modpackId = i.options.getInteger('modpack-id', true)?.toString();

		const ftbApi = FtbApi.getInstance();
		const req = await ftbApi.fetch(modpackId);

		if (req?.id?.toString() !== modpackId) {
			await i.editReply(
				`:x: Could not find a modpack with the id: ${modpackId}.`
			);
			return;
		}

		const converted = ftbApi.convertRequestData(req);

		const [existingTracker] = await db.getTrackedModpack(
			modpackId,
			i.channel!.id,
			i.guild!.id
		);
		if (existingTracker) {
			await i.editReply(
				":x: A tracker already exists for this modpack's ID, in this channel."
			);
			return;
		}

		const newTracker = await db.addTrackedModpack(
			modpackId,
			i.channel!.id,
			i.guild!.id,
			i.user.id
		);
		if (!newTracker) {
			await i.editReply(
				':x: Oops! Something went wrong when trying to store this tracker. Does it already exist?'
			);
			return;
		}

		const [storedTracker] = await db.getTrackedModpack(
			converted.id.toString(),
			i.channel!.id,
			i.guild!.id
		);

		ftbApi.testForVersionChange(storedTracker, converted, Date.now());

		await i.editReply(
			`:white_check_mark: Tracking project ${converted.id}: ${converted.name}...`
		);
		return;
	}
}
