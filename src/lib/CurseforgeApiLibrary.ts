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

	private getEmbed(trackerId: string, pack: CurseforgeModpack) {
		const embed = new EmbedBuilder();
		embed.setColor('#b46000');
		embed.setAuthor({
			name: pack.name,
			iconURL: this.ICON_URL,
			url: pack.url,
		});
		embed.setDescription('New File Released!');
		embed.setThumbnail(pack.image);
		embed.addFields([
			{
				name: 'File Name',
				value: pack.latest.version,
				inline: true,
			},
			{
				name: 'Modloader',
				value: pack.latest.modloader,
				inline: true,
			},
		]);
		embed.setFooter({ text: `Tracker ID: ${trackerId}` });
		// embed.setTimestamp(now); //TODO: Change this to modpack update timestamp.

		return embed;
	}

	public testForVersionChange = async (
		dbItem: typeof schema.trackedModpacks.$inferSelect,
		modpack: CurseforgeModpack
	) => {
		const oldVersion = dbItem.latestModpackVersionId;
		const newMatchesOld =
			oldVersion && oldVersion === String(modpack.latest.id);
		if (newMatchesOld) return;

		const embed = this.getEmbed(dbItem.id, modpack);

		const visitButton = new ButtonBuilder();
		visitButton.setStyle(ButtonStyle.Link);
		visitButton.setLabel('Visit Project Page');
		visitButton.setURL(modpack.url);

		const actionRow = new ActionRowBuilder<ButtonBuilder>();
		actionRow.addComponents(visitButton);

		const discordBot = DiscordBot.getInstance();

		const guild = discordBot._client.guilds.cache.get(dbItem.guildId);
		const channel = guild!.channels.cache.get(
			dbItem.channelId
		) as GuildTextBasedChannel;

		const db = DrizzleDB.getInstance();

		if (!channel) {
			const msg =
				'[CurseforgeApi] Deleting tracker {tracker.id} from {guild.name} as channel {channel.id} no longer exists.'
					.replace('{tracker.id}', dbItem.id)
					.replace('{guild.name}', guild!.name)
					.replace('{channel.id}', dbItem.channelId);

			console.log(msg);

			await db.deleteTrackedModpackById(dbItem.id);
			return;
		}

		await channel
			.send({
				embeds: [embed],
				components: [actionRow],
			})
			.catch(async (error) => {
				const msg =
					'Failed to send update notification to {guild} -> {channel} -- Reason: {error}'
						.replace('{guild}', `[${guild.name}](${guild.id})`)
						.replace(
							'{channelId}',
							`[${channel.name}](${channel.id})`
						)
						.replace('{error}', error?.message || 'Unknown');

				await discordBot.dmOwner(msg);
			});

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

		for (const pack of modpacks) {
			if (!this.cache.has(+pack.modpackId)) {
				const { data } = await this.fetch(pack.modpackId);
				if (!data) continue;
				const converted = this.convertRequestData(data);
				this.cache.set(converted.id, converted);
			}
			await this.testForVersionChange(
				pack,
				this.cache.get(+pack.modpackId)!
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
