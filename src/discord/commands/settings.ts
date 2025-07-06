import * as Discord from 'discord.js';
import * as Drizzle from '../../drizzle';

const SubCommandLabels = {
	SET: 'set',
};

const SubCommandOptionLabels = {
	[SubCommandLabels.SET]: {
		EDITOR_ROLE: 'editor-role',
	},
};

export default {
	metadata: new Discord.SlashCommandBuilder()
		.setName('settings')
		.setDescription(
			'Configure your preferences for how the bot interacts with your server.'
		)
		.addSubcommand((subcmd) =>
			subcmd
				.setName(SubCommandLabels.SET)
				.setDescription('Set a value to a config property')
				.addRoleOption((option) =>
					option
						.setName(
							SubCommandOptionLabels[SubCommandLabels.SET]
								.EDITOR_ROLE
						)
						.setDescription('The role used to manage trackers.')
				)
		)
		.toJSON(),
	handle: async (interaction: Discord.ChatInputCommandInteraction) => {
		const isGuildOwner = interaction.user.id === interaction.guild!.ownerId;
		if (!isGuildOwner) {
			await interaction.editReply(
				`Sorry. Only the server's owner can interact with this.`
			);
			return;
		}
		const subcmd = interaction.options.getSubcommand(true);
		switch (subcmd) {
			case SubCommandLabels.SET: {
				const role = interaction.options.getRole(
					SubCommandOptionLabels[SubCommandLabels.SET].EDITOR_ROLE,
					true
				);
				const newGuildSettings = await Drizzle.createGuildSettings(
					interaction.guild!.id,
					role.id
				);
				if (!newGuildSettings) {
					await interaction.editReply(
						`Failed to store this role ID into the database. Please contact support about this.`
					);
					return;
				}
				await interaction.editReply(
					'Successfully updated the "editor" role for this server! You may now add some modpack trackers...'
				);
				break;
			}
			default: {
				await interaction.editReply(
					':x: ERROR: You should not see this. (id: settings-subcmd)'
				);
				return;
			}
		}
	},
};
