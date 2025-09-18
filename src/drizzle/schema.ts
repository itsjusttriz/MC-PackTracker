import { sqliteTable, text, int } from 'drizzle-orm/sqlite-core';
import { Helpers } from '../util/helpers';

export const schema = {
	guildSettings: sqliteTable('guild_settings', {
		guildId: text().notNull().unique().primaryKey(),
		editorRoleId: text(),
	}),

	trackedModpacks: sqliteTable('tracked_modpacks', {
		id: text()
			.unique()
			.primaryKey()
			.$defaultFn(() => Helpers.uid()),
		launcher: text().$type<'curseforge' | 'ftb' | 'undefined'>(),
		modpackId: text().notNull(),
		latestModpackVersionId: text(),
		channelId: text().notNull(),
		guildId: text().notNull(),
		trackerAuthorId: text().notNull(),
		createdAt: int()
			.notNull()
			.$defaultFn(() => Date.now()),
	}),
};
