const axios = require("axios");

module.exports = {
  config: {
    name: "whatsong",
    aliases: ["shazam", "findsong", "identify"],
    version: "1.0",
    author: "NeoKEX",
    countDown: 10,
    role: 0,
    shortDescription: { en: "Identify music from audio/video" },
    longDescription: { en: "Identify music in a replied audio or video file using AudD API" },
    category: "utility",
    guide: {
      en: "Reply to an audio or video file with: {pn}"
    }
  },

  onStart: async function ({ message, event, api }) {
    const { messageReply, type } = event;

    if (type !== "message_reply" || !messageReply.attachments || messageReply.attachments.length === 0) {
      return message.reply("Please reply to an audio or video clip to identify the song.");
    }

    const attachment = messageReply.attachments[0];
    
    if (attachment.type !== "audio" && attachment.type !== "video") {
      return message.reply("Please reply to a valid audio or video file.");
    }

    const fileUrl = attachment.url;
    const apiToken = "2d3c02eddbcb2830ada64f0506a6cf8c";

    try {
      api.setMessageReaction("🔍", event.messageID, () => {}, true);

      const response = await axios.get("https://api.audd.io/", {
        params: {
          api_token: apiToken,
          url: fileUrl,
          return: "apple_music,spotify,deezer"
        }
      });

      const { status, result, error } = response.data;

      if (status === "error") {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply(`API Error: ${error.error_message} (Code: ${error.error_code})`);
      }

      if (!result) {
        api.setMessageReaction("🤷‍♂️", event.messageID, () => {}, true);
        return message.reply("Sorry, I couldn't identify any music in this file.");
      }

      api.setMessageReaction("✅", event.messageID, () => {}, true);
      
      let resMsg = `🎵 Song Found!\n\n` +
                   `🏷️ Title: ${result.title}\n` +
                   `👤 Artist: ${result.artist}\n` +
                   `💿 Album: ${result.album}\n` +
                   `📅 Release Date: ${result.release_date || "Unknown"}\n` +
                   `🏢 Label: ${result.label || "N/A"}\n\n` +
                   `🔗 Listen: ${result.song_link}`;

      if (result.spotify) resMsg += `\n🟢 Spotify: ${result.spotify.external_urls.spotify}`;
      if (result.apple_music) resMsg += `\n🍎 Apple Music: ${result.apple_music.url}`;
      
      await message.reply(resMsg);

    } catch (err) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return message.reply(`Error: ${err.message}`);
    }
  }
};