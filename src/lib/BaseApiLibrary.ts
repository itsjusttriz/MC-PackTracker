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
			let errText = `Error fetching modpack via ${this.constructor.name} with id: ${id}`;
			errText += `\n\`\`\`\n${error.message}\n\`\`\``;

			console.error(errText);

			const discordBot = DiscordBot.getInstance();
			await discordBot.dmOwner(errText);

			return null;
		}
	}
}
