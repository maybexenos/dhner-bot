const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: 'efile',
    version: '1.3.0',
    role: 0,
    coolDown: 5,
    author: 'S1FU',
    category: 'files',
    shortDescription: { en: '𝗌𝖾𝗇𝖽 𝖾𝗏𝖾𝗇𝗍 𝖿𝗂𝗅𝖾 𝗐𝗂𝗍𝗁 𝖺𝖾𝗌𝗍𝗁𝖾𝗍𝗂𝖼 𝗏𝗂𝖻𝖾' }
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID, messageID, senderID } = event;
    const permission = ['100087331405932']; 

    const stylize = (text) => {
      const fonts = {
        "a":"𝖺","b":"𝖻","c":"𝖼","d":"𝖽","e":"𝖾","f":"𝖿","g":"𝗀","h":"𝗁","i":"𝗂","j":"𝗃","k":"𝗄","l":"𝗅","m":"𝗆",
        "n":"𝗇","o":"𝗈","p":"𝗉","q":"𝗊","r":"𝗋","s":"𝗌","t":"𝗍","u":"𝗎","v":"𝗏","w":"𝗐","x":"𝗑","y":"𝗒","z":"𝗓",
        "0":"𝟎","1":"𝟏","2":"𝟐","3":"𝟑","4":"𝟒","5":"𝟓","6":"𝟔","7":"𝟕","8":"𝟖","9":"𝟗"
      };
      return text.toString().toLowerCase().split('').map(char => fonts[char] || char).join('');
    };

    if (!permission.includes(senderID)) {
      return message.reply(`✧ 𐃷 𝗀𝗈𝗆𝖾𝗇𝗇𝖺𝗌𝖺𝗂! 𝗍𝗁𝗂𝗌 𝗂𝗌 𝗈𝗇𝗅𝗒 𝖿𝗈𝗋 𝗆𝗒 𝗌𝖾𝗇𝗌𝖾𝗂 𝗌𝗂𝖿𝗎 Ი𐑼 𖹭`);
    }

    if (args.length === 0) {
      return message.reply(`✧ 𐃷 𝗉𝗅𝖾𝖺𝗌𝖾 𝗍𝖾𝗅𝗅 𝗆𝖾 𝗍𝗁𝖾 𝖿𝗂𝗅𝖾 𝗇𝖺𝗆𝖾 𝖿𝗂𝗋𝗌𝗍 Ი𐑼 𖹭`);
    }

    let fileName = args[0];
    if (!fileName.includes('.')) fileName += '.js';

    const filePath = path.join(__dirname, '..', 'events', fileName);

    if (!fs.existsSync(filePath)) {
      return message.reply(`✧ 𐃷 𝗌𝗈𝗋𝗋𝗒, ${stylize(fileName)} 𝖿𝗂𝗅𝖾 𝖽𝗈𝖾𝗌𝗇'𝗍 𝖾𝗑𝗂𝗌𝗍 Ი𐑼 𖹭`);
    }

    try {
      const fileData = fs.readFileSync(filePath, 'utf-8');
      
      await message.reply(`🌷 ✨ ${stylize("fetching the event code for you")}... ᯓ★`);
      
      api.sendMessage(`✨ ${stylize("𝗁𝖾𝗋𝖾 𝗂𝗌 𝗒𝗈𝗎𝗋 𝖿𝗂𝗅𝖾")}: ${stylize(fileName)} 𐃷 Ი𐑼\n\n${fileData}`, threadID, messageID);
      
    } catch (error) {
      message.reply(`✧ 𐃷 𝗌𝗈𝗆𝖾𝗍𝗁𝗂𝗇𝗀 𝗐𝖾𝗇𝗍 𝗐𝗋𝗈𝗇𝗀 𝗐𝗂𝗍𝗁 𝗍𝗁𝖾 𝖿𝗂𝗅𝖾 Ი𐑼 𖹭`);
    }
  }
};