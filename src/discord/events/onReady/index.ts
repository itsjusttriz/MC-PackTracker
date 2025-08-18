import type { CommandCollection, DiscordReadyClient } from '../../types';

// TODO: Redo old imports??
import { startProcessing } from '../../../fetcher';
import { schedule } from 'node-cron';
import { log } from './GuildRegistry';
import { register, sync } from './CommandRegistry';
import { set } from './Status';

export class DiscordReadyEvent {
	constructor(
		private _client: DiscordReadyClient,
		private _commands: CommandCollection
	) {
		this.handle();
	}

	async handle() {
		const { username, id } = this._client.user!;
		console.log(`Logged in as ${username} (${id})!`);

		//----------------------------------------------------------------
		// TODO: Change this section to classes.
		//----------------------------------------------------------------
		await log(this._client);

		await sync(this._commands);
		await register(this._client, this._commands);

		await set(this._client);

		await startProcessing(this._client);
		//----------------------------------------------------------------
		//----------------------------------------------------------------

		schedule(
			'0 * * * *',
			async () => {
				await startProcessing(this._client);
			},
			{
				timezone: 'Europe/Dublin',
			}
		);
	}
}
