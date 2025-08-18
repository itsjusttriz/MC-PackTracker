import { EmbedBuilder } from 'discord.js';

export class EmbedService {
	static buildErrorEmbed(text: string) {
		return new EmbedBuilder()
			.setColor('DarkRed')
			.setDescription(`:x: **Error!**\n\n${text}`);
	}
}
