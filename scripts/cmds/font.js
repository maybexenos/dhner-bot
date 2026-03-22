const fs = require("fs-extra");

module.exports = {
  config: {
    name: "font",
    version: "3.2.0",
    author: "S1FU",
    countDown: 4,
    role: 0,
    category: "𝗎𝗍𝗂𝗅𝗂𝗍𝗒",
    description: { en: "𝖼𝗈𝗇𝗏𝖾𝗋𝗍 𝗍𝖾𝗑𝗍 𝗍𝗈 𝖼𝗎𝗍𝖾 𝖺𝗇𝖽 𝖿𝖺𝗇𝖼𝗒 𝗌𝗍𝗒𝗅𝖾𝗌" },
    guide: { en: "『 {pn} <𝗇𝗎𝗆𝖻𝖾𝗋> <𝗍𝖾𝗑𝗍> | 𝗅𝗂𝗌𝗍 | 𝗋𝖺𝗇𝖽𝗈𝗆 』" }
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID, messageID } = event;

    const stylize = (text) => {
      const fonts = {
        "a":"𝖺","b":"𝖻","c":"𝖼","d":"𝖽","e":"𝖾","f":"𝖿","g":"𝗀","h":"𝗁","i":"𝗂","j":"𝗃","k":"𝗄","l":"𝗅","m":"𝗆",
        "n":"𝗇","o":"𝗈","p":"𝗉","q":"𝗊","r":"𝗋","s":"𝗌","t":"𝗍","u":"𝗎","v":"𝗏","w":"𝗐","x":"𝗑","y":"𝗒","z":"𝗓",
        "0":"𝟎","1":"𝟏","2":"𝟐","3":"𝟑","4":"𝟒","5":"𝟓","6":"𝟔","7":"𝟕","8":"𝟖","9":"𝟗"
      };
      return text.toString().toLowerCase().split('').map(char => fonts[char] || char).join('');
    };

    if (args[0]?.toLowerCase() === "list") {
      let msg = `✧ Ი𐑼 𖹭 ${stylize("𝖺𝗏𝖺𝗂𝗅𝖺𝖻𝗅𝖾 𝖿𝗈𝗇𝗍𝗌")} 𖹭 Ი𐑼 ✧\n\n`;
      fontStyles.forEach((style, i) => {
        const preview = convertText("Abc 123", style.map);
        msg += `❀ ${stylize(i + 1)}. ${stylize(style.name)}\n   ${preview}\n\n`;
      });
      msg += `— ᯓ★ ${stylize("𝗎𝗌𝖾: 𝖿𝗈𝗇𝗍 <𝗇𝗎𝗆𝖻𝖾𝗋> <𝗍𝖾𝗑𝗍>")} Ი𐑼 𖹭`;
      return api.sendMessage(msg, threadID, messageID);
    }

    if (args.length === 0) {
      return message.reply(`✧ 𐃷 ${stylize("𝗐𝖾𝗅𝖼𝗈𝗆𝖾 𝗍𝗈 𝖿𝗈𝗇𝗍 𝗆𝖺𝗀𝗂𝖼")} Ი𐑼 𖹭\n\n` +
        `🌷 ${stylize("𝗎𝗌𝖾")}: 𝖿𝗈𝗇𝗍 <𝗇𝗎𝗆𝖻𝖾𝗋> <𝗍𝖾𝗑𝗍>\n` +
        `🌷 ${stylize("𝗅𝗂𝗌𝗍")}: ${stylize("𝗌𝗁𝗈𝗐 𝖺𝗅𝗅 𝗌𝗍𝗒𝗅𝖾𝗌")}\n` +
        `🌷 ${stylize("𝗋𝖺𝗇𝖽𝗈𝗆")}: ${stylize("𝗌𝗎𝗋𝗉𝗋𝗂𝗌𝖾 𝗌𝗍𝗒𝗅𝖾")}\n\n` +
        `✨ ${stylize("𝖾𝗑𝖺𝗆𝗉𝗅𝖾")}: 𝖿𝗈𝗇𝗍 𝟥 𝗁𝖾𝗅𝗅𝗈 𝗐𝗈𝗋𝗅𝖽 ᯓ★`);
    }

    if (args[0]?.toLowerCase() === "random") {
      const text = args.slice(1).join(" ");
      if (!text) return message.reply(`✧ 𐃷 ${stylize("𝗉𝗅𝖾𝖺𝗌𝖾 𝗉𝗋𝗈𝗏𝗂𝖽𝖾 𝗌𝗈𝗆𝖾 𝗍𝖾𝗑𝗍")} Ი𐑼 𖹭`);
      const randomIndex = Math.floor(Math.random() * fontStyles.length);
      const style = fontStyles[randomIndex];
      const converted = convertText(text, style.map);
      return sendStyledResult(api, threadID, messageID, converted, style.name, randomIndex + 1, stylize);
    }

    const choice = parseInt(args[0]);
    const text = args.slice(1).join(" ").trim();

    if (isNaN(choice) || choice < 1 || choice > fontStyles.length) {
      return message.reply(`✧ 𐃷 ${stylize("𝖼𝗁𝗈𝗈𝗌𝖾 𝖻𝖾𝗍𝗐𝖾𝖾𝗇")} 𝟏-${fontStyles.length} Ი𐑼 𖹭`);
    }

    if (!text) return message.reply(`✧ 𐃷 ${stylize("𝗒𝗈𝗎 𝖿𝗈𝗋𝗀𝗈𝗍 𝗍𝗁𝖾 𝗍𝖾𝗑𝗍, 𝗌𝗂𝗅𝗅𝗒")} Ი𐑼 𖹭`);

    const style = fontStyles[choice - 1];
    const converted = convertText(text, style.map);
    sendStyledResult(api, threadID, messageID, converted, style.name, choice, stylize);
  }
};

