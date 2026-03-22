const axios = require('axios');
const fs = require('fs-extra');
const FormData = require('form-data');
const path = require('path');

module.exports = {
  config: {
    name: "art",
    aliases: ["artify", "animeart"],
    version: "2.0",
    author: "S1FU",
    countDown: 10,
    role: 0,
    shortDescription: { en: "𝖺𝗉𝗉𝗅𝗒 𝖺𝗂 𝖺𝗇𝗂𝗆𝖾 𝗌𝗍𝗒𝗅𝖾" },
    longDescription: { en: "𝗍𝗋𝖺𝗇𝗌𝖿𝗈𝗋𝗆 𝗒𝗈𝗎𝗋 𝗉𝗁𝗈𝗍𝗈𝗌 𝗂𝗇𝗍𝗈 𝖺𝗂 𝖺𝗇𝗂𝗆𝖾 𝖺𝗋𝗍 𝗏𝗂𝖺 𝗋𝖾𝗉𝗅𝗒" },
    category: "𝗂𝗆𝖺𝗀𝖾",
    guide: { en: "『 𝗋𝖾𝗉𝗅𝗒 𝗍𝗈 𝖺𝗇 𝗂𝗆𝖺𝗀𝖾 𝗐𝗂𝗍𝗁 {pn} 』" }
  },

  onStart: async function ({ message, event, api }) {
    const { messageReply, threadID, messageID, senderID } = event;
    const cachePath = path.join(__dirname, 'cache', `artify_${senderID}.jpg`);

    if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
      return message.reply("┏━━━〔 𝖺𝗋𝗍𝗂𝖿𝗒 〕━━━┓\n\n  ᯓ★ 𝗉𝗅𝖾𝖺𝗌𝖾 𝗋𝖾𝗉𝗅𝗒 𝗍𝗈 𝖺 𝗉𝗁𝗈𝗍𝗈 .ᐟ\n\n┗━━━━━━━━━━━━━━━┛");
    }

    const url = messageReply.attachments[0].url;
    api.setMessageReaction("🎨", messageID, () => {}, true);

    try {
      const res = await axios.get(url, { responseType: "arraybuffer" });
      await fs.outputFile(cachePath, Buffer.from(res.data));

      const form = new FormData();
      form.append("image", fs.createReadStream(cachePath));

      const apiRes = await axios.post(
        "https://art-api-97wn.onrender.com/artify?style=anime",
        form,
        { 
          headers: form.getHeaders(), 
          responseType: "arraybuffer" 
        }
      );

      await fs.outputFile(cachePath, apiRes.data);

      const body = `┏━━━〔 𝖺𝗂 𝖺𝗋𝗍𝗂𝖿𝗒 〕━━━┓\n\n  ᯓ★ 𝗌𝗍𝗒𝗅𝖾: 𝖺𝗇𝗂𝗆𝖾 𝖾𝖽𝗂𝗍𝗂𝗈𝗇\n  ᯓ★ 𝗌𝖾𝗋𝗏𝖾𝖽 𝖻𝗒 𝗌𝟣𝖿𝗎 ⋆\n\n┗━━━━━━━━━━━━━━━┛`;

      await message.reply({
        body: body,
        attachment: fs.createReadStream(cachePath)
      });

      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      api.setMessageReaction("✅", messageID, () => {}, true);

    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return message.reply("ᯓ★ 𝗌𝗒𝗌𝗍𝖾𝗆 𝖾𝗋𝗋𝗈𝗋 𝗈𝗋 𝖺𝗉𝗂 𝖽𝗈𝗐𝗇 Ი𐑼");
    }
  }
};