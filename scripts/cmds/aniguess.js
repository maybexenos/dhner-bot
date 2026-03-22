const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "aniguess",
    aliases: ["animeguess", "ag"],
    version: "2.0",
    author: "S1FU",
    role: 0,
    countDown: 5,
    shortDescription: { en: "𝗀𝗎𝖾𝗌𝗌 𝗍𝗁𝖾 𝖺𝗇𝗂𝗆𝖾 𝖼𝗁𝖺𝗋𝖺𝖼𝗍𝖾𝗋" },
    category: "𝖺𝗇𝗂𝗆𝖾",
    guide: { en: "『 {pn} 』 𝗈𝗋 『 {pn} 𝗍𝗈𝗉 』" }
  },

  onStart: async function ({ event, message, usersData, api, args }) {
    const { getStreamFromURL } = global.utils;

    if (args[0] === "top") {
      const allUsers = await usersData.getAll();
      const topPlayers = allUsers
        .sort((a, b) => (b.money || 0) - (a.money || 0))
        .slice(0, 5);

      let msg = `┏━━━〔 𝗍𝗈𝗉 𝗉𝗅𝖺𝗒𝖾𝗋𝗌 〕━━━┓\n\n`;
      topPlayers.forEach((user, index) => {
        msg += `  ${index + 1}. ${user.name}: ${user.money || 0} 𝖼𝗈𝗂𝗇𝗌\n`;
      });
      msg += `\n┗━━━━━━━━━━━━━━━┛`;
      return message.reply(msg);
    }

    try {
      const res = await axios.get('https://animequiz-mu.vercel.app/kshitiz');
      const { image, traits, tags, fullName, firstName } = res.data;

      const imageStream = await getStreamFromURL(image);

      const body = `┏━━━〔 𝖺𝗇𝗂𝗆𝖾 𝗀𝗎𝖾𝗌𝗌 〕━━━┓\n\n` +
        `  ᯓ★ 𝗀𝗎𝖾𝗌𝗌 𝗍𝗁𝖾 𝖼𝗁𝖺𝗋𝖺𝖼𝗍𝖾𝗋 .ᐟ\n` +
        `  ⋆ 𝗍𝗋𝖺𝗂𝗍𝗌: ${traits}\n` +
        `  ⋆ 𝗍𝖺𝗀𝗌: ${tags}\n\n` +
        `  ⏳ 𝗋𝖾𝗉𝗅𝗒 𝗂𝗇 𝟣𝟧𝗌\n` +
        `┗━━━━━━━━━━━━━━━┛`;

      const sent = await message.reply({ body, attachment: imageStream });

      global.GoatBot.onReply.set(sent.messageID, {
        commandName: this.config.name,
        correctAnswer: [fullName.toLowerCase(), firstName.toLowerCase()],
        senderID: event.senderID,
        messageID: sent.messageID
      });

      setTimeout(async () => {
        if (global.GoatBot.onReply.has(sent.messageID)) {
          global.GoatBot.onReply.delete(sent.messageID);
          api.unsendMessage(sent.messageID);
        }
      }, 15000);

    } catch (error) {
      console.error(error);
      return message.reply("ᯓ★ 𝖺𝗉𝗂 𝖾𝗋𝗋𝗈𝗋 𝗈𝗋 𝗍𝗂𝗆𝖾𝗈𝗎𝗍 Ი𐑼");
    }
  },

  onReply: async function ({ message, event, Reply, api, usersData }) {
    const { senderID, body } = event;
    const { correctAnswer, messageID, senderID: originalAuthor } = Reply;

    if (senderID !== originalAuthor) return;

    const userAnswer = body.trim().toLowerCase();

    if (correctAnswer.includes(userAnswer)) {
      const reward = 1000;
      const userData = await usersData.get(senderID);
      await usersData.set(senderID, { money: (userData.money || 0) + reward });

      global.GoatBot.onReply.delete(messageID);
      api.unsendMessage(messageID);
      
      return message.reply(`┏━━━〔 𝖼𝗈𝗋𝗋𝖾𝖼𝗍 〕━━━┓\n\n  ᯓ★ 𝗈𝗆𝖾𝖽𝖾𝗍𝗈𝗎 .ᐟ\n  ⋆ 𝗒𝗈𝗎 𝗐𝗈𝗇: ${reward} 𝖼𝗈𝗂𝗇𝗌\n\n┗━━━━━━━━━━━━━━━┛`);
    } else {
      global.GoatBot.onReply.delete(messageID);
      api.unsendMessage(messageID);
      
      return message.reply(`┏━━━〔 𝗐𝗋𝗈𝗇𝗀 〕━━━┓\n\n  ᯓ★ 𝗀𝖺𝗆𝖾 𝗈𝗏𝖾𝗋 .ᐟ\n  ⋆ 𝖺𝗇𝗌𝗐𝖾𝗋: ${correctAnswer[0]}\n\n┗━━━━━━━━━━━━━━━┛`);
    }
  }
};