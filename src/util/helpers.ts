export class Helpers {
	static normalize(s: string) {
		return s
			.split('')
			.map((letter, i) => (i === 0 ? letter.toUpperCase() : letter))
			.join('');
	}

	static uid(length = 12) {
		const characters =
			'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let uniqueString = '';
		for (let i = 0; i < length; i++) {
			const randomIndex = Math.floor(Math.random() * characters.length);
			uniqueString += characters[randomIndex];
		}
		return uniqueString;
	}

	static wait(ms: number) {
		return new Promise((res) => setTimeout(res, ms));
	}
}
