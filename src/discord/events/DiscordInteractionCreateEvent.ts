import { MessageFlags, type Interaction } from 'discord.js';

import type { CommandCollection } from '../types';

import { InvalidCommandError } from '../../util/errors';

import { GuildConfigurationService } from '../../services/GuildConfigurationService';
import { GuildPermissionService } from '../../services/GuildPermissionService';

export class DiscordInteractionCreateEvent {
	constructor(
		private _commands: CommandCollection,
		interaction: Interaction
	) {
		this.handle(interaction);
	}

	async handle(i: Interaction) {
		if (!i.isChatInputCommand() || !i.guild) return;

		const isCommandBlockable = !['ping', 'settings'].some(
			(cmd) => i.commandName.toLowerCase() === cmd.toLowerCase()
		);

		const guildConfigCheck = await GuildConfigurationService.check(i);
		if (!guildConfigCheck && isCommandBlockable) {
			GuildConfigurationService.sendErrorEmbed(i);
			return;
		}

		const hasBasePermissions =
			GuildPermissionService.checkBasePermissions(i);
		if (!hasBasePermissions) {
			GuildPermissionService.sendErrorEmbed(i);
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
}
