const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");

function getDomain(url) {
  const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n]+)/im;
  const match = url.match(regex);
  return match ? match[1] : null;
}

module.exports = {
  config: {
    name: "event",
    version: "2.5.0",
    author: "S1FU",
    countDown: 5,
    role: 3,
    category: "𝗈𝗐𝗇𝖾𝗋",
    description: { en: "𝖺𝖾𝗌𝗍𝗁𝖾𝗍𝗂𝖼 𝖾𝗏𝖾𝗇𝗍 𝗆𝖺𝗇𝖺𝗀𝖾𝗆𝖾𝗇𝗍 𝗌𝗒𝗌𝗍𝖾𝗆" },
    guide: { en: "『 {pn} 𝗅𝗈𝖺𝖽 | 𝗅𝗈𝖺𝖽𝖺𝗅𝗅 | 𝗎𝗇𝗅𝗈𝖺𝖽 | 𝗂𝗇𝗌𝗍𝖺𝗅𝗅 』" }
  },

  onStart: async function ({ args, message, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, commandName, event }) {
    const { configCommands } = global.GoatBot;
    const { log, loadScripts, unloadScripts } = global.utils;

    const stylize = (text) => {
      const fonts = {
        "a":"𝖺","b":"𝖻","c":"𝖼","d":"𝖽","e":"𝖾","f":"𝖿","g":"𝗀","h":"𝗁","i":"𝗂","j":"𝗃","k":"𝗄","l":"𝗅","m":"𝗆",
        "n":"𝗇","o":"𝗈","p":"𝗉","q":"𝗊","r":"𝗋","s":"𝗌","t":"𝗍","u":"𝗎","v":"𝗏","w":"𝗐","x":"𝗑","y":"𝗒","z":"𝗓",
        "0":"𝟎","1":"𝟏","2":"𝟐","3":"𝟑","4":"𝟒","5":"𝟓","6":"𝟔","7":"𝟕","8":"𝟖","9":"𝟗"
      };
      return text.toString().toLowerCase().split('').map(char => fonts[char] || char).join('');
    };

    if (args[0] == "load" && args.length == 2) {
      const infoLoad = loadScripts("events", args[1], log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData);
      return message.reply(infoLoad.status == "success" 
        ? `✧ 𐃷 ${stylize("𝗅𝗈𝖺𝖽𝖾𝖽 𝖾𝗏𝖾𝗇𝗍")}: ${stylize(infoLoad.name)} Ი𐑼 𖹭`
        : `✧ 𐃷 ${stylize("𝗅𝗈𝖺𝖽 𝖿𝖺𝗂𝗅𝖾𝖽")}: ${stylize(infoLoad.error)} Ი𐑼`);
    }

    if (args[0] == "loadall") {
      const allFile = fs.readdirSync(path.join(__dirname, "..", "events")).filter(file => file.endsWith(".js"));
      let count = 0;
      for (const file of allFile) {
        const res = loadScripts("events", file.replace(".js", ""), log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData);
        if (res.status == "success") count++;
      }
      return message.reply(`✧ 𐃷 ${stylize("𝗌𝗎𝖼𝖼𝖾𝗌𝗌𝖿𝗎𝗅𝗅𝗒 𝗋𝖾𝗅𝗈𝖺𝖽𝖾𝖽")} ${stylize(count)} ${stylize("𝖾𝗏𝖾𝗇𝗍𝗌")} Ი𐑼 𖹭`);
    }

    if (args[0] == "unload") {
      const infoUnload = unloadScripts("events", args[1], configCommands);
      return message.reply(infoUnload.status == "success"
        ? `✧ 𐃷 ${stylize("𝗎𝗇𝗅𝗈𝖺𝖽𝖾𝖽")}: ${stylize(infoUnload.name)} Ი𐑼 𖹭`
        : `✧ 𐃷 ${stylize("𝗎𝗇𝗅𝗈𝖺𝖽 𝖿𝖺𝗂𝗅𝖾𝖽")} Ი𐑼`);
    }

    if (args[0] == "install") {
      let url = args[1], fileName = args[2], rawCode;
      if (!url || !fileName) return message.reply(`✧ 𐃷 ${stylize("𝗂𝗇𝗏𝖺𝗅𝗂𝖽 𝖿𝗈𝗋𝗆𝖺𝗍")} Ი𐑼`);

      try {
        if (url.match(/(https?:\/\/(?:www\.|(?!www)))/)) {
          if (url.includes("github.com")) url = url.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");
          if (url.includes("pastebin.com") && !url.includes("/raw/")) url = url.replace("pastebin.com/", "pastebin.com/raw/");
          rawCode = (await axios.get(url)).data;
        } else {
          rawCode = event.body.slice(event.body.indexOf(fileName) + fileName.length + 1);
        }

        const infoLoad = loadScripts("events", fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, null, rawCode);
        return message.reply(infoLoad.status == "success"
          ? `✧ 𐃷 ${stylize("𝗂𝗇𝗌𝗍𝖺𝗅𝗅𝖾𝖽")}: ${stylize(infoLoad.name)} Ი𐑼 𖹭`
          : `✧ 𐃷 ${stylize("𝗂𝗇𝗌𝗍𝖺𝗅𝗅 𝖿𝖺𝗂𝗅𝖾𝖽")} Ი𐑼`);
      } catch (e) { return message.reply(`✧ 𐃷 ${stylize("𝖽𝗈𝗐𝗇𝗅𝗈𝖺𝖽 𝖾𝗋𝗋𝗈𝗋")} Ი𐑼`); }
    }

    message.reply(`✧ 𐃷 ${stylize("𝖺𝗏𝖺𝗂𝗅𝖺𝖻𝗅𝖾")}: 𝗅𝗈𝖺𝖽, 𝗅𝗈𝖺𝖽𝖺𝗅𝗅, 𝗎𝗇𝗅𝗈𝖺𝖽, 𝗂𝗇𝗌𝗍𝖺𝗅𝗅 Ი𐑼 𖹭`);
  }
};