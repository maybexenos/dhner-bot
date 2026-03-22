const fs = require("fs-extra");
const path = require("path");
const sleep = ms => new Promise(res => setTimeout(res, ms));

module.exports = {
  config: {
    name: "autofdrq",
    version: "2.0",
    author: "S1FU",
    countDown: 10,
    role: 2, // Updated to 2 for Admin/Owner only
    shortDescription: {
      en: "𝖺𝗎𝗍𝗈-𝖺𝖼𝖼𝖾𝗉𝗍 𝖺𝗇𝖽 𝗀𝗋𝗈𝗎𝗉 𝖺𝖽𝖽"
    },
    longDescription: {
      en: "𝖺𝗎𝗍𝗈𝗆𝖺𝗍𝗂𝖼𝖺𝗅𝗅𝗒 𝖺𝖼𝖼𝖾𝗉𝗍𝗌 𝖿𝗋𝗂𝖾𝗇𝖽 𝗋𝖾𝗊𝗎𝖾𝗌𝗍𝗌 𝖺𝗇𝖽 𝗆𝗈𝗏𝖾𝗌 𝗎𝗌𝖾𝗋𝗌 𝗍𝗈 𝖺 𝗍𝖺𝗋𝗀𝖾𝗍 𝗀𝗋𝗈𝗎𝗉"
    },
    category: "𝖺𝖽𝗆𝗂𝗇",
    guide: {
      en: "『 {pn} 』 𝗈𝗋 『 {pn} 𝗌𝗍𝗈𝗉 』"
    }
  },

  onStart: async function ({ api, message, args }) {
    const GROUP_TID = "9815886431866723";
    const OWNER_UID = "100081330372098";

    if (args[0] === "stop") {
      if (global.autofdrqInterval) {
        clearInterval(global.autofdrqInterval);
        global.autofdrqInterval = null;
        return message.reply("┏━━━〔 𝗌𝗒𝗌𝗍𝖾𝗆 〕━━━┓\n\n  ᯓ★ 𝖺𝗎𝗍𝗈 𝖿𝖽 𝖺𝖼𝖼𝖾𝗉𝗍 𝗁𝖺𝗅𝗍𝖾𝖽 .ᐟ\n\n┗━━━━━━━━━━━━━━━┛");
      }
      return message.reply("ᯓ★ 𝗌𝗒𝗌𝗍𝖾𝗆 𝗂𝗌 𝗇𝗈𝗍 𝗋𝗎𝗇𝗇𝗂𝗇𝗀 Ი𐑼");
    }

    if (global.autofdrqInterval) {
      clearInterval(global.autofdrqInterval);
    }

    message.reply("┏━━━〔 𝖺𝗎𝗍𝗈 𝖿𝖽 〕━━━┓\n\n  ᯓ★ 𝖽𝗂𝗀𝗂𝗍𝖺𝗅 𝖺𝖼𝖼𝖾𝗉𝗍: 𝖺𝖼𝗍𝗂𝗏𝖾\n  ⋆ 𝗂𝗇𝗍𝖾𝗋𝗏𝖺𝗅: 𝟣𝟢 𝗌𝖾𝖼𝗈𝗇𝖽𝗌\n  ⋆ 𝗌𝖾𝗋𝗏𝖾𝖽 𝖻𝗒 𝗌𝟣𝖿𝗎 Ი𐑼\n\n┗━━━━━━━━━━━━━━━┛");

    global.autofdrqInterval = setInterval(async () => {
      try {
        const friendRequests = await api.getThreadList(50, null, ["PENDING"]);
        const newRequests = friendRequests.filter(t => t.isFriendRequest && t.threadType === "USER");

        if (!newRequests.length) return;

        for (const thread of newRequests) {
          const uid = thread.userID || thread.threadID;
          if (!uid) continue;

          try {
            await api.acceptFriendRequest(uid);
            await sleep(1000);

            try {
              await api.addUserToGroup(uid, GROUP_TID);
              await sleep(800);
              await api.sendMessage(`┏━━━〔 𝗅𝗈𝗀 〕━━━┓\n\n  ᯓ★ 𝖺𝖼𝖼𝖾𝗉𝗍𝖾𝖽: ${uid}\n  ⋆ 𝗌𝗍𝖺𝗍𝗎𝗌: 𝖺𝖽𝖽𝖾𝖽 𝗍𝗈 𝗀𝗋𝗈𝗎𝗉\n\n┗━━━━━━━━━━━━━━━┛`, OWNER_UID);
            } catch (groupErr) {
              await api.sendMessage(`ᯓ★ 𝖺𝖼𝖼𝖾𝗉𝗍𝖾𝖽 ${uid} 𝖻𝗎𝗍 𝗀𝗋𝗈𝗎𝗉 𝖺𝖽𝖽 𝖿𝖺𝗂𝗅𝖾𝖽 Ი𐑼`, OWNER_UID);
            }

          } catch (acceptErr) {
            console.error(acceptErr);
          }
        }
      } catch (err) {
        console.error("𝗀𝗅𝗈𝖻𝖺𝗅 𝖺𝗎𝗍𝗈𝖿𝖽 𝖾𝗋𝗋𝗈𝗋:", err);
      }
    }, 10000);
  }
};