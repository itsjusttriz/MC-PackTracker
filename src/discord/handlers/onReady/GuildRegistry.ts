import * as Client from '../..';

export const log = (c: Client.HandlerContext['client']) =>
	new Promise(async (res) => {
		try {
			(await c.guilds.fetch())
				.map((g) => [g.name, `(${g.id})`].join(' '))
				.forEach((g) => console.log('Recognising Guild: ', g));
			res(true);
		} catch (error) {
			console.error('Failed to log guilds:', error);
			res(false);
		}
	});
