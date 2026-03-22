const jimp = require("jimp");
const fs = require("fs");

module.exports = {
    config: {
        name: "love",
        aliases: [],
        version: "2.5",
        author: "SiFu", // inspired by Badol 🐤🐳
        countDown: 5,
        role: 0,
        shortDescription: "Create a love DP",
        longDescription: "Mention someone or reply to their message to create a love DP.",
        category: "photo",
        guide: "{pn} @mention or reply"
    },

    onStart: async function ({ message, event, args, api }) {
        let one = event.senderID;
        let two;

        
        if (event.type == "message_reply") {
            
            two = event.messageReply.senderID;
        } else if (Object.keys(event.mentions).length > 0) {
            
            two = Object.keys(event.mentions)[0];
        } else {

            return message.reply(toStyle("𝐏𝐥𝐞𝐚𝐬𝐞 𝐦𝐞𝐧𝐭𝐢𝐨𝐧 𝐬𝐨𝐦𝐞𝐨𝐧𝐞 𝐨𝐫 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚 𝐦𝐞𝐬𝐬𝐚𝐠𝐞! 💚"));
        }

        const waitMsg = await message.reply(toStyle("𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠 𝐲𝐨𝐮𝐫 𝐬𝐭𝐲𝐥𝐢𝐬𝐡 𝐥𝐨𝐯𝐞 𝐃𝐏... 𝐏𝐥𝐞𝐚𝐬𝐞 𝐰𝐚𝐢𝐭."));

        try {
            const imagePath = await bal(one, two);
            const caption = toStyle("𝐖𝐡𝐞𝐧 𝐄𝐠𝐨 𝐚𝐧𝐝 𝐋𝐨𝐯𝐞 𝐜𝐥𝐚𝐬𝐡, 𝐋𝐨𝐯𝐞 𝐚𝐥𝐰𝐚𝐲𝐬 𝐥𝐨𝐬𝐞𝐬. 💔🥀");

            await message.reply({
                body: caption,
                attachment: fs.createReadStream(imagePath)
            });

            api.unsendMessage(waitMsg.messageID);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

        } catch (err) {
            console.error(err);
            message.reply("🥹 Error bby");
        }
    }
};

function toStyle(text) {
    const fonts = {
        a: "𝐚", b: "𝐛", c: "𝐜", d: "𝐝", e: "𝐞", f: "𝐟", g: "𝐠", h: "𝐡", i: "𝐢",
        j: "𝐣", k: "𝐤", l: "𝐥", m: "𝐦", n: "𝐧", o: "𝐨", p: "𝐩", q: "𝐪", r: "𝐫",
        s: "𝐬", t: "𝐭", u: "𝐮", v: "𝐯", w: "𝐰", x: "𝐱", y: "𝐲", z: "𝐳",
        A: "𝐀", B: "𝐁", C: "𝐂", D: "𝐃", E: "𝐄", F: "𝐅", G: "𝐆", H: "𝐇", I: "𝐈",
        J: "𝐉", K: "𝐊", L: "𝐋", M: "𝐌", N: "𝐍", O: "𝐎", P: "𝐏", Q: "𝐐", R: "𝐑",
        S: "𝐒", T: "𝐓", U: "𝐔", V: "𝐕", W: "𝐖", X: "𝐗", Y: "𝐘", Z: "𝐙"
    };
    return text.split("").map(char => fonts[char] || char).join("");
}

async function bal(one, two) {
    const avatarToken = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";
    const pth = __dirname + `/cache/love_${one}_${two}.png`;

    const [img, av1, av2] = await Promise.all([
        jimp.read("https://i.imgur.com/LjpG3CW.jpeg"),
        jimp.read(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=${avatarToken}`),
        jimp.read(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=${avatarToken}`)
    ]);

    av1.circle();
    av2.circle();

    img.resize(1440, 1080)
       .composite(av1.resize(470, 470), 125, 210)
       .composite(av2.resize(470, 470), 800, 200);

    await img.writeAsync(pth);
    return pth;
}
