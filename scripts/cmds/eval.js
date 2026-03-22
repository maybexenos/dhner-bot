const { removeHomeDir, log } = global.utils;

module.exports = {
  config: {
    name: "eval",
    version: "2.0.0",
    author: "S1FU",
    countDown: 0,
    role: 3,
    category: "𝗈𝗐𝗇𝖾𝗋",
    description: { en: "𝖾𝗑𝖾𝖼𝗎𝗍𝖾 𝗃𝖺𝗏𝖺𝗌𝗉𝗋𝗂𝗉𝗍 𝖼𝗈𝖽𝖾 𝗂𝗇𝗌𝗍𝖺𝗇𝗍𝗅𝗒" },
    guide: { en: "『 {pn} <𝖼𝗈𝖽𝖾> 』" }
  },

  onStart: async function ({ api, args, message, event, threadsData, usersData, dashBoardData, globalData, threadModel, userModel, dashBoardModel, globalModel, role, commandName, getLang }) {
    
    const stylize = (text) => {
      const fonts = {
        "a":"𝖺","b":"𝖻","c":"𝖼","d":"𝖽","e":"𝖾","f":"𝖿","g":"𝗀","h":"𝗁","i":"𝗂","j":"𝗃","k":"𝗄","l":"𝗅","m":"𝗆",
        "n":"𝗇","o":"𝗈","p":"𝗉","q":"𝗊","r":"𝗋","s":"𝗌","t":"𝗍","u":"𝗎","v":"𝗏","w":"𝗐","x":"𝗑","y":"𝗒","z":"𝗓",
        "0":"𝟎","1":"𝟏","2":"𝟐","3":"𝟑","4":"𝟒","5":"𝟓","6":"𝟔","7":"𝟕","8":"𝟖","9":"𝟗"
      };
      return text.toString().toLowerCase().split('').map(char => fonts[char] || char).join('');
    };

    function output(msg) {
      if (typeof msg == "number" || typeof msg == "boolean" || typeof msg == "function")
        msg = msg.toString();
      else if (msg instanceof Map) {
        let text = `𝗆𝖺𝗉(${msg.size}) `;
        const obj = {};
        msg.forEach((v, k) => { obj[k] = v; });
        text += JSON.stringify(obj, null, 2);
        msg = text;
      }
      else if (typeof msg == "object")
        msg = JSON.stringify(msg, null, 2);
      else if (typeof msg == "undefined")
        msg = "𝗎𝗇𝖽𝖾𝖿𝗂𝗇𝖾𝖽";

      message.reply(`${msg}`);
    }

    const out = (msg) => output(msg);

    const cmd = `
    (async () => {
      try {
        ${args.join(" ")}
      }
      catch(err) {
        const errorStack = err.stack ? removeHomeDir(err.stack) : removeHomeDir(JSON.stringify(err, null, 2) || "");
        message.reply("✧ 𐃷 " + stylize("𝖾𝗋𝗋𝗈𝗋 𝖽𝖾𝗍𝖾𝖼𝗍𝖾𝖽") + " Ი𐑼\\n\\n" + errorStack);
      }
    })()`;

    eval(cmd);
    api.setMessageReaction("⚡", event.messageID, () => {}, true);
  }
};