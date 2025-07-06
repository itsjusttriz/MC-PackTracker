import * as Util from '../util';

export type ConvertedRequestData = {
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

export const extractModloaderLabel = (data: Record<string, any>) => {
	const loader = data.targets.find(
		(target: any) => target.type === 'modloader'
	);

	const name = Util.Helpers.normalize(loader.name);
	const [major, minor] = (loader.version as string).split('.');

	return `${name}, 1.${major}.${minor}`;
};

export const convertRequestData = (data: Record<string, any>) => {
	const newData = {
		id: data.id,
		name: data.name,
		url: `https://www.feed-the-beast.com/modpacks/${data.id}-${data.slug}?tab=versions`,
		type: data.type,
		image: data.art.find(
			(art: Record<string, any>) => art.title.toLowerCase() === 'logo'
		).url,
	} as ConvertedRequestData;

	const latest = data.versions.sort(
		(a: any, b: any) => b.released - a.released
	)[0];

	newData.latest = {
		id: latest.id,
		modloader: extractModloaderLabel(latest),
		version: latest.name,
	};

	return newData;
};
