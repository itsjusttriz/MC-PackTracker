import * as z from 'zod';
import { config } from 'dotenv';
import { resolve } from 'node:path';

import { EnvironmentValidationError } from '../util/errors';

config({
	path: resolve(__dirname, '../../.env'),
	quiet: true,
});

const schema = z.object({
	DB_FILE_NAME: z.string().nonempty('DB_FILE_NAME is required'),
	DISCORD_APP_ID: z.string().nonempty('DISCORD_APP_ID is required'),
	DISCORD_TOKEN: z.string().nonempty('DISCORD_TOKEN is required'),
	CURSEFORGE_TOKEN: z.string().nonempty('CURSEFORGE_TOKEN is required'),
	AGENT: z.string(),
	DM_ON_ERROR: z.boolean().nonempty('DM_ON_ERROR is required')
});
export type EnvObject = z.infer<typeof schema>;
export class EnvService {
	private static instance: EnvService;

	private readonly _data: EnvObject;
	private readonly _env = schema.safeParse(process.env);

	public static getInstance() {
		if (!EnvService.instance) EnvService.instance = new EnvService();

		return EnvService.instance;
	}

	private constructor() {
		if (!this._env.success) {
			const error = JSON.stringify(this._env.error.flatten());
			throw new EnvironmentValidationError(error);
		}
		this._data = this._env.data;
	}

	get dbFileName() {
		return this._data.DB_FILE_NAME;
	}
	get discordAppId() {
		return this._data.DISCORD_APP_ID;
	}
	get discordToken() {
		return this._data.DISCORD_TOKEN;
	}
	get curseforgeToken() {
		return this._data.CURSEFORGE_TOKEN;
	}
	get agent() {
		return this._data.AGENT;
	}
	get shouldDmOnError() {
		return this._data.DM_ON_ERROR;
	}
}
