const { writeFileSync } = require("fs-extra");

module.exports = {
	config: {
		name: "typing",
		version: "1.0",
		author: "Custom",
		countDown: 3,
		role: 1,
		description: {
			en: "Toggle typing indicator on/off for this thread or globally"
		},
		category: "box chat",
		guide: {
			en: "   {pn} on  — Enable typing indicator for this thread"
				+ "\n   {pn} off — Disable typing indicator for this thread"
				+ "\n   {pn} on -g  — Enable globally (admin bot only)"
				+ "\n   {pn} off -g — Disable globally (admin bot only)"
				+ "\n   {pn} status — Show current status"
		}
	},

	langs: {
		en: {
			threadOn: "✅ Typing indicator turned ON for this thread.",
			threadOff: "🔴 Typing indicator turned OFF for this thread.",
			threadReset: "🔄 Typing indicator reset to global setting for this thread.",
			globalOn: "✅ Typing indicator turned ON globally.",
			globalOff: "🔴 Typing indicator turned OFF globally.",
			status: "📋 Typing Indicator Status:\n• Global: %1\n• This Thread: %2",
			noPermission: "⛔ Only bot admins can change the global setting.",
			usage: "❓ Usage: {pn} [on | off | reset | status] [-g for global]"
		}
	},

	onStart: async function ({ api, event, args, message, getLang, threadsData, role }) {
		const { config } = global.GoatBot;
		const { threadID } = event;

		const subCmd = (args[0] || "").toLowerCase();
		const isGlobal = args.includes("-g");

		if (!subCmd || subCmd === "status") {
			const globalStatus = config.typingIndicator?.enable !== false ? "ON ✅" : "OFF 🔴";
			const threadData = global.db.allThreadData.find(t => t.threadID == threadID);
			const threadTyping = threadData?.data?.typingIndicator;
			const threadStatus = threadTyping === undefined
				? `Default (follows global: ${globalStatus})`
				: threadTyping ? "ON ✅" : "OFF 🔴";
			return message.reply(getLang("status", globalStatus, threadStatus));
		}

		if (subCmd !== "on" && subCmd !== "off" && subCmd !== "reset") {
			return message.reply(getLang("usage"));
		}

		if (isGlobal) {
			if (role < 2) return message.reply(getLang("noPermission"));

			if (!config.typingIndicator) config.typingIndicator = {};
			if (subCmd === "on") {
				config.typingIndicator.enable = true;
				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
				return message.reply(getLang("globalOn"));
			} else if (subCmd === "off") {
				config.typingIndicator.enable = false;
				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
				return message.reply(getLang("globalOff"));
			}
		} else {
			const threadData = global.db.allThreadData.find(t => t.threadID == threadID);
			if (!threadData) return;

			if (subCmd === "on") {
				threadData.data.typingIndicator = true;
				await threadsData.set(threadID, threadData.data, "data");
				return message.reply(getLang("threadOn"));
			} else if (subCmd === "off") {
				threadData.data.typingIndicator = false;
				await threadsData.set(threadID, threadData.data, "data");
				return message.reply(getLang("threadOff"));
			} else if (subCmd === "reset") {
				delete threadData.data.typingIndicator;
				await threadsData.set(threadID, threadData.data, "data");
				return message.reply(getLang("threadReset"));
			}
		}
	}
};
