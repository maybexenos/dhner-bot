const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "blur",
    version: "2.0",
    author: "S1FU",
    countDown: 10,
    role: 0,
    category: "𝖾𝖽𝗂𝗍",
    shortDescription: { en: "𝖺𝗉𝗉𝗅𝗒 𝖽𝗂𝗀𝗂𝗍𝖺𝗅 𝖻𝗅𝗎𝗋 𝖾𝖿𝖿𝖾𝗼𝗍" },
    guide: { en: "『 {pn} <𝖺𝗆𝗈𝗎𝗇𝗍> [@𝗆𝖾𝗇𝗍𝗂𝗈𝗇/𝗋𝖾𝗉𝗅𝗒] 』" }
  },

  onStart: async function ({ api, event, message, args }) {
    const { senderID, mentions, type, messageReply, messageID, threadID } = event;

    const stylize = (text) => {
      const fonts = {
        "a": "𝖺", "b": "𝖻", "c": "𝖼", "d": "𝖽", "e": "𝖾", "f": "𝖿", "g": "𝗀", "h": "𝗁", "i": "𝗂", "j": "𝗃", "k": "𝗄", "l": "𝗅", "m": "𝗆", 
        "n": "𝗇", "o": "𝗈", "p": "𝗉", "q": "𝗊", "r": "𝗋", "s": "𝗌", "t": "𝗍", "u": "𝗎", "v": "𝗏", "w": "𝗐", "x": "𝗑", "y": "𝗒", "z": "𝗓",
        "0": "𝟎", "1": "𝟏", "2": "𝟐", "3": "𝟑", "4": "𝟒", "5": "𝟓", "6": "𝟔", "7": "𝟕", "8": "𝟖", "9": "𝟗"
      };
      return text.toString().toLowerCase().split('').map(char => fonts[char] || char).join('');
    };

    let amount = 2;
    if (args[0] && !isNaN(args[0])) {
      amount = Math.max(1, Math.min(10, parseInt(args[0])));
    }

    let imageURL;
    if (type === "message_reply" && messageReply.attachments?.length > 0 && messageReply.attachments[0].type === "photo") {
      imageURL = messageReply.attachments[0].url;
    } else if (Object.keys(mentions).length > 0) {
      const uid = Object.keys(mentions)[0];
      imageURL = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    } else {
      imageURL = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    }

    const cachePath = path.join(__dirname, "cache", `blur_${Date.now()}.png`);

    try {
      api.setMessageReaction("⏳", messageID, () => {}, true);
      
      const res = await axios.get(`https://api.popcat.xyz/v2/blur?image=${encodeURIComponent(imageURL)}&amount=${amount}`, {
        responseType: "arraybuffer"
      });

      if (!fs.existsSync(path.dirname(cachePath))) fs.mkdirSync(path.dirname(cachePath), { recursive: true });
      fs.writeFileSync(cachePath, Buffer.from(res.data));

      const body = `┏━━━〔 𝖻𝗅𝗎𝗋 𝖾𝖽𝗂𝗍 〕━━━┓\n\n  ᯓ★ 𝗂𝗇𝗍𝖾𝗇𝗌𝗂𝗍𝗒: ${stylize(amount)}\n  ⋆ 𝗌𝖾𝗋𝗏𝖾드 𝖻𝗒 𝗌𝟣z𝗎 Ი𐑼\n\n┗━━━━━━━━━━━━━━━┛`;

      await message.reply({
        body: body,
        attachment: fs.createReadStream(cachePath)
      });

      api.setMessageReaction("✅", messageID, () => {}, true);
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);

    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", messageID, () => {}, true);
      message.reply("ᯓ★ 𝖿𝖺𝗂𝗅𝖾𝖽 𝗍𝗈 𝗉𝗋𝗈𝖼𝖾𝗌𝗌 𝖽𝗂𝗀𝗂𝗍𝖺𝗅 𝗂𝗆𝖺𝗀𝖾 Ი𐑼");
    }
  }
};