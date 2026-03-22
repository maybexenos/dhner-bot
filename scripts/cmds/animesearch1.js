const axios = require('axios');

async function getStreamFromURL(url) {
    const response = await axios.get(url, { responseType: 'stream' });
    return response.data;
}

async function fetchTikTokVideos(query) {
    try {
        const response = await axios.get(`https://lyric-search-neon.vercel.app/kshitiz?keyword=${encodeURIComponent(query)}`);
        return response.data;
    } catch (error) {
        console.error('𝖿𝖾𝗍𝖼𝗁 𝖾𝗋𝗋𝗈𝗋:', error);
        return null;
    }
}

module.exports = {
    config: {
        name: "anisearch1",
        aliases: ["aniedit1","anisar1"],
        author: "S1FU", // API by kshitiz
        version: "2.0",
        shortDescription: { en: "𝗀𝖾𝗍 𝖺𝗇𝗂𝗆𝖾 𝖾𝖽𝗂𝗍 𝗏𝗂𝖽𝖾𝗈𝗌" },
        longDescription: { en: "𝗌𝖾𝖺𝗋𝗀𝗁 𝖺𝗇𝖽 𝗀𝖾𝗍 𝗋𝖺𝗇𝖽𝗈𝗆 𝖺𝗇𝗂𝗆𝖾 𝖾𝖽𝗂𝗍𝗌 𝗏𝗂𝖺 𝖺𝗉𝗂" },
        category: "𝖺𝗇𝗂𝗆𝖾",
        guide: { en: "『 {pn} [𝗊𝗎𝖾𝗋𝗒] 』" },
    },

    onStart: async function ({ api, event, args }) {
        const query = args.join(' ');
        if (!query) {
            return api.sendMessage("┏━━━〔 𝗌𝗒𝗌𝗍𝖾𝗆 〕━━━┓\n\n  ᯓ★ 𝗉𝗅𝖾𝖺𝗌𝖾 𝗉𝗋𝗈𝗏𝗂𝖽𝖾 𝖺 𝗌𝖾𝖺𝗋𝖼𝗁 𝗍𝖾𝗋𝗆 .ᐟ\n\n┗━━━━━━━━━━━━━━━┛", event.threadID, event.messageID);
        }

        api.setMessageReaction("🐋", event.messageID, () => {}, true);
        const modifiedQuery = `${query} anime edit`;

        const videos = await fetchTikTokVideos(modifiedQuery);

        if (!videos || videos.length === 0) {
            return api.sendMessage(`ᯓ★ 𝗇𝗈 𝖾𝖽𝗂𝗍𝗌 𝖿𝗈𝗎𝗇𝖽 𝖿𝗈𝗋 "${query}" Ი𐑼`, event.threadID, event.messageID);
        }

        const selectedVideo = videos[Math.floor(Math.random() * videos.length)];
        const videoUrl = selectedVideo.videoUrl;

        if (!videoUrl) {
            return api.sendMessage('ᯓ★ 𝗏𝗂𝖽𝖾𝗈 𝗎𝗋𝗅 𝗇𝗈𝗍 𝖿𝗈𝗎𝗇𝖽 .ᐟ', event.threadID, event.messageID);
        }

        try {
            const videoStream = await getStreamFromURL(videoUrl);
            await api.sendMessage({ 
                body: `┏━━━〔 𝖺𝗇𝗂𝗆𝖾 𝗌𝖾𝖺𝗋𝖼𝗁 〕━━━┓\n\n  ᯓ★ 𝗋𝖾𝗌𝗎𝗅𝗍 𝖿𝗈𝗋: ${query}\n  ᯓ★ 𝖾𝗇𝗃𝗈𝗒 𝗒𝗈𝗎𝗋 𝖺𝖾𝗌𝗍𝗁𝖾𝗍𝗂𝖼 𝗏𝗂𝖽𝖾𝗈 ⋆\n\n┗━━━━━━━━━━━━━━━┛`, 
                attachment: videoStream 
            }, event.threadID, event.messageID);
        } catch (error) {
            console.error(error);
            api.sendMessage('ᯓ★ 𝖿𝖺𝗂𝗅𝖾𝖽 𝗍𝗈 𝗉𝗋𝗈𝖼𝖾𝗌𝗌 𝗍𝗁𝖾 𝗏𝗂𝖽𝖾𝗈 Ი𐑼', event.threadID, event.messageID);
        }
    },
};