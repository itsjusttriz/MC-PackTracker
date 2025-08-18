import * as Discord from 'discord.js';
import * as Cron from 'node-cron';

import * as Client from '../..';
import * as Fetcher from '../../../fetcher';

import * as GuildRegistry from './GuildRegistry';
import * as CommandRegistry from './CommandRegistry';
import * as Status from './Status';

export default async (ctx: Client.HandlerContext) => {
	ctx.client.on(Discord.Events.ClientReady, async (readyClient) => {
		const { username, id } = readyClient.user!;
		console.log(`Logged in as ${username} (${id})!`);

		await GuildRegistry.log(readyClient);
		await CommandRegistry.sync(ctx.commands);
		await CommandRegistry.register(ctx.client, ctx.commands);
		await Status.set(readyClient);

		await Fetcher.startProcessing(readyClient);
		Cron.schedule(
			'0 * * * *',
			async () => {
				await Fetcher.startProcessing(readyClient);
			},
			{
				timezone: 'Europe/Dublin',
			}
		);
	});
};
