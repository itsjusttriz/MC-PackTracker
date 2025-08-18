import {
	PermissionFlagsBits,
	MessageFlags,
	type ChatInputCommandInteraction,
} from 'discord.js';

import { EmbedService } from './EmbedService';

export class GuildPermissionService {
	private static _embed = EmbedService.buildErrorEmbed(
		'Missing Permission(s)! Re-invite me with the requested permissions.'
	);

	static async checkBasePermissions(i: ChatInputCommandInteraction) {
		const requiredBits =
			PermissionFlagsBits.ViewChannel |
			PermissionFlagsBits.SendMessages |
			PermissionFlagsBits.ReadMessageHistory |
			PermissionFlagsBits.EmbedLinks |
			PermissionFlagsBits.AttachFiles |
			PermissionFlagsBits.ChangeNickname |
			PermissionFlagsBits.UseExternalEmojis;

		return i.appPermissions.has(requiredBits);
	}

	static sendErrorEmbed(i: ChatInputCommandInteraction) {
		i.reply({
			embeds: [this._embed],
			flags: [MessageFlags.Ephemeral],
		});
	}
}
