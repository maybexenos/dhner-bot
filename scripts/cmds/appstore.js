const itunes = require("searchitunes");

module.exports = {
	config: {
		name: "appstore",
		version: "2.5",
		author: "S1FU",
		countDown: 5,
		role: 0,
		shortDescription: {
			en: "𝖿𝗎𝗍𝗎𝗋𝗂𝗌𝗍𝗂𝖼 𝖺𝗉𝗉 𝗌𝖾𝖺𝗋𝖼𝗁 𝖾𝗇𝗀𝗂𝗇𝖾"
		},
		longDescription: {
			en: "𝗌𝖾𝖺𝗋c𝗁 𝖿𝗈𝗋 𝖺𝗉𝗉𝗌 𝗈𝗇 𝗍𝗁𝖾 𝖺𝗉𝗉𝗅𝖾 𝖺𝗉𝗉 𝗌𝗍𝗈𝗋𝖾 𝗐𝗂𝗍𝗁 𝖽𝗂𝗀𝗂𝗍𝖺𝗅 𝗂𝗇𝗍𝖾𝗋𝖿𝖺𝖼𝖾"
		},
		category: "𝗌𝗈𝖿𝗍𝗐𝖺𝗋𝖾",
		guide: {
			en: "『 {pn} <𝗄𝖾𝗒𝗐𝗈𝗋𝖽> 』"
		},
		envConfig: {
			limitResult: 3
		}
	},

	onStart: async function ({ message, args, commandName, envCommands, api }) {
		const { getStreamFromURL } = global.utils;
		const query = args.join(" ");

		if (!query) {
			return message.reply("┏━━━〔 𝗌𝗒𝗌𝗍𝖾𝗆 〕━━━┓\n\n  ᯓ★ 𝗄𝖾𝗒𝗐𝗈𝗋𝖽 𝗂𝗌 𝗋𝖾𝗊𝗎𝗂𝗋𝖾𝖽 .ᐟ\n  ⋆ 𝖾𝗑𝖺𝗆𝗉𝗅𝖾: {pn} 𝖿𝖺𝖼𝖾𝖻𝗈𝗈𝗄\n\n┗━━━━━━━━━━━━━━━┛");
		}

		api.setMessageReaction("🔍", message.messageID, () => {}, true);

		try {
			const data = await itunes({
				entity: "software",
				country: "US", // 𝖦𝗅𝗈𝖻𝖺𝗅 𝗌𝖾𝖺𝗋𝗼𝗁 𝖿𝗈𝗋 𝗆𝗈𝗋𝖾 𝗋𝖾𝗌𝗎𝗅𝗍𝗌
				term: query,
				limit: envCommands[commandName].limitResult
			});

			const results = data.results;

			if (results.length > 0) {
				let msg = `┏━━━〔 𝖺𝗉𝗉 𝗌𝖾𝖺𝗋𝖼𝗁 〕━━━┓\n\n`;
				const pendingImages = [];

				for (const app of results) {
					const rating = app.averageUserRating ? app.averageUserRating.toFixed(1) : "𝟢.𝟢";
					const price = app.formattedPrice === "Free" ? "𝖿𝗋𝖾𝖾" : app.formattedPrice;
					
					msg += `  ᯓ★ 𝗇𝖺𝗆𝖾: ${app.trackCensoredName}\n`;
					msg += `  ⋆ 𝖽𝖾𝗏: ${app.artistName}\n`;
					msg += `  ⋆ 𝗉𝗋𝗂𝖼𝖾: ${price}\n`;
					msg += `  ⋆ 𝗋𝖺𝗍𝗂𝗇𝗀: ${rating}/𝟧.𝟢 Ი𐑼\n`;
					msg += `  ⋆ 𝗅𝗂𝗇𝗄: ${app.trackViewUrl}\n\n`;

					pendingImages.push(getStreamFromURL(app.artworkUrl512 || app.artworkUrl100));
				}

				msg += `┗━━━━━━━━━━━━━━━┛`;

				const attachments = await Promise.all(pendingImages);
				return message.reply({ body: msg, attachment: attachments });
			} else {
				return message.reply(`ᯓ★ 𝗇𝗈 𝖽𝗂𝗀𝗂𝗍𝖺𝗅 𝗋𝖾𝖼𝗈𝗋𝖽𝗌 𝖿𝗈𝗎𝗇𝖽 𝖿𝗈𝗋 "${query}" Ი𐑼`);
			}
		} catch (err) {
			console.error(err);
			return message.reply("ᯓ★ 𝖼𝗈𝗇𝗇𝖾𝖼𝗍𝗂𝗈𝗇 𝗍𝗈 𝖺𝗉𝗉𝗌𝗍𝗈𝗋𝖾 𝖿𝖺𝗂𝗅𝖾𝖽 Ი𐑼");
		}
	}
};