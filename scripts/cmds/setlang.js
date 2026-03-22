const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "setlang",
    version: "2.0.0",
    author: "S1FU",
    countDown: 5,
    role: 0,
    category: "𝗈𝗐𝗇𝖾𝗋",
    shortDescription: {
      en: "𝗌𝖾𝗍 𝖽𝖾𝖿𝖺𝗎𝗅𝗍 𝗅𝖺𝗇𝗀𝗎𝖺𝗀𝖾 𝗈𝖿 𝗍𝗁𝖾 𝖻𝗈𝗍"
    },
    guide: {
      en: "『 {pn} <𝗅𝖺𝗇𝗀𝗎𝖺𝗀𝖾 𝖼𝗈𝖽𝖾> [-𝗀𝗅𝗈𝖻𝖺𝗅] 』"
    }
  },

  onStart: async function ({ message, args, threadsData, role, event }) {
    const stylize = (text) => {
      const fonts = {
        "a":"𝖺","b":"𝖻","c":"𝖼","d":"𝖽","e":"𝖾","f":"𝖿","g":"𝗀","h":"𝗁","i":"𝗂","j":"𝗃","k":"𝗄","l":"𝗅","m":"𝗆",
        "n":"𝗇","o":"𝗈","p":"𝗉","q":"𝗊","r":"𝗋","s":"𝗌","t":"𝗍","u":"𝗎","v":"𝗏","w":"𝗐","x":"𝗑","y":"𝗒","z":"𝗓"
      };
      return text.toString().toLowerCase().split('').map(char => fonts[char] || char).join('');
    };

    if (!args[0]) {
      return message.reply(`✧ 𐃷 ${stylize("𝗉𝗅𝖾𝖺𝗌𝖾 𝗉𝗋𝗈𝗏𝗂𝖽𝖾 𝖺 𝗅𝖺𝗇𝗀𝗎𝖺𝗀𝖾 𝖼𝗈𝖽𝖾")} (𝖾𝗇, 𝗏𝗂) Ი𐑼 𖹭`);
    }

    let langCode = args[0].toLowerCase();
    if (langCode === "default" || langCode === "reset") langCode = null;

    const isGlobal = ["-g", "-global", "all"].includes(args[1]?.toLowerCase());

    if (isGlobal) {
      if (role < 2) {
        return message.reply(`✧ 𐃷 ${stylize("𝗈𝗇𝗅𝗒 𝖻𝗈𝗍 𝖺𝖽𝗆𝗂𝗇 𝖼𝖺𝗇 𝗎𝗌𝖾 𝗀𝗅𝗈𝖻𝖺𝗅 𝗌𝖾𝗍𝗍𝗂𝗇𝗀𝗌")} Ი𐑼 𖹭`);
      }

      const langPath = path.join(process.cwd(), "languages", `${langCode}.lang`);
      if (!fs.existsSync(langPath)) {
        return message.reply(`✧ 𐃷 ${stylize("𝗅𝖺𝗇𝗀𝗎𝖺𝗀𝖾 𝖿𝗂𝗅𝖾 𝗇𝗈𝗍 𝖿𝗈𝗎𝗇𝖽")}: ${langCode} Ი𐑼`);
      }

      const langData = fs.readFileSync(langPath, "utf-8")
        .split(/\r?\n/)
        .filter(line => line.trim() && !line.startsWith("#") && !line.startsWith("//"));

      global.language = {};
      for (const line of langData) {
        const sep = line.indexOf('=');
        if (sep === -1) continue;
        const keyFull = line.slice(0, sep).trim();
        const val = line.slice(sep + 1).trim().replace(/\\n/gi, '\n');
        const dot = keyFull.indexOf('.');
        const head = keyFull.slice(0, dot);
        const key = keyFull.slice(dot + 1);
        
        if (!global.language[head]) global.language[head] = {};
        global.language[head][key] = val;
      }

      global.SizuBot.config.language = langCode;
      fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.SizuBot.config, null, 2));
      
      message.reaction("✨", event.messageID);
      return message.reply(`✨ ${stylize("𝗀𝗅𝗈𝖻𝖺𝗅 𝗅𝖺𝗇𝗀𝗎𝖺𝗀𝖾 𝗌𝖾𝗍 𝗍𝗈")}: ${langCode} 𐃷 Ი𐑼`);
    }

    await threadsData.set(event.threadID, langCode, "data.lang");
    message.reaction("✅", event.messageID);
    return message.reply(`✨ ${stylize("𝗅𝖺𝗇𝗀𝗎𝖺𝗀𝖾 𝖿𝗈𝗋 𝗍𝗁𝗂𝗌 𝖼𝗁𝖺𝗍 𝗌𝖾𝗍 𝗍𝗈")}: ${langCode} 𐃷 Ი𐑼`);
  }
};