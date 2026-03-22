module.exports = {
  config: {
    name: "botnick",
    aliases: ["botname"],
    version: "3.0",
    author: "SiFu",
    countDown: 10,
    role: 2,
    category: "owner",
    guide: { en: "{pn} <new nickname>" }
  },

  onStart: async function({ api, args, threadsData, message, event }) {
    const newName = args.join(" ");
    if (!newName) return message.reply("❌ ᴘʟᴇᴀsᴇ ᴇɴᴛᴇʀ ᴛʜᴇ ɴᴇᴡ ɴɪᴄᴋɴᴀᴍᴇ! ᯓ★");

    const allThreads = (await threadsData.getAll()).filter(t => t.isGroup && t.threadID);
    
    const msg = `🐍 ᴀʀᴇ ʏᴏᴜ sᴜʀᴇ ʏᴏᴜ ᴡᴀɴᴛ ᴛᴏ ᴄʜᴀɴɢᴇ ᴛʜᴇ ʙᴏᴛ ɴɪᴄᴋɴᴀᴍᴇ ᴛᴏ: "${newName}" ɪɴ ${allThreads.length} ɢʀᴏᴜᴘs?\n\n ʀᴇᴀᴄᴛ ᴛᴏ ᴛʜɪs ᴍᴇssᴀɢᴇ ᴛᴏ ᴄᴏɴғɪʀᴍ. 𐃷`;

    return message.reply(msg, (err, info) => {
      global.GoatBot.onReaction.set(info.messageID, {
        commandName: this.config.name,
        messageID: info.messageID,
        author: event.senderID,
        newName,
        allThreads
      });
    });
  },

  onReaction: async function({ api, message, event, Reaction }) {
    const { author, newName, allThreads, messageID } = Reaction;
    
    if (event.userID !== author) return;

    api.unsendMessage(messageID);

    const report = await message.reply("🎀 ᴘʀᴏᴄᴇss sᴛᴀʀᴛᴇᴅ... ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ. ᯓ★");
    
    let successCount = 0;
    let failCount = 0;

    for (const thread of allThreads) {
      try {
        
        await new Promise(resolve => setTimeout(resolve, 500)); 
        await api.changeNickname(newName, thread.threadID, api.getCurrentUserID());
        successCount++;
      } catch (error) {
        failCount++;
      }
    }

    return message.reply(`👻 ᴅᴏɴᴇ! ʜᴀᴀ ᴍᴇʀɪ ᴊᴀᴀᴀɴ 🐋\n\n✨ sᴜᴄᴄᴇss: ${successCount}\n❌ ғᴀɪʟᴇᴅ: ${failCount}\n🏷️ ɴᴇᴡ ɴᴀᴍᴇ: ${newName} `);
  }
};