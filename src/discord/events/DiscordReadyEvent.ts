import { DiscordBot } from '../../discord';

import { CurseforgeApi } from '../../lib/CurseforgeApiLibrary';
import { FtbApi } from '../../lib/FtbApiLibrary';

import { CommandRegistryService } from '../../services/CommandRegistryService';
import { CronService } from '../../services/CronService';

export class DiscordReadyEvent {
	constructor() {
		this.handle();
	}

	async handle() {
		const discordBot = DiscordBot.getInstance();
		const client = discordBot._client;
		const { username, id } = client.user!;

		console.log(`Logged in as ${username} (${id})!`);

		const cmdRegistry = CommandRegistryService.getInstance();
		await cmdRegistry.sync();
		await cmdRegistry.register();

		discordBot.startPresenceLoop();

		const ftbApi = FtbApi.getInstance();
		await ftbApi.startProcessing();

		const curseforgeApi = CurseforgeApi.getInstance();
		await curseforgeApi.startProcessing();

		const scheduler = CronService.getInstance();
		scheduler.register('0 * * * *', async () => {
			// Process modpacks, hourly, ON the hour.
			await ftbApi.startProcessing();
			await curseforgeApi.startProcessing();
		});
	}
}
