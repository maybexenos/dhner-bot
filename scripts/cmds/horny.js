const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "horny",
    aliases: ["license", "hornymeme"],
    version: "1.0.0",
    author: "SiFu",
    countDown: 5,
    role: 0,
    shortDescription: "Horny license meme image",
    longDescription: "Generate a horny license meme with user avatar",
    category: "fun"
  },

  onStart: async function ({ api, event }) {
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    try {
      let uid;

      // রিপ্লাই বা মেনশন থেকে UID নেওয়া
      if (event.type === "message_reply") {
        uid = event.messageReply.senderID;
      } else if (Object.keys(event.mentions).length > 0) {
        uid = Object.keys(event.mentions)[0];
      } else {
        uid = event.senderID;
      }

      // প্রোফাইল পিকচার লিঙ্ক (এটি সাধারণত সব ক্ষেত্রে কাজ করে)
      const avatar = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      // API কল
      const res = await axios.get(
        `https://maybexenos.vercel.app/meme/horny?avatar=${encodeURIComponent(avatar)}`,
        { responseType: "arraybuffer" }
      );

      const imgPath = path.join(cacheDir, `horny_${uid}.png`);
      fs.writeFileSync(imgPath, Buffer.from(res.data, "utf-8"));

      // শুধু ইমেজ পাঠানো
      return api.sendMessage(
        {
          attachment: fs.createReadStream(imgPath)
        },
        event.threadID,
        () => {
          if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        },
        event.messageID
      );

    } catch (err) {
      console.error(err);
      return api.sendMessage("error 😿", event.threadID);
    }
  }
};
