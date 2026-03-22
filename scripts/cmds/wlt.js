const fs = require("fs-extra");

module.exports = {
  config: {
    name: "wlthread",
    aliases: ["wlt", "threadwhitelist"],
    version: "1.1",
    author: "乛 Xꫀᥒos ゎ",
    countDown: 5,
    role: 2, // Admin only
    description: "Manage authorized groups (threads) allowed to use the bot.",
    category: "owner",
    guide: {
      en: "『 ᴛʜʀᴇᴀᴅ ᴡʜɪᴛᴇʟɪꜱᴛ ᴘᴀɴᴇʟ 』" +
        "\n  ◸ ᴀᴅᴅ ◿ {pn} add <tid>" +
        "\n  ◸ ʀᴇᴍᴏᴠᴇ ◿ {pn} rm <tid>" +
        "\n  ◸ ᴠɪᴇᴡ ◿ {pn} list" +
        "\n  ◸ ᴛᴏɢɢʟᴇ ◿ {pn} on/off"
    }
  },

  langs: {
    en: {
      added: "『 ⚡ ᴛʜʀᴇᴀᴅ ᴀᴜᴛʜᴏʀɪᴢᴇᴅ ⚡ 』\n━━━━━━━━━━━━━━━━━━\n◈ ᴅᴀᴛᴀ: ɴᴇᴡ ɢʀᴏᴜᴘ ᴀᴅᴅᴇᴅ\n┝ ɴᴀᴍᴇ: %1\n┝ ᴛɪᴅ: %2\n━━━━━━━━━━━━━━━━━━\n✨ ᴛʜɪs ɢʀᴏᴜᴘ ᴄᴀɴ ɴᴏᴡ ᴜsᴇ ᴛʜᴇ ʙᴏᴛ.",
      removed: "『 🛡️ ᴛʜʀᴇᴀᴅ ᴘᴜʀɢᴇᴅ 🛡️ 』\n━━━━━━━━━━━━━━━━━━\n✅ ᴛɪᴅ [ %1 ] ʜᴀs ʙᴇᴇɴ ʀᴇᴍᴏᴠᴇᴅ.\n━━━━━━━━━━━━━━━━━━\n⚠️ ʙᴏᴛ ᴡɪʟʟ ɴᴏ ʟᴏɴɢᴇʀ ᴡᴏʀᴋ ʜᴇʀᴇ.",
      listWL: "『 🖥️ ᴛʜʀᴇᴀᴅ ᴡʜɪᴛᴇʟɪꜱᴛ ᴅᴀsʜʙᴏᴀʀᴅ 』\n━━━━━━━━━━━━━━━━━━\n%1\n━━━━━━━━━━━━━━━━━━\n📊 ᴛᴏᴛᴀʟ ᴀᴜᴛʜᴏʀɪᴢᴇᴅ ɢʀᴏᴜᴘs: %2",
      status: "『 ⚙️ Whitelist System 』\n━━━━━━━━━━━━━━━━━━\n◈ Status: %1\n━━━━━━━━━━━━━━━━━━\n💡 Use 'on' or 'off' to toggle the system."
    }
  },

  onStart: async function ({ message, args, threadsData, event, getLang }) {
    const config = global.GoatBot.config;
    
    // Initialize structure if not exists
    if (!config.whiteListThread) {
        config.whiteListThread = {
            enable: false,
            whiteListThreadIds: []
        };
    }

    const action = args[0]?.toLowerCase();

    switch (action) {
      case "on": {
        config.whiteListThread.enable = true;
        fs.writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
        return message.reply(getLang("status", "✅ ENABLED"));
      }

      case "off": {
        config.whiteListThread.enable = false;
        fs.writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
        return message.reply(getLang("status", "❌ DISABLED"));
      }

      case "add":
      case "-a": {
        const { whiteListThreadIds } = config.whiteListThread;
        let tid = args[1] || event.threadID;

        if (whiteListThreadIds.includes(tid)) return message.reply("🤦 ᴛʜɪs ᴛʜʀᴇᴀᴅ ɪs ᴀʟʀᴇᴀᴅʏ ᴡʜɪᴛᴇʟɪsᴛᴇᴅ.");

        whiteListThreadIds.push(tid);
        const threadName = (await threadsData.get(tid))?.threadName || "Unknown Thread";

        fs.writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
        return message.reply(getLang("added", threadName, tid));
      }

      case "remove":
      case "rm":
      case "-r": {
        const { whiteListThreadIds } = config.whiteListThread;
        let tid = args[1] || event.threadID;

        const index = whiteListThreadIds.indexOf(tid);
        if (index === -1) return message.reply("👽🙏 ᴛʜɪs ᴛʜʀᴇᴀᴅ ɪs ɴᴏᴛ ɪɴ ᴛʜᴇ ᴅᴀᴛᴀʙᴀsᴇ.");

        whiteListThreadIds.splice(index, 1);
        fs.writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
        return message.reply(getLang("removed", tid));
      }

      case "list":
      case "-l": {
        const { whiteListThreadIds, enable } = config.whiteListThread;
        if (whiteListThreadIds.length === 0) return message.reply("📪 ᴛʜʀᴇᴀᴅ ᴡʜɪᴛᴇʟɪꜱᴛ ɪs ᴇᴍᴘᴛʏ.");
        
        let listStr = `Status: ${enable ? "ON" : "OFF"}\n\n`;
        for (const tid of whiteListThreadIds) {
          const threadInfo = await threadsData.get(tid);
          const name = threadInfo?.threadName || "Unknown Thread";
          listStr += `┝ 🏛️ ${name}\n┝ 🆔 ${tid}\n\n`;
        }

        return message.reply(getLang("listWL", listStr, whiteListThreadIds.length));
      }

      default:
        return message.SyntaxError();
    }
  }
};
