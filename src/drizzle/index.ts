import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql/node';
import { EnvService } from '../services/EnvService';
import { schema } from './schema';
import { resolve } from 'node:path';

export class DrizzleDB {
	private static instance: DrizzleDB;

	private db;

	get _schema() {
		return schema;
	}

	public static getInstance() {
		if (!DrizzleDB.instance) {
			DrizzleDB.instance = new DrizzleDB();
		}
		return DrizzleDB.instance;
	}

	private constructor() {
		const env = EnvService.getInstance();
		this.db = drizzle(
			'file:' + resolve(__dirname, '../../', env.dbFileName),
			{
				schema,
			}
		);
	}

	getGuildSettings = (id: string) => {
		return this.db
			.select()
			.from(schema.guildSettings)
			.where(eq(schema.guildSettings.guildId, id));
	};

	createGuildSettings = async (guildId: string, roleId: string) => {
		const query = await this.db.insert(schema.guildSettings).values({
			guildId,
			editorRoleId: roleId,
		});

		return !!query.rowsAffected;
	};

	deleteTrackedModpackById = async (id: string) => {
		const query = await this.db
			.delete(schema.trackedModpacks)
			.where(eq(schema.trackedModpacks.id, id));

		return !!query.rowsAffected;
	};

	getTrackedModpackById = (id: string) => {
		return this.db
			.select()
			.from(schema.trackedModpacks)
			.where(eq(schema.trackedModpacks.id, id));
	};

	getTrackedModpack = (
		modpackId: string,
		channelId: string,
		guildId: string
	) => {
		return this.db
			.select()
			.from(schema.trackedModpacks)
			.where(
				and(
					eq(schema.trackedModpacks.modpackId, modpackId),
					eq(schema.trackedModpacks.channelId, channelId),
					eq(schema.trackedModpacks.guildId, guildId)
				)
			);
	};

	getAllTrackedModpacks = () => {
		return this.db.select().from(schema.trackedModpacks);
	};

	getTrackedModpacks = (guildId: string) => {
		return this.db
			.select()
			.from(schema.trackedModpacks)
			.where(eq(schema.trackedModpacks.guildId, guildId));
	};

	addTrackedModpack = async (
		launcher: 'ftb' | 'curseforge',
		modpackId: string,
		channelId: string,
		guildId: string,
		trackerAuthorId: string
	) => {
		const query = await this.db.insert(schema.trackedModpacks).values({
			launcher,
			modpackId,
			channelId,
			guildId,
			trackerAuthorId,
		});
		return !!query.rowsAffected;
	};

	updateTrackedModpackLatestId = async (
		modpackId: string,
		channelId: string,
		guildId: string,
		fileId: string
	) => {
		const query = await this.db
			.update(schema.trackedModpacks)
			.set({
				latestModpackVersionId: fileId,
			})
			.where(
				and(
					eq(schema.trackedModpacks.modpackId, modpackId),
					eq(schema.trackedModpacks.channelId, channelId),
					eq(schema.trackedModpacks.guildId, guildId)
				)
			);

		return !!query.rowsAffected;
	};
}
