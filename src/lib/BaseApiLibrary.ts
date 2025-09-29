import axios, { type AxiosInstance } from 'axios';
import { EnvService } from '../services/EnvService';
import { DiscordBot } from '../discord';

export class BaseApiLibrary {
	protected http: AxiosInstance;
	constructor(env: EnvService, baseURL: string) {
		this.http = axios.create({
			baseURL,
			timeout: 1000 * 10,
			headers: {
				'User-Agent': env.agent,
			},
		});
	}

	async fetch(id: string) {
		console.log(`Trying to fetch ${id} for ${this.constructor.name}.`);

		try {
			const req = await this.http.get(`/${id}`, {
				validateStatus: function (status) {
					return status < 300; // Resolve only if the status code is less than 300
				},
			});
			return req.data;
		} catch (error: any) {
			console.error('Error fetching modpack:', id);
			console.error(error.message);

			const discordBot = DiscordBot.getInstance();
			await discordBot
				.dmOwner(
					`Error fetching modpack via ${this.constructor.name} with id: ${id}\n\`\`\`\n${error.message}\n\`\`\``
				)
				.catch(() =>
					console.log('failed to DM Triz with above error.')
				);

			return null;
		}
	}
}
