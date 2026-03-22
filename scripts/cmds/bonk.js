const axios = require("axios");

module.exports = {
  config: {
    name: "bonk",
    aliases: ["hit", "🔨"],
    version: "2.1.0",
    author: "S1FU",
    countDown: 5,
    role: 0,
    category: "𝖿𝗎𝗇",
    shortDescription: { en: "𝖽𝗂𝗀𝗂𝗍𝖺𝗅 𝖻𝗈𝗇𝗄 𝗆𝖾𝗆𝖾" },
    guide: { en: "『 {pn} @𝗆𝖾𝗇𝗍𝗂𝗈𝗇 / 𝗋𝖾𝗉𝗅𝗒 』" }
  },

  onStart: async function ({ api, event, usersData }) {
    const { senderID, threadID, messageID, mentions, messageReply } = event;

    const stylize = (text) => {
      const fonts = {
        "a": "𝖺", "b": "𝖻", "c": "𝖼", "d": "𝖽", "e": "𝖾", "f": "𝖿", "g": "𝗀", "h": "𝗁", "i": "𝗂", "j": "𝗃", "k": "𝗄", "l": "𝗅", "m": "𝗆", 
        "n": "𝗇", "o": "𝗈", "p": "𝗉", "q": "𝗊", "r": "𝗋", "s": "𝗌", "t": "𝗍", "u": "𝗎", "v": "𝗏", "w": "𝗐", "x": "𝗑", "y": "𝗒", "z": "𝗓"
      };
      return text.toString().toLowerCase().split('').map(char => fonts[char] || char).join('');
    };

    try {
      api.setMessageReaction("🔨", messageID, () => {}, true);

      let targetID = senderID;
      if (messageReply) {
        targetID = messageReply.senderID;
      } else if (Object.keys(mentions).length > 0) {
        targetID = Object.keys(mentions)[0];
      }

      const avatar1Url = `https://graph.facebook.com/${senderID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const avatar2Url = `https://graph.facebook.com/${targetID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      const imgUrl = `https://maybexenos.vercel.app/meme/bonk?avatar1=${encodeURIComponent(avatar2Url)}&avatar2=${encodeURIComponent(avatar1Url)}`;

      const name1 = await usersData.getName(senderID);
      const name2 = await usersData.getName(targetID);

      const body = ` ${stylize(name1)} 𝖻𝗈𝗇𝗄𝖾𝖽 ${stylize(name2)}\n`;

      return api.sendMessage(
        {
          body: body,
          attachment: await global.utils.getStreamFromURL(imgUrl)
        },
        threadID,
        messageID
      );

    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("ᯓ★ 𝖻𝗈𝗇𝗄 𝗆𝖾𝖼𝗁𝖺𝗇𝗂𝗌𝗆 𝖿𝖺𝗂𝗅𝖾𝖽 Ი𐑼", threadID, messageID);
    }
  }
};