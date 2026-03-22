const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage, registerFont } = require("canvas");

module.exports = {
  config: {
    name: "uid",
    version: "4.0.0",
    author: "乛 Xꫀᥒos ♡",
    countDown: 6,
    role: 0,
    shortDescription: { en: "Cute Cyberpunk UID Card" },
    longDescription: { en: "Generates a futuristic yet adorable identity profile with neon + pastel kawaii vibes." },
    category: "info",
    guide: { en: "{pn} [@mention | reply | uid | blank = yourself]" }
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, senderID, messageReply, mentions } = event;

    let targetID =
      messageReply?.senderID ||
      (Object.keys(mentions || {}).length > 0 ? Object.keys(mentions)[0] : 
      (args[0] && /^\d+$/.test(args[0]) ? args[0] : senderID));

    const loadingMsg = await api.sendMessage({
      body: "✧･ﾟ: *✧･ﾟ:*  Scanning...  *:･ﾟ✧*:･ﾟ✧\n(｡>﹏<｡) Please wait cutie~ ♡"
    }, threadID);

    try {
      const user = await usersData.get(targetID);
      const displayName = (user?.name || "UNKNOWN_CUTE").toUpperCase();

      // ─── Canvas Setup ───
      const W = 1280;
      const H = 640;
      const canvas = createCanvas(W, H);
      const ctx = canvas.getContext("2d");

      // 1. Background: deep cyber + subtle pastel gradient overlay
      const bgGrad = ctx.createLinearGradient(0, 0, W, H);
      bgGrad.addColorStop(0, "#0d001a");
      bgGrad.addColorStop(0.4, "#120028");
      bgGrad.addColorStop(1, "#1a0033");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Soft cyber grid (cute opacity)
      ctx.strokeStyle = "rgba(180, 100, 255, 0.08)";
      ctx.lineWidth = 1.2;
      for (let x = 0; x < W; x += 60) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 60) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // 2. Cute glowing particles / stars
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * W;
        const y = Math.random() * H;
        const size = Math.random() * 3 + 1;
        ctx.fillStyle = `hsla(${Math.random()*60 + 270}, 90%, 85%, ${Math.random()*0.5 + 0.3})`;
        ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI*2); ctx.fill();
      }

      // 3. Avatar with double cute glow (pink + cyan mix)
      let avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=720&height=720`;
      let avatarImg;
      try {
        const { data } = await axios.get(avatarUrl, { responseType: "arraybuffer" });
        avatarImg = await loadImage(data);
      } catch {
        avatarImg = await loadImage("https://i.imgur.com/4M34hi2.png"); // fallback cute placeholder
      }

      const ax = 220, ay = 320, ar = 180;
      // Outer glow (cute pastel pink-cyan)
      ctx.shadowBlur = 60;
      ctx.shadowColor = "rgba(255, 105, 180, 0.7)";
      ctx.beginPath(); ctx.arc(ax, ay, ar + 30, 0, Math.PI*2); ctx.fillStyle = "rgba(0, 255, 255, 0.15)"; ctx.fill();

      // Inner neon ring
      ctx.shadowBlur = 35;
      ctx.shadowColor = "#ff69b4";
      ctx.strokeStyle = "#00ffff";
      ctx.lineWidth = 6;
      ctx.setLineDash([8, 12]);
      ctx.beginPath(); ctx.arc(ax, ay, ar + 12, 0, Math.PI*2); ctx.stroke(); ctx.setLineDash([]);

      // Clip & draw avatar (rounded cute style)
      ctx.save();
      ctx.beginPath(); ctx.arc(ax, ay, ar, 0, Math.PI*2); ctx.clip();
      ctx.drawImage(avatarImg, ax - ar, ay - ar, ar*2, ar*2);
      ctx.restore();

      // Tiny heart overlay on avatar (kawaii touch)
      ctx.fillStyle = "rgba(255, 182, 193, 0.5)";
      ctx.font = "bold 60px Arial";
      ctx.fillText("♡", ax - 28, ay + 22);

      // 4. Main text block ── right side HUD
      // Title tag
      ctx.fillStyle = "#ff69b4";
      ctx.font = "bold 32px Courier New";
      ctx.fillText("✦ USER NEURAL PROFILE ✦", 520, 110);

      // Glitch-style name (cute shadow + main)
      ctx.font = "bold 110px Arial";
      ctx.fillStyle = "rgba(0, 255, 255, 0.25)";
      ctx.fillText(displayName, 523, 223);
      ctx.shadowBlur = 15; ctx.shadowColor = "#ff69b4";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(displayName, 520, 220);
      ctx.shadowBlur = 0;

      // UID panel (cute rounded rect)
      ctx.fillStyle = "rgba(30, 20, 50, 0.65)";
      ctx.fillRect(500, 260, 680, 100);
      ctx.strokeStyle = "#ff69b4";
      ctx.lineWidth = 3;
      ctx.strokeRect(500, 260, 680, 100);

      ctx.fillStyle = "#00ffff";
      ctx.font = "bold 42px Courier New";
      ctx.fillText(`UID: ${targetID}`, 540, 330);

      // Cute status lines
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = "24px Courier New";
      ctx.fillText("✿ STATUS: SPARKLING ONLINE ♡", 540, 380);
      ctx.fillText("✿ MOOD: とてもかわいい (very cute)", 540, 415);
      ctx.fillText("✿ ACCESS: GRANTED WITH LOVE", 540, 450);

      // Small footer heart line
      ctx.fillStyle = "#ff69b4";
      ctx.font = "italic 22px Arial";
      ctx.fillText("Stay cute in the neon night~ ૮₍ ˶ᵔ ᵕ ᵔ˶ ₎ა", 520, 580);

      // Final save
      const cacheFile = path.join(__dirname, "cache", `cute_cyber_uid_${Date.now()}.png`);
      fs.ensureDirSync(path.dirname(cacheFile));
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(cacheFile, buffer);

      api.unsendMessage(loadingMsg.messageID);

      await api.sendMessage({
        body: `✧･ﾟ: *✧･ﾟ:*  IDENTITY CONFIRMED ♡ *:･ﾟ✧*:･ﾟ✧\n\n` +
              `Name → ${displayName}\n` +
              `UID  → ${targetID}\n\n` +
              `Have a sparkly day cutie~ 💖`,
        attachment: fs.createReadStream(cacheFile)
      }, threadID, () => fs.unlinkSync(cacheFile), messageID);

    } catch (err) {
      api.unsendMessage(loadingMsg?.messageID);
      api.sendMessage(`(｡•́︿•̀｡) Oopsie~ ${err.message || "neural link failed..."}`, threadID, messageID);
    }
  }
};
