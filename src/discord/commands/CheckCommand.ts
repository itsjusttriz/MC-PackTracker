import {
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
	type GuildMember,
} from 'discord.js';

import { DrizzleDB } from '../../drizzle';

import { CurseforgeApi } from '../../lib/CurseforgeApiLibrary';
import { FtbApi } from '../../lib/FtbApiLibrary';

import CommandBase from './CommandBase';

export default class extends CommandBase {
	metadata = new SlashCommandBuilder()
		.setName('check')
		.setDescription('Force an update check on a stored tracker.')
		.addStringOption((input) => {
			return input
				.setName('tracker-id')
				.setRequired(true)
				.setDescription(
					"You'll find this ID on the bottom of past update alerts or by using /tracklist"
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

		let trackerId = i.options.getString('tracker-id', true);

		const trackedModpack = (await db.getTrackedModpackById(trackerId))?.[0];
		if (!trackedModpack) {
			const err = `:x: Could not find an existing tracker with an ID of \`${trackerId}\`. Does it exist?`;
			await i.editReply(err);
			return;
		}

		switch (trackedModpack.launcher) {
			case 'curseforge': {
				const api = CurseforgeApi.getInstance();
				const request = await api.fetch(trackedModpack.modpackId);
				const converted = api.convertRequestData(request.data);

				api.testForVersionChange(trackedModpack, converted, Date.now());
				break;
			}
			case 'ftb': {
				const api = FtbApi.getInstance();
				const request = await api.fetch(trackedModpack.modpackId);
				const converted = api.convertRequestData(request);

				api.testForVersionChange(trackedModpack, converted, Date.now());
				break;
			}
		}

		await i.editReply(
			'Re-checking the latest version of this modpack...\n' +
				"-# If nothing shows, then the latest version hasn't changed."
		);
		await new Promise((res) => setTimeout(res, 5000));
		await i.deleteReply();
	}
}
