module.exports = {
  config: {
    name: "bio",
    version: "3.5",
    author: "SiFu",
    countDown: 5,
    role: 2, 
    shortDescription: {
      en: "Advanced bio manager with confirmation system",
    },
    longDescription: {
      en: "Change bot bio with confirmation and character limit checks",
    },
    category: "owner",
    guide: {
      en: "{pn} [text] | {pn} clear",
    },
  },

  onStart: async function ({ args, message, event, api }) {
    const input = args.join(" ");

    if (!input) {
      return message.reply("⚠️ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴛᴇxᴛ ᴏʀ ᴜsᴇ 'clear'! ᯓ★");
    }

    if (input.toLowerCase() === "clear") {
      return message.reply("🔄 ʀᴇᴘʟʏ ᴛᴏ ᴛʜɪs ᴍᴇssᴀɢᴇ ᴡɪᴛʜ 'yes' ᴛᴏ ᴄʟᴇᴀʀ ᴛʜᴇ ʙɪᴏ.", (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: event.senderID,
          type: "confirmClear"
        });
      });
    }

    if (input.length > 101) {
      return message.reply(`❌ ᴛᴏᴏ ʟᴏɴɢ! (${input.length}/101). ᴘʟᴇᴀsᴇ sʜᴏʀᴛᴇɴ ɪᴛ. 𖹭`);
    }

    // ᴄᴏɴғɪʀᴍᴀᴛɪᴏɴ sᴛᴇᴘ ғᴏʀ ɴᴇᴡ ʙɪᴏ
    const msg = `🔍 ᴘʀᴇᴠɪᴇᴡ: "${input}"\n\n💬 ʀᴇᴘʟʏ ᴛᴏ ᴛʜɪs ᴍᴇssᴀɢᴇ ᴡɪᴛʜ 'yes' ᴛᴏ ᴄᴏɴғɪʀᴍ ᴛʜᴇ ᴄʜᴀɴɢᴇ. ˙𐃷˙`;
    
    return message.reply(msg, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        messageID: info.messageID,
        author: event.senderID,
        newBio: input,
        type: "confirmChange"
      });
    });
  },

  onReply: async function ({ api, message, event, Reply, args }) {
    const { author, type, newBio, messageID } = Reply;
    if (event.senderID !== author) return;

    const confirmation = args[0]?.toLowerCase();

    if (confirmation === "yes" || confirmation === "confirm") {
      try {
        if (type === "confirmChange") {
          await api.changeBio(newBio);
          message.reply(`🐋\nɴᴇᴡ ʙɪᴏ: ${newBio} ᯓ★`);
        } else if (type === "confirmClear") {
          await api.changeBio("");
          message.reply(" ʙɪᴏ ʜᴀs ʙᴇᴇɴ sᴜᴄᴄᴇssғᴜʟʟʏ ᴄʟᴇᴀʀᴇᴅ! 𐃷");
        }
        api.unsendMessage(messageID); // ᴏᴘᴛɪᴏɴᴀʟ: ᴅᴇʟᴇᴛᴇ ᴛʜᴇ ᴄᴏɴғɪʀᴍᴀᴛɪᴏɴ ᴘʀᴏᴍᴘᴛ
      } catch (err) {
        message.reply("❌ ᴀɴ ᴇʀʀᴏʀ ᴏᴄᴄᴜʀʀᴇᴅ! ᴄʜᴇᴄᴋ ᴛᴏᴋᴇɴ ᴘᴇʀᴍɪssɪᴏɴs. Ი𐑼⋆");
      }
    } else {
      message.reply("❌ ᴄᴀɴᴄᴇʟʟᴇᴅ! ɴᴏ ᴄʜᴀɴɢᴇs ᴡᴇʀᴇ ᴍᴀᴅᴇ. 𖹭");
    }
  }
};