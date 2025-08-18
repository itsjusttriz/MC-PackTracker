import {
	EmbedBuilder,
	MessageFlags,
	PermissionFlagsBits,
	type ChatInputCommandInteraction,
	type Interaction,
} from 'discord.js';

import type { CommandCollection, DiscordReadyClient } from '../../types';

import { InvalidCommandError } from '../../../util/errors';

// TODO: Redo old imports?
import { detect } from './GuildSettingsChecker';

export class DiscordInteractionCreateEvent {
	constructor(
		private _commands: CommandCollection,
		interaction: Interaction
	) {
		this.handle(interaction);
	}

	async handle(i: Interaction) {
		if (!i.isChatInputCommand() || !i.guild) return;

		// TODO: Change these command names to consts.
		const isCommandUnblockable = ['ping', 'settings'].some(
			(cmd) => i.commandName.toLowerCase() === cmd.toLowerCase()
		);

		// TODO: Make this class-shaped.
		const isGuildConfigured = await detect(i);

		if (!isGuildConfigured.passed && !isCommandUnblockable) {
			i.reply({
				embeds: [isGuildConfigured.embed!],
				flags: [MessageFlags.Ephemeral],
			});
			return;
		}

		const canSpeak = this.checkSpeakAvailability(i);
		if (!canSpeak) {
			const embed = this.createErrorEmbed(
				'Missing Permission(s)! Re-invite me with the requested permissions.'
			);
			i.reply({
				embeds: [embed],
				flags: MessageFlags.Ephemeral,
			});
			return;
		}

		await i.deferReply({
			withResponse: true,
			flags: MessageFlags.Ephemeral,
		});

		try {
			const cmd = this._commands.get(i.commandName);
			if (!cmd)
				throw new InvalidCommandError(
					`${i.commandName} doesn't exist.`
				);

			cmd.handle(i);
		} catch (e) {
			console.error(e);

			const replyOpts = {
				content: 'There was an error while executing this command!',
				ephemeral: true,
			};

			if (i.replied || i.deferred) i.followUp(replyOpts);
			else i.reply(replyOpts);
		}
	}

	private checkSpeakAvailability(i: ChatInputCommandInteraction) {
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

	private createErrorEmbed(text: string) {
		return new EmbedBuilder()
			.setColor('DarkRed')
			.setDescription(`:x: **Error!**\n\n${text}`);
	}
}
