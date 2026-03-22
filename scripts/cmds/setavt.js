const axios = require("axios");

module.exports = {
  config: {
    name: "changeavatar",
    aliases: ["setav", "changeavt", "setavatar"],
    version: "4.0.0",
    author: "S1FU",
    countDown: 10,
    role: 2, 
    category: "𝗈𝗐𝗇𝖾𝗋",
    shortDescription: { en: "𝖼𝗁𝖺𝗇𝗀𝖾 𝖻𝗈𝗍 𝗉𝗋𝗈𝖿𝗂𝗅𝖾 𝗉𝗂𝖼𝗍𝗎𝗋𝖾" },
    guide: { en: "『 {pn} [𝗎𝗋𝗅 | 𝗋𝖾𝗉𝗅𝗒] [𝖼𝖺𝗉𝗍𝗂𝗈𝗇] [𝗌𝖾𝖼𝗈𝗇𝖽𝗌] 』" }
  },

  onStart: async function ({ message, event, args, api }) {
    const stylize = (text) => {
      const fonts = {
        "a":"𝖺","b":"𝖻","c":"𝖼","d":"𝖽","e":"𝖾","f":"𝖿","g":"𝗀","h":"𝗁","i":"𝗂","j":"𝗃","k":"𝗄","l":"𝗅","m":"𝗆",
        "n":"𝗇","o":"𝗈","p":"𝗉","q":"𝗊","r":"𝗋","s":"𝗌","t":"𝗍","u":"𝗎","v":"𝗏","w":"𝗐","x":"𝗑","y":"𝗒","z":"𝗓"
      };
      return text.toString().toLowerCase().split('').map(char => fonts[char] || char).join('');
    };

    const imageURL = (args[0] || "").startsWith("http") ? args.shift() : 
                     event.attachments[0]?.url || event.messageReply?.attachments[0]?.url;
    
    const expirationAfter = !isNaN(args[args.length - 1]) ? args.pop() : null;
    const caption = args.join(" ");

    if (!imageURL) {
      return message.reply(`✧ 𐃷 ${stylize("𝗉𝗅𝖾𝖺𝗌𝖾 𝗉𝗋𝗈𝗏𝗂𝖽𝖾 𝖺𝗇 𝗂𝗆𝖺𝗀𝖾 𝗎𝗋𝗅 𝗈𝗋 𝗋𝖾𝗉𝗅𝗒 𝗍𝗈 𝖺 𝗉𝗁𝗈𝗍𝗈")} Ი𐑼 𖹭`);
    }

    message.reaction("🥵", event.messageID);
    const fcaApi = global.GoatBot.fcaApi;

    try {
      fcaApi.changeAvatar(imageURL, caption, expirationAfter, (err) => {
        if (err) {
          message.reaction("❌", event.messageID);
          return message.reply(`✧ 𐃷 ${stylize("𝖾𝗋𝗋𝗈𝗋")}: ${err.message || stylize("𝖿𝖺𝗂𝗅𝖾𝖽 𝗍𝗈 𝗎𝗉𝖽𝖺𝗍𝖾")} Ი𐑼`);
        }

        message.reaction("✨", event.messageID);
        return message.reply(`✨ ${stylize("𝖺𝗏𝖺𝗍𝖺𝗋 𝖼𝗁𝖺𝗇𝗀𝖾𝖽 𝗌𝗎𝖼𝖼𝖾𝗌𝗌𝖿𝗎𝗅𝗅𝗒")}! 𐃷 Ი𐑼`, (err, info) => {
          // Auto delete success message after 15s
          setTimeout(() => api.unsendMessage(info.messageID), 15000);
        });
      });
    } catch (e) {
      console.error(e);
      message.reaction("❌", event.messageID);
      return message.reply(`✧ 𐃷 ${stylize("𝖺 𝗌𝗒𝗌𝗍𝖾𝗆 𝖾𝗋𝗋𝗈𝗋 𝗈𝖼𝖼𝗎𝗋𝗋𝖾𝖽")} Ი𐑼 𖹭`);
    }
  }
};