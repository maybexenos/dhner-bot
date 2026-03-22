const axios = require('axios');
const fs = require('fs-extra'); 
const path = require('path');
const stream = require('stream');
const { promisify } = require('util');

const pipeline = promisify(stream.pipeline);
const API_ENDPOINT = "https://free-goat-api.onrender.com/4k"; 
const CACHE_DIR = path.join(__dirname, 'cache');

function extractImageUrl(args, event) {
    let imageUrl = args.find(arg => arg.startsWith('http'));
    if (!imageUrl && event.messageReply?.attachments?.length > 0) {
        const imageAttachment = event.messageReply.attachments.find(att => att.type === 'photo' || att.type === 'image');
        if (imageAttachment?.url) imageUrl = imageAttachment.url;
    }
    return imageUrl;
}

module.exports = {
  config: {
    name: "4k",
    aliases: ["upscale", "hd", "enhance"],
    version: "2.0.0",
    author: "S1FU",
    countDown: 15,
    role: 0,
    category: "𝗂𝗆𝖺𝗀𝖾",
    shortDescription: { en: "𝗎𝗉𝗌𝖼𝖺𝗅𝖾 𝗂𝗆𝖺𝗀𝖾 𝗍𝗈 𝗁𝖽/𝟦𝗄 𝗋𝖾𝗌𝗈𝗅𝗎𝗍𝗂𝗈𝗇" },
    guide: { en: "『 {pn} <𝗎𝗋𝗅> | 𝗋𝖾𝗉𝗅𝗒 𝗍𝗈 𝗂𝗆𝖺𝗀𝖾 』" }
  },

  onStart: async function ({ args, message, event, api }) {
    const stylize = (text) => {
      const fonts = {
        "a":"𝖺","b":"𝖻","c":"𝖼","d":"𝖽","e":"𝖾","f":"𝖿","g":"𝗀","h":"𝗁","i":"𝗂","j":"𝗃","k":"𝗄","l":"𝗅","m":"𝗆",
        "n":"𝗇","o":"𝗈","p":"𝗉","q":"𝗊","r":"𝗋","s":"𝗌","t":"𝗍","u":"𝗎","v":"𝗏","w":"𝗐","x":"𝗑","y":"𝗒","z":"𝗓"
      };
      return text.toString().toLowerCase().split('').map(char => fonts[char] || char).join('');
    };

    const imageUrl = extractImageUrl(args, event);
    if (!imageUrl) {
      return message.reply(`✧ 𐃷 ${stylize("𝗉𝗅𝖾𝖺𝗌𝖾 𝗉𝗋𝗈𝗏𝗂𝖽𝖾 𝖺𝗇 𝗂𝗆𝖺𝗀𝖾 𝗎𝗋𝗅 𝗈𝗋 𝗋𝖾𝗉𝗅𝗒 𝗍𝗈 𝗈𝗇𝖾")} Ი𐑼 𖹭`);
    }

    await fs.ensureDir(CACHE_DIR);
    message.reaction("⏳", event.messageID);
    let tempFilePath; 

    try {
      const apiResponse = await axios.get(`${API_ENDPOINT}?url=${encodeURIComponent(imageUrl)}`, { timeout: 45000 });
      const upscaledImageUrl = apiResponse.data.image;

      if (!upscaledImageUrl) throw new Error("𝖺𝗉𝗂 𝗋𝖾𝗍𝗎𝗋𝗇𝖾𝖽 𝖾𝗆𝗉𝗍𝗒 𝗋𝖾𝗌𝗎𝗅𝗍");

      const imageRes = await axios.get(upscaledImageUrl, { responseType: 'stream', timeout: 60000 });
      const fileHash = Date.now() + Math.random().toString(36).substring(2, 5);
      tempFilePath = path.join(CACHE_DIR, `4k_${fileHash}.jpg`);
      
      await pipeline(imageRes.data, fs.createWriteStream(tempFilePath));
      message.reaction("✨", event.messageID);
      
      return api.sendMessage({
        body: `┏━━━〔 ${stylize("𝗎𝗉𝗌𝖼𝖺𝗅𝖾 𝗌𝗎𝖼𝖼𝖾𝗌𝗌")} 〕━━━┓\n\n  ᯓ★ ${stylize("𝗆𝗈𝖽𝖾")}: 𝟦𝗄 / 𝗎𝗅𝗍𝗋𝖺 𝗁𝖽\n  ᯓ★ ${stylize("𝗌𝗍𝖺𝗍𝗎𝗌")}: ${stylize("𝖾𝗇𝗁𝖺𝗇𝖼𝖾𝖽")}\n\n┗━━━━━━━━━━━━━━━┛`,
        attachment: fs.createReadStream(tempFilePath)
      }, event.threadID, () => {
          if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      }, event.messageID);

    } catch (error) {
      message.reaction("❌", event.messageID);
      console.error(error);
      return message.reply(`✧ 𐃷 ${stylize("𝖿𝖺𝗂𝗅𝖾𝖽 𝗍𝗈 𝗎𝗉𝗌𝖼𝖺𝗅𝖾 𝗂𝗆𝖺𝗀𝖾")} Ი𐑼 𖹭`);
    }
  }
};