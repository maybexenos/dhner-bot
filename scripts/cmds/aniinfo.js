const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "aniinfo",
    aliases: ["animeinfo", "a-info"],
    version: "2.0",
    author: "S1FU",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "𝗀𝖾𝗍 𝖺𝗇𝗂𝗆𝖾 𝗂𝗇𝖿𝗈𝗋𝗆𝖺𝗍𝗂𝗈𝗇 𝗎𝗌𝗂𝗇𝗀 𝗃𝗂𝗄𝖺𝗇 𝖺𝗉𝗂"
    },
    category: "𝖺𝗇𝗂𝗆𝖾",
    guide: {
      en: "『 {pn} [𝖺𝗇𝗂𝗆𝖾 𝗇𝖺𝗆𝖾] 』"
    }
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(" ");
    if (!query) {
      return api.sendMessage("┏━━━〔 𝗌𝗒𝗌𝗍𝖾𝗆 〕━━━┓\n\n  ᯓ★ 𝖺𝗇𝗂𝗆𝖾 𝗇𝖺𝗆𝖾 𝗆𝗂𝗌𝗌𝗂𝗇𝗀 .ᐟ\n\n┗━━━━━━━━━━━━━━━┛", event.threadID);
    }

    try {
      const res = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`);
      const anime = res.data.data[0];

      if (!anime) return api.sendMessage("ᯓ★ 𝗇𝗈 𝗋𝖾𝗌𝗎𝗅𝗍𝗌 𝖿𝗈𝗎𝗇𝖽 Ი𐑼", event.threadID);

      const {
        title,
        title_english,
        type,
        episodes,
        status,
        score,
        aired,
        synopsis,
        images,
        genres,
        url
      } = anime;

      const msg = `┏━━━〔 𝖺𝗇𝗂𝗆𝖾 𝗂𝗇𝖿𝗈 〕━━━┓\n\n` +
        `  ⋆ 𝗍𝗂𝗍𝗅𝖾: ${title_english || title}\n` +
        `  ⋆ 𝗍𝗒𝗉𝖾: ${type}\n` +
        `  ⋆ 𝗌𝖼𝗈𝗋𝖾: ${score || "?"}/10\n` +
        `  ⋆ 𝗌𝗍𝖺𝗍𝗎𝗌: ${status}\n` +
        `  ⋆ 𝖾𝗉𝗂𝗌𝗈𝖽𝖾𝗌: ${episodes || "?"}\n` +
        `  ⋆ 𝖺𝗂𝗋𝖾𝖽: ${aired.string || "?"}\n` +
        `  ⋆ 𝗀𝖾𝗇𝗋𝖾𝗌: ${genres.map(g => g.name).join(", ")}\n\n` +
        `  ⋆ 𝖽𝖾𝗌𝖼𝗋𝗂𝗉𝗍𝗂𝗈𝗇:\n  ${synopsis?.substring(0, 300) || "𝗇𝗈 𝗌𝗒𝗇𝗈𝗉𝗌𝗂𝗌 𝖿𝗈𝗎𝗇𝖽."}...\n\n` +
        `┗━━━━━━━━━━━━━━━┛`;

      const imageURL = images.jpg.large_image_url;
      const imgData = (await axios.get(imageURL, { responseType: "arraybuffer" })).data;
      const filePath = path.join(__dirname, "cache", `ani_${event.senderID}.jpg`);
      
      if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"));
      fs.writeFileSync(filePath, imgData);

      api.sendMessage(
        {
          body: msg,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); },
        event.messageID
      );

    } catch (err) {
      console.error(err);
      api.sendMessage("ᯓ★ 𝗌𝗒𝗌𝗍𝖾𝗆 𝖾𝗋𝗋𝗈𝗋 𝗈𝖼𝖼𝗎𝗋𝖾𝖽 Ი𐑼", event.threadID);
    }
  }
};