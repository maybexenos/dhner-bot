const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "sl",
    aliases: ["selfListen"],
    version: "2.5.0",
    author: "S1FU",
    role: 3,
    category: "𝗈𝗐𝗇𝖾𝗋",
    shortDescription: { en: "𝗍𝗈𝗀𝗀𝗅𝖾 𝖻𝗈𝗍 𝗌𝖾𝗅𝖿-𝗅𝗂𝗌𝗍𝖾𝗇 𝗆𝗈𝖽𝖾" },
    guide: { en: "『 {pn} 𝗈𝗇 | 𝗈𝖿𝗉 』" }
  },

  onStart: async function ({ args, message, event, api }) {
    const stylize = (text) => {
      const fonts = {
        "a":"𝖺","b":"𝖻","c":"𝖼","d":"𝖽","e":"𝖾","f":"𝖿","g":"𝗀","h":"𝗁","i":"𝗂","j":"𝗃","k":"𝗄","l":"𝗅","m":"𝗆",
        "n":"𝗇","o":"𝗈","p":"𝗉","q":"𝗊","r":"𝗋","s":"𝗌","t":"𝗍","u":"𝗎","v":"𝗏","w":"𝗐","x":"𝗑","y":"𝗒","z":"𝗓"
      };
      return text.toString().toLowerCase().split('').map(char => fonts[char] || char).join('');
    };

    const input = args[0]?.toLowerCase();
    const configPath = path.join(__dirname, "..", "..", "config.json");
    
    let config;
    try {
      config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    } catch (err) {
      return message.reply(`✧ 𐃷 ${stylize("𝖼𝖺𝗇𝗍 𝗅𝗈𝖺𝖽 𝖼𝗈𝗇𝖿𝗂𝗀 𝖿𝗂𝗅𝖾")} Ი𐑼 𖹭`);
    }

    if (!input) {
      const status = config.optionsFca.selfListen ? "𝗈𝗇" : "𝗈𝖿𝖿";
      return message.reply(`✧ 𐃷 ${stylize("𝗌𝖾𝗅𝖿𝗅𝗂𝗌𝗍𝖾𝗇 𝗂𝗌 𝖼𝗎𝗋𝗋𝖾𝗇𝗍𝗅𝗒")} ${stylize(status)} Ი𐑼\n${stylize("𝗎𝗌𝖾")} /𝗌𝗅 𝗈𝗇 | 𝗈𝖿𝖿`);
    }

    if (!["on", "off"].includes(input)) {
      return message.reply(`✧ 𐃷 ${stylize("𝗂𝗇𝗏𝖺𝗅𝗂𝖽 𝗈𝗉𝗍𝗂𝗈𝗇")} Ი𐑼 𖹭`);
    }

    const newValue = input === "on";

    try {
      config.optionsFca.selfListen = newValue;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      api.setOptions({ selfListen: newValue });

      message.reaction("✨", event.messageID);
      return message.reply(`✨ ${stylize("𝗌𝖾𝗅𝖿𝗅𝗂𝗌𝗍𝖾𝗇 𝗍𝗎𝗋𝗇𝖾𝖽")} ${stylize(input)} 𝗌𝗎𝖼𝖼𝖾𝗌𝗌𝖿𝗎𝗅𝗅𝗒 𐃷 Ი𐑼`);
    } catch (err) {
      console.error(err);
      return message.reply(`✧ 𐃷 ${stylize("𝖿𝖺𝗂𝗅𝖾𝖽 𝗍𝗈 𝗎𝗉𝖽𝖺𝗍𝖾 𝖼𝗈𝗇𝖿𝗂𝗀")} Ი𐑼 𖹭`);
    }
  }
};