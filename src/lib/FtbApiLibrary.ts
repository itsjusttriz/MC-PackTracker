import { DiscordBot } from '../discord';
import { DrizzleDB } from '../drizzle';
import type { schema } from '../drizzle/schema';
import { EnvService } from '../services/EnvService';
import { Helpers } from '../util/helpers';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	type GuildTextBasedChannel,
} from 'discord.js';
import { BaseApiLibrary } from './BaseApiLibrary';

type FTBModpack = {
	id: number;
	name: string;
	url: string;
	type: string;
	image: string;
	latest: {
		id: number;
		modloader: string;
		version: string;
	};
};

export class FtbApi extends BaseApiLibrary {
	private static instance: FtbApi;

	public static getInstance() {
		if (!FtbApi.instance) FtbApi.instance = new FtbApi();
		return FtbApi.instance;
	}

	private cache = new Map<FTBModpack['id'], FTBModpack>();
	private ICON_URL =
		'https://avatars.githubusercontent.com/u/26458395?s=500&v=4';

	constructor() {
		const env = EnvService.getInstance();
		super(env, 'https://api.feed-the-beast.com/v1/modpacks/public/modpack');
	}

	public testForVersionChange = async (
		dbItem: typeof schema.trackedModpacks.$inferSelect,
		modpack: FTBModpack,
		now: number
	) => {
		const oldVersion = dbItem.latestModpackVersionId;
		const newMatchesOld =
			oldVersion && oldVersion === String(modpack.latest.id);
		if (newMatchesOld) return;

		const embed = new EmbedBuilder()
			.setColor('#5c1f19')
			.setAuthor({
				name: modpack.name,
				iconURL: this.ICON_URL,
				url: modpack.url,
			})
			.setDescription('New File Released!')
			.setThumbnail(modpack.image)
			.addFields([
				{
					name: 'Version',
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

		const db = DrizzleDB.getInstance();

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
		modpacks = modpacks.filter((mp) => mp.launcher === 'ftb');

		const startTime = Date.now();

		for (const pack of modpacks) {
			if (!this.cache.has(+pack.modpackId)) {
				const data = await this.fetch(pack.modpackId);
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
			url: `https://www.feed-the-beast.com/modpacks/${data.id}-${data.slug}?tab=versions`,
			type: data.type,
			image: data.art.find(
				(art: Record<string, any>) => art.title.toLowerCase() === 'logo'
			).url,
		} as FTBModpack;

		const latest = data.versions.sort(
			(a: any, b: any) => b.released - a.released
		)[0];

		newData.latest = {
			id: latest.id,
			modloader: this.extractModloaderLabel(latest),
			version: latest.name,
		};

		return newData;
	}

	private extractModloaderLabel(data: Record<string, any>) {
		const loader = data.targets.find(
			(target: any) => target.type === 'modloader'
		);

		const name = Helpers.normalize(loader.name);
		const [major, minor] = (loader.version as string).split('.');

		return `${name}, 1.${major}.${minor}`;
	}
}
