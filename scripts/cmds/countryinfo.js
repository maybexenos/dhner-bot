const axios = require('axios');

module.exports = {
  config: {
    name: "countryinfo",
    aliases: ["country", "nation"],
    version: "4.0.0",
    author: "S1FU",
    countDown: 5,
    role: 0,
    category: "𝗂𝗇𝖿𝗈𝗋𝗆𝖺𝗍𝗂𝗈𝗇",
    guide: { en: "『 {pn} <𝖼𝗈𝗎𝗇𝗍𝗋𝗒 𝗇𝖺𝗆𝖾> 』" }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const query = args.join(' ').trim();

    const stylize = (text) => {
      const fonts = {
        "a":"𝖺","b":"𝖻","c":"𝖼","d":"𝖽","e":"𝖾","f":"𝖿","g":"𝗀","h":"𝗁","i":"𝗂","j":"𝗃","k":"𝗄","l":"𝗅","m":"𝗆",
        "n":"𝗇","o":"𝗈","p":"𝗉","q":"𝗊","r":"𝗋","s":"𝗌","t":"𝗍","u":"𝗎","v":"𝗏","w":"𝗐","x":"𝗑","y":"𝗒","z":"𝗓",
        "0":"𝟎","1":"𝟏","2":"𝟐","3":"𝟑","4":"𝟒","5":"𝟓","6":"𝟔","7":"𝟕","8":"𝟖","9":"𝟗"
      };
      return text.toString().toLowerCase().split('').map(char => fonts[char] || char).join('');
    };

    if (!query) {
      return api.sendMessage(`┏━━━〔 𝖾𝗋𝗋𝗈𝗋 〕━━━┓\n\n  ᯓ★ 𝗉𝗅𝖾𝖺𝗌𝖾 𝗉𝗋𝗈𝗏𝗂𝖽𝖾 𝗇𝖺𝗆𝖾\n\n┗━━━━━━━━━━━━━━━┛`, threadID, messageID);
    }

    try {
      api.setMessageReaction("🌍", messageID, () => {}, true);
      const { data } = await axios.get(`https://restcountries.com/v3/name/${encodeURIComponent(query)}`);

      if (!data || data.length === 0) {
        return api.sendMessage(`ᯓ★ 𝖼𝗈𝗎𝗇𝗍𝗋𝗒 𝗇𝗈𝗍 𝖿𝗈𝗎𝗇𝖽 Ი𐑼`, threadID, messageID);
      }

      const c = data[0];
      const flagEmoji = c.cca2 ? [...c.cca2.toUpperCase()].map(char => String.fromCodePoint(127397 + char.charCodeAt())).join('') : '🏳️';

      const info = {
        capital: c.capital ? c.capital.join(', ') : '𝗇/𝖺',
        pop: c.population ? c.population.toLocaleString() : '𝗇/𝖺',
        lang: c.languages ? Object.values(c.languages).join(', ') : '𝗇/𝖺',
        cur: c.currencies ? Object.values(c.currencies).map(cur => `${cur.name} (${cur.symbol || '-'})`).join(', ') : '𝗇/𝖺',
        area: c.area ? `${c.area.toLocaleString()} 𝗄𝗆²` : '𝗇/𝖺',
        un: c.unMember ? '𝗒𝖾𝗌 ✅' : '𝗇𝗈 ❌',
        map: c.maps?.googleMaps || '𝗇/𝖺'
      };

      const message = 
        `┏━━━〔 𝖼𝗈𝗎𝗇𝗍𝗋𝗒 𝗂𝗇𝖿𝗈 〕━━━┓\n\n` +
        `  ${flagEmoji} 𝗇𝖺𝗆𝖾: ${stylize(c.name.common)}\n` +
        `  🏛️ 𝖼𝖺𝗉𝗂𝗍𝖺𝗅: ${stylize(info.capital)}\n` +
        `  👥 𝗉𝗈𝗉𝗎𝗅𝖺𝗍𝗂𝗈𝗇: ${stylize(info.pop)}\n` +
        `  🗣️ 𝗅𝖺𝗇𝗀𝗎𝖺𝗀𝖾: ${stylize(info.lang)}\n` +
        `  𝒷 𝖼𝗎𝗋𝗋𝖾𝗇𝖼𝗒: ${stylize(info.cur)}\n` +
        `  📐 𝖺𝗋𝖾𝖺: ${stylize(info.area)}\n` +
        `  🏢 𝗎𝗇 𝗆𝖾𝗆𝖻𝖾𝗋: ${stylize(info.un)}\n\n` +
        `  📍 𝗆𝖺𝗉𝗌: ${info.map}\n\n` +
        `┗━━━━━━━━━━━━━━━┛`;

      if (c.flags?.png) {
        const stream = await api.getStreamFromURL(c.flags.png);
        return api.sendMessage({ body: message, attachment: stream }, threadID, messageID);
      } else {
        return api.sendMessage(message, threadID, messageID);
      }

    } catch (error) {
      return api.sendMessage(`ᯓ★ 𝗌𝗒𝗌𝗍𝖾𝗆 𝖾𝗋𝗋𝗈𝗋 Ი𐑼`, threadID, messageID);
    }
  }
};