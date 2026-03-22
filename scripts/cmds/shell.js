const { exec } = require("child_process");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "shell",
        aliases: ["sh"],
        version: "6.6.6", 
        author: "乛 Xꫀᥒos ゎ", 
        countDown: 0,
        role: 2, 
        description: {
            vi: "Thực thi hệ thống mức tối cao",
            en: "Supreme level system execution"
        },
        category: "owner",
        guide: {
            vi: "{pn} <command>",
            en: "{pn} <command>"
        }
    },

    langs: {
        en: {
            missing: "『 ⚠ 』 𝔓𝔩𝔢𝔞𝔰𝔢 𝔭𝔯𝔬𝔳𝔦𝔡𝔢 𝔦𝔫𝔭𝔲𝔱 𝔭𝔞𝔯𝔞𝔪𝔢𝔱𝔢𝔯𝔰...",
            executing: "『 ⚡ 』 𝗘𝗫𝗘𝗖𝗨𝗧𝗜𝗡𝗚 𝗢𝗡 𝗠𝗔𝗜𝗡𝗙𝗥𝗔𝗠𝗘...",
            longOutput: "『 📂 』 𝔒𝔲𝔱𝔭𝔲𝔱 𝔢𝔵𝔠𝔢𝔢𝔡𝔢𝔡 𝔟𝔲𝔣𝔣𝔢𝔯. 𝔇𝔲𝔪𝔭𝔦𝔫𝔤 𝔱𝔬 𝔩𝔬𝔤 𝔣𝔦𝔩𝔢."
        }
    },

    onStart: async function ({ api, event, args, message, getLang }) {
        const cmd = args.join(" ");
        if (!cmd) return message.reply(getLang("missing"));

        const start = Date.now();
        const msgInfo = await message.reply(getLang("executing"));

        exec(cmd, { 
            timeout: 60000, // Extended to 60s
            maxBuffer: 1024 * 1024 * 100 // 100MB Buffer
        }, async (error, stdout, stderr) => {
            const time = ((Date.now() - start) / 1000).toFixed(3);
            let out = error ? error.message : (stderr || stdout || "ℭ𝔬𝔪𝔪𝔞𝔫𝔔 𝔢𝔵𝔢𝔠𝔲𝔱𝔢𝔡 𝔴𝔦𝔱𝔥 𝔫𝔬 𝔯𝔢𝔱𝔲𝔯𝔫.");
            const status = error ? "✖ 𝔉𝔞𝔦𝔩𝔲𝔯𝔢" : "✔ 𝔖𝔲𝔠𝔠𝔢𝔰𝔰";

            // Cleanup previous message
            if (msgInfo?.messageID) api.unsendMessage(msgInfo.messageID);

            if (out.length > 3800) {
                const p = path.join(__dirname, `log_${Date.now()}.txt`);
                fs.writeFileSync(p, out);
                return message.reply({
                    body: `『 𝗗𝗨𝗠𝗣 𝗖𝗢𝗠𝗣𝗟𝗘𝗧𝗘 』\n\n𝐒𝐭𝐚𝐭𝐮𝐬: ${status}\n𝐓𝐢𝐦𝐞: ${time}𝗌\n━━━━━━━━━━━━━━━━━━`,
                    attachment: fs.createReadStream(p)
                }, () => fs.unlinkSync(p));
            }

            // Rare Symbols & Unique Font UI
            const ui = 
                `⧼ 𝕾𝖄𝕾𝕿𝕰𝕸 𝕺𝖀𝕿𝕻𝕿 ⧽\n` +
                `︩︪︩︪︩︪︩︪︩︪︩︪︩︪︩︪︩︪︩︪︩︪︩︪︩︪︩︪︩︪︩︪\n` +
                `📡 𝐈𝐧𝐩𝐮𝐭: ${cmd}\n` +
                `⏱ 𝐑𝐮𝐧𝐭𝐢𝐦𝐞: ${time}𝗌\n` +
                `💎 𝐒𝐭𝐚𝐭𝐮𝐬: ${status}\n` +
                `━━━━━━━━━━━━━━━━━━\n` +
                `📜 𝗥𝗲𝘀𝘂𝗹𝘁:\n\n` +
                ` ${out}\n` +
                `━━━━━━━━━━━━━━━━━━\n` +
                `⧼ 𝕰𝕹𝕯 𝕺𝕱 𝕿𝕽𝕬𝕹𝕾𝕸𝕴𝕾𝕾𝕴𝕺𝕹 ⧽`;

            return message.reply(ui);
        });
    }
};