const axios = require('axios');
const yts = require("yt-search");

const baseApiUrl = async () => {
    const base = await axios.get(`https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json`);
    return base.data.api;
};

(async () => {
    global.apis = { diptoApi: await baseApiUrl() };
})();

async function getStreamFromURL(url, pathName) {
    const response = await axios.get(url, { responseType: "stream" });
    response.data.path = pathName;
    return response.data;
}

global.utils = { ...global.utils, getStreamFromURL: global.utils.getStreamFromURL || getStreamFromURL };

function getVideoID(url) {
    const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
    const match = url.match(checkurl);
    return match ? match[1] : null;
}

module.exports = {
    config: {
        name: "songvdo",
        aliases: ["musicvdo", "vdo"],
        version: "2.0.0",
        author: "S1FU",
        countDown: 10,
        role: 0,
        category: "𝗆𝗎𝗌𝗂𝖼",
        shortDescription: { en: "𝖽𝗈𝗐𝗇𝗅𝗈𝖺𝖽 𝗒𝗈𝗎𝗍𝗎𝖻𝖾 𝗏𝗂𝖽𝖾𝗈𝗌/𝗌𝗈𝗇𝗀𝗌" },
        guide: { en: "『 {pn} <𝗌𝗈𝗇𝗀 𝗇𝖺𝗆𝖾 | 𝗎𝗋𝗅> 』" }
    },

    onStart: async function ({ api, args, event, message }) {
        const stylize = (text) => {
            const fonts = {
                "a":"𝖺","b":"𝖻","c":"𝖼","d":"𝖽","e":"𝖾","f":"𝖿","g":"𝗀","h":"𝗁","i":"𝗂","j":"𝗃","k":"𝗄","l":"𝗅","m":"𝗆",
                "n":"𝗇","o":"𝗈","p":"𝗉","q":"𝗊","r":"𝗋","s":"𝗌","t":"𝗍","u":"𝗎","v":"𝗏","w":"𝗐","x":"𝗑","y":"𝗒","z":"𝗓"
            };
            return text.toString().toLowerCase().split('').map(char => fonts[char] || char).join('');
        };

        if (args.length === 0) {
            return message.reply(`✧ 𐃷 ${stylize("𝗉𝗅𝖾𝖺𝗌𝖾 𝗉𝗋𝗈𝗏𝗂𝖽𝖾 𝖺 𝗌𝗈𝗇𝗀 𝗇𝖺𝗆𝖾 𝗈𝗋 𝗎𝗋𝗅")} Ი𐑼 𖹭`);
        }

        try {
            let videoID, searchMsg;
            const url = args[0];

            if (url && (url.includes("youtube.com") || url.includes("youtu.be"))) {
                videoID = getVideoID(url);
                if (!videoID) return message.reply(`✧ 𐃷 ${stylize("𝗂𝗇𝗏𝖺𝗅𝗂𝖽 𝗒𝗈𝗎𝗍𝗎𝖻𝖾 𝗎𝗋𝗅")} Ი𐑼 𖹭`);
            } else {
                const songName = args.join(' ');
                searchMsg = await message.reply(`⏳ ${stylize("𝗌𝖾𝖺𝗋𝗀𝗁𝗂𝗇𝗀")} "${songName}"... Ი𐑼`);
                const r = await yts(songName);
                if (!r.videos.length) return message.reply(`✧ 𐃷 ${stylize("𝗇𝗈 𝗌𝗈𝗇𝗀 𝖿𝗈𝗎𝗇𝖽")} Ი𐑼 𖹭`);
                videoID = r.videos[0].videoId;
            }

            message.reaction("📥", event.messageID);
            const { data } = await axios.get(`${global.apis.diptoApi}/ytDl3?link=${videoID}&format=mp4`);
            const { title, quality, downloadLink } = data;

            if (searchMsg) api.unsendMessage(searchMsg.messageID);

            const tinyRes = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(downloadLink)}`);
            const shortLink = tinyRes.data;

            await message.reply({
                body: `┏━━━〔 ${stylize("𝗒𝗈𝗎𝗍𝗎𝖻𝖾 𝖽𝗈𝗐𝗇𝗅𝗈𝖺𝖽")} 〕━━━┓\n\n  ᯓ★ ${stylize("𝗍𝗂𝗍𝗅𝖾")}: ${title}\n  ᯓ★ ${stylize("𝗊𝗎𝖺𝗅𝗂𝗍𝗒")}: ${quality}\n  ᯓ★ ${stylize("𝗅𝗂𝗇𝗄")}: ${shortLink}\n\n┗━━━━━━━━━━━━━━━┛`,
                attachment: await global.utils.getStreamFromURL(downloadLink, `${title}.mp4`)
            });
            message.reaction("✨", event.messageID);

        } catch (e) {
            console.error(e);
            return message.reply(`✧ 𐃷 ${stylize("𝖾𝗋𝗋𝗈𝗋 𝗈𝖼𝖼𝗎𝗋𝗋𝖾𝖽 𝗐𝗁𝗂𝗅𝖾 𝗉𝗋𝗈𝖼𝖾𝗌𝗌𝗂𝗇𝗀")} Ი𐑼 𖹭`);
        }
    }
};