import * as DrizzleNode from 'drizzle-orm/libsql/node';
import * as LibSQL from '@libsql/client';
import * as Drizzle from 'drizzle-orm';
import * as path from 'node:path';

import Env from '../env';

import * as Schema from './schema';
export * as Schema from './schema';

const client = LibSQL.createClient({
	url: `file:${path.resolve(__dirname, '../../', Env.DB_FILE_NAME)}`,
});
export const db = DrizzleNode.drizzle({
	client,
	schema: Schema,
});

export const getGuildSettings = (id: string) => {
	return db
		.select()
		.from(Schema.guildSettings)
		.where(Drizzle.eq(Schema.guildSettings.guildId, id));
};

export const createGuildSettings = async (guildId: string, roleId: string) => {
	const query = await db.insert(Schema.guildSettings).values({
		guildId,
		editorRoleId: roleId,
	});

	return !!query.rowsAffected;
};

export const deleteTrackedModpackById = async (id: string) => {
	const query = await db
		.delete(Schema.trackedModpacks)
		.where(Drizzle.eq(Schema.trackedModpacks.id, id));

	return !!query.rowsAffected;
};

export const getTrackedModpackById = (id: string) => {
	return db
		.select()
		.from(Schema.trackedModpacks)
		.where(Drizzle.eq(Schema.trackedModpacks.id, id));
};

export const getTrackedModpack = (
	modpackId: string,
	channelId: string,
	guildId: string
) => {
	return db
		.select()
		.from(Schema.trackedModpacks)
		.where(
			Drizzle.and(
				Drizzle.eq(Schema.trackedModpacks.modpackId, modpackId),
				Drizzle.eq(Schema.trackedModpacks.channelId, channelId),
				Drizzle.eq(Schema.trackedModpacks.guildId, guildId)
			)
		);
};

export const getAllTrackedModpacks = () => {
	return db.select().from(Schema.trackedModpacks);
};

export const getTrackedModpacks = (guildId: string) => {
	return db
		.select()
		.from(Schema.trackedModpacks)
		.where(Drizzle.eq(Schema.trackedModpacks.guildId, guildId));
};

export const addTrackedModpack = async (
	modpackId: string,
	channelId: string,
	guildId: string,
	trackerAuthorId: string
) => {
	const query = await db.insert(Schema.trackedModpacks).values({
		modpackId,
		channelId,
		guildId,
		trackerAuthorId,
	});
	return !!query.rowsAffected;
};

export const updateTrackedModpackLatestId = async (
	modpackId: string,
	channelId: string,
	guildId: string,
	fileId: string
) => {
	const query = await db
		.update(Schema.trackedModpacks)
		.set({
			latestModpackVersionId: fileId,
		})
		.where(
			Drizzle.and(
				Drizzle.eq(Schema.trackedModpacks.modpackId, modpackId),
				Drizzle.eq(Schema.trackedModpacks.channelId, channelId),
				Drizzle.eq(Schema.trackedModpacks.guildId, guildId)
			)
		);

	return !!query.rowsAffected;
};
