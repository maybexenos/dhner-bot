const axios = require('axios');

const allmodels = ["madara", "aizen", "ayanokoji", "jinwoo", "nami", "nami-ja"];
const Langdata = ["en", "ja", "ko"];

module.exports = {
  config: {
    name: "anivoice",
    version: "2.0",
    author: "S1FU",
    countDown: 5,
    role: 0,
    category: "𝖿𝗎𝗇",
    shortDescription: {
      en: "𝗀𝖾𝗇𝖾𝗋𝖺𝗍𝖾 𝖺𝗂 𝗏𝗈𝗂𝖼𝖾𝗌 𝗐𝗂𝗍𝗁 𝖺𝖾𝗌𝗍𝗁𝖾𝗍𝗂𝖼 𝗌𝗍𝗒𝗅𝖾"
    },
    guide: {
      en: "『 {pn} 𝗍𝖾𝗑𝗍 --𝗆 [𝗆𝗈𝖽𝖾𝗅] --𝗅 [𝗅𝖺𝗇𝗀] 』"
    }
  },

  onStart: async function ({ api, args, message, event }) {
    const { getPrefix, getStreamFromURL } = global.utils;
    const p = getPrefix(event.threadID);

    if (!args || args.length === 0) {
      return message.reply(`┏━━━〔 𝖺𝗂 𝗏𝗈𝗂𝖼𝖾 〕━━━┓\n\n  ᯓ★ 𝗉𝗅𝖾𝖺𝗌𝖾 𝗉𝗋𝗈𝗏𝗂𝖽𝖾 𝗂𝗇𝗉𝗎𝗍𝗌 .ᐟ\n  ᯓ★ 𝖾𝗑𝖺𝗆𝗉𝗅𝖾: ${p}𝖺𝗂𝗏𝗈𝗂𝖼𝖾 𝗁𝖾𝗅𝗅𝗈 --𝗆 𝖺𝗂𝗓𝖾𝗇\n\n  ⋆ 𝗆𝗈𝖽𝖾𝗅𝗌: ${allmodels.join(", ")}\n  ⋆ 𝗅𝖺𝗇𝗀𝗌: ${Langdata.join(", ")}\n\n┗━━━━━━━━━━━━━━━┛`);
    }

    let modelName = "aizen";
    const modelFlagIndex = args.findIndex(arg => arg === "--m" || arg === "--model");
    if (modelFlagIndex !== -1 && args.length > modelFlagIndex + 1) {
      modelName = args[modelFlagIndex + 1].toLowerCase();
      args.splice(modelFlagIndex, 2);
    }
    
    if (!allmodels.includes(modelName)) {
      return message.reply(`┏━━━〔 𝖾𝗋𝗋𝗈𝗋 〕━━━┓\n\n  ᯓ★ 𝗂𝗇𝗏𝖺𝗅𝗂𝖽 𝗆𝗈𝖽𝖾𝗅 𝗇𝖺𝗆𝖾 .ᐟ\n\n┗━━━━━━━━━━━━━━━┛`);
    }

    let lang = "en";
    const langFlagIndex = args.findIndex(arg => arg === "--lang" || arg === "--l");
    if (langFlagIndex !== -1 && args.length > langFlagIndex + 1) {
      lang = args[langFlagIndex + 1].toLowerCase();
      args.splice(langFlagIndex, 2);
    }
    
    if (!Langdata.includes(lang)) {
      return message.reply(`┏━━━〔 𝖾𝗋𝗋𝗈𝗋 〕━━━┓\n\n  ᯓ★ 𝗎𝗇𝗌𝗎𝗉𝗉𝗈𝗋𝗍𝖾𝖽 𝗅𝖺𝗇𝗀𝗎𝖺𝗀𝖾 .ᐟ\n\n┗━━━━━━━━━━━━━━━┛`);
    }
    
    let text = args.join(" ");
    if (!text) return message.reply("ᯓ★ 𝗉𝗅𝖾𝖺𝗌𝖾 𝖾𝗇𝗍𝖾𝗋 𝗌𝗈𝗆𝖾 𝗍𝖾𝗑𝗍 .ᐟ");

    try {
      if (lang !== "en") {
        const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`);
        text = res.data[0].map(item => item[0]).join('');
      }

      const apiURL = `https://voice-foxai.onrender.com/clonet?text=${encodeURIComponent(text)}&model=${modelName}&lang=${lang}`;
      
      const response = await axios.get(apiURL);
      const audioUrl = response.data.url;
      if (!audioUrl) return message.reply("ᯓ★ 𝗇𝗈 𝖺𝗎𝖽𝗂𝗈 𝖿𝗈𝗎𝗇𝖽 Ი𐑼");

      const stream = await getStreamFromURL(audioUrl);
      return message.reply({ body: `┏━━━〔 𝗏𝗈𝗂𝖼𝖾 𝗋𝖾𝖺𝖽𝗒 〕━━━┓\n\n  ⋆ 𝗆𝗈𝖽𝖾𝗅: ${modelName}\n  ⋆ 𝗅𝖺𝗇𝗀: ${lang}\n\n┗━━━━━━━━━━━━━━━┛`, attachment: stream });
    } catch (err) {
      return message.reply("ᯓ★ 𝗌𝗒𝗌𝗍𝖾𝗆 𝖾𝗋𝗋𝗈𝗋 𝗈𝖼𝖼𝗎𝗋𝖾𝖽 Ი𐑼");
    }
  }
};