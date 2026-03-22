const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "notice",
        aliases: ["n"],
        version: "4.0",
        author: "乛 Xꫀᥒos ゎ",
        countDown: 5,
        role: 2, 
        shortDescription: "notification",
        longDescription: "অ্যাডমিন এই কমান্ডের মাধ্যমে সব গ্রুপে একসাথে টেক্সট, অডিও, ভিডিও বা ছবি পাঠাতে পারবে।",
        category: "owner",
        guide: "{pn} <বার্তা> (অথবা কোনো ছবি/ভিডিওতে রিপ্লাই দিয়ে)",
        envConfig: {
            delayPerGroup: 1000 
        }
    },

    onStart: async function ({ message, api, event, args, commandName, envCommands, threadsData }) {
        const { delayPerGroup } = envCommands[commandName];
        
        const msgBody = args.join(" ");
        const replyAttachments = event.messageReply ? event.messageReply.attachments : [];
        const currentAttachments = event.attachments.length > 0 ? event.attachments : [];
        const allAttachments = [...currentAttachments, ...replyAttachments];

        if (!msgBody && allAttachments.length === 0) {
            return message.reply("bkcda kichu lekh na hoy img vdo audio kichur reply de 🤦");
        }

        
        const timestamp = new Date().toLocaleString("en-US", { 
            timeZone: "Asia/Dhaka",
            hour: '2-digit', minute: '2-digit', hour12: true,
            day: 'numeric', month: 'short', year: 'numeric'
        });

        const stylishText = `ᯓᡣ𐭩 ᴀᴅᴍɪɴ ɴᴏᴛɪғɪᴄᴀᴛɪᴏɴ ᝰ.ᐟ\n────୨ৎ────────୨ৎ────\n\n` +
                            `✎ᝰ.\n ${msgBody || "Media Attachment Only"}\n\n` +
                            `────୨ৎ────────୨ৎ────\n` +
                             `ദ്ദി◝ ⩊ ◜.ᐟᴀᴅᴍɪɴ :  —͟͟͞͞ sɪғᴜ ᯓᡣ𐭩`;

       
        const cachePaths = [];
        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

        if (allAttachments.length > 0) {
            message.reply("aktu dara dawnlode Kore nei.!¡");
            
            for (let i = 0; i < allAttachments.length; i++) {
                const item = allAttachments[i];
                
                let ext = "jpg";
                if (item.type === "video") ext = "mp4";
                if (item.type === "audio") ext = "mp3";
                if (item.type === "animated_image") ext = "gif";

                const filePath = path.join(cacheDir, `notice_${Date.now()}_${i}.${ext}`);
                const url = item.url || item.uri; 

                try {
                    const response = await axios.get(url, { responseType: 'arraybuffer' });
                    fs.writeFileSync(filePath, Buffer.from(response.data, 'binary'));
                    cachePaths.push(filePath);
                } catch (e) {
                    console.error("Download Failed:", e);
                }
            }
        }

        
        try {
            let groupThreads = [];
            
            const allThreadsData = await threadsData.getAll();
            groupThreads = allThreadsData.filter(t => t.isGroup && t.threadID !== event.threadID);

            if (groupThreads.length === 0) {
                const inboxThreads = await api.getThreadList(100, null, ["INBOX"]);
                groupThreads = inboxThreads.filter(t => t.isGroup && t.threadID !== event.threadID);
            }

            if (groupThreads.length === 0) {
                return message.reply("Kono gc khuje pacchi na 🥺");
            }

            message.reply(`┏━━━〔 ═━┈┈┈┈━═ 〕━━━┓\n    🚀🎯 : ${groupThreads.length} \n     📎 ✨: ${cachePaths.length}\n ┗━━━━━━━━━━━━━━━┛`);

            let successCount = 0;
            let failedCount = 0;

            for (const thread of groupThreads) {
                try {
                    const msgOptions = {
                        body: stylishText,
                        attachment: cachePaths.length > 0 ? cachePaths.map(p => fs.createReadStream(p)) : []
                    };

                    await api.sendMessage(msgOptions, thread.threadID);
                    successCount++;
                } catch (err) {
                    failedCount++;
                    // console.log(`Failed for ${thread.threadID}: ${err.message}`);
                }
                
                await new Promise(resolve => setTimeout(resolve, delayPerGroup));
            }

            
            cachePaths.forEach(p => {
                try { fs.unlinkSync(p); } catch (e) {}
            });

            const report = `┏━━━〔 ═━┈┈┈┈━═ 〕━━━┓\n    𝐒𝐞𝐧𝐭 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲!\n  ━━━━━━━━━━━━━\n        𝐒𝐮𝐜𝐜𝐞𝐬𝐬 : ${successCount}\n┗━━━━━━━━━━━━━━━┛`;
            return message.reply(report);

        } catch (error) {
            return message.reply(`system err : ${error.message}`);
        }
    }
};
