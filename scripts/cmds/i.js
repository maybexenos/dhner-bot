module.exports = {
  config: {
    name: "i",
    aliases: ["hotline"],
    version: "2.0",
    author: "SiFu",
    shortDescription: "Create a Drake meme",
    longDescription: "Generate a high-quality Drake meme using the PopCat API without any bot text messages.",
    category: "fun",
    guide: "{pn} Top Text | Bottom Text"
  },

  async onStart({ api, event, args }) {
    try {
      const content = args.join(" ");
      const textParts = content.split("|");

      // Validating input - if invalid, it simply stops (as per your "no text message" request)
      if (textParts.length < 2) return;

      const text1 = textParts[0].trim();
      const text2 = textParts[1].trim();

      // Show typing indicator for a smoother feel
      api.sendTypingIndicator(event.threadID);

      const apiURL = `https://api.popcat.xyz/v2/drake?text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}`;

      // Sending only the attachment with no body text
      return api.sendMessage({
        attachment: await global.utils.getStreamFromURL(apiURL)
      }, event.threadID, event.messageID);

    } catch (err) {
      console.error(err);
      // Fails silently to ensure no text messages are sent
    }
  }
};