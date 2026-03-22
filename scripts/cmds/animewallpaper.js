const axios = require("axios");
const path = require("path");
const fs = require("fs");

module.exports = {
  config: {
    name: "animewallpaper",
    aliases: ["aniwall", "wallpaper"],
    version: "2.0",
    author: "S1FU/SAIM",
    role: 0,
    countDown: 10,
    shortDescription: {
      en: "𝖿𝖾𝗍𝖼𝗁 𝖺𝖾𝗌𝗍𝗁𝖾𝗍𝗂𝖼 𝖺𝗇𝗂𝗆𝖾 𝗐𝖺𝗅𝗅𝗉𝖺𝗉𝖾𝗋𝗌"
    },
    category: "𝗆𝖾𝖽𝗂𝖺",
    guide: {
      en: "『 {pn} <𝗍𝗂𝗍𝗅𝖾> - <𝖼𝗈𝗎𝗇𝗍> 』"
    },
  },

  onStart: async function ({ api, event, args }) {
    try {
      if (!args[0]) {
        return api.sendMessage(
          `┏━━━〔 𝗌𝗒𝗌𝗍𝖾𝗆 〕━━━┓\n\n  ᯓ★ 𝖺𝗇𝗂𝗆𝖾 𝗍𝗂𝗍𝗅𝖾 𝗆𝗂𝗌𝗌𝗂𝗇𝗀 .ᐟ\n  ⋆ 𝗎𝗌𝖾: {pn} 𝗇𝖺𝗋𝗎𝗍𝗈 - 𝟧\n\n┗━━━━━━━━━━━━━━━┛`,
          event.threadID,
          event.messageID
        );
      }

      let input = args.join(" ");
      let count = 5;
      if (input.includes("-")) {
        const parts = input.split("-");
        input = parts[0].trim();
        count = parseInt(parts[1].trim()) || 5;
      }
      if (count > 20) count = 20; // 𝗅𝗂𝗆𝗂𝗍𝖾𝖽 𝖿𝗈𝗋 𝗌𝗍𝖺𝖻𝗂𝗅𝗂𝗍𝗒

      const GITHUB_RAW = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
      const rawRes = await axios.get(GITHUB_RAW);
      const apiBase = rawRes.data.apiv1;

      const apiUrl = `${apiBase}/api/anime?title=${encodeURIComponent(input)}`;
      const res = await axios.get(apiUrl);
      const data = res.data?.wallpapers || [];

      if (data.length === 0) {
        return api.sendMessage(
          `ᯓ★ 𝗇𝗈 𝗐𝖺𝗅𝗅𝗉𝖺𝗉𝖾𝗋𝗌 𝖿𝗈𝗎𝗇𝖽 𝖿𝗈𝗋 "${input}" Ი𐑼`,
          event.threadID,
          event.messageID
        );
      }

      const cacheDir = path.join(__dirname, "cache", `wall_${event.senderID}`);
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

      const attachments = [];
      const totalToFetch = Math.min(count, data.length);

      for (let i = 0; i < totalToFetch; i++) {
        try {
          const imgRes = await axios.get(data[i], { responseType: "arraybuffer" });
          const imgPath = path.join(cacheDir, `${i + 1}.jpg`);
          fs.writeFileSync(imgPath, Buffer.from(imgRes.data));
          attachments.push(fs.createReadStream(imgPath));
        } catch (e) {
          console.warn(`ᯓ★ 𝖿𝖺𝗂𝗅𝖾𝖽 𝗍𝗈 𝖿𝖾𝗍𝖼𝗁 𝗂𝗆𝖺𝗀𝖾 ${i + 1}`);
        }
      }

      const bodyMsg = `┏━━━〔 𝖺𝗇𝗂𝗆𝖾 𝗐𝖺𝗅𝗅 〕━━━┓\n\n  ᯓ★ 𝗋𝖾𝗌𝗎𝗅𝗍𝗌 𝖿𝗈𝗋: ${input}\n  ᯓ★ 𝗍𝗈𝗍𝖺𝗅 𝗂𝗆𝖺𝗀𝖾𝗌: ${attachments.length}\n  ⋆ 𝗌𝖾𝗋𝗏𝖾𝖽 𝖻𝗒 𝗌𝟣𝖿𝗎 Ი𐑼\n\n┗━━━━━━━━━━━━━━━┛`;
      
      await api.sendMessage(
        { body: bodyMsg, attachment: attachments },
        event.threadID,
        () => {
          if (fs.existsSync(cacheDir)) {
            fs.rmSync(cacheDir, { recursive: true, force: true });
          }
        },
        event.messageID
      );

    } catch (err) {
      console.error(err);
      return api.sendMessage("ᯓ★ 𝗌𝗒𝗌𝗍𝖾𝗆 𝖾𝗋𝗋𝗈𝗋 𝗈𝖼𝖼𝗎𝗋𝖾𝖽 Ი𐑼", event.threadID, event.messageID);
    }
  }
};