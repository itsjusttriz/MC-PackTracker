import * as Discord from 'discord.js';
import * as Drizzle from '../../../drizzle';

const addEditorEmbed = new Discord.EmbedBuilder()
	.setColor('Red')
	.setTitle(':no_entry: Error!')
	.setDescription(
		[
			'**You have not selected an editor role for this server.**\n',
			'To do so, run `/settings set {editor-role}`',
		].join('\n')
	);

export const detect = async (i: Discord.ChatInputCommandInteraction) => {
	const [guildSettings] = await Drizzle.getGuildSettings(i.guild!.id);
	if (!guildSettings?.editorRoleId) {
		return { passed: false, embed: addEditorEmbed };
	}
	return { passed: true };
};
