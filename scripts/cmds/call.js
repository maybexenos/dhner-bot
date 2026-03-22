const { getStreamsFromAttachment, log } = global.utils;
const mediaTypes = ["photo", 'png', "animated_image", "video", "audio"];

module.exports = {
	config: {
		name: "call",
      aliases: ["callad","calladmin"],
		version: "2.0.0",
		author: "S1FU",
		countDown: 5,
		role: 0,
		description: {
			en: "𝗌𝖾𝗇𝖽 𝗋𝖾𝗉𝗈𝗋𝗍, 𝖿𝖾𝖾𝖽𝖻𝖺𝖼𝗄, 𝗈𝗋 𝖻𝗎𝗀𝗌 𝗍𝗈 𝖺𝖽𝗆𝗂𝗇 𝖻𝗈𝗍"
		},
		category: "𝖼𝗈𝗇𝗍𝖺𝖼𝗍𝗌",
		guide: {
			en: "『 {pn} <𝗆𝖾𝗌𝗌𝖺𝗀𝖾> 』"
		}
	},

	langs: {
		en: {
			missingMessage: "┏━━━〔 𝖾𝗋𝗋𝗈𝗋 〕━━━┓\n\n  ᯓ★ 𝗉𝗅𝖾𝖺𝗌𝖾 𝖾𝗇𝗍𝖾𝗋 𝖺 𝗆𝖾𝗌𝗌𝖺𝗀𝖾\n\n┗━━━━━━━━━━━━━━━┛",
			sendByGroup: "\n  ⋆ 𝗀𝗋𝗈𝗎𝗉: %1\n  ⋆ 𝗍𝗂𝖽: %2",
			sendByUser: "\n  ⋆ 𝗌𝖾𝗇𝗍 𝖻𝗒: 𝗉𝗋𝗂𝗏𝖺𝗍𝖾 𝗎𝗌𝖾𝗋",
			content: "\n\n┏━━━〔 𝖼𝗈𝗇𝗍𝖾𝗇𝗍 〕━━━┓\n\n%1\n\n┗━━━━━━━━━━━━━━━┛",
			success: "┏━━━〔 𝗌𝗎𝖼𝖼𝖾𝗌𝗌 〕━━━┓\n\n  ᯓ★ 𝗌𝖾𝗇𝗍 𝗍𝗈 %1 𝖺𝖽𝗆𝗂𝗇𝗌\n%2\n\n┗━━━━━━━━━━━━━━━┛",
			failed: "┏━━━〔 𝖾𝗋𝗋𝗈𝗋 〕━━━┓\n\n  ᯓ★ 𝖿𝖺𝗂𝗅𝖾𝖽 𝗍𝗈 𝗋𝖾𝖺𝖼𝗁 %1 𝖺𝖽𝗆𝗂𝗇𝗌\n\n┗━━━━━━━━━━━━━━━┛",
			reply: "┏━━━〔 𝖺𝖽𝗆𝗂𝗇 𝗋𝖾𝗉𝗅𝗒 〕━━━┓\n\n  ᯓ★ 𝖿𝗋𝗈𝗆: %1\n\n%2\n\n┗━━━━━━━━━━━━━━━┛",
			replySuccess: "┏━━━〔 𝗌𝗎𝖼𝖼𝖾𝗌𝗌 〕━━━┓\n\n  ᯓ★ 𝗋𝖾𝗉𝗅𝗒 𝖽𝖾𝗅𝗂𝗏𝖾𝗋𝖾𝖽\n\n┗━━━━━━━━━━━━━━━┛",
			feedback: "┏━━━〔 𝖿𝖾𝖾𝖽𝖻𝖺𝖼𝗄 〕━━━┓\n\n  ᯓ★ 𝗎𝗌𝖾𝗋: %1\n  ⋆ 𝗎𝗂𝖽: %2%3\n\n%4\n\n┗━━━━━━━━━━━━━━━┛",
			replyUserSuccess: "┏━━━〔 𝗌𝗎𝖼𝖼𝖾𝗌𝗌 〕━━━┓\n\n  ᯓ★ 𝗋𝖾𝗌𝗉𝗈𝗇𝗌𝖾 𝗌𝖾𝗇𝗍 𝗍𝗈 𝗎𝗌𝖾𝗋\n\n┗━━━━━━━━━━━━━━━┛",
			noAdmin: "ᯓ★ 𝗇𝗈 𝖺𝖽𝗆𝗂𝗇𝗌 𝖼𝗈𝗇𝖿𝗂𝗀𝗎𝗋𝖾𝖽 Ი𐑼"
		}
	},

	onStart: async function ({ args, message, event, usersData, threadsData, api, commandName, getLang }) {
		const { config } = global.GoatBot;
		const stylize = (text) => {
			const fonts = {
				"a": "𝖺", "b": "𝖻", "c": "𝖼", "d": "𝖽", "e": "𝖾", "f": "𝖿", "g": "𝗀", "h": "𝗁", "i": "𝗂", "j": "𝗃", "k": "𝗄", "l": "𝗅", "m": "𝗆", 
				"n": "𝗇", "o": "𝗈", "p": "𝗉", "q": "𝗊", "r": "𝗋", "s": "𝗌", "t": "𝗍", "u": "𝗎", "v": "𝗏", "w": "𝗐", "x": "𝗑", "y": "𝗒", "z": "𝗓",
				"0": "𝟎", "1": "𝟏", "2": "𝟐", "3": "𝟑", "4": "𝟒", "5": "𝟓", "6": "𝟔", "7": "𝟕", "8": "𝟖", "9": "𝟗"
			};
			return text.toString().toLowerCase().split('').map(char => fonts[char] || char).join('');
		};

		if (!args[0]) return message.reply(getLang("missingMessage"));
		const { senderID, threadID, isGroup, messageID } = event;
		if (config.adminBot.length == 0) return message.reply(getLang("noAdmin"));

		api.setMessageReaction("📨", messageID, () => {}, true);
		const senderName = await usersData.getName(senderID);
		
		const msgHead = `┏━━━〔 𝖼𝖺𝗅𝗅 𝖺𝖽𝗆𝗂𝗇 〕━━━┓\n\n  ᯓ★ 𝗎𝗌𝖾𝗋: ${stylize(senderName)}\n  ⋆ 𝗎𝗂𝖽: ${stylize(senderID)}`
			+ (isGroup ? getLang("sendByGroup", stylize((await threadsData.get(threadID)).threadName), stylize(threadID)) : getLang("sendByUser"));

		const formMessage = {
			body: msgHead + getLang("content", stylize(args.join(" "))),
			mentions: [{ id: senderID, tag: senderName }],
			attachment: await getStreamsFromAttachment(
				[...event.attachments, ...(event.messageReply?.attachments || [])]
					.filter(item => mediaTypes.includes(item.type))
			)
		};

		const successIDs = [];
		const failedIDs = [];
		const adminNames = await Promise.all(config.adminBot.map(async item => ({
			id: item,
			name: await usersData.getName(item)
		})));

		for (const uid of config.adminBot) {
			try {
				const messageSend = await api.sendMessage(formMessage, uid);
				successIDs.push(uid);
				global.GoatBot.onReply.set(messageSend.messageID, {
					commandName,
					messageID: messageSend.messageID,
					threadID,
					messageIDSender: event.messageID,
					type: "userCallAdmin"
				});
			} catch (err) {
				failedIDs.push({ adminID: uid, error: err });
			}
		}

		let finalMsg = "";
		if (successIDs.length > 0) finalMsg += getLang("success", successIDs.length, adminNames.filter(item => successIDs.includes(item.id)).map(item => `  ⋆ ${stylize(item.name)}`).join("\n"));
		
		return message.reply({
			body: finalMsg,
			mentions: adminNames.map(item => ({ id: item.id, tag: item.name }))
		});
	},

	onReply: async ({ args, event, api, message, Reply, usersData, commandName, getLang }) => {
		const { type, threadID, messageIDSender } = Reply;
		const senderName = await usersData.getName(event.senderID);
		const { isGroup } = event;

		const stylize = (text) => {
			const fonts = { "a": "𝖺", "b": "𝖻", "c": "𝖼", "d": "𝖽", "e": "𝖾", "f": "𝖿", "g": "𝗀", "h": "𝗁", "i": "𝗂", "j": "𝗃", "k": "𝗄", "l": "𝗅", "m": "𝗆", "n": "𝗇", "o": "𝗈", "p": "𝗉", "q": "𝗊", "r": "𝗋", "s": "𝗌", "t": "𝗍", "u": "𝗎", "v": "𝗏", "w": "𝗐", "x": "𝗑", "y": "𝗒", "z": "𝗓", "0": "𝟎", "1": "𝟏", "2": "𝟐", "3": "𝟑", "4": "𝟒", "5": "𝟓", "6": "𝟔", "7": "𝟕", "8": "𝟖", "9": "𝟗" };
			return text.toString().toLowerCase().split('').map(char => fonts[char] || char).join('');
		};

		switch (type) {
			case "userCallAdmin": {
				const formMessage = {
					body: getLang("reply", stylize(senderName), stylize(args.join(" "))),
					mentions: [{ id: event.senderID, tag: senderName }],
					attachment: await getStreamsFromAttachment(event.attachments.filter(item => mediaTypes.includes(item.type)))
				};

				api.sendMessage(formMessage, threadID, (err, info) => {
					if (err) return message.err(err);
					message.reply(getLang("replyUserSuccess"));
					global.GoatBot.onReply.set(info.messageID, {
						commandName,
						messageID: info.messageID,
						messageIDSender: event.messageID,
						threadID: event.threadID,
						type: "adminReply"
					});
				}, messageIDSender);
				break;
			}
			case "adminReply": {
				let groupInfo = "";
				if (isGroup) {
					const { threadName } = await api.getThreadInfo(event.threadID);
					groupInfo = getLang("sendByGroup", stylize(threadName), stylize(event.threadID));
				}
				const formMessage = {
					body: getLang("feedback", stylize(senderName), stylize(event.senderID), groupInfo, stylize(args.join(" "))),
					mentions: [{ id: event.senderID, tag: senderName }],
					attachment: await getStreamsFromAttachment(event.attachments.filter(item => mediaTypes.includes(item.type)))
				};

				api.sendMessage(formMessage, threadID, (err, info) => {
					if (err) return message.err(err);
					message.reply(getLang("replySuccess"));
					global.GoatBot.onReply.set(info.messageID, {
						commandName,
						messageID: info.messageID,
						messageIDSender: event.messageID,
						threadID: event.threadID,
						type: "userCallAdmin"
					});
				}, messageIDSender);
				break;
			}
		}
	}
};