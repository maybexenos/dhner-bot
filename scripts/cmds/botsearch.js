const axios = require('axios');

module.exports = {
  config: {
    name: "botsearch",
    version: "2.0",
    author: "SiFu",
    countDown: 5,
    description: "🔍 Search Google with previews and reactions",
    category: "utility",
    guide: { en: "{pn} [query]" }
  },

  onStart: async function ({ api, event, args, message }) {
    const query = args.join(" ");
    if (!query) return message.reply("❌ ᴘʟᴇᴀsᴇ ᴇɴᴛᴇʀ ᴀ sᴇᴀʀᴄʜ ϙᴜᴇʀʏ! ᯓ★");

    // ᴘʟᴇᴀsᴇ ᴜsᴇ ʏᴏᴜʀ ᴏᴡɴ ᴋᴇʏs ɪɴ ᴘʀᴏᴅᴜᴄᴛɪᴏɴ
    const API_KEY = "AIzaSyApKVVy6L44Qz21LR2BJWRhf7yP4qmczvg";
    const CX = "b4c33dfdc37784f23"; 

    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${CX}&key=${API_KEY}`;

    message.reply("🔍 sᴇᴀʀᴄʜɪɴɢ ᴛʜᴇ ᴡᴇʙ... ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ.", async (err, info) => {
      try {
        const response = await axios.get(url);
        const results = response.data.items;

        if (!results || results.length === 0) {
          return message.reply("❌ ɴᴏ ʀᴇsᴜʟᴛs ғᴏᴜɴᴅ ғᴏʀ ʏᴏᴜʀ ϙᴜᴇʀʏ. 𐃷");
        }

        let messageText = `📚 **sᴇᴀʀᴄʜ ʀᴇsᴜʟᴛs ғᴏʀ:** "${query.toUpperCase()}"\n━━━━━━━━━━━━━\n\n`;
        
        results.slice(0, 5).forEach((item, index) => {
          messageText += `${index + 1}. 📌 **${item.title}**\n🔹 ${item.snippet}\n🔗 ${item.link}\n\n`;
        });

        messageText += `━━━━━━━━━━━━━\n💡 ʜᴀᴀ ᴍᴇʀɪ ᴊᴀᴀᴀɴ 🐋 ᯓ★`;

        await message.reply(messageText);
        api.unsendMessage(info.messageID); // ʀᴇᴍᴏᴠᴇ "sᴇᴀʀᴄʜɪɴɢ" ᴍᴇssᴀɢᴇ

      } catch (error) {
        console.error("Search Error:", error);
        message.reply("⚠️ ᴇʀʀᴏʀ: ᴀᴘɪ ʟɪᴍɪᴛ ʀᴇᴀᴄʜᴇᴅ ᴏʀ ɴᴇᴛᴡᴏʀᴋ ɪssᴜᴇ. Ი𐑼⋆");
      }
    });
  }
};