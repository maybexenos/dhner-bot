const fs = require('fs-extra');
const path = require('path');
const pathFile = path.join(__dirname, 'cache', 'autoseen.txt');

module.exports = {
    config: {
        name: "autoseen",
        version: "2.0.0",
        author: "S1FU",
        countDown: 5,
        role: 2,
        shortDescription: {
            en: "𝗍𝗈𝗀𝗀𝗅𝖾 𝖺𝗎𝗍𝗈-𝗋𝖾𝖺𝖽 𝗆𝗈𝖽𝖾"
        },
        longDescription: {
            en: "𝖺𝗎𝗍𝗈𝗆𝖺𝗍𝗂𝖼𝖺𝗅𝗅𝗒 𝗆𝖺𝗋𝗄𝗌 𝖺𝗅𝗅 𝗂𝗇𝖼𝗈𝗆𝗂𝗇𝗀 𝗆𝖾𝗌𝗌𝖺𝗀𝖾𝗌 𝖺𝗌 𝗌𝖾𝖾𝗇"
        },
        category: "𝖺𝖽𝗆𝗂𝗇",
        guide: {
            en: "『 {pn} 𝗈𝗇/𝗈𝖿𝖿 』"
        }
    },

    onChat: async ({ api, event }) => {
        if (!fs.existsSync(pathFile)) fs.writeFileSync(pathFile, 'false');
        const isEnable = fs.readFileSync(pathFile, 'utf-8');
        
        if (isEnable === 'true') {
            api.markAsReadAll(() => {});
        }
    },

    onStart: async ({ api, event, args }) => {
        try {
            if (!fs.existsSync(path.dirname(pathFile))) {
                fs.mkdirSync(path.dirname(pathFile), { recursive: true });
            }

            if (args[0] === 'on') {
                fs.writeFileSync(pathFile, 'true');
                return api.sendMessage(`┏━━━〔 𝗔𝗨𝗧𝗢𝗦𝗘𝗘𝗡 〕━━━┓\n┣ 𝘀𝘁𝗮𝘁𝘂𝘀 : 𝗮𝗰𝘁𝗶𝘃𝗮𝘁𝗲𝗱\n┣ 𝗺𝗲𝘀𝘀𝗮𝗴𝗲𝘀 𝘄𝗶𝗹𝗹 𝗯𝗲 𝘀𝗲𝗲𝗻 𝗮𝘂𝘁𝗼\n┗━━━━━━━━━━━━━━━┛`, event.threadID, event.messageID);
            } 
            
            else if (args[0] === 'off') {
                fs.writeFileSync(pathFile, 'false');
                return api.sendMessage(`┏━━━〔 𝗔𝗨𝗧𝗢𝗦𝗘𝗘𝗡 〕━━━┓\n┣ 𝘀𝘁𝗮𝘁𝘂𝘀 : 𝗱𝗲𝗮𝗰𝘁𝗶𝘃𝗮𝘁𝗲𝗱\n┣ 𝗮𝘂𝘁𝗼-𝗿𝗲𝗮𝗱 𝗵𝗮𝘀 𝗯𝗲𝗲𝗻 𝗵𝗮𝗹𝘁𝗲𝗱\n┗━━━━━━━━━━━━━━━┛`, event.threadID, event.messageID);
            } 
            
            else {
                return api.sendMessage(`┏━━━〔 𝗦𝗬𝗦𝗧𝗘𝗠 〕━━━┓\n┣ 𝗶𝗻𝘃𝗮𝗹𝗶𝗱 𝗽𝗮𝗿𝗮𝗺𝗲𝘁𝗲𝗿\n┣ 𝘂𝘀𝗲 : {pn} 𝗼𝗻 𝗼𝗿 𝗼𝗳𝗳\n┗━━━━━━━━━━━━━━━┛`, event.threadID, event.messageID);
            }
        } catch (e) {
            console.log(e);
            api.sendMessage(`┏━━━〔 𝗘𝗥𝗥𝗢𝗥 〕━━━┓\n┣ 𝘀𝘆𝘀𝘁𝗲𝗺 𝗳𝗮𝗶𝗹𝘂𝗿𝗲\n┗━━━━━━━━━━━━━━━┛`, event.threadID);
        }
    }
};
