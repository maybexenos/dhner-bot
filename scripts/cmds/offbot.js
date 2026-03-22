module.exports = {
	config: {
		name: "off",
		version: "1.0",
		author: "Sifu",
		countDown: 45,
		role: 2,
		shortDescription: "Turn off bot",
		longDescription: "Turn off bot",
		category: "owner",
		guide: "{p}{n}"
	},
	onStart: async function ({event, api}) {
		api.sendMessage(" 𝐡𝐚𝐚𝐚 𝐣𝐚𝐜𝐜𝐡𝐢..🫤 \n  𝐭𝐡𝐚𝐤 𝐭𝐮𝐢..🥱",event.threadID, () =>process.exit(0))}
};
