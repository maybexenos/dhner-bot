const fetch = require('node-fetch');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: "anigif",
        version: "2.0",
        author: "S1FU",
        countDown: 10,
        role: 0,
        category: "𝖺𝗇𝗂𝗆𝖾",
        shortDescription: {
            en: "𝗀𝖾𝗍 𝖺𝗇𝗂𝗆𝖾 𝗀𝗂𝖿𝗌 𝖻𝗒 𝗍𝖺𝗀𝗌 𝗐𝗂𝗍𝗁 𝖺𝖾𝗌𝗍𝗁𝖾𝗍𝗂𝖼 𝗌𝗍𝗒𝗅𝖾"
        },
        guide: {
            en: "『 {pn} <𝗍𝖺𝗀> 』"
        }
    },

    onStart: async function ({ api, args, message, event }) {
        const sfwTags = [
            "bite", "blush", "comfy", "cry", "cuddle", "dance", "eevee", "fluff", "holo", "hug", "icon", "kiss", "kitsune", 
            "lick", "neko", "okami", "pat", "poke", "senko", "sairo", "slap", "smile", "tail", "tickle"
        ];
        
        const nsfwTags = [
            "anal", "blowjob", "cum", "fuck", "pussylick", "solo", "threesome_fff", "threesome_ffm", 
            "threesome_mmf", "yaio", "yuri"
        ];

        const availableTags = [...sfwTags, ...nsfwTags];
        const tag = args[0]?.toLowerCase();

        if (!tag || !availableTags.includes(tag)) {
            return message.reply(`┏━━━〔 𝗍𝖺𝗀 𝗅𝗂𝗌𝗍 〕━━━┓\n\n  ᯓ★ 𝗌𝖿𝗐: ${sfwTags.slice(0, 5).join(", ")}... (𝗍𝗈𝗍𝖺𝗅 ${sfwTags.length})\n  ᯓ★ 𝗇𝗌𝖿𝗐: ${nsfwTags.slice(0, 5).join(", ")}...\n\n  ⋆ 𝗎𝗌𝖾: {pn} 𝗍𝖺𝗀𝗇𝖺𝗆𝖾\n\n┗━━━━━━━━━━━━━━━┛`);
        }

        const isNsfw = nsfwTags.includes(tag);
        const endpoint = `https://purrbot.site/api/img/${isNsfw ? 'nsfw' : 'sfw'}/${tag}/gif`;

        try {
            const response = await fetch(endpoint);
            if (response.status !== 200) return message.reply("ᯓ★ 𝖺𝗉𝗂 𝖼𝗈𝗇𝗇𝖾𝖼𝗍𝗂𝗈𝗇 𝖿𝖺𝗂𝗅𝖾𝖽 Ი𐑼");

            const data = await response.json();
            const gifUrl = data.link;

            const gifRes = await fetch(gifUrl);
            const buffer = await gifRes.buffer();
            const filePath = path.join(__dirname, `cache`, `${tag}_${event.senderID}.gif`);
            
            if (!fs.existsSync(path.join(__dirname, `cache`))) fs.mkdirSync(path.join(__dirname, `cache`));
            fs.writeFileSync(filePath, buffer);

            return message.reply({
                body: `┏━━━〔 𝖺𝗇𝗂𝗆𝖾 𝗀𝗂𝖿 〕━━━┓\n\n  ᯓ★ 𝗍𝖺𝗀: ${tag}\n  ᯓ★ 𝖾𝗇𝗃𝗈𝗒 𝗒𝗈𝗎𝗋 𝗏𝗂𝗏𝖾 ⋆\n\n┗━━━━━━━━━━━━━━━┛`,
                attachment: fs.createReadStream(filePath)
            }, () => { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); });

        } catch (err) {
            console.error(err);
            return message.reply("ᯓ★ 𝗌𝗒𝗌𝗍𝖾𝗆 𝖾𝗋𝗋𝗈𝗋 𝗈𝖼𝖼𝗎𝗋𝖾𝖽 .ᐟ");
        }
    }
};