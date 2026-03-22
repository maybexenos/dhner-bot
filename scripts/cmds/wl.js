const fs = require("fs-extra");

const boxTop    = "✦──── ⋆⋅☆⋅⋆ ────✦";
const boxBottom = "✦──── ⋆⋅☆⋅⋆ ────✦";
const heartLine = "┗━━━━━━━━━━━━━━━┛";
const miniSep   = "❀ • ─────── • ❀";

module.exports = {
  config: {
    name: "whitelists",
    aliases: ["wl", "whitelist", "white"],
    version: "3.1",
    author: "乛 Xꫀᥒos ゎ",
    countDown: 4,
    role: 2,
    description: "Manage who is allowed to play with special powers~",
    category: "owner",
    guide: {
      en: "   {pn} add    @tag / reply / uid(s)\n" +
          "   {pn} remove @tag / reply / uid(s)\n" +
          "   {pn} list\n" +
          "   {pn} mode   on / off\n" +
          "   {pn} noti   on / off"
    }
  },

  langs: {
    en: {
      // ────── ADD ──────
      add_header:     boxTop + "\n   ♡ ɴᴇᴡ sᴛᴀʀ ᴀᴅᴅᴇᴅ ᴛᴏ sᴋʏ ♡\n" + boxBottom,
      add_success:    "૮₍ ˶ᵔ ᵕ ᵔ˶ ₎ა Yayy~ %1 new cutie(s) joined the whitelist family!\n\n%2",
      add_already:    "\n\n✿ These sweeties were already sparkling here:\n%2",
      add_empty:      "❀ No new friends added~ maybe they’re already VIP? ♡",

      // ────── REMOVE ──────
      remove_header:  boxTop + "\n   ♡ sᴏғᴛ ɢᴏᴏᴅʙʏᴇ ᴋɪss ♡\n" + boxBottom,
      remove_success: "Gave a gentle hug & bye-bye to %1 sweetie(s)\n\n%2",
      remove_notfound:"\n\n✿ These angels weren't on the list:\n%2",
      remove_self:    "🥺 You can't remove yourself silly~ Who will take care of me then?",

      // ────── LIST ──────
      list_header:    boxTop + "\n     ♡ ᴡʜɪᴛᴇʟɪsᴛ ᴅɪᴀʀʏ ♡\n" + boxBottom,
      list_empty:     "Right now the list is empty...\n(´• ω •`)ﾉ Wanna be the first star? ♡",
      list_item:      "❀  %1   ᴵᴰ %2",
      list_stats:     "\n" + miniSep + "\n✦ Total stars: %1\n✦ Security gate: %2\n✦ Notifications: %3\n" + heartLine,

      // ────── MODE ──────
      mode_on:        boxTop + "\n   ♡ sʏsᴛᴇᴍ ɢᴀᴛᴇ ʟᴏᴄᴋᴇᴅ ♡\n" + boxBottom + "\n\nOnly whitelist babies can enter now~ 🛡️",
      mode_off:       boxTop + "\n   ♡ sʏsᴛᴇᴍ ɢᴀᴛᴇ ᴏᴘᴇɴ ♡\n" + boxBottom + "\n\nEveryone is welcome again~ 🌸",

      // ────── NOTI ──────
      noti_on:        boxTop + "\n   ♡ ᴀʟᴇʀᴛs ᴏɴ ♡\n" + boxBottom + "\n\nI'll whisper when someone tries to sneak in~ 🔔",
      noti_off:       boxTop + "\n   ♡ ᴀʟᴇʀᴛs ᴏғғ ♡\n" + boxBottom + "\n\nSilent mode activated~ 🔕",

      // ────── ERRORS ──────
      missing_target: "૮ • ﻌ • ა Please @tag someone, reply to a message, or write UID(s)~",
      invalid_mode:   "💡 Use: mode on / off",
      invalid_noti:   "💡 Use: noti on / off"
    }
  },

  onStart: async function ({ message, args, usersData, event, getLang, api }) {
    const config = global.GoatBot.config || {};
    if (!config.whiteListMode) {
      config.whiteListMode = { enable: false, whiteListIds: [] };
    }
    const wl = config.whiteListMode;

    // Helper: collect target UIDs safely
    const getTargets = () => {
      let ids = [];

      if (event.mentions && Object.keys(event.mentions).length > 0) {
        ids = Object.keys(event.mentions);
      } else if (event.messageReply) {
        ids = [event.messageReply.senderID];
      } else if (args.length > 1) {
        ids = args.slice(1).filter(id => /^\d{10,17}$/.test(id));
      }

      return [...new Set(ids.filter(Boolean))];
    };

    const action = (args[0] || "").toLowerCase();
    const targets = getTargets();

    // ──── ADD ────
    if (["add", "-a", "a"].includes(action)) {
      if (targets.length === 0) return message.reply(getLang("missing_target"));

      const newlyAdded = [];
      const alreadyThere = [];

      for (const uid of targets) {
        if (wl.whiteListIds.includes(uid)) {
          alreadyThere.push(uid);
        } else {
          wl.whiteListIds.push(uid);
          newlyAdded.push(uid);
        }
      }

      if (newlyAdded.length === 0 && alreadyThere.length === 0) {
        return message.reply(getLang("missing_target"));
      }

      fs.writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

      const nameList = await Promise.all(
        [...newlyAdded, ...alreadyThere].map(async uid => ({
          uid,
          name: (await usersData.getName(uid)) || "Mystery Star"
        }))
      );

      let txt = getLang("add_header") + "\n\n";

      if (newlyAdded.length > 0) {
        const addedTxt = nameList
          .filter(u => newlyAdded.includes(u.uid))
          .map(u => `  ❀ ${u.name} (${u.uid})`)
          .join("\n");
        txt += getLang("add_success", newlyAdded.length, addedTxt) + "\n";
      }

      if (alreadyThere.length > 0) {
        const dupTxt = nameList
          .filter(u => alreadyThere.includes(u.uid))
          .map(u => `  ✧ ${u.name} (${u.uid})`)
          .join("\n");
        txt += getLang("add_already", dupTxt);
      }

      txt += "\n" + heartLine;
      return message.reply(txt);
    }

    // ──── REMOVE ────
    if (["remove", "rm", "-r", "r"].includes(action)) {
      if (targets.length === 0) return message.reply(getLang("missing_target"));

      // Safety: prevent removing yourself if you're the last one or something
      const senderIsInList = wl.whiteListIds.includes(event.senderID);
      const wouldBeEmptyAfter = wl.whiteListIds.length === targets.length && targets.includes(event.senderID);

      if (wouldBeEmptyAfter && senderIsInList) {
        return message.reply(getLang("remove_self"));
      }

      const removed = [];
      const notFound = [];

      for (const uid of targets) {
        const idx = wl.whiteListIds.indexOf(uid);
        if (idx !== -1) {
          wl.whiteListIds.splice(idx, 1);
          removed.push(uid);
        } else {
          notFound.push(uid);
        }
      }

      fs.writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

      const nameList = await Promise.all(
        [...removed, ...notFound].map(async uid => ({
          uid,
          name: (await usersData.getName(uid)) || "Unknown"
        }))
      );

      let txt = getLang("remove_header") + "\n\n";

      if (removed.length > 0) {
        const remTxt = nameList
          .filter(u => removed.includes(u.uid))
          .map(u => `  ❀ ${u.name} (${u.uid})`)
          .join("\n");
        txt += getLang("remove_success", removed.length, remTxt) + "\n";
      }

      if (notFound.length > 0) {
        const nfTxt = nameList
          .filter(u => notFound.includes(u.uid))
          .map(u => `  ✧ ${u.name} (${u.uid})`)
          .join("\n");
        txt += getLang("remove_notfound", nfTxt);
      }

      txt += "\n" + heartLine;
      return message.reply(txt);
    }

    // ──── LIST ────
    if (["list", "-l", "l"].includes(action)) {
      let txt = getLang("list_header") + "\n\n";

      if (wl.whiteListIds.length === 0) {
        txt += getLang("list_empty") + "\n\n" + heartLine;
        return message.reply(txt);
      }

      const entries = await Promise.all(
        wl.whiteListIds.map(async (uid, i) => {
          const name = await usersData.getName(uid) || "Sweet Mystery";
          return getLang("list_item", i + 1, name, uid);
        })
      );

      const gateStatus = wl.enable ? "🟢 LOCKED" : "🔓 OPEN";
      const notiStatus = config.hideNotiMessage?.whiteListMode ? "🔴 OFF" : "🟢 ON";

      txt += entries.join("\n") + getLang("list_stats", wl.whiteListIds.length, gateStatus, notiStatus);
      return message.reply(txt);
    }

    // ──── MODE ────
    if (["mode", "-m", "m"].includes(action)) {
      const state = args[1]?.toLowerCase();
      if (!["on", "off"].includes(state)) return message.reply(getLang("invalid_mode"));

      wl.enable = state === "on";

      fs.writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
      return message.reply(wl.enable ? getLang("mode_on") : getLang("mode_off"));
    }

    // ──── NOTI ────
    if (["noti", "-n", "n"].includes(action)) {
      const state = args[1]?.toLowerCase();
      if (!["on", "off"].includes(state)) return message.reply(getLang("invalid_noti"));

      if (!config.hideNotiMessage) config.hideNotiMessage = {};
      config.hideNotiMessage.whiteListMode = state === "off";

      fs.writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
      return message.reply(state === "on" ? getLang("noti_on") : getLang("noti_off"));
    }

    // Default help
    return message.reply(
      boxTop + "\n   ♡ ᴡʜɪᴛᴇʟɪsᴛ ᴄᴏɴᴛʀᴏʟ ♡\n" + boxBottom + "\n\n" +
      "❀ add    → @tag / reply / uid(s)\n" +
      "❀ remove → @tag / reply / uid(s)\n" +
      "❀ list   → see all stars\n" +
      "❀ mode   → on / off\n" +
      "❀ noti   → on / off\n\n" +
      heartLine + "\nUse with lots of love~ ♡"
    );
  }
};
