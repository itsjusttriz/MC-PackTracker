import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from 'discord.js';

import type { CommandData } from '../types';

export default class implements CommandData {
	metadata = new SlashCommandBuilder()
		.setName('broken')
		.setDescription('You should not see this. Report this to the dev ASAP!')
		.toJSON();

	handle(i: ChatInputCommandInteraction) {}
}
