 const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pfp",
    aliases: ["pp",  "profile"],
    version: "2.5.0",
    author: "S1FU",
    countDown: 5,
    role: 0,
    category: "𝗎𝗍𝗂𝗅𝗂𝗍𝗒",
    shortDescription: { en: "𝖿𝖾𝗍𝖼𝗁 𝗁𝗂𝗀𝗁 𝗊𝗎𝖺𝗅𝗂𝗍𝗒 𝗉𝗋𝗈𝖿𝗂𝗅𝖾 𝗉𝗂𝖼𝗍𝗎𝗋𝖾" },
    guide: { en: "『 {pn} | @𝗍𝖺𝗀 | 𝗎𝗂𝖽 | 𝗋𝖾𝗉𝗅𝗒 』" }
  },

  langs: {
    en: {
      fetching: "  ᯓ★ 𝖿𝖾𝗍𝖼𝗁𝗂𝗇𝗀 𝗉𝗋𝗈𝖿𝗂𝗅𝖾 𝖽𝖺𝗍𝖺...",
      success: "┏━━━〔 Ი𐑼  𝗉𝗋𝗈𝖿𝗂𝗅𝖾 𝗉𝗂𝖼 Ი𐑼 〕━━━┓\n\n  ᯓ★ 𝗎𝗌𝖾𝗋: %1\n  ⋆ 𝗎𝗂𝖽: %2\n\n┗━━━━━━━━━━━━━━━┛",
      error: "ᯓ★ 𝖾𝗋𝗋𝗈𝗋: %1 Ი𐑼",
      invalid: "ᯓ★ 𝗂𝗇𝗏𝖺𝗅𝗂𝖽 𝗎𝗌𝖾𝗋 𝗂𝖽 Ი𐑼"
    }
  },

  onStart: async function ({ api, message, args, event, getLang, usersData }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;

    const stylize = (text) => {
      const fonts = {
        "a":"𝖺","b":"𝖻","c":"𝖼","d":"𝖽","e":"𝖾","f":"𝖿","g":"𝗀","h":"𝗁","i":"𝗂","j":"𝗃","k":"𝗄","l":"𝗅","m":"𝗆",
        "n":"𝗇","o":"𝗈","p":"𝗉","q":"𝗊","r":"𝗋","s":"𝗌","t":"𝗍","u":"𝗎","v":"𝗏","w":"𝗐","x":"𝗑","y":"𝗒","z":"𝗓",
        "0":"𝟎","1":"𝟏","2":"𝟐","3":"𝟑","4":"𝟒","5":"𝟓","6":"𝟔","7":"𝟕","8":"𝟖","9":"𝟗"
      };
      return text.toString().toLowerCase().split('').map(char => fonts[char] || char).join('');
    };

    try {
      let uid = senderID;

      if (messageReply) {
        uid = messageReply.senderID;
      } else if (Object.keys(mentions).length > 0) {
        uid = Object.keys(mentions)[0];
      } else if (args[0]) {
        if (!isNaN(args[0])) {
          uid = args[0];
        } else if (args[0].includes("facebook.com/")) {
          const match = args[0].match(/(?:profile\.php\?id=|\/)([\d]+)/);
          if (match) {
            uid = match[1];
          } else {
            const vanity = args[0].match(/facebook\.com\/([^/?]+)/);
            if (vanity) {
              const res = await axios.get(`https://www.facebook.com/${vanity[1]}`);
              uid = res.data.match(/"userID":"(\d+)"/)?.[1];
            }
          }
        }
      }

      if (!uid || isNaN(uid)) return message.reply(getLang("invalid"));

      api.setMessageReaction("📸", messageID, () => {}, true);
      const loadingMsg = await message.reply(getLang("fetching"));

      const name = await usersData.getName(uid);
      const url = `https://graph.facebook.com/${uid}/picture?width=1024&height=1024&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      
      const cachePath = path.join(__dirname, "cache", `pfp_${uid}_${Date.now()}.jpg`);
      await fs.ensureDir(path.dirname(cachePath));

      const imgRes = await axios.get(url, { responseType: "arraybuffer" });
      await fs.writeFile(cachePath, Buffer.from(imgRes.data));

      await api.unsendMessage(loadingMsg.messageID);

      await message.reply({
        body: getLang("success", stylize(name), stylize(uid)),
        attachment: fs.createReadStream(cachePath)
      });

      fs.remove(cachePath);
    } catch (err) {
      return message.reply(getLang("error", stylize(err.message)));
    }
  }
};