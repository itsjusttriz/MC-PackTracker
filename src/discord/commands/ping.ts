import * as Discord from 'discord.js';

export default {
	metadata: new Discord.SlashCommandBuilder()
		.setName('ping')
		.setDescription('Ping the bot to check if it is online.')
		.toJSON(),
	handle: async (interaction: Discord.ChatInputCommandInteraction) => {
		await interaction.editReply({
			content: 'Pong! 🏓',
		});
	},
};
