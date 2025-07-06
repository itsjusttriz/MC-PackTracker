import 'dotenv/config';
import { join } from 'node:path';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	out: './drizzle',
	schema: './src/drizzle/schema.ts',
	dialect: 'sqlite',
	dbCredentials: {
		url: `file:${path.join(__dirname, process.env.DB_FILE_NAME!)}`,
	},
});
