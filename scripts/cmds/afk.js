const afkUsers = new Map();
const moment = require("moment");

module.exports = {
  config: {
    name: "afk",
    version: "2.0",
    author: "S1FU",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "𝗌𝖾𝗍 𝖺𝖿𝗄 𝗌𝗍𝖺𝗍𝗎𝗌 𝗐𝗂𝗍𝗁 𝖺𝖾𝗌𝗍𝗁𝖾𝗍𝗂𝖼 𝗌𝗒𝗆𝖻𝗈𝗅𝗌"
    },
    description: {
      en: "𝗅𝖾𝗍 𝗈𝗍𝗁𝖾𝗋𝗌 𝗄𝗇𝗈𝗐 𝗒𝗈𝗎 𝖺𝗋𝖾 𝖺𝗐𝖺𝗒 𝗎𝗌𝗂𝗇𝗀 𝗋𝖺𝗋𝖾 𝖽𝖾𝗌𝗂𝗀𝗇𝗌"
    },
    category: "𝗌𝗒𝗌𝗍𝖾𝗆",
    guide: {
      en: "『 {pn} [𝗋𝖾𝖺𝗌𝗈𝗇] 』 𝗈𝗋 『 {pn} 𝖻𝖺𝖼𝗄 』"
    }
  },

  onStart: async function ({ event, message, args }) {
    const uid = event.senderID;
    const isBack = args[0]?.toLowerCase() === "back";

    if (isBack) {
      if (afkUsers.has(uid)) {
        afkUsers.delete(uid);
        return message.reply(`┏━━━〔 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗕𝗔𝗖𝗞 〕━━━┓\n┣ 𝗌𝗍𝖺𝗍𝗎𝗌 : 𝖺𝖼𝗍𝗂𝗏𝖾\n┣ 𝗒𝗈𝗎 𝖺𝗋𝖾 𝗇𝗈 𝗅𝗈𝗇𝗀𝖾𝗋 𝖺𝖿𝗄 ⋆\n┗━━━━━━━━━━━━━━━┛`);
      } else {
        return message.reply(`┏━━━〔 𝗔𝗙𝗞 〕━━━┓\n┣ 𝗒𝗈𝗎 𝖺𝗋𝖾 𝗇𝗈𝗍 𝖺𝖿𝗄 𝗋𝗂𝗀𝗁𝗍 𝗇𝗈𝗐\n┗━━━━━━━━━━━━━━━┛`);
      }
    }

    const reason = args.join(" ") || "𝗇𝗈 𝗋𝖾𝖺𝗌𝗈𝗇 𝗉𝗋𝗈𝗏𝗂𝖽𝖾𝖽";
    afkUsers.set(uid, {
      reason,
      time: Date.now()
    });

    return message.reply(`┏━━━〔 𝗔𝗙𝗞 𝗦𝗘𝗧 〕━━━┓\n┣ 𝗌𝗍𝖺𝗍𝗎𝗌 : 𝖺𝖿𝗄 𝖺𝖼𝗍𝗂𝗏𝖺𝗍𝖾𝖽\n┣ 𝗋𝖾𝖺𝗌𝗈𝗇 : ${reason}\n┗━━━━━━━━━━━━━━━┛`);
  },

  onChat: async function ({ event, message, usersData }) {
    if (!event.mentions || Object.keys(event.mentions).length === 0) return;

    const mentions = Object.keys(event.mentions);
    const now = Date.now();

    for (const uid of mentions) {
      if (afkUsers.has(uid)) {
        const { reason, time } = afkUsers.get(uid);
        const name = await usersData.getName(uid);
        const duration = moment.duration(now - time).humanize();

        return message.reply(`┏━━━〔 𝗨𝗦𝗘𝗥 𝗔𝗙𝗞 〕━━━┓\n┣ ${name} 𝗂𝗌 𝖺𝗐𝖺𝗒\n┣ 𝗋𝖾𝖺𝗌𝗈𝗇 : ${reason}\n┣ 𝗌𝗂𝗇𝖼𝖾 : ${duration} 𝖺𝗀𝗈\n┗━━━━━━━━━━━━━━━┛`);
      }
    }
  }
};
