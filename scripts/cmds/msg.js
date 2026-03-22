module.exports = {
    config: {
        name: "msg",
        version: "1.1",
        author: "SiFu",
        countDown: 5,
        role: 2,
        description: {
            vi: "Thay đổi số lượng tin nhắn của người dùng.",
            en: "Change a user's message count with stylish output."
        },
        category: "admin",
        guide: {
            en: "   {pn} [count]: Change your own count."
              + "\n   {pn} @tag [count]: Change for tagged user."
              + "\n   {pn} [reply] [count]: Change for replied user."
              + "\n   {pn} [UID] [count]: Change by UID."
        }
    },

    onStart: async function ({ args, threadsData, message, event }) {
        const { threadID, senderID, mentions, type, messageReply } = event;
        const { resolve } = require("path");
        const { readJsonSync, writeJsonSync, ensureFileSync } = require("fs-extra");

        // Stylish Font Map
        const fonts = {
            "a": "𝖺", "b": "𝖻", "c": "𝖼", "d": "𝖽", "e": "𝖾", "f": "𝖿", "g": "𝗀", "h": "𝗁", "i": "𝗂", "j": "𝗃", "k": "𝗄", "l": "𝗅", "m": "𝗆", 
            "n": "𝗇", "o": "𝗈", "p": "𝗉", "q": "𝗊", "r": "𝗋", "s": "𝗌", "t": "𝗍", "u": "𝗎", "v": "𝗏", "w": "𝗐", "x": "𝗑", "y": "𝗒", "z": "𝗓",
            "A": "𝖠", "B": "𝖡", "C": "𝖢", "D": "𝖣", "E": "𝖤", "F": "𝖥", "G": "𝖦", "H": "𝖧", "I": "𝖨", "J": "𝖩", "K": "𝖪", "L": "𝖫", "M": "𝖬", 
            "N": "𝖭", "O": "𝖮", "P": "𝖯", "Q": "𝖰", "R": "𝖱", "S": "𝖲", "T": "𝖳", "U": "𝖴", "V": "𝖵", "W": "𝖶", "X": "𝖷", "Y": "𝖸", "Z": "𝖹",
            "0": "０", "1": "１", "2": "２", "3": "３", "4": "４", "5": "５", "6": "６", "7": "７", "8": "８", "9": "９"
        };

        const stylize = (text) => text.split('').map(char => fonts[char] || char).join('');

        let targetID, newCount;

      
        if (type === "message_reply") {
            targetID = messageReply.senderID;
            newCount = parseInt(args[0]);
        } else if (Object.keys(mentions).length > 0) {
            targetID = Object.keys(mentions)[0];
            newCount = parseInt(args[args.length - 1]);
        } else if (args.length >= 2 && !isNaN(args[0])) {
            targetID = args[0];
            newCount = parseInt(args[1]);
        } else {
            targetID = senderID;
            newCount = parseInt(args[0]);
        }

        if (isNaN(newCount)) {
            return message.reply(stylize("Please provide a valid number. Example: /msg 666"));
        }

        try {
            
            const threadData = await threadsData.get(threadID);
            if (threadData && threadData.members) {
                const memberIndex = threadData.members.findIndex(m => m.userID == targetID);
                if (memberIndex !== -1) {
                    threadData.members[memberIndex].count = newCount;
                    await threadsData.set(threadID, threadData.members, "members");
                }
            }

            const dataPath = resolve(__dirname, "cache", "count_activity.json");
            ensureFileSync(dataPath);
            let activityData = {};
            try {
                activityData = readJsonSync(dataPath);
            } catch (e) {}

            if (!activityData[threadID]) activityData[threadID] = {};
            if (!activityData[threadID][targetID]) {
                activityData[threadID][targetID] = {
                    total: 0,
                    types: { text: 0, sticker: 0, media: 0 },
                    daily: {}
                };
            }

            activityData[threadID][targetID].total = newCount;
            activityData[threadID][targetID].types.text = newCount;
            activityData[threadID][targetID].types.sticker = 0;
            activityData[threadID][targetID].types.media = 0;
            
            writeJsonSync(dataPath, activityData, { spaces: 2 });

            const successMsg = stylize(`Successfully updated user ID ${targetID} total messages to ${newCount}`);
            return message.reply(`✨ ${successMsg} ✨`);

        } catch (error) {
            console.error(error);
            return message.reply(stylize("An error occurred while updating the data."));
        }
    }
};
