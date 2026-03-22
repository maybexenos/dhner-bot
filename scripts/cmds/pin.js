const axios = require("axios");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "pinterest",
    aliases: ["pin", "pint"],
    version: "1.0.0",
    author: "Xenos",
    countDown: 10,
    role: 0,
    category: "image",
    shortDescription: "Pinterest search with cute mobile UI",
    longDescription: "Search Pinterest images with beautiful grid view & pagination",
    guide: {
      en: "{pn} <query> [-count]\n\n" +
          "Examples:\n" +
          "  {pn} pastel anime girl\n" +
          "  {pn} kawaii cat -12\n\n" +
          "Reply with: next / more / আরো / দাও"
    }
  },

  onStart: async function ({ api, args, message, event }) {
    // ─── Parse count & query ───
    let count = 6; // default mobile-friendly grid
    const countMatch = args.find(arg => arg.startsWith("-") && /^\-\d+$/.test(arg));
    if (countMatch) {
      count = Math.max(1, Math.min(30, parseInt(countMatch.slice(1))));
      args = args.filter(a => a !== countMatch);
    }

    const query = args.join(" ").trim();
    if (!query) {
      return message.reply(
        "✧･ﾟ: *✧･ﾟ:*  Pinterest Magic *:･ﾟ✧*:･ﾟ✧\n\n" +
        "Please write what you want to search~\n" +
        "Example: pinterest cute cat -9\n\n" +
        "Or just reply 'next' to see more ♡"
      );
    }

    const loading = await message.reply(
      `✨ Searching Pinterest for "${query}"...\n` +
      `Preparing ${count} cute images~ ♡`
    );

    message.reaction("🔍", event.messageID);

    try {
      // ─── API Call ───
      const apiUrl = `https://egret-driving-cattle.ngrok-free.app/api/pin?query=${encodeURIComponent(query)}&num=120`;
      const { data } = await axios.get(apiUrl, { timeout: 20000 });

      const images = Array.isArray(data?.results) ? data.results : [];
      if (images.length === 0) {
        api.unsendMessage(loading.messageID).catch(() => {});
        return message.reply(`(｡•́︿•̀｡) No cute images found for "${query}"...`);
      }

      api.unsendMessage(loading.messageID).catch(() => {});

      // First batch
      const firstBatch = images.slice(0, count);
      const streams = await prepareAttachments(firstBatch);

      if (streams.length === 0) {
        return message.reply("💦 Couldn't load the images... maybe try another keyword?");
      }

      const sent = await message.reply({
        body: createResultMessage(query, 1, streams.length, images.length),
        attachment: streams
      });

      // Register reply handler (correct GoatBot way)
      global.GoatBot.onReply.set(sent.messageID, {
        commandName: this.config.name,
        author: event.senderID,
        images,
        current: count,
        perPage: count,
        query
      });

      message.reaction("💖", event.messageID);

    } catch (err) {
      api.unsendMessage(loading.messageID).catch(() => {});
      console.error("[Pinterest]", err);
      message.reaction("🥺", event.messageID);
      message.reply(
        "｡ﾟ(ﾟ´Д｀ﾟ)ﾟ｡ Oops... something went wrong\n" +
        (err.message.includes("timeout") ? "The search took too long~" : err.message)
      );
    }
  },

  onReply: async function ({ api, event, Reply, message }) {
    if (event.senderID !== Reply.author) return;

    const replyText = event.body.toLowerCase().trim();
    const triggers = ["next", "more", "আরো", "দাও", "আরও", "পরের", "next page"];

    if (!triggers.includes(replyText)) return;

    const { images, current, perPage, query } = Reply;

    if (current >= images.length) {
      return message.reply(`🏁 No more images left for "${query}" ♡`);
    }

    message.reaction("⏳", event.messageID);

    const nextStart = current;
    const nextEnd = Math.min(current + perPage, images.length);
    const nextUrls = images.slice(nextStart, nextEnd);

    const streams = await prepareAttachments(nextUrls);

    if (streams.length === 0) {
      message.reaction("⚠️", event.messageID);
      return message.reply("Couldn't load next page... try again?");
    }

    const newMsg = await message.reply({
      body: createResultMessage(query, nextStart + 1, nextEnd, images.length),
      attachment: streams
    });

    message.reaction("✅", event.messageID);

    // Register new reply handler
    global.GoatBot.onReply.set(newMsg.messageID, {
      commandName: this.config.name,
      author: event.senderID,
      images,
      current: nextEnd,
      perPage,
      query
    });
  }
};

// ─── Helper Functions ───

function createResultMessage(query, start, end, total) {
  return `✧･: Pinterest Results :･✧\n\n` +
         `🔍 Topic: ${query}\n` +
         `🖼️ Showing: ${start} – ${end} of ${total}\n\n` +
         `💕 Reply "next" for more cuties~ ♡`;
}

async function prepareAttachments(urls) {
  if (!urls || urls.length === 0) return [];

  const results = await Promise.allSettled(
    urls.map(async url => {
      try {
        return await getStreamFromURL(url);
      } catch {
        return null;
      }
    })
  );

  return results
    .filter(r => r.status === "fulfilled" && r.value)
    .map(r => r.value);
}