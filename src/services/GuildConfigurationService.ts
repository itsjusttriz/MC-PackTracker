import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { EmbedService } from './EmbedService';
import { DrizzleDB } from '../drizzle';

export class GuildConfigurationService {
	private static _embed = EmbedService.buildErrorEmbed(
		`Editor role not set! Run \`/settings set {editor-role}\``
	);

	static async check(i: ChatInputCommandInteraction) {
		const db = DrizzleDB.getInstance();
		const [guildSettings] = await db.getGuildSettings(i.guild!.id);
		return !!guildSettings?.editorRoleId || false;
	}

	static sendErrorEmbed(i: ChatInputCommandInteraction) {
		i.reply({
			embeds: [this._embed],
			flags: [MessageFlags.Ephemeral],
		});
	}
}
