const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "animix",
    aliases: ["animixpic", "a"],
    version: "2.0",
    author: "S1FU",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "𝗌𝖾𝗇𝖽 𝖺 𝗋𝖺𝗇𝖽𝗈𝗆 𝖺𝗇𝗂𝗆𝗂𝗑-𝗌𝗍𝗒𝗅𝖾 𝗉𝗁𝗈𝗍𝗈"
    },
    longDescription: {
      en: "𝖿𝖾𝗍𝖼𝗁 𝖺𝗇𝖽 𝗌𝖾𝗇𝖽 𝖺 𝗋𝖺𝗇𝖽𝗈𝗆 𝖺𝗇𝗂𝗆𝗂𝗑 𝖺𝗇𝗂𝗆𝖾-𝗌𝗍𝗒𝗅𝖾 𝗂𝗆𝖺𝗀𝖾"
    },
    category: "𝗂𝗆𝖺𝗀𝖾",
    guide: {
      en: "『 {pn} 』"
    }
  },

  onStart: async function ({ message, event }) {
    const cachePath = path.join(__dirname, "cache", `animix_${event.senderID}.jpg`);
    
    try {
      const res = await axios.get("https://api.waifu.pics/sfw/waifu");
      const imgURL = res.data.url;

      const imageRes = await axios.get(imgURL, { responseType: "arraybuffer" });
      await fs.outputFile(cachePath, imageRes.data);

      return message.reply({ 
        body: `┏━━━〔 𝖺𝗇𝗂𝗆𝗂𝗑 𝗏𝗂𝖻𝖾 〕━━━┓\n\n  ᯓ★ 𝗁𝖾𝗋𝖾 𝗂𝗌 𝗒𝗈𝗎𝗋 𝖺𝗇𝗂𝗆𝖾 𝗉𝗂𝖼 .ᐟ\n  ᯓ★\n\n┗━━━━━━━━━━━━━━━┛`, 
        attachment: fs.createReadStream(cachePath) 
      }, () => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      });

    } catch (error) {
      console.error(error);
      return message.reply("ᯓ★ 𝖿𝖺𝗂𝗅𝖾𝖽 𝗍𝗈 𝖿𝖾𝗍𝖼𝗁 𝖺𝗇𝗂𝗆𝗂𝗑 𝗂𝗆𝖺𝗀𝖾 Ი𐑼");
    }
  }
};