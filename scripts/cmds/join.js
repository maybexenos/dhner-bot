const fs = require("fs-extra"); // not really used here, but kept for consistency

module.exports = {
  config: {
    name: "join",
    aliases: ["joingroup", "addme", "groupjoin"],
    version: "3.4",
    author: "乛 Xꫀᥒos ゎ",
    countDown: 6,
    role: 2,
    description: "See all groups I'm in and let you join one~",
    category: "admin",
    guide: {
      en: "{pn}\nJust reply with a number from the list ♡"
    }
  },

  langs: {
    en: {
      no_groups:      "૮₍ ˶• ̫ •˶ ₎ა Oopsie~ I'm not in any groups right now...",
      loading:        "✧･ﾟ: *✧･ﾟ:* Collecting cozy groups... *:･ﾟ✧*:･ﾟ✧\n♡ Please wait cutie~ ♡",
      list_header:    "┏━━━〔  〕━━━┓\n     ♡ ɢʀᴏᴜᴘ ᴅɪᴀʀʏ ♡\n┏━━━〔  〕━━━┓\n",
      list_item:      "❀ %1. %2\n   ᴵᴰ → %3   👥 %4 cuties\n" + "✦ • ─────── • ✦",
      list_footer:    "\n♡ Reply with the number to join a cozy place~ ♡\n┏━━━〔  〕━━━┓",
      already_in:     "💖 You're already in \"%1\" silly~ No need to knock twice ♡",
      group_full:     "🥺 \"%1\" is full (250 members max)... maybe next time?",
      success:        "૮₍ ˶ᵔ ᵕ ᵔ˶ ₎ა Yayyy~ You joined \"%1\"!\nHave fun in the group cutie~ 💕",
      error:          "｡ﾟ(ﾟ´Д｀ﾟ)ﾟ｡ Oh no... couldn't add you\nMaybe I don't have permission? 🥺",
      invalid_number: "❀ That number doesn't exist in my list... try again okay? ♡",
      not_your_reply: "✿ This list isn't yours cutie~ Only the owner can choose~"
    }
  },

  onStart: async function ({ api, event, message, getLang }) {
    const loading = await message.reply(getLang("loading"));

    try {
      const threads = await api.getThreadList(50, null, ["INBOX"]);
      const groups = threads.filter(t => 
        t.isGroup && 
        t.threadName && 
        t.threadName.trim() !== "" &&
        !t.isArchived
      );

      if (groups.length === 0) {
        return message.reply(getLang("no_groups"));
      }

      let txt = getLang("list_header");

      groups.forEach((g, i) => {
        txt += getLang("list_item", i + 1, g.threadName, g.threadID, g.participantIDs?.length || "?");
      });

      txt += getLang("list_footer");

      const sentMsg = await message.reply(txt);

      // Clean loading message
      api.unsendMessage(loading.messageID).catch(() => {});

      // Save reply state
      global.GoatBot.onReply.set(sentMsg.messageID, {
        commandName: this.config.name,
        author: event.senderID,
        groups: groups,
        messageID: sentMsg.messageID
      });

    } catch (err) {
      console.error("[join] Error:", err);
      api.unsendMessage(loading.messageID).catch(() => {});
      return message.reply(getLang("error"));
    }
  },

  onReply: async function ({ api, event, Reply, message, getLang }) {
    const { author, groups } = Reply;

    if (event.senderID !== author) {
      return message.reply(getLang("not_your_reply"));
    }

    const num = parseInt(event.body.trim(), 10);
    if (isNaN(num) || num < 1 || num > groups.length) {
      return message.reply(getLang("invalid_number"));
    }

    const chosen = groups[num - 1];

    try {
      const threadInfo = await api.getThreadInfo(chosen.threadID);

      if (threadInfo.participantIDs.includes(event.senderID)) {
        return message.reply(getLang("already_in", chosen.threadName));
      }

      if (threadInfo.participantIDs.length >= 250) {
        return message.reply(getLang("group_full", chosen.threadName));
      }

      await api.addUserToGroup(event.senderID, chosen.threadID);

      message.reply(getLang("success", chosen.threadName));

    } catch (err) {
      console.error("[join onReply] Error:", err);
      message.reply(getLang("error"));
    } finally {
      // Clean up reply handler
      global.GoatBot.onReply.delete(Reply.messageID);
    }
  }
};
