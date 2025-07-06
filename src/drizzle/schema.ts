import * as SQLite from 'drizzle-orm/sqlite-core';

import * as Util from '../util';

export const guildSettings = SQLite.sqliteTable('guild_settings', {
	guildId: SQLite.text().notNull().unique().primaryKey(),
	editorRoleId: SQLite.text().unique(),
});

export const trackedModpacks = SQLite.sqliteTable('tracked_modpacks', {
	id: SQLite.text()
		.unique()
		.primaryKey()
		.$defaultFn(() => Util.Helpers.uid()),
	modpackId: SQLite.text().notNull(),
	latestModpackVersionId: SQLite.text(),
	channelId: SQLite.text().notNull(),
	guildId: SQLite.text().notNull(),
	trackerAuthorId: SQLite.text().notNull(),
	createdAt: SQLite.int()
		.notNull()
		.$defaultFn(() => Date.now()),
});
