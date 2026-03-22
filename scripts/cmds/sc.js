const A = require("axios");
const B = require("fs");
const C = require("path");

const F = C.join(__dirname, "cache", `sc_${Date.now()}.mp3`);

const G = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";

module.exports = {
  config: {
    name: "soundcloud",
    aliases: ["sc", "music"],
    version: "0.0.1",
    author: "ArYAN",
    countDown: 10,
    role: 0,
    description: "Search and download music from SoundCloud",
    category: "Downloader",
    guide: "{pn} <song name>"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const D = args.join(" ");

    if (!D) return api.sendMessage("⚠️ Please provide a [song name]", threadID, messageID);

    

    try {
      api.setMessageReaction("⏳", event.messageID, event.threadID);

      const K = await A.get(G);
      const H = K.data.api;

      const S = await A.get(`${H}/soundcloudv2?type=search&q=${encodeURIComponent(D)}`);
      if (!S.data.status || S.data.results.length === 0) throw new Error();

      const L = S.data.results[0].url;
      const M = S.data.results[0].title;

      const N = await A.get(`${H}/soundcloudv2?type=download&url=${encodeURIComponent(L)}`);
      const O = N.data.download_url;

      const P = await A.get(O, { responseType: "arraybuffer" });

      B.writeFileSync(F, Buffer.from(P.data));
      api.setMessageReaction("✅", event.messageID, event.threadID);

      return api.sendMessage({
        body: `🎵 Title: ${M}\n✅ [Downloaded successfully]`,
        attachment: B.createReadStream(F)
      }, threadID, () => {
        if (B.existsSync(F)) B.unlinkSync(F);
      }, messageID);

    } catch (Q) {
      api.setMessageReaction("❌", event.messageID, event.threadID);
      if (B.existsSync(F)) B.unlinkSync(F);
      return api.sendMessage("[OK]", threadID, messageID);
    }
  }
};