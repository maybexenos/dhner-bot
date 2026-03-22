const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "restart",
    version: "2.0.0",
    author: "S1FU",
    countDown: 5,
    role: 2,
    category: "𝗈𝗐𝗇𝖾𝗋",
    shortDescription: { en: "𝗋𝖾𝗌𝗍𝖺𝗋𝗍 𝗍𝗁𝖾 𝖻𝗈𝗍 𝗌𝗒𝗌𝗍𝖾𝗆" }
  },

  onLoad: function ({ api }) {
    const pathFile = path.join(__dirname, "tmp", "restart.txt");
    if (fs.existsSync(pathFile)) {
      const [tid, time] = fs.readFileSync(pathFile, "utf-8").split(" ");
      const delay = (Date.now() - parseInt(time)) / 1000;
      
      api.sendMessage(`✨ 𝖺𝗐𝖺𝗄𝖾𝗇𝖾𝖽! 𝖻𝗈𝗍 𝗂𝗌 𝖻𝖺𝖼𝗄 𝗈𝗇𝗅𝗂𝗇𝖾 𝖺𝖿𝗍𝖾𝗋 ${delay.toFixed(2)}𝗌 𐃷 Ი𐑼`, tid);
      fs.unlinkSync(pathFile);
    }
  },

  onStart: async function ({ message, event }) {
    const stylize = (text) => {
      const fonts = {
        "a":"𝖺","b":"𝖻","c":"𝖼","d":"𝖽","e":"𝖾","f":"𝖿","g":"𝗀","h":"𝗁","i":"𝗂","j":"𝗃","k":"𝗄","l":"𝗅","m":"𝗆",
        "n":"𝗇","o":"𝗈","p":"𝗉","q":"𝗊","r":"𝗋","s":"𝗌","t":"𝗍","u":"𝗎","v":"𝗏","w":"𝗐","x":"𝗑","y":"𝗒","z":"𝗓"
      };
      return text.toString().toLowerCase().split('').map(char => fonts[char] || char).join('');
    };

    const tmpDir = path.join(__dirname, "tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
    
    const pathFile = path.join(tmpDir, "restart.txt");
    fs.writeFileSync(pathFile, `${event.threadID} ${Date.now()}`);

    await message.reply(`✧ 𐃷 ${stylize("𝗋𝖾𝗌𝗍𝖺𝗋𝗍𝗂𝗇𝗀 𝗍𝗁𝖾 𝗌𝗒𝗌𝗍𝖾𝗆")}... Ი𐑼 𖹭`);
    process.exit(2);
  }
};