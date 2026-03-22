const axios = require("axios");

module.exports = {
  config: {
    name: "alluser",
    aliases: ["groupmembers", "members"],
    version: "3.0",
    author: "S1FU",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "𝗅𝗂𝗌𝗍 𝖺𝗅𝗅 𝗀𝗋𝗈𝗎𝗉 𝗆𝖾𝗆𝖻𝖾𝗋𝗌 𝗐𝗂𝗍𝗁 𝖺𝖾𝗌𝗍𝗁𝖾𝗍𝗂𝖼 𝗌𝗍𝗒𝗅𝖾"
    },
    category: "𝗀𝗋𝗈𝗎𝗉",
    guide: {
      en: "『 {pn} 』"
    }
  },

  onStart: async function({ api, event, usersData }) {
    const threadID = event.threadID;

    try {
      const participantIDs = event.participantIDs || [];
      if (participantIDs.length === 0)
        return api.sendMessage("ᯓ★ 𝗇𝗈 𝗆𝖾𝗆𝖻𝖾𝗋𝗌 𝖿𝗈𝗎𝗇𝖽 Ი𐑼", threadID);

      let msg = `Ი𐑼 𖹭 𝗆𝖾𝗆𝖻𝖾𝗋 𝗅𝗂𝗌𝗍 𖹭 Ი𐑼 \n\n`;
      let count = 1;

      for (const uid of participantIDs) {
        const name = await usersData.getName(uid);
        msg += `  ⋆ ${count++}. ${name}\n  ⋆ 𝗎𝗂𝖽: ${uid}\n  ⋆ 𝖿𝖻: https://fb.com/${uid}\n\n`;
      }

      msg += `  ⋆ 𝗍𝗈𝗍𝖺𝗅 𝗆𝖾𝗆𝖻𝖾𝗋𝗌: ${participantIDs.length}\n\n┗━━━━━━━━━━━━━━━┛`;
      return api.sendMessage(msg, threadID);

    } catch (error) {
      console.error(error);
      return api.sendMessage("ᯓ★ 𝗌𝗒𝗌𝗍𝖾𝗆 𝖾𝗋𝗋𝗈𝗋 𝗈𝖼𝖼𝗎𝗋𝖾𝖽 .ᐟ", threadID);
    }
  }
};