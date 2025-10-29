import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	type GuildTextBasedChannel,
} from 'discord.js';
import { DiscordBot } from '../discord';
import { DrizzleDB } from '../drizzle';
import type { schema } from '../drizzle/schema';
import { EnvService } from '../services/EnvService';
import { BaseApiLibrary } from './BaseApiLibrary';
import { error } from 'console';

type CurseforgeModpack = {
	id: number;
	name: string;
	url: string;
	image: string;
	latest: {
		id: number;
		modloader: string;
		version: string;
	};
};

export class CurseforgeApi extends BaseApiLibrary {
	private static instance: CurseforgeApi;

	public static getInstance() {
		if (!CurseforgeApi.instance)
			CurseforgeApi.instance = new CurseforgeApi();
		return CurseforgeApi.instance;
	}

	private cache = new Map<CurseforgeModpack['id'], CurseforgeModpack>();
	private ICON_URL =
		'https://pbs.twimg.com/profile_images/1739930019546165248/5KvWmfLN_400x400.jpg';

	constructor() {
		const env = EnvService.getInstance();
		super(env, 'https://api.curseforge.com/v1/mods');

		this.http.defaults.headers.get.Accept = 'application/json';
		this.http.defaults.headers.get['x-api-key'] = env.curseforgeToken;
	}

	public testForVersionChange = async (
		dbItem: typeof schema.trackedModpacks.$inferSelect,
		modpack: CurseforgeModpack,
		now: number
	) => {
		const oldVersion = dbItem.latestModpackVersionId;
		const newMatchesOld =
			oldVersion && oldVersion === String(modpack.latest.id);
		if (newMatchesOld) return;

		const embed = new EmbedBuilder()
			.setColor('#b46000')
			.setAuthor({
				name: modpack.name,
				iconURL: this.ICON_URL,
				url: modpack.url,
			})
			.setDescription('New File Released!')
			.setThumbnail(modpack.image)
			.addFields([
				{
					name: 'File Name',
					value: modpack.latest.version,
					inline: true,
				},
				{
					name: 'Modloader',
					value: modpack.latest.modloader,
					inline: true,
				},
			])
			.setFooter({ text: `Tracker ID: ${dbItem.id}` })
			.setTimestamp(now);

		const visitButton = new ButtonBuilder()
			.setStyle(ButtonStyle.Link)
			.setLabel('Visit Project Page')
			.setURL(modpack.url);

		const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
			visitButton
		);

		const discordBot = DiscordBot.getInstance();

		const guild = discordBot._client.guilds.cache.get(dbItem.guildId);
		const channel = guild!.channels.cache.get(
			dbItem.channelId
		) as GuildTextBasedChannel;

		const db = DrizzleDB.getInstance();

		if (channel) {
			await channel
				.send({
					embeds: [embed],
					components: [actionRow],
				})
				.catch((error) =>
					discordBot.dmOwner(
						`Failed to post in channel (${channel.guild.id}->${
							channel.id
						}): ${error.message || 'Unknown reason'}`
					)
				);
		} else {
			console.log(
				`[CurseforgeApi] Deleting tracker #${dbItem.id} from ${
					guild!.name
				} as channel #${dbItem.channelId} no longer exists.`
			);
			await db.deleteTrackedModpackById(dbItem.id);
			return;
		}

		const updatedInDb = await db.updateTrackedModpackLatestId(
			String(modpack.id),
			channel.id,
			guild!.id,
			String(modpack.latest.id)
		);
		if (!updatedInDb) {
			await channel.send(
				`Failed to update the latest version ID in the database. Please contact support about this.`
			);
		}
	};

	async startProcessing() {
		const db = DrizzleDB.getInstance();
		let modpacks = await db.getAllTrackedModpacks();
		modpacks = modpacks.filter((mp) => mp.launcher === 'curseforge');

		const startTime = Date.now();

		for (const pack of modpacks) {
			if (!this.cache.has(+pack.modpackId)) {
				const { data } = await this.fetch(pack.modpackId);
				if (!data) continue;
				const converted = this.convertRequestData(data);
				this.cache.set(converted.id, converted);
			}
			await this.testForVersionChange(
				pack,
				this.cache.get(+pack.modpackId)!,
				startTime
			);
			await new Promise((res) => setTimeout(res, 5000));
		}
		if (!!this.cache.size) this.cache.clear();
	}

	public convertRequestData(data: Record<string, any>) {
		const newData = {
			id: data.id,
			name: data.name,
			url: `https://www.curseforge.com/minecraft/modpacks/${data.slug}`,
			image: data.logo.url,
		} as CurseforgeModpack;

		const latest = data.latestFiles.sort(
			(a: any, b: any) =>
				new Date(b.fileDate).getTime() - new Date(a.fileDate).getTime()
		)[0];

		newData.latest = {
			id: latest.id,
			modloader: latest.gameVersions?.join(', '),
			version: latest.fileName,
		};

		return newData;
	}
}
