const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
  config: {
    name: "developer",
    aliases: ["dev"],
    version: "2.6.0",
    author: "S1FU",
    countDown: 5,
    role: 0,
    category: "𝗌𝗒𝗌𝗍𝖾𝗆",
    description: { en: "𝗆𝖺𝗇𝖺𝗀𝖾 𝖽𝖾𝗏𝖾𝗅𝗈𝗉𝖾𝗋 𝗋𝗈𝗅𝖾 𝗐𝗂𝗍𝗁 𝗋𝖾𝗉𝗅𝗒 𝗌𝗎𝗉𝗉𝗈𝗋𝗍" },
    guide: { en: "『 {pn} add | remove | list 』" }
  },

  langs: {
    en: {
      added: "┏━━━〔 𝖺𝗎𝗍𝗁𝗈𝗋𝗂𝗓𝖾𝖽 〕━━━┓\n\n  ᯓ★ 𝗀𝗋𝖺𝗇𝗍𝖾𝖽 𝖺𝖼𝖼𝖾𝗌𝗌 𝗍𝗈 %1 𝗎𝗌𝖾𝗋𝗌\n%2\n\n┗━━━━━━━━━━━━━━━┛",
      removed: "┏━━━〔 𝗋𝖾𝗏𝗈𝗄𝖾𝖽 〕━━━┓\n\n  ᯓ★ 𝗋𝖾𝗆𝗈𝗏𝖾𝖽 %1 𝖽𝖾𝗏𝖾𝗅𝗈𝗉𝖾𝗋𝗌\n%2\n\n┗━━━━━━━━━━━━━━━┛",
      missingId: "┏━━━〔 𝖾𝗋𝗋𝗈𝗋 〕━━━┓\n\n  ᯓ★ 𝗉𝗅𝖾𝖺𝗌𝖾 𝗍𝖺𝗀, 𝗋𝖾𝗉𝗅𝗒 𝗈𝗋 𝗎𝗂𝖽\n\n┗━━━━━━━━━━━━━━━┛",
      listDev: "┏━━━〔 𝖽𝖾𝗏 𝗅𝗂𝗌𝗍 〕━━━┓\n\n%1\n\n┗━━━━━━━━━━━━━━━┛",
      noPermission: "ᯓ★ 𝗁𝗂𝗀𝗁𝖾𝗋 𝗉𝗋𝗂𝗏𝗂𝗅𝖾𝗀𝖾 𝗋𝖾𝗊𝗎𝗂𝗋𝖾𝖽 Ი𐑼"
    }
  },

  onStart: async function ({ message, args, usersData, event, getLang, role }) {
    if (!config.developer) config.developer = [];

    const stylize = (text) => {
      const fonts = {
        "a":"𝖺","b":"𝖻","c":"𝖼","d":"𝖽","e":"𝖾","f":"𝖿","g":"𝗀","h":"𝗁","i":"𝗂","j":"𝗃","k":"𝗄","l":"𝗅","m":"𝗆",
        "n":"𝗇","o":"𝗈","p":"𝗉","q":"𝗊","r":"𝗋","s":"𝗌","t":"𝗍","u":"𝗎","v":"𝗏","w":"𝗐","x":"𝗑","y":"𝗒","z":"𝗓",
        "0":"𝟎","1":"𝟏","2":"𝟐","3":"𝟑","4":"𝟒","5":"𝟓","6":"𝟔","7":"𝟕","8":"𝟖","9":"𝟗"
      };
      return text.toString().toLowerCase().split('').map(char => fonts[char] || char).join('');
    };

    // --- UID Parser (Supports Tags, Reply, and Direct IDs) ---
    const getTargetUIDs = () => {
      let ids = [];
      if (Object.keys(event.mentions).length > 0) ids = Object.keys(event.mentions);
      else if (event.messageReply) ids.push(event.messageReply.senderID);
      else ids = args.slice(1).filter(arg => !isNaN(arg) && arg.length >= 10);
      return ids;
    };

    switch (args[0]) {
      case "add":
      case "-a": {
        if (role < 4) return message.reply(getLang("noPermission"));
        const uids = getTargetUIDs();
        if (uids.length === 0) return message.reply(getLang("missingId"));

        const notDevIds = uids.filter(uid => !config.developer.includes(uid));
        config.developer.push(...notDevIds);
        
        const names = await Promise.all(notDevIds.map(async uid => ({ uid, name: await usersData.getName(uid) })));
        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

        return message.reply(getLang("added", notDevIds.length, names.map(n => `  ⋆ ${stylize(n.name)} (${stylize(n.uid)})`).join("\n")));
      }

      case "remove":
      case "-r": {
        if (role < 4) return message.reply(getLang("noPermission"));
        const uids = getTargetUIDs();
        if (uids.length === 0) return message.reply(getLang("missingId"));

        const devIdsToRemove = uids.filter(uid => config.developer.includes(uid));
        for (const uid of devIdsToRemove) config.developer.splice(config.developer.indexOf(uid), 1);

        const names = await Promise.all(devIdsToRemove.map(async uid => ({ uid, name: await usersData.getName(uid) })));
        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

        return message.reply(getLang("removed", devIdsToRemove.length, names.map(n => `  ⋆ ${stylize(n.name)} (${stylize(n.uid)})`).join("\n")));
      }

      case "list":
      case "-l": {
        if (config.developer.length === 0) return message.reply("ᯓ★ 𝗇𝗈 𝖽𝖾𝗏𝖾𝗅𝗈𝗉𝖾𝗋𝗌 𝖿𝗈𝗎𝗇𝖽 Ი𐑼");
        const list = await Promise.all(config.developer.map(async uid => ({ uid, name: await usersData.getName(uid) })));
        return message.reply(getLang("listDev", list.map(n => `  ᯓ★ ${stylize(n.name)}\n  ⋆ ${stylize(n.uid)}`).join("\n\n"), config.developer.length));
      }

      default:
        return message.reply(`┏━━━〔 𝗁𝖾𝗅𝗉 〕━━━┓\n\n  ᯓ★ ${stylize("dev add")} <𝗋𝖾𝗉𝗅𝗒/@𝗍𝖺𝗀>\n  ᯓ★ ${stylize("dev remove")} <𝗋𝖾𝗉𝗅𝗒/𝗂𝖽>\n  ᯓ★ ${stylize("dev list")}\n\n┗━━━━━━━━━━━━━━━┛`);
    }
  }
};