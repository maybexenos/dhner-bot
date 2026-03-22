const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const getBase = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "bed",
    version: "2.5",
    author: "S1FU",
    countDown: 5,
    role: 0,
    shortDescription: { en: "𝖺𝗇𝗂𝗆𝖾 𝖻𝖾𝖽 𝗁𝗎𝗀 𝗂𝗆𝖺𝗀𝖾" },
    longDescription: { en: "𝗀𝖾𝗇𝖾𝗋𝖺𝗍𝖾 𝖺 𝖼𝗎𝗍𝖾 𝖺𝗇𝗂𝗆𝖾-𝗌𝗍𝗒𝗅𝖾 𝖻𝖾𝖽 𝗁𝗎𝗀 𝗂𝗆𝖺𝗀𝖾 𝗐𝗂𝗍𝗁 𝗌𝗈𝗆𝖾𝗈𝗇𝖾" },
    category: "𝗅𝗈𝗏𝖾",
    guide: { en: "『 {pn} @𝗆𝖾𝗇𝗍𝗂𝗈𝗇 』" }
  },

  onStart: async function ({ message, event, api }) {
    const { mentions, senderID, threadID, messageID } = event;
    const cachePath = path.join(__dirname, 'cache', `bed_${senderID}_${Date.now()}.png`);

    try {
      const mentionKeys = Object.keys(mentions);
      if (mentionKeys.length === 0) {
        return message.reply("┏━━━〔 𝗌𝗒𝗌𝗍𝖾𝗆 〕━━━┓\n\n  ᯓ★ 𝗆𝖾𝗇𝗍𝗂𝗈𝗇 𝗌𝗈𝗆𝖾𝗈𝗇𝖾 .ᐟ\n\n┗━━━━━━━━━━━━━━━┛");
      }

      const targetID = mentionKeys[0];
      api.setMessageReaction("⏳", messageID, () => {}, true);

      const base = await getBase();
      const apiURL = `${base}/api/bed`;

      const response = await axios.post(
        apiURL,
        { senderID, targetID },
        { responseType: "arraybuffer" }
      );

      if (!fs.existsSync(path.dirname(cachePath))) fs.mkdirSync(path.dirname(cachePath), { recursive: true });
      fs.writeFileSync(cachePath, Buffer.from(response.data));

      const body = `┏━━━〔 𝖻𝖾𝖽 𝗁𝗎𝗀 〕━━━┓\n\n  ᯓ★ 𝗁𝖾𝗋𝖾 𝗂𝗌 𝗒𝗈𝗎𝗋 𝗂𝗆𝖺𝗀𝖾\n\n┗━━━━━━━━━━━━━━━┛`;

      await message.reply({
        body: body,
        attachment: fs.createReadStream(cachePath)
      });

      api.setMessageReaction("✅", messageID, () => {}, true);

      if (fs.existsSync(cachePath)) {
        setTimeout(() => fs.unlinkSync(cachePath), 10000);
      }

    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return message.reply("ᯓ★ 𝖽𝗂𝗀𝗂𝗍𝖺𝗅 𝗀𝖾𝗇𝖾𝗋𝖺𝗍𝗂𝗈𝗇 𝖿𝖺𝗂𝗅𝖾𝖽 Ი𐑼");
    }
  }
};