const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pairr",
    aliases: ["shadi"],
    version: "2.5.0",
    author: "Xenos",
    countDown: 10,
    role: 0,
    category: "fun",
    description: "Generate a love pair image with someone",
    guide: {
      en: "{pn} @mention or reply to a user"
    }
  },

  onStart: async function ({ api, event, args, message, usersData }) {
    const { threadID, senderID, messageReply, mentions } = event;
    const line = "━━━━━━━━━━━━━━━━━━";

  
    let partnerID;
    if (Object.keys(mentions).length > 0) {
      partnerID = Object.keys(mentions)[0];
    } else if (messageReply) {
      partnerID = messageReply.senderID;
    } else {
      return message.reply("⚠️ Please mention someone or reply to their message to pair!");
    }

    const loading = await message.reply("🎀 ᴄᴀʟᴄᴜʟᴀᴛɪɴɢ ʟᴏᴠᴇ ᴘᴇʀᴄᴇɴᴛᴀɢᴇ...");

    try {
     
      const name1 = await usersData.getName(senderID);
      const name2 = await usersData.getName(partnerID);
      const avatar1 = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const avatar2 = `https://graph.facebook.com/${partnerID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      
   
      const percent = Math.floor(Math.random() * 31) + 70; // ৭০% থেকে ১০০% এর মধ্যে

    
      const apiUrl = `https://maybexenos.vercel.app/love/pair?avatar1=${encodeURIComponent(avatar1)}&avatar2=${encodeURIComponent(avatar2)}&name1=${encodeURIComponent(name1)}&name2=${encodeURIComponent(name2)}&percent=${percent}`;

    
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const imgPath = path.join(cacheDir, `pair_${Date.now()}.png`);

      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      await fs.writeFile(imgPath, Buffer.from(response.data));

      
      api.unsendMessage(loading.messageID);

      const caption = 
        `[ ᴘᴀɪʀ ᴍᴀᴛᴄʜ ᴍᴀᴋᴇʀ ]\n` +
        `${line}\n` +
        `● ᴘᴀʀᴛɴᴇʀ 𝟷: ${name1}\n` +
        `● ᴘᴀʀᴛɴᴇʀ 𝟸: ${name2}\n` +
        `● ᴍᴀᴛᴄʜ: ${percent}%\n` +
        `${line}\n` +
        `⚡ sᴜᴄᴄᴇssғᴜʟʟʏ ᴘᴀɪʀᴇᴅ!`;

      await message.reply({
        body: caption,
        attachment: fs.createReadStream(imgPath)
      });

      // ফাইল ক্লিনআপ
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);

    } catch (err) {
      console.error(err);
      api.unsendMessage(loading.messageID);
      return message.reply("❌ ᴇʀʀᴏʀ: ғᴀɪʟᴇᴅ ᴛᴏ ɢᴇɴᴇʀᴀᴛᴇ ᴘᴀɪʀ ɪᴍᴀɢᴇ.");
    }
  }
};