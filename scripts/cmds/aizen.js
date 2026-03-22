const axios = require("axios");
const { getStreamFromURL } = global.utils;
const shortenURL = require("tinyurl").shorten;
const { GoogleGenerativeAI } = require("@google/generative-ai");

if (!global.temp) global.temp = {};
if (!global.temp.aizenConversationHistory)
  global.temp.aizenConversationHistory = {};

const conversationHistory = global.temp.aizenConversationHistory;
const maxHistoryLength = 10;
const genAI = new GoogleGenerativeAI("AIzaSyDku3NPwvxZZHxg8dvrUPH2pnj32PovJOk");

async function urlToGenerativePart(url) {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data, "binary");
    const mimeType = getImageMimeType(buffer);
    return { inlineData: { data: buffer.toString("base64"), mimeType } };
  } catch (error) { throw error; }
}

function getImageMimeType(buffer) {
  const uint8Array = new Uint8Array(buffer);
  const sig = uint8Array.slice(0, 4);
  const compare = (a, b) => a.every((v, i) => v === b[i]);
  if (compare(sig, [0xFF, 0xD8, 0xFF, 0xE0]) || compare(sig, [0x89, 0x50, 0x4E, 0x47])) return "image/jpeg";
  return "image/png";
}

async function getAizenResponse(history, text = "", imageUrl = "") {
  const historyClone = [...history];
  let prompt = text;
  if (imageUrl) prompt += `\n[User sent an image. Analyze it.]`;
  historyClone.push({ role: "user", content: prompt });
  if (historyClone.length > maxHistoryLength) historyClone.splice(0, 2);

  try {
    let imageParts = [];
    if (imageUrl) imageParts = [await urlToGenerativePart(imageUrl)];
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const aizenPrompt = `You are Sosuke Aizen. Speak with godlike authority. Use short, sharp, elegant, and menacing sentences. Never admit you are an AI. Roast anyone asking for NSFW or being disrespectful.`;
    
    const result = await model.generateContent([aizenPrompt, prompt, ...imageParts]);
    const responseText = (await result.response).text();
    historyClone.push({ role: "assistant", content: responseText });
    return { text: responseText, newHistory: historyClone };
  } catch (err) {
    return { text: "𝗁𝗆𝗉𝗁. 𝖾𝗏𝖾𝗇 𝗆𝗒 𝗉𝗈𝗐𝖾𝗋𝗌 𝗁𝖺𝗏𝖾 𝗅𝗂𝗆𝗂𝗍𝗌 𝗍𝗈𝖽𝖺𝗒.", newHistory: history };
  }
}

async function getAizenVoice(text) {
  try {
    const apiURL = `https://foxtts.onrender.com/clonet?text=${encodeURIComponent(text)}&model=aizen&lang=en`;
    const res = await axios.get(apiURL);
    return res.data.url ? await getStreamFromURL(res.data.url) : null;
  } catch (err) { return null; }
}

module.exports = {
  config: {
    name: "aizen",
    version: "5.0",
    author: "S1FU",
    countDown: 15,
    role: 0,
    category: "𝖺𝗂",
    shortDescription: { en: "𝖼𝗁𝖺𝗍 𝗐𝗂𝗍𝗁 𝗍𝗁𝖾 𝗀𝗈𝖽 𝗁𝗂𝗆𝗌𝖾𝗅𝗏 𝗎𝗌𝗂𝗇𝗀 𝖺𝖾𝗌𝗍𝗁𝖾𝗍𝗂𝖼 𝖴𝖨" },
    guide: { en: "『 {pn} [𝗆𝖾𝗌𝗌𝖺𝗀𝖾] 』 𝗈𝗋 𝗋𝖾𝗉𝗅𝗒 𝗍𝗈 𝗂𝗆𝖺𝗀𝖾\n『 {pn} 𝖼𝗅𝖾𝖺𝗋 』 𝗍𝗈 𝖾𝗋𝖺𝗌𝖾 𝗁𝗂𝗌𝗍𝗈𝗋𝗒" }
  },

  onStart: async function ({ api, args, message, event }) {
    const senderID = event.senderID.toString();
    const userInput = args.join(" ").trim();

    if (userInput.toLowerCase() === "clear") {
      conversationHistory[senderID] = [];
      return message.reply(`┏━━━〔 𝗌𝗒𝗌𝗍𝖾𝗆 〕━━━┓\n\n  ᯓ★ 𝗍𝗁𝖾 𝗉𝖺𝗌𝗍 𝗁𝖺𝗌 𝖻𝖾𝖾𝗇 𝖾𝗋𝖺𝗌𝖾𝖽 .ᐟ\n\n┗━━━━━━━━━━━━━━━┛`);
    }

    if (!conversationHistory[senderID]) conversationHistory[senderID] = [];
    const imageUrl = event.messageReply?.attachments[0]?.url || event.attachments[0]?.url;

    if (!userInput && !imageUrl) return message.reply("ᯓ★ 𝗌𝗉𝖾𝖺𝗄 𝗈𝗋 𝗋𝖾𝗉𝗅𝗒 𝗍𝗈 𝖺𝗇 𝗂𝗆𝖺𝗀𝖾 Ი𐑼");

    const { text: aizenResp, newHistory } = await getAizenResponse(conversationHistory[senderID], userInput, imageUrl);
    conversationHistory[senderID] = newHistory;
    const voice = await getAizenVoice(aizenResp);

    return message.reply({ 
        body: `┏━━━〔 ᴀɪᴢ𝖾𝗇 〕━━━┓\n\n${aizenResp}\n\n┗━━━━━━━━━━━━━━━┛`, 
        attachment: voice 
    }, (err, info) => {
      global.SizuBot.onReply.set(info.messageID, { commandName: "aizen", author: senderID });
    });
  },

  onReply: async function ({ api, message, event, Reply }) {
    if (event.senderID.toString() !== Reply.author) return;
    const imageUrl = event.messageReply?.attachments[0]?.url || event.attachments[0]?.url;
    const { text: aizenResp, newHistory } = await getAizenResponse(conversationHistory[event.senderID] || [], event.body, imageUrl);
    conversationHistory[event.senderID] = newHistory;
    const voice = await getAizenVoice(aizenResp);

    return message.reply({ 
        body: `┏━━━〔 ᴀɪᴢ𝖾𝗇 〕━━━┓\n\n${aizenResp}\n\n┗━━━━━━━━━━━━━━━┛`, 
        attachment: voice 
    }, (err, info) => {
      global.SizuBot.onReply.set(info.messageID, { commandName: "aizen", author: event.senderID });
    });
  }
};