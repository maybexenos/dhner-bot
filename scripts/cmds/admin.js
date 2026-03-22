const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

const toSmallCaps = t => {
    const map = {
        a:'ᴀ', b:'ʙ', c:'ᴄ', d:'ᴅ', e:'ᴇ', f:'ꜰ', g:'ɢ', h:'ʜ', i:'ɪ', j:'ᴊ', k:'ᴋ', l:'ʟ',
        m:'ᴍ', n:'ɴ', o:'ᴏ', p:'ᴘ', q:'ǫ', r:'ʀ', s:'ꜱ', t:'ᴛ', u:'ᴜ', v:'ᴠ', w:'ᴡ', x:'x',
        y:'ʏ', z:'ᴢ', '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉'
    };
    return (t || "???").toLowerCase().split("").map(c => map[c] || c).join("");
};

const boxTop    = "┏━━━〔  〕━━━┓";
const boxBottom = "┏━━━〔  〕━━━┓";
const heartLine = "┗━━━━━━━━━━━━━━━┛";
const miniStar  = "✧˖°";
const cuteDot   = "❀";

module.exports = {
    config: {
        name: "admin",
        version: "2.2",
        author: "乛 Xꫀᥒos ゎ",
        countDown: 3,
        role: 3,
        description: "Add, remove or see your precious admins~",
        category: "system",
        guide: {
            en: "{pn} add    @tag / reply / uid(s)\n"
              + "{pn} remove @tag / reply / uid(s)\n"
              + "{pn} list"
        }
    },

    langs: {
        en: {
            // ────── COMMON ──────
            missing_target: "૮₍ ˶• ̫ •˶ ₎ა Darling~ please @tag someone, reply to their message, or write UID(s) okay? ♡",

            // ────── ADD ──────
            add_header:     boxTop + "\n     ♡ ɴᴇᴡ ʙᴀʙʏ ᴀᴅᴍɪɴs ᴀʀʀɪᴠᴇᴅ ♡\n" + boxBottom,
            add_success:    "Yayyy~ %1 new cutie(s) joined our little family!\n\n%2",
            add_already:    "\n\n✿ Already part of our cozy home:\n%2",
            add_nothing:    "❀ No new admins this time~ everyone is already super loved ♡",

            // ────── REMOVE ──────
            remove_header:  boxTop + "\n   ♡ sᴏғᴛ ɢᴏᴏᴅʙʏᴇ ᴋɪss ᴛᴏ ᴀᴅᴍɪɴs ♡\n" + boxBottom,
            remove_success: "Gave a gentle hug and bye-bye to %1 sweetie(s)\n\n%2",
            remove_notfound:"\n\n✿ These angels weren't admins:\n%2",
            remove_nothing: "❀ No one left~ everyone is still here with us ♡",

            // ────── LIST ──────
            list_header:    boxTop + "\n      ♡ ᴏᴜʀ ᴘʀᴇᴄɪᴏᴜs ᴀᴅᴍɪɴs ♡\n" + boxBottom,
            list_empty:     "Right now our family has no admins...\n(´• ω •`)ﾉ Maybe you can be the first? ♡",
            list_item:      cuteDot + "  %1   ❀  %2\n    ᴵᴰ  %3",
            list_footer:    heartLine + "\n🧸 Stay soft, stay sparkly, stay you~ 🧸" + "\n" + heartLine
        }
    },

    onStart: async function ({ message, args, usersData, event, getLang }) {
        const action = (args[0] || "").toLowerCase();

        const collectUids = () => {
            let ids = [];

            // Priority 1: Mentions
            if (event.mentions && Object.keys(event.mentions).length > 0) {
                ids = Object.keys(event.mentions);
            }
            // Priority 2: Reply
            else if (event.messageReply) {
                ids = [event.messageReply.senderID];
            }
            // Priority 3: Direct UIDs from arguments
            else if (args.length > 1) {
                ids = args.slice(1).filter(id => /^\d{10,17}$/.test(id));
            }

            return [...new Set(ids.filter(Boolean))];
        };

        const uids = collectUids();

        if (["add", "-a", "a"].includes(action)) {
            if (uids.length === 0) return message.reply(getLang("missing_target"));

            const newlyAdded = [];
            const duplicates  = [];

            uids.forEach(uid => {
                if (config.adminBot.includes(uid)) {
                    duplicates.push(uid);
                } else {
                    config.adminBot.push(uid);
                    newlyAdded.push(uid);
                }
            });

            if (newlyAdded.length === 0 && duplicates.length === 0) {
                return message.reply(getLang("missing_target"));
            }

            writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

            const nameMap = await Promise.all(
                [...newlyAdded, ...duplicates].map(async uid => ({
                    uid,
                    name: await usersData.getName(uid) || "Mystery Baby"
                }))
            );

            let text = getLang("add_header") + "\n\n";

            if (newlyAdded.length > 0) {
                const addedStr = nameMap
                    .filter(u => newlyAdded.includes(u.uid))
                    .map(u => `  ❀ ${toSmallCaps(u.name)}  (${u.uid})`)
                    .join("\n");
                text += getLang("add_success", newlyAdded.length, addedStr) + "\n";
            }

            if (duplicates.length > 0) {
                const dupStr = nameMap
                    .filter(u => duplicates.includes(u.uid))
                    .map(u => `  ✧ ${toSmallCaps(u.name)}  (${u.uid})`)
                    .join("\n");
                text += getLang("add_already", dupStr);
            }

            text += "\n" + heartLine;
            return message.reply(text);
        }

        if (["remove", "-r", "r"].includes(action)) {
            if (uids.length === 0) return message.reply(getLang("missing_target"));

            const removed   = [];
            const notAdmins = [];

            uids.forEach(uid => {
                const idx = config.adminBot.indexOf(uid);
                if (idx !== -1) {
                    config.adminBot.splice(idx, 1);
                    removed.push(uid);
                } else {
                    notAdmins.push(uid);
                }
            });

            if (removed.length === 0 && notAdmins.length === 0) {
                return message.reply(getLang("missing_target"));
            }

            writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

            const nameMap = await Promise.all(
                [...removed, ...notAdmins].map(async uid => ({
                    uid,
                    name: await usersData.getName(uid) || "Unknown Angel"
                }))
            );

            let text = getLang("remove_header") + "\n\n";

            if (removed.length > 0) {
                const remStr = nameMap
                    .filter(u => removed.includes(u.uid))
                    .map(u => `  ❀ ${toSmallCaps(u.name)}  (${u.uid})`)
                    .join("\n");
                text += getLang("remove_success", removed.length, remStr) + "\n";
            }

            if (notAdmins.length > 0) {
                const nfStr = nameMap
                    .filter(u => notAdmins.includes(u.uid))
                    .map(u => `  ✧ ${toSmallCaps(u.name)}  (${u.uid})`)
                    .join("\n");
                text += getLang("remove_notfound", nfStr);
            }

            text += "\n" + heartLine;
            return message.reply(text);
        }

        if (["list", "-l", "l"].includes(action)) {
            let text = getLang("list_header") + "\n\n";

            if (config.adminBot.length === 0) {
                text += getLang("list_empty") + "\n\n" + getLang("list_footer");
                return message.reply(text);
            }

            const admins = await Promise.all(
                config.adminBot.map(async (uid, index) => {
                    const name = await usersData.getName(uid) || "Sweet Mystery";
                    return getLang("list_item", index + 1, toSmallCaps(name), uid);
                })
            );

            text += admins.join("\n\n") + "\n\n" + getLang("list_footer");
            return message.reply(text);
        }

        // Default help
        return message.reply(
            boxTop + "\n     ♡ ᴀᴅᴍɪɴ ᴄᴏᴍᴍᴀɴᴅs ♡\n" + boxBottom + "\n\n" +
            "❀ add    → @tag / reply / uid(s)\n" +
            "❀ remove → @tag / reply / uid(s)\n" +
            "❀ list   → see all admins\n\n" +
            heartLine + "\nUse with love~ ♡"
        );
    }
};
