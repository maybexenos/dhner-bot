 const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "fish",
    version: "2.5.0",
    author: "S1FU",
    countDown: 5,
    role: 0,
    category: "𝖾𝖼𝗈𝗇𝗈𝗆𝗒",
    shortDescription: { en: "𝗎𝗅𝗍𝗂𝗆𝖺𝗍𝖾 𝖿𝗂𝗌𝗁𝗂𝗇𝗀 𝖾𝗑𝗉𝖾𝗋𝗂𝖾𝗇𝖼𝖾" }
  },

  onStart: async function ({ event, message, usersData }) {
    const stylize = (text) => {
      const fonts = {
        "a":"𝖺","b":"𝖻","c":"𝖼","d":"𝖽","e":"𝖾","f":"𝖿","g":"𝗀","h":"𝗁","i":"𝗂","j":"𝗃","k":"𝗄","l":"𝗅","m":"𝗆",
        "n":"𝗇","o":"𝗈","p":"𝗉","q":"𝗊","r":"𝗋","s":"𝗌","t":"𝗍","u":"𝗎","v":"𝗏","w":"𝗐","x":"𝗑","y":"𝗒","z":"𝗓",
        "0":"𝟎","1":"𝟏","2":"𝟐","3":"𝟑","4":"𝟒","5":"𝟓","6":"𝟔","7":"𝟕","8":"𝟖","9":"𝟗"
      };
      return text.toString().toLowerCase().split('').map(char => fonts[char] || char).join('');
    };

    const cooldownTime = 1000 * 60 * 10; // Reduced to 10 mins
    const userData = await usersData.get(event.senderID);
    const lastWork = userData.data?.fishTime || 0;

    if (Date.now() - lastWork < cooldownTime) {
      const timeLeft = cooldownTime - (Date.now() - lastWork);
      const mins = Math.floor(timeLeft / 60000);
      const secs = Math.floor((timeLeft % 60000) / 1000);
      return message.reply(`✧ 𐃷 ${stylize("𝗁𝖾𝗒! 𝗒𝗈𝗎𝗋 𝗁𝖺𝗇𝖽𝗌 𝖺𝗋𝖾 𝗍𝗂𝗋𝖾𝖽")}\n\n🌷 ✨ ${stylize("𝗋𝖾𝗌𝗍 𝖿𝗈𝗋")} ${mins}𝗆 ${secs}𝗌 Ი𐑼 𖹭`);
    }

    const fishData = [
      // Legendary & Mythic
      { name: "👑 𝗄𝗂𝗇𝗀 𝗆𝖾𝗋𝗆𝖺𝗂𝖽", min: 50000, max: 100000, rarity: "𝗅𝖾𝗀𝖾𝗇𝖽𝖺𝗋𝗒", chance: 1 },
      { name: "🦑 𝗄𝗋𝖺𝗄𝖾𝗇", min: 25000, max: 45000, rarity: "𝗆𝗒𝗍𝗁𝗂𝖼", chance: 3 },
      { name: "🦈 𝗀𝗋𝖾𝖺𝗍 𝗐𝗁𝗂𝗍𝖾 𝗌𝗁𝖺𝗋𝗄", min: 12000, max: 22000, rarity: "𝖾𝗉𝗂𝖼", chance: 6 },
      // Rare & Uncommon
      { name: "🐡 𝗉𝗎𝖿𝖿𝖾𝗋 𝖿𝗂𝗌𝗁", min: 6000, max: 9500, rarity: "𝗋𝖺𝗋𝖾", chance: 10 },
      { name: "🐟 𝖼𝗁𝗂𝗍𝖺𝗅 𝗆𝖺𝖼𝗁", min: 4000, max: 7000, rarity: "𝗋𝖺𝗋𝖾", chance: 15 },
      { name: "🐠 𝗋𝗎𝗂 𝗆𝖺𝖼𝗁", min: 2000, max: 3500, rarity: "𝗎𝗇𝖼𝗈𝗆𝗆𝗈𝗇", chance: 20 },
      // Common
      { name: "🦀 𝗄𝖾𝗄𝗋𝖺", min: 1000, max: 1800, rarity: "𝖼𝗈𝗆𝗆𝗈𝗇", chance: 25 },
      { name: "🦐 𝖼𝗁𝗂𝗇𝗀𝗋𝗂", min: 500, max: 1200, rarity: "𝖼𝗈𝗆𝗆𝗈𝗇", chance: 30 },
      { name: "🐚 𝗌𝗁𝖺𝗆𝗎𝗄", min: 100, max: 400, rarity: "𝖼𝗈𝗆𝗆𝗈𝗇", chance: 40 },
      // Trash
      { name: "🥫 𝗉𝗎𝗋𝖺𝗇𝗈 𝗍𝗂𝗇", min: 5, max: 20, rarity: "𝗍𝗋𝖺𝗌𝗁", chance: 100 }
    ];

    const random = Math.random() * 100;
    let selected = fishData[fishData.length - 1]; 

    for (const f of fishData) {
      if (random <= f.chance) {
        selected = f;
        break;
      }
    }

    const reward = Math.floor(Math.random() * (selected.max - selected.min + 1)) + selected.min;
    
    await usersData.set(event.senderID, {
      money: userData.money + reward,
      data: { ...userData.data, fishTime: Date.now() }
    });

    const time = moment.tz("Asia/Dhaka").format("hh:mm A");

    let response = `┏━━━〔 Ი𐑼𝗌𝖾𝖺 𝗋𝖾𝗉𝗈𝗋𝗍Ი𐑼 〕━━━┓\n\n`;
    response += `  ᯓ★ ${stylize("𝖼𝖺𝗎𝗀𝗁𝗍")}: ${selected.name}\n`;
    response += `  ᯓ★ ${stylize("𝗋𝖺𝗋𝗂𝗍𝗒")}: ${stylize(selected.rarity)}\n`;
    response += `  ᯓ★ ${stylize("𝗏𝖺𝗅𝗎𝖾")}: +${reward.toLocaleString()}$\n`;
    response += `  ᯓ★ ${stylize("𝗍𝗂𝗆𝖾")}: ${time}\n\n`;
    response += `┗━━━━━━━━━━━━━━━┛`;

    return message.reply(response);
  }
};