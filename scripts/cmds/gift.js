const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "gift",
        version: "5.5.0",
        author: "SiFu",
        countDown: 10,
        role: 0,
        category: "economy",
        guide: {
            en: "{pn} [amount] (reply) | {pn} @tag [amount]"
        }
    },

    onStart: async function ({ args, usersData, message, event }) {
        const { senderID, mentions, type, messageReply } = event;

        // Smart Number Formatter for Massive Values
        const formatSmart = (num) => {
            if (num >= 1e15) return (num / 1e15).toFixed(2) + "Q";
            if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
            if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
            if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
            if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
            return Math.floor(num).toLocaleString();
        };

        const parseAmount = (input) => {
            if (!input) return NaN;
            let v = input.toLowerCase();
            let n = parseFloat(v);
            if (v.endsWith('k')) return n * 1e3;
            if (v.endsWith('m')) return n * 1e6;
            if (v.endsWith('b')) return n * 1e9;
            if (v.endsWith('t')) return n * 1e12;
            if (v.endsWith('q')) return n * 1e15;
            return n;
        };

        let targetID, rawAmount;
        if (type === "message_reply") {
            targetID = messageReply.senderID;
            rawAmount = args[0];
        } else if (Object.keys(mentions).length > 0) {
            targetID = Object.keys(mentions)[0];
            rawAmount = args[args.length - 1];
        } else if (args.length >= 2) {
            targetID = args[0];
            rawAmount = args[1];
        } else {
            return message.reply("⚡ [ SYSTEM ] : Target & Amount Required.");
        }

        const amount = Math.floor(parseAmount(rawAmount));
        if (isNaN(amount) || amount <= 0) return message.reply("🚫 [ VOID ] : Invalid Value.");
        if (targetID == senderID) return message.reply("⚠️ [ PROTOCOL ] : Self-gift Blocked.");

        try {
            const sBal = await usersData.get(senderID, "money");
            if (amount > sBal) return message.reply(`📉 [ REJECTED ] : Low Credits.`);

            const rName = await usersData.getName(targetID);
            const sName = await usersData.getName(senderID);
            const rBal = await usersData.get(targetID, "money") || 0;

            const nSBal = sBal - amount;
            const nRBal = rBal + amount;

            await usersData.set(senderID, nSBal, "money");
            await usersData.set(targetID, nRBal, "money");

            // --- UI CONSTRUCTION ---
            const canvas = createCanvas(1100, 600);
            const ctx = canvas.getContext("2d");

            // 1. Solid Dark Background (Green Block Fix)
            ctx.fillStyle = "#05070a";
            ctx.fillRect(0, 0, 1100, 600);

            // 2. Cyber Grid Pattern
            ctx.strokeStyle = "rgba(0, 255, 170, 0.1)";
            ctx.lineWidth = 1;
            for(let i=0; i<1100; i+=40) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 600); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1100, i); ctx.stroke();
            }

            // 3. Card Body with Proper Fill
            ctx.fillStyle = "#0a0f1e"; // Solid Deep Blue/Black
            ctx.roundRect(50, 50, 1000, 500, 40);
            ctx.fill();

            // 4. Neon Glowing Border
            ctx.shadowBlur = 25;
            ctx.shadowColor = "#00ffaa";
            ctx.strokeStyle = "#00ffaa";
            ctx.lineWidth = 4;
            ctx.stroke();
            ctx.shadowBlur = 0; // Reset Shadow to prevent bleeding

            // 5. Header Bar
            ctx.fillStyle = "rgba(0, 255, 170, 0.15)";
            ctx.fillRect(50, 50, 1000, 85);
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 42px sans-serif";
            ctx.fillText("CORE-LINK ASSET TRANSFER", 100, 108);

            // 6. Labels & Names
            const label = (txt, x, y) => {
                ctx.font = "18px 'Courier New'";
                ctx.fillStyle = "rgba(0, 255, 170, 0.6)";
                ctx.fillText(txt, x, y);
            };

            label("SENDER_NODE //", 100, 190);
            ctx.font = "bold 34px sans-serif"; ctx.fillStyle = "#fff";
            ctx.fillText(sName.toUpperCase(), 100, 235);

            label("RECEIVER_NODE //", 100, 300);
            ctx.font = "bold 34px sans-serif"; ctx.fillStyle = "#fff";
            ctx.fillText(rName.toUpperCase(), 100, 345);

            // 7. Amount Box
            ctx.fillStyle = "rgba(0, 255, 170, 0.1)";
            ctx.roundRect(100, 385, 500, 110, 20); ctx.fill();

            ctx.font = "bold 65px sans-serif"; ctx.fillStyle = "#00ffaa";
            ctx.fillText(`$${formatSmart(amount)}`, 130, 465);

            // 8. Ledger Info
            label("REALTIME_LEDGER", 750, 190);
            ctx.font = "22px 'Courier New'"; ctx.fillStyle = "#00ffaa";
            ctx.fillText(`- DISP: $${formatSmart(nSBal)}`, 750, 230);
            ctx.fillText(`- RECV: $${formatSmart(nRBal)}`, 750, 265);

            // 9. Dual Avatars
            const loadAv = async (id) => {
                try {
                    const res = `https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
                    return await loadImage(res);
                } catch { return await loadImage("https://i.imgur.com/Ha6DMwk.jpeg"); }
            };

            const [avS, avR] = await Promise.all([loadAv(senderID), loadAv(targetID)]);

            const drawAv = (img, x, y, clr) => {
                ctx.save();
                ctx.shadowBlur = 30; ctx.shadowColor = clr;
                ctx.beginPath(); ctx.arc(x, y, 90, 0, Math.PI*2); ctx.clip();
                ctx.drawImage(img, x-90, y-90, 180, 180);
                ctx.restore();
                ctx.strokeStyle = clr; ctx.lineWidth = 5;
                ctx.beginPath(); ctx.arc(x, y, 90, 0, Math.PI*2); ctx.stroke();
            };

            drawAv(avS, 780, 410, "#ff00ff"); // Sender (Magenta)
            drawAv(avR, 880, 440, "#00ffaa"); // Receiver (Neon Green)

            // 10. Metadata Footer
            ctx.font = "14px Arial"; ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.fillText(`HASH: ${Math.random().toString(16).toUpperCase().slice(2,14)}`, 100, 535);
            ctx.fillText("QUANTUM SECURE // END-TO-END", 780, 535);

            const cp = path.join(__dirname, "cache", `card_${Date.now()}.png`);
            if (!fs.existsSync(path.dirname(cp))) fs.mkdirSync(path.dirname(cp));

            fs.writeFileSync(cp, canvas.toBuffer());

            return message.reply({ attachment: fs.createReadStream(cp) }, () => fs.unlinkSync(cp));

        } catch (e) {
            console.error(e);
            return message.reply("⚡ [ SYSTEM CRASH ] : UI Generation Failed.");
        }
    }
};
