import axios, { type AxiosInstance } from 'axios';
import { EnvService } from '../services/EnvService';

export class BaseApiLibrary {
	protected http: AxiosInstance;
	constructor(env: EnvService, baseURL: string) {
		this.http = axios.create({
			baseURL,
			timeout: 1000,
			headers: {
				'User-Agent': env.agent,
			},
		});
	}

	async fetch(id: string) {
		try {
			const req = await this.http.get(`/${id}`, {
				validateStatus: function (status) {
					return status < 300; // Resolve only if the status code is less than 300
				},
			});
			return req.data;
		} catch (error: any) {
			console.error(
				'Error fetching modpack:',
				id,
				'-',
				error.response.status,
				error.response.statusText
			);
			return null;
		}
	}
}
