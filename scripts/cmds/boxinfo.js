const fs = require("fs-extra");
const axios = require("axios");

module.exports = {
  config: {
    name: "groupinfo",
    aliases: ["boxinfo", "gcinfo"],
    version: "2.0",
    author: "SiFu ",
    countDown: 5,
    role: 0,
    category: "box chat",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event, threadsData }) {
    try {
      let threadInfo = await api.getThreadInfo(event.threadID);
      const { threadName, participantIDs, adminIDs, messageCount, emoji, threadID, approvalMode, imageSrc } = threadInfo;

      let maleCount = 0, femaleCount = 0, unknownCount = 0;
      for (let user of threadInfo.userInfo) {
        if (user.gender === "MALE") maleCount++;
        else if (user.gender === "FEMALE") femaleCount++;
        else unknownCount++;
      }

      let adminList = "";
      for (let ad of adminIDs) {
        const info = await api.getUserInfo(ad.id);
        adminList += `  ┣ 👤 ${info[ad.id].name}\n`;
      }

      const approvalStatus = approvalMode ? "🟢 ᴇɴᴀʙʟᴇᴅ" : "🔴 ᴅɪsᴀʙʟᴇᴅ";
      const path = __dirname + `/cache/gc_avatar_${threadID}.png`;

      const infoMsg = `╭━━━━━━━『 ɢᴄ ɪɴғᴏ 』━━━━━━━╮\n` +
        `┃ 🏷️ **ɴᴀᴍᴇ:** ${threadName || "ɴ/ᴀ"}\n` +
        `┃ 🆔 **ɪᴅ:** ${threadID}\n` +
        `┃ 🛡️ **ᴀᴘᴘʀᴏᴠᴀʟ:** ${approvalStatus}\n` +
        `┃ 🎭 **ᴇᴍᴏᴊɪ:** ${emoji || "👍"}\n` +
        `┣━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `┃ 👥 **ᴛᴏᴛᴀʟ ᴍᴇᴍʙᴇʀs:** ${participantIDs.length}\n` +
        `┃ ♂️ **ᴍᴀʟᴇs:** ${maleCount}\n` +
        `┃ ♀️ **ғᴇᴍᴀʟᴇs:** ${femaleCount}\n` +
        `┃ ❓ **ᴏᴛʜᴇʀ/ʙᴏᴛs:** ${unknownCount}\n` +
        `┣━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `┃ 👔 **ᴀᴅᴍɪɴɪsᴛʀᴀᴛᴏʀs (${adminIDs.length}):**\n` +
        `${adminList}` +
        `┣━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `┃ 💬 **ᴛᴏᴛᴀʟ ᴍᴇssᴀɢᴇs:** ${messageCount}\n` +
        `╰━━━━━━━━━━━━━━━ ᯓ★ ━━━╯\n\n` +
        `✨ ・┆Tєαᴍ ☣︎ нєαятℓєѕѕ┆・ Ი𐑼⋆𖹭.ᐟ`;

      // ᴅᴏᴡɴʟᴏᴀᴅ ɢʀᴏᴜᴘ ɪᴍᴀɢᴇ ᴀɴᴅ sᴇɴᴅ
      if (imageSrc) {
        const getImg = (await axios.get(imageSrc, { responseType: "arraybuffer" })).data;
        fs.writeFileSync(path, Buffer.from(getImg, "utf-8"));
        
        return api.sendMessage({
          body: infoMsg,
          attachment: fs.createReadStream(path)
        }, event.threadID, () => fs.unlinkSync(path), event.messageID);
      } else {
        return message.reply(infoMsg);
      }

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ ᴇʀʀᴏʀ ғᴇᴛᴄʜɪɴɢ ɢʀᴏᴜᴘ ᴅᴀᴛᴀ. Ი𐑼⋆", event.threadID);
    }
  }
};