const math = require('mathjs');

module.exports = {
  config: {
    name: "calculator",
    aliases: ["calc", "math"],
    version: "3.1.0",
    author: "S1FU",
    countDown: 5,
    role: 0,
    category: "𝗎𝗍𝗂𝗅𝗂𝗍𝗒",
    shortDescription: { en: "𝖽𝗂𝗀𝗂𝗍𝖺𝗅 𝗆𝖺𝗍𝗁 𝗌𝗈𝗅𝗏𝖾𝗋" },
    guide: { en: "『 {pn} <𝖾𝗑𝗉𝗋𝖾𝗌𝗌𝗂𝗈𝗇> 』" }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    const stylize = (text) => {
      const fonts = {
        "a": "𝖺", "b": "𝖻", "c": "𝖼", "d": "𝖽", "e": "𝖾", "f": "𝖿", "g": "𝗀", "h": "𝗁", "i": "𝗂", "j": "𝗃", "k": "𝗄", "l": "𝗅", "m": "𝗆", 
        "n": "𝗇", "o": "𝗈", "p": "𝗉", "q": "𝗊", "r": "𝗋", "s": "𝗌", "t": "𝗍", "u": "𝗎", "v": "𝗏", "w": "𝗐", "x": "𝗑", "y": "𝗒", "z": "𝗓",
        "0": "𝟎", "1": "𝟏", "2": "𝟐", "3": "𝟑", "4": "𝟒", "5": "𝟓", "6": "𝟔", "7": "𝟕", "8": "𝟖", "9": "𝟗"
      };
      return text.toString().toLowerCase().split('').map(char => fonts[char] || char).join('');
    };

    if (!args[0]) {
      return api.sendMessage(
        `┏━━━〔 𝖼𝖺𝗅𝖼𝗎𝗅𝖺𝗍𝗈𝗋 〕━━━┓\n\n` +
        `  ᯓ★ 𝗌𝗒𝗇𝗍𝖺𝗑: {pn} [𝖾𝗑𝗉𝗋𝖾𝗌𝗌𝗂𝗈𝗇]\n` +
        `  ⋆ 𝖾𝗑𝖺𝗆𝗉𝗅𝖾: 𝟧 + 𝟥 / 𝗌𝗊𝗋𝗍(𝟤𝟧)\n` +
        `  ⋆ 𝖻𝖺𝗇𝗀𝗅𝖺 𝖽𝗂𝗀𝗂𝗍𝗌 𝗌𝗎𝗉𝗉𝗈𝗋𝗍𝖾𝖽\n\n` +
        `┗━━━━━━━━━━━━━━━┛`,
        threadID, messageID
      );
    }

    const banglaDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    const englishDigits = ['0','1','2','3','4','5','6','7','8','9'];
    const banglaToEnglish = (text) => text.replace(/[০-৯]/g, d => englishDigits[banglaDigits.indexOf(d)]);

    const rawInput = args.join(" ");
    const expression = banglaToEnglish(rawInput)
      .replace(/×/g, '*')
      .replace(/÷/g, '/');

    try {
      const result = math.evaluate(expression);

      const finalUI = 
        `┏━━━〔 𝗆𝖺𝗍𝗁 𝗋𝖾𝗌𝗎𝗅𝗍 〕━━━┓\n\n` +
        `  ᯓ★ 𝗂𝗇𝗉𝗎𝗍: ${stylize(expression)}\n` +
        `  ⋆ 𝗈𝗎𝗍𝗉𝗎𝗍: ${stylize(result)}\n\n` +
        `┗━━━━━━━━━━━━━━━┛`;

      api.sendMessage(finalUI, threadID, messageID);
      api.setMessageReaction("🔢", messageID, () => {}, true);

    } catch (err) {
      const errorUI = 
        `┏━━━〔 𝗆𝖺𝗍𝗁 𝖾𝗋𝗋𝗈𝗋 〕━━━┓\n\n` +
        `  ᯓ★ 𝗌𝗍𝖺𝗍𝗎𝗌: 𝗂𝗇𝗏𝖺𝗅𝗂𝖽 𝖾𝗑𝗉𝗋𝖾𝗌𝗌𝗂𝗈𝗇\n` +
        `  ⋆ 𝖽𝖾𝗍𝖺𝗂𝗅𝗌: ${stylize(err.message)}\n\n` +
        `┗━━━━━━━━━━━━━━━┛`;
      
      api.sendMessage(errorUI, threadID, messageID);
      api.setMessageReaction("❌", messageID, () => {}, true);
    }
  }
};