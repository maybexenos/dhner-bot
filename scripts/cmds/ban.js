const { findUid } = global.utils;
const moment = require("moment-timezone");

module.exports = {
        config: {
                name: "ban",
                version: "2.0",
                author: "S1FU",
                countDown: 5,
                role: 1,
                shortDescription: { en: "𝖻𝖺𝗇 𝗎𝗌𝖾𝗋𝗌 𝖿𝗋𝗈𝗆 𝗍𝗁𝖾 𝖼𝗁𝖺𝗍" },
                category: "𝖻𝗈𝗑 𝖼𝗁𝖺𝗍",
                guide: {
                        en: "『 {pn} [@𝗍𝖺𝗀|𝗎𝗂𝖽|𝗋𝖾𝗉𝗅𝗒] 』\n『 {pn} 𝗎𝗇𝖻𝖺𝗇 [@𝗍𝖺𝗀|𝗎𝗂𝖽] 』\n『 {pn} 𝗅𝗂𝗌𝗍 』"
                }
        },

        onStart: async function ({ message, event, args, threadsData, usersData, api }) {
                const { threadID, messageID, senderID, mentions, messageReply } = event;
                const { members, adminIDs } = await threadsData.get(threadID);
                const botID = global.botID || api.getCurrentUserID();
                const banKey = `data.banned_ban_${botID}`;
                const dataBanned = await threadsData.get(threadID, banKey, []);

                if (args[0] === 'unban') {
                        let target;
                        if (Object.keys(mentions).length) target = Object.keys(mentions)[0];
                        else if (messageReply) target = messageReply.senderID;
                        else if (!isNaN(args[1])) target = args[1];
                        else if (args[1]?.startsWith('https')) target = await findUid(args[1]);

                        if (!target) return message.reply(`┏━━━〔 𝗕𝗔𝗡 〕━━━┓\n┣ 𝗽𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮 𝘁𝗮𝗿𝗴𝗲𝘁 𝘁𝗼 𝘂𝗻𝗯𝗮𝗻\n┗━━━━━━━━━━━━━━━┛`);

                        const index = dataBanned.findIndex(item => item.id == target);
                        if (index === -1) return message.reply(`┏━━━〔 𝗕𝗔𝗡 〕━━━┓\n┣ 𝘁𝗵𝗶𝘀 𝘂𝘀𝗲𝗿 𝗶𝘀 𝗻𝗼𝘁 𝗿𝗲𝘀𝘁𝗿𝗶𝗰𝘁𝗲𝗱\n┗━━━━━━━━━━━━━━━┛`);

                        dataBanned.splice(index, 1);
                        await threadsData.set(threadID, dataBanned, banKey);
                        const name = await usersData.getName(target) || "𝖥𝖺𝖼𝖾𝖻𝗈𝗈𝗄 𝖴𝗌𝖾𝗋";

                        return message.reply(`┏━━━〔 𝗨𝗡𝗕𝗔𝗡𝗡𝗘𝗗 〕━━━┓\n┣ 𝘂𝘀𝗲𝗿 : ${name}\n┣ 𝘀𝘁𝗮𝘁𝘂𝘀 : 𝗮𝗰𝗰𝗲𝘀𝘀 𝗿𝗲𝘀𝘁𝗼𝗿𝗲𝗱\n┗━━━━━━━━━━━━━━━┛`);
                }

                if (args[0] === 'list') {
                        if (!dataBanned.length) return message.reply(`┏━━━〔 𝗕𝗔𝗡 𝗟𝗜𝗦𝗧 〕━━━┓\n┣ 𝗻𝗼 𝗯𝗮𝗻𝗻𝗲𝗱 𝗺𝗲𝗺𝗯𝗲𝗿𝘀 𝗳𝗼𝘂𝗻𝗱\n┗━━━━━━━━━━━━━━━┛`);
                        let msg = `┏━━━〔 𝗕𝗔𝗡 𝗟𝗜𝗦𝗧 〕━━━┓\n`;
                        for (let i = 0; i < dataBanned.length; i++) {
                                const name = await usersData.getName(dataBanned[i].id) || "𝖴𝗇𝗄𝗇𝗈𝗐𝗇";
                                msg += `┣ ${i + 1}. ${name} (${dataBanned[i].id})\n`;
                        }
                        msg += `┗━━━━━━━━━━━━━━━┛`;
                        return message.reply(msg);
                }

                let target, reason;
                if (messageReply) {
                        target = messageReply.senderID;
                        reason = args.join(' ');
                } else if (Object.keys(mentions).length) {
                        target = Object.keys(mentions)[0];
                        reason = args.join(' ').replace(mentions[target], '').trim();
                } else if (!isNaN(args[0])) {
                        target = args[0];
                        reason = args.slice(1).join(' ');
                }

                if (!target) return message.reply(`┏━━━〔 𝗕𝗔𝗡 〕━━━┓\n┣ 𝘁𝗮𝗴 𝗼𝗿 𝗿𝗲𝗽𝗹𝘆 𝘁𝗼 𝘀𝗼𝗺𝗲𝗼𝗻𝗲 𝘁𝗼 𝗯𝗮𝗻\n┗━━━━━━━━━━━━━━━┛`);
                if (target == senderID) return message.reply(`┏━━━〔 𝗕𝗔𝗡 〕━━━┓\n┣ 𝘆𝗼𝘂 𝗰𝗮𝗻𝗻𝗼𝘁 𝗯𝗮𝗻 𝘆𝗼𝘂𝗿𝘀𝗲𝗹𝗳\n┗━━━━━━━━━━━━━━━┛`);
                if (adminIDs.includes(target)) return message.reply(`┏━━━〔 𝗕𝗔𝗡 〕━━━┓\n┣ 𝗰𝗮𝗻𝗻𝗼𝘁 𝗯𝗮𝗻 𝗮𝗱𝗺𝗶𝗻𝗶𝘀𝘁𝗿𝗮𝘁𝗼𝗿𝘀\n┗━━━━━━━━━━━━━━━┛`);
                if (dataBanned.some(i => i.id == target)) return message.reply(`┏━━━〔 𝗕𝗔𝗡 〕━━━┓\n┣ 𝘂𝘀𝗲𝗿 𝗶𝘀 𝗮𝗹𝗿𝗲𝗮𝗱𝘆 𝗯𝗮𝗻𝗻𝗲𝗱\n┗━━━━━━━━━━━━━━━┛`);

                const name = await usersData.getName(target) || "𝖥𝖺𝖼𝖾𝖻𝗈𝗈𝗄 𝖴𝗌𝖾𝗋";
                const time = moment().tz("Asia/Dhaka").format('HH:mm:ss DD/MM/YYYY');
                
                dataBanned.push({ id: target, time, reason: reason || "𝗇𝗈 𝗋𝖾𝖺𝗌𝗈𝗇" });
                await threadsData.set(threadID, dataBanned, banKey);

                const successBody = `┏━━━〔 𝗨𝗦𝗘𝗥 𝗕𝗔𝗡𝗡𝗘𝗗 〕━━━┓\n┣ 𝗻𝗮𝗺𝗲 : ${name}\n┣ 𝗿𝗲𝗮𝘀𝗼𝗻 : ${reason || "𝗇𝗈 𝗋𝖾𝖺𝗌𝗈𝗇"}\n┣ 𝘁𝗶𝗺𝗲 : ${time}\n┗━━━━━━━━━━━━━━━┛`;
                
                message.reply(successBody, () => {
                        if (adminIDs.includes(api.getCurrentUserID())) {
                                api.removeUserFromGroup(target, threadID);
                        } else {
                                message.send(`┏━━━〔 𝗡𝗢𝗧𝗜𝗖𝗘 〕━━━┓\n┣ 𝗽𝗹𝗲𝗮𝘀𝗲 𝗺𝗮𝗸𝗲 𝗺𝗲 𝗮𝗱𝗺𝗶𝗻 𝘁𝗼 𝗸𝗶𝗰𝗸 𝘁𝗵𝗲𝗺\n┗━━━━━━━━━━━━━━━┛`);
                        }
                });
        },

        onEvent: async function ({ event, api, threadsData, message }) {
                if (event.logMessageType === "log:subscribe") {
                        const botID = global.botID || api.getCurrentUserID();
                        const banKey = `data.banned_ban_${botID}`;
                        const dataBanned = await threadsData.get(event.threadID, banKey, []);
                        const added = event.logMessageData.addedParticipants;

                        for (const user of added) {
                                const banned = dataBanned.find(i => i.id == user.userFbId);
                                if (banned) {
                                        api.removeUserFromGroup(user.userFbId, event.threadID, (err) => {
                                                if (!err) message.send(`┏━━━〔 𝗔𝗨𝗧𝗢 𝗞𝗜𝗖𝗞 〕━━━┓\n┣ ${user.fullName} 𝗶𝘀 𝗯𝗮𝗻𝗻𝗲𝗱\n┣ 𝘂𝗶𝗱 : ${user.userFbId}\n┣ 𝗿𝗲𝗮𝘀𝗼𝗻 : ${banned.reason}\n┗━━━━━━━━━━━━━━━┛`);
                                        });
                                }
                        }
                }
        }
};
