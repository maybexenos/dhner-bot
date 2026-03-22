module.exports = {
  config: {
    name: "setemoji",
    version: "1.0.2",
    author: "Xenos",
    countDown: 3,
    role: 0,
    category: "group",
    description: "Change group emoji",
    guide: {
      en: "{pn} [emoji]"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID, messageID } = event;
    const line = "━━━━━━━━━━━━━━━━━━";
    const emoji = args.join(" ");

    if (!emoji) {
      return message.reply(`⚠️ Please provide an emoji!\nExample: setemoji 💖`);
    }

    try {
      await api.changeThreadEmoji(emoji, threadID);
      
      return message.reply(
        `[ GROUP SETTINGS ]\n` +
        `${line}\n` +
        `● New Emoji: ${emoji}\n` +
        `● Status: Updated ✓\n` +
        `${line}\n` +
        `    Success ✓`
      );
    } catch (err) {
      return message.reply("❌ Failed to change emoji! Make sure I have admin.");
    }
  }
};