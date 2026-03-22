const DIG = require("discord-image-generation");
const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "jail",
    version: "2.0",
    author: "SIFU",
    countDown: 5,
    role: 0,
    shortDescription: "Put someone in jail",
    longDescription: "Generates a jail meme image using user avatar",
    category: "fun",
    guide: {
      en: "{pn} @tag or reply to a message"
    }
  },

  onStart: async function ({ event, message, args }) {
    try {
      let targetID;

      // 1️⃣ Target Selection (Mention > Reply > Sender)
      if (Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
      } else if (event.messageReply) {
        targetID = event.messageReply.senderID;
      } else {
        return message.reply("🐳 Please tag someone or reply to their message to put them in jail!");
      }

      // 2️⃣ Profile Picture Fix (Using Graph API with Token)
      const token = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";
      const avatarURL = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=${token}`;

      // Download avatar as buffer
      const response = await axios.get(avatarURL, { responseType: "arraybuffer" });
      const avatarBuffer = Buffer.from(response.data);

      // 3️⃣ Generate Jail Image
      const img = await new DIG.Jail().getImage(avatarBuffer);
      
      const cacheDir = path.join(__dirname, "tmp");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      
      const pathSave = path.join(cacheDir, `jail_${targetID}.png`);
      fs.writeFileSync(pathSave, Buffer.from(img));

      // 4️⃣ Formatting message content
      let content = args.join(' ');
      // Remove mention text from body if present
      for (const id in event.mentions) {
        content = content.replace(event.mentions[id], "");
      }

      const bodyMsg = `⚖️ 𝐉𝐮𝐬𝐭𝐢𝐜𝐞 𝐒𝐞𝐫𝐯𝐞𝐝! ⚖️\n\n${content.trim() || "You're under arrest for being too cool!"} 🚔🚨`;

      // 5️⃣ Send and Cleanup
      return message.reply({
        body: bodyMsg,
        attachment: fs.createReadStream(pathSave)
      }, () => {
        if (fs.existsSync(pathSave)) fs.unlinkSync(pathSave);
      });

    } catch (error) {
      console.error("JAIL CMD ERROR:", error);
      return message.reply(" Failed to generate Jail image. Please try again later.");
    }
  }
};