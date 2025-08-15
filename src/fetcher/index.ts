import axios from 'axios';
import * as Discord from 'discord.js';

import * as Drizzle from '../drizzle';
import Env from '../env';

import * as Helpers from './helpers';
export * as Helpers from './helpers';

export const client = axios.create({
	baseURL: 'https://api.feed-the-beast.com/v1/modpacks/public/modpack',
	timeout: 1000,
	headers: { 'User-Agent': Env.AGENT },
});

export const fetch = async (id: string) => {
	try {
		const req = await client.get(`/${id}`, {
			validateStatus: function (status) {
				return status < 300; // Resolve only if the status code is less than 300
			},
		});
		return req.data;
	} catch (error: any) {
		console.error(
			'Error fetching modpack:',
			id,
			'-',
			error.response.status,
			error.response.statusText
		);
		return null;
	}
};

const idCache = new Map<
	Helpers.ConvertedRequestData['id'],
	Helpers.ConvertedRequestData
>();

export const startProcessing = async (c: Discord.Client) => {
	const modpacks = await Drizzle.getAllTrackedModpacks();
	const startTime = Date.now();

	for (const pack of modpacks) {
		if (!idCache.has(+pack.modpackId)) {
			const data = await fetch(pack.modpackId);
			if (!data) continue;

			const converted = Helpers.convertRequestData(data);
			idCache.set(converted.id, converted);
		}

		await testForVersionChange(
			c,
			pack,
			idCache.get(+pack.modpackId)!,
			startTime
		);
		await new Promise((res) => setTimeout(res, 5000));
	}

	if (!!idCache.size) idCache.clear();
};

export const testForVersionChange = async (
	c: Discord.Client,
	dbItem: typeof Drizzle.Schema.trackedModpacks.$inferSelect,
	modpack: Helpers.ConvertedRequestData,
	now: number
) => {
	const oldVersion = dbItem.latestModpackVersionId;
	const newMatchesOld =
		oldVersion && oldVersion === String(modpack.latest.id);
	if (newMatchesOld) return;

	const embed = new Discord.EmbedBuilder()
		.setColor('#5c1f19')
		.setAuthor({
			name: modpack.name,
			iconURL:
				'https://avatars.githubusercontent.com/u/26458395?s=500&v=4',
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

	const visitButton = new Discord.ButtonBuilder()
		.setStyle(Discord.ButtonStyle.Link)
		.setLabel('Visit Project Page')
		.setURL(modpack.url);

	const actionRow =
		new Discord.ActionRowBuilder<Discord.ButtonBuilder>().addComponents(
			visitButton
		);

	const guild = c.guilds.cache.get(dbItem.guildId);
	const channel = guild!.channels.cache.get(
		dbItem.channelId
	) as Discord.GuildTextBasedChannel;
	await channel.send({
		embeds: [embed],
		components: [actionRow],
	});

	const updatedInDb = await Drizzle.updateTrackedModpackLatestId(
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
