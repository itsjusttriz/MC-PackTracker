import * as Discord from 'discord.js';
import * as Client from '../../client';

export const set = (c: Client.HandlerContext['client']) =>
	new Promise((res) => {
		try {
			c.user!.setActivity('feed-the-beast.com/modpacks/', {
				type: Discord.ActivityType.Watching,
			});
			res(true);
		} catch (error) {
			console.error('Failed to set activity:', error);
			res(false);
		}
	});
