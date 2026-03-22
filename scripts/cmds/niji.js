const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
 config: {
 name: "niji",
 aliases: ["anime"],
 version: "1.4",
 author: "xnil6x",
 shortDescription: "Generate premium anime art",
 longDescription: "▄︻デ══━✦ Creates 4 stunning anime images using Niji-v5 ✦━══デ︻▄",
 category: "AI",
 role: 2,
 guide: {
 en: "{p}niji <your creative prompt>"
 }
 },

 onStart: async function ({ api, event, args, message }) {
 try {
 const prompt = args.join(" ");
 if (!prompt) {
 return message.reply(`
┏━━━〔  〕━━━┓
 Please provide a prompt!
 Example: {p}niji 
 cyberpunk anime couple
┗━━━━━━━━━━━━━━━┛
 `);
 }

 await message.reply(`
Generating your anime art...
 `); 

 const response = await axios.get(`https://renzweb.onrender.com/api/niji-v5?prompt=${encodeURIComponent(prompt)}`); 
 const imageUrls = response.data?.results; 

 if (!Array.isArray(imageUrls) || imageUrls.length !== 4) { 
 return message.reply(`
┏━━━〔  〕━━━┓
 ✘ Generation Failed!
 API returned invalid data
┗━━━━━━━━━━━━━━━┛
 `); 
 } 

 const imgPaths = []; 
 for (let i = 0; i < imageUrls.length; i++) { 
 const imgPath = path.join(__dirname, `niji_${Date.now()}_${i}.jpg`); 
 const res = await axios.get(imageUrls[i], { responseType: "arraybuffer" }); 
 fs.writeFileSync(imgPath, Buffer.from(res.data, "binary")); 
 imgPaths.push(imgPath); 
 } 

 const msg = await message.reply({ 
 body: `✦⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅✦
 
 🎴 NIJI-V5 ART RESULTS 🎴
 
 Prompt: "${prompt}"
 
 ━━━━━━━━━━━━━━━━━━━
 [ U1 ] [ U2 ] [ U3 ] [ U4 ]
 ━━━━━━━━━━━━━━━━━━━
 
 Reply with U1-U4 to get
 the full resolution image
✦⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅✦`, 
 attachment: imgPaths.map(p => fs.createReadStream(p)) 
 }); 

 global.SizuBot.onReply.set(msg.messageID, { 
 commandName: "niji", 
 author: event.senderID, 
 imgPaths 
 }); 

 setTimeout(() => { 
 imgPaths.forEach(p => { 
 try { fs.unlinkSync(p); } catch {} 
 }); 
 }, 2 * 60 * 1000); 

 } catch (err) { 
 return message.reply(`
┏━━━〔  〕━━━┓
 ✘ An error occurred!
 ${err.message}
┗━━━━━━━━━━━━━━━┛
 `); 
 }
 },

 onReply: async function ({ api, event, Reply, message }) {
 const { author, imgPaths } = Reply;
 if (event.senderID !== author) return; 

 const choice = event.body.toUpperCase().trim(); 
 const map = { U1: 0, U2: 1, U3: 2, U4: 3 }; 

 if (!map.hasOwnProperty(choice)) return message.reply(`
┏━━━〔  〕━━━┓
 Invalid selection!
 Please reply with:
 U1, U2, U3 or U4
┗━━━━━━━━━━━━━━━┛
 `); 

 const selectedImg = fs.createReadStream(imgPaths[map[choice]]); 
 return message.reply({ 
 body: `✦⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅✦
 
 🏆 YOUR SELECTED ART (${choice})
 
 Enjoy your high quality image!
✦⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅✦`, 
 attachment: selectedImg 
 });
 }
};