const fontStyles = [
  { name: "Bold Serif", map: "𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗" },
  { name: "Bold Italic", map: "𝑨𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴𝑵𝑶𝑷𝑸𝑹𝑺𝑻𝑼𝑽𝑾𝑿𝒀𝒁𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛0123456789" },
  { name: "Script", map: "𝒜𝒝𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏0123456789" },
  { name: "Bold Script", map: "𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃0123456789" },
  { name: "Fraktur", map: "𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷0123456789" },
  { name: "Double Struck", map: "𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝗇𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡" },
  { name: "Sans Bold", map: "𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶碰𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵" },
  { name: "Sans Italic", map: "𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡𝘢𝘣𝘤🇩🇪𝖿𝘨𝗁𝗂𝗃𝗄𝗅𝗆𝗇𝗈𝗉𝗊𝗋𝗌𝗍𝗎𝗏𝗐𝗑𝗒𝗓0123456789" },
  { name: "Small Caps", map: "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789" },
  { name: "Circled", map: "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ⓪①②③④⑤⑥⑦⑧⑨" },
  { name: "Medieval", map: "𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟0123456789" }
];

function convertText(text, mapStr) {
  const map = Array.from(mapStr);
  let result = "";
  const alpha = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (const char of text) {
    const index = alpha.indexOf(char);
    result += (index !== -1 && map[index]) ? map[index] : char;
  }
  return result;
}

function sendStyledResult(api, threadID, messageID, text, styleName, number, stylize) {
  const box = 
    `┏━━━〔 ${stylize("𝗌𝗍𝗒𝗅𝖾")} #${number} 〕━━━┓\n\n` +
    `  ᯓ★ ${stylize("𝗆𝗈𝖽𝖾")}: ${stylize(styleName)}\n` +
    `  ᯓ★ ${stylize("𝗋𝖾𝗌𝗎𝗅𝗍")}:\n\n${text}\n\n` +
    `┗━━━━━━━━━━━━━━━┛`;
  api.sendMessage(box, threadID, messageID);
}