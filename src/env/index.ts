import * as z from 'zod';
import * as dotenv from 'dotenv';
import * as path from 'node:path';

dotenv.config({
	path: path.resolve(__dirname, '../../.env'),
});

const schema = z.object({
	DB_FILE_NAME: z.string().nonempty('DB_FILE_NAME is required'),
	DISCORD_APP_ID: z.string().nonempty('DISCORD_APP_ID is required'),
	DISCORD_TOKEN: z.string().nonempty('DISCORD_TOKEN is required'),
	AGENT: z.string(),
});
export type Env = z.infer<typeof schema>;

const env = schema.safeParse(process.env);
if (!env.success) {
	throw new Error(
		`Environment variable validation failed: ${JSON.stringify(
			env.error.flatten()
		)}`
	);
}

export default env.data as Env;
