import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { EmbedService } from './EmbedService';
import { getGuildSettings } from '../drizzle';

export class GuildConfigurationService {
	private static _embed = EmbedService.buildErrorEmbed(
		`Editor role not set! Run \`/settings set {editor-role}\``
	);

	static async check(i: ChatInputCommandInteraction) {
		const [guildSettings] = await getGuildSettings(i.guild!.id);
		if (!guildSettings?.editorRoleId) {
			return false;
		}
		return true;
	}

	static sendErrorEmbed(i: ChatInputCommandInteraction) {
		i.reply({
			embeds: [this._embed],
			flags: [MessageFlags.Ephemeral],
		});
	}
}
