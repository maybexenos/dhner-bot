const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');

const fetchAvatar = async (uid) => {
  try {
    const avatarUrl = `https://graph.facebook.com/${uid}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const response = await axios.get(`${avatarUrl}&t=${Date.now()}`, {
      responseType: "arraybuffer",
      timeout: 15000,
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    return Buffer.from(response.data);
  } catch (error) {
    throw new Error(`Failed to fetch avatar: ${error.message}`);
  }
};

module.exports = {
  config: {
    name: 'dim',
    aliases: ['anda', 'egg'],
    version: '3.0.0',
    author: 'S1FU',
    countDown: 5,
    role: 0,
    category: 'fun',
    description: { en: "𝗍𝗎𝗋𝗇 𝗌𝗈𝗆𝖾𝗈𝗇𝖾 𝗂𝗇𝗍𝗈 𝖺 𝖽𝗂𝗆 (𝖾𝗀𝗀) 𝗆𝖾𝗆𝖾" },
    guide: { en: "『 {pn} @𝗆𝖾𝗇𝗍𝗂𝗈𝗇 / 𝗋𝖾𝗉𝗅𝗒 』" }
  },

  onStart: async function ({ event, api, message, usersData }) {
    const { threadID, messageID, senderID } = event;

    const stylize = (text) => {
      const fonts = {
        "a":"𝖺","b":"𝖻","c":"𝖼","d":"𝖽","e":"𝖾","f":"𝖿","g":"𝗀","h":"𝗁","i":"𝗂","j":"𝗃","k":"𝗄","l":"𝗅","m":"𝗆",
        "n":"𝗇","o":"𝗈","p":"𝗉","q":"𝗊","r":"𝗋","s":"𝗌","t":"𝗍","u":"𝗎","v":"𝗏","w":"𝗐","x":"𝗑","y":"𝗒","z":"𝗓",
        "0":"𝟎","1":"𝟏","2":"𝟐","3":"𝟑","4":"𝟒","5":"𝟓","6":"𝟔","7":"𝟕","8":"𝟖","9":"𝟗"
      };
      return text.toString().toLowerCase().split('').map(char => fonts[char] || char).join('');
    };

    try {
      const targetID = event.mentions && Object.keys(event.mentions).length > 0
        ? Object.keys(event.mentions)[0]
        : event.messageReply?.senderID;

      if (!targetID) return message.reply(`┏━━━〔 𝖾𝗋𝗋𝗈𝗋 〕━━━┓\n\n  ᯓ★ ${stylize("mention or reply to someone")}\n\n┗━━━━━━━━━━━━━━━┛`);
      
      api.setMessageReaction("🥚", messageID, () => {}, true);
      const targetName = await usersData.getName(targetID);

      const avatarBuffer = await fetchAvatar(targetID);
      const avatar = await loadImage(avatarBuffer);

      const cacheDir = path.join(__dirname, 'cache', 'dim');
      await fs.ensureDir(cacheDir);
      const bgPath = path.join(cacheDir, 'bg.jpg');

      let bg;
      if (!fs.existsSync(bgPath)) {
        const bgRes = await axios.get('https://i.postimg.cc/Wbt5GLY7/5674fba3a393f7578a73919569b5147f.jpg', { responseType: 'arraybuffer' });
        await fs.writeFile(bgPath, bgRes.data);
        bg = await loadImage(bgRes.data);
      } else {
        bg = await loadImage(await fs.readFile(bgPath));
      }

      const canvas = createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bg, 0, 0);

      const size = 155;
      const x = 98;  
      const y = 58;   

      ctx.save();
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatar, x, y, size, size);
      ctx.restore();

      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2 + 2, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.stroke();

      const output = path.join(cacheDir, `dim_${targetID}.png`);
      await fs.writeFile(output, canvas.toBuffer());

      const bodyMsg = 
        `\n\n` +
        `  ᯓ★ ${stylize(targetName)} ${stylize("is now a pure egg")}\n` +
        `  ⋆ 𝗌𝗍𝖺𝗍𝗎𝗌: ${stylize("dim level max")}\n\n` +
        ``;

      await message.reply({
        body: bodyMsg,
        attachment: fs.createReadStream(output)
      });

      setTimeout(() => fs.unlink(output).catch(() => {}), 5000);

    } catch (e) {
      console.error(e);
      message.reply(`ᯓ★ ${stylize("failed to create dim meme")} Ი𐑼`);
    }
  }
};