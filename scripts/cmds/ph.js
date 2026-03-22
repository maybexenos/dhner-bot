const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "ph",
    version: "2.1.0",
    author: "S1FU",
    countDown: 5,
    role: 0,
    category: "fun",
    description: {
      en: "𝖼𝗋𝖾𝖺𝗍𝖾 𝖺 𝗉𝗈𝗋𝗇𝗁𝗎𝖻 𝗌𝗍𝗒𝗅𝖾 𝗍𝖾𝗑𝗍 𝗅𝗈𝗀𝗈 (𝗂𝗆𝖺𝗀𝖾 𝗈𝗇𝗅𝗒)"
    },
    guide: {
      en: "『 {pn} [𝗍𝖾𝗑𝗍𝟣] | [𝗍𝖾𝗑𝗍𝟤] 』"
    }
  },

  onStart: async function ({ args, message, event }) {
    const { senderID } = event;

    const stylize = (text) => {
      const fonts = {
        "a":"𝖺","b":"𝖻","c":"𝖼","d":"𝖽","e":"𝖾","f":"𝖿","g":"𝗀","h":"𝗁","i":"𝗂","j":"𝗃","k":"𝗄","l":"𝗅","m":"𝗆",
        "n":"𝗇","o":"𝗈","p":"𝗉","q":"𝗊","r":"𝗋","s":"𝗌","t":"𝗍","u":"𝗎","v":"𝗏","w":"𝗐","x":"𝗑","y":"𝗒","z":"𝗓"
      };
      return text.toString().toLowerCase().split('').map(char => fonts[char] || char).join('');
    };

    let text1, text2;
    const input = args.join(" ");
    
    if (!input) {
      return message.reply( ` ᯓ★ 𝗉𝗅𝖾𝖺𝗌𝖾 𝗉𝗋𝗈𝗏𝗂𝖽𝖾 𝗍𝖾𝗑𝗍`);
    }

    if (input.includes("|")) {
      const split = input.split("|");
      text1 = split[0].trim();
      text2 = split[1].trim();
    } else {
      const parts = input.split(" ");
      if (parts.length === 1) {
        text1 = parts[0];
        text2 = "Hub";
      } else {
        text2 = parts.pop();
        text1 = parts.join(" ");
      }
    }

    try {
      const apiUrl = `https://maybexenos.vercel.app/image/pornhub?text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}`;
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const savePath = path.join(cacheDir, `ph_${senderID}_${Date.now()}.png`);

      const response = await axios({
        method: "GET",
        url: apiUrl,
        responseType: "stream"
      });

      const writer = fs.createWriteStream(savePath);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        await message.reply({
          attachment: fs.createReadStream(savePath)
        });

        fs.unlinkSync(savePath);
      });

      writer.on("error", () => {
        message.reply(`ᯓ★ ${stylize("failed to save image")} Ი𐑼`);
      });

    } catch (error) {
      console.error(error);
      message.reply(`ᯓ★ ${stylize("api currently unreachable")} Ი𐑼`);
    }
  }
};