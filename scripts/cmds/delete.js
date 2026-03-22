const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "delete",
    version: "1.1.0",
    author: "S1FU",
    countDown: 5,
    role: 2,
    category: "𝖺𝖽𝗆𝗂𝗇",
    shortDescription: { en: "𝖽𝖾𝗅𝖾𝗍𝖾 𝖺 𝖼𝗈𝗆𝗆𝖺𝗇𝖽 𝖿𝗂𝗅𝖾" },
    guide: { en: "『 {pn} <𝖼𝗈𝗆𝗆𝖺𝗇𝖽 𝗇𝖺𝗆𝖾> 』" }
  },

  onStart: async function ({ args, message, event }) {
    const stylize = (text) => {
      const fonts = {
        "a":"𝖺","b":"𝖻","c":"𝖼","d":"𝖽","e":"𝖾","f":"𝖿","g":"𝗀","h":"𝗁","i":"𝗂","j":"𝗃","k":"𝗄","l":"𝗅","m":"𝗆",
        "n":"𝗇","o":"𝗈","p":"𝗉","q":"𝗊","r":"𝗋","s":"𝗌","t":"𝗍","u":"𝗎","v":"𝗏","w":"𝗐","x":"𝗑","y":"𝗒","z":"𝗓",
        "0":"𝟎","1":"𝟏","2":"𝟐","3":"𝟑","4":"𝟒","5":"𝟓","6":"𝟔","7":"𝟕","8":"𝟖","9":"𝟗"
      };
      return text.toString().toLowerCase().split('').map(char => fonts[char] || char).join('');
    };

    if (!args.length) {
      return message.reply(`✧ 𐃷 ${stylize("𝗉𝗅𝖾𝖺𝗌𝖾 𝗉𝗋𝗈𝗏𝗂𝖽𝖾 𝗍𝗁𝖾 𝖼𝗈𝗆𝗆𝖺𝗇𝖽 𝗇𝖺𝗆𝖾")} Ი𐑼 𖹭`);
    }

    const commandName = args[0].toLowerCase();
    const commandPath = path.join(__dirname, `${commandName}.js`);

    try {
      if (!fs.existsSync(commandPath)) {
        return message.reply(`✧ 𐃷 ${stylize("𝖼𝗈𝗆𝗆𝖺𝗇𝖽")} ${stylize(commandName)} ${stylize("𝗇𝗈𝗍 𝖿𝗈𝗎𝗇𝖽")} Ი𐑼 𖹭`);
      }

      fs.unlinkSync(commandPath);
      
      return message.reply(`✨ ${stylize("𝗌𝗎𝖼𝖼𝖾𝗌𝗌𝖿𝗎𝗅𝗅𝗒 𝖽𝖾𝗅𝖾𝗍𝖾𝖽")}: ${stylize(commandName)}.𝗃𝗌 𐃷 Ი𐑼`);
    } catch (err) {
      return message.reply(`✧ 𐃷 ${stylize("𝖾𝗋𝗋𝗈𝗋")}: ${err.message} Ი𐑼 𖹭`);
    }
  }
};