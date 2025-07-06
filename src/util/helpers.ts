export const uid = (length: number = 12) => {
	const characters =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let uniqueString = '';
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		uniqueString += characters[randomIndex];
	}
	return uniqueString;
};

export const normalize = (s: string) =>
	s
		.split('')
		.map((letter, i) => (i === 0 ? letter.toUpperCase() : letter))
		.join('');
