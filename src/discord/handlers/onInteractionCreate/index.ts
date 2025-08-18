import * as Discord from 'discord.js';

import * as Client from '../..';

import * as GuildSettingsChecker from './GuildSettingsChecker';

export default async (ctx: Client.HandlerContext) => {
	ctx.client.on(
		'interactionCreate',
		async (interaction: Discord.Interaction) => {
			if (!interaction.isChatInputCommand() || !interaction.guild) return;
			const isUnpreventableCommand = ['ping', 'settings'].some(
				(cmd) => interaction.commandName.toLowerCase() === cmd
			);
			const guildSettingsCheck = await GuildSettingsChecker.detect(
				interaction
			);
			if (!guildSettingsCheck.passed && !isUnpreventableCommand) {
				await interaction.reply({
					embeds: [guildSettingsCheck.embed!],
					flags: Discord.MessageFlags.Ephemeral,
				});
				return;
			}
			const canSpeak = interaction.appPermissions.has(
				Discord.PermissionFlagsBits.ViewChannel |
					Discord.PermissionFlagsBits.SendMessages |
					Discord.PermissionFlagsBits.ReadMessageHistory |
					Discord.PermissionFlagsBits.EmbedLinks |
					Discord.PermissionFlagsBits.AttachFiles |
					Discord.PermissionFlagsBits.ChangeNickname |
					Discord.PermissionFlagsBits.UseExternalEmojis
			);
			if (!canSpeak) {
				await interaction.reply({
					content:
						':x: ERROR: I seem to be missing some permissions, that are required for me to perform my duties. Please correct this by re-inviting me and ensuring all listed permissions are enabled during onboarding...',
					flags: Discord.MessageFlags.Ephemeral,
				});
				return;
			}
			await interaction.deferReply({
				flags: Discord.MessageFlags.Ephemeral,
				withResponse: true,
			});
			try {
				const command = ctx.commands.get(interaction.commandName);
				if (!command) {
					throw new Error(
						`No command matching ${interaction.commandName} was found.`
					);
				}
				command.handle(interaction);
			} catch (error) {
				console.error(error);
				const reply =
					interaction.replied || interaction.deferred
						? interaction.followUp
						: interaction.reply;
				const replyOpts = {
					content: 'There was an error while executing this command!',
					ephemeral: true,
				};
				await reply(replyOpts);
			}
		}
	);
};
