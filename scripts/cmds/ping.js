const { createCanvas } = require('canvas');
const fs = require('fs-extra');
const axios = require('axios');
const path = require('path');
const moment = require('moment-timezone');

module.exports = {
  config: {
    name: "ping",
    aliases: ["pong", "latency", "speedtest", "ms"],
    version: "6.1",
    author: "乛 Xꫀᥒos ゎ",
    category: "system",
    countDown: 7,
    role: 0,
    shortDescription: { en: "✦ Neo Cyber Latency Dashboard" }
  },

  onStart: async function ({ message }) {
    const start = Date.now();
    try {
      await axios.get('https://1.1.1.1', { timeout: 5000 });
      await axios.get('https://cloudflare.com', { timeout: 3000 });
    } catch {}

    const latency = Date.now() - start;

    // ─── Canvas setup (same beautiful design as before) ───────
    const W = 920;
    const H = 620;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');

    // Background - deep space + radial pulse
    const grad = ctx.createRadialGradient(W/2, H/2, 80, W/2, H/2, 620);
    grad.addColorStop(0,   '#0b001a');
    grad.addColorStop(0.35,'#140033');
    grad.addColorStop(0.7, '#001a33');
    grad.addColorStop(1,   '#000d1f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Subtle orbiting grid
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.07)';
    ctx.lineWidth = 1.2;
    for (let i = -W; i < W*2; i += 80) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + H*1.4, H);
      ctx.stroke();
    }

    // Central glass panel
    ctx.save();
    ctx.shadowColor = 'rgba(0, 255, 255, 0.22)';
    ctx.shadowBlur = 60;
    ctx.fillStyle = 'rgba(20, 40, 90, 0.18)';
    ctx.strokeStyle = 'rgba(0, 220, 255, 0.25)';
    ctx.lineWidth = 2;
    roundRect(ctx, 70, 70, W-140, H-140, 44);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // ─── Gauge ┣━━━━━━━━━━━━━━━┫┣━━━━━━━━━━━━━━━┫──────────
    const cx = W / 2;
    const cy = 310;
    const baseRadius = 210;

    // Outer halo
    ctx.shadowColor = latency < 140 ? '#00faff' : latency < 320 ? '#ffeb3b' : '#ff4d6d';
    ctx.shadowBlur = 90;
    ctx.lineWidth = 38;
    ctx.strokeStyle = ctx.shadowColor + '44';
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius + 20, Math.PI * 0.7, Math.PI * 2.3);
    ctx.stroke();

    // Main gradient progress ring
    const gradient = ctx.createLinearGradient(cx - 200, cy, cx + 200, cy);
    gradient.addColorStop(0, latency < 140 ? '#00f0ff' : '#ffca28');
    gradient.addColorStop(0.5, latency < 140 ? '#40ffe5' : '#ff9800');
    gradient.addColorStop(1, latency < 140 ? '#00b8ff' : '#f44336');

    ctx.shadowBlur = 45;
    ctx.lineWidth = 24;
    ctx.strokeStyle = gradient;
    ctx.lineCap = 'round';
    const startAng = Math.PI * 0.73;
    const fullRange = Math.PI * 1.54;
    const progress = Math.min(latency / 1200, 1);
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius, startAng, startAng + fullRange * progress, false);
    ctx.stroke();

    // Inner glow ring
    ctx.shadowBlur = 35;
    ctx.lineWidth = 12;
    ctx.strokeStyle = latency < 140 ? '#e0ffff' : latency < 320 ? '#fff176' : '#ff8a80';
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius - 10, startAng, startAng + fullRange * progress);
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Particles
    const particleCount = 48;
    for (let i = 0; i < particleCount; i++) {
      const t = i / (particleCount - 1);
      if (t > progress + 0.08) continue;

      const angle = startAng + fullRange * t;
      const pulse = Math.sin(Date.now() * 0.004 + i * 0.8) * 0.5 + 0.5;

      ctx.fillStyle = t < progress
        ? (latency < 140 ? `rgba(0,255,255,${0.7 + pulse*0.3})` : `rgba(255,235,59,${0.7 + pulse*0.3})`)
        : 'rgba(120,180,220,0.15)';

      const px = cx + (baseRadius - 8) * Math.cos(angle);
      const py = cy + (baseRadius - 8) * Math.sin(angle);

      ctx.beginPath();
      ctx.arc(px, py, 4 + pulse*2, 0, Math.PI*2);
      ctx.fill();
    }

    // ─── Text Elements (on image only) ┣━━━━━━━━━━━━━━━┫─────
    // Big latency number
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 40;
    ctx.fillStyle = '#f8fdff';
    ctx.textAlign = 'center';
    ctx.font = '900 138px "Segoe UI", sans-serif';
    ctx.fillText(latency, cx, cy + 52);

    // ms
    ctx.font = 'bold 54px Arial';
    ctx.fillStyle = latency < 140 ? '#00faff' : latency < 320 ? '#ffeb3b' : '#ff4d6d';
    ctx.fillText('ms', cx + 148, cy + 52);

    // Title
    ctx.shadowBlur = 25;
    ctx.fillStyle = '#a5f2ff';
    ctx.font = 'bold 38px "Courier New", monospace';
    ctx.fillText('PING INFO', cx, cy - 140);

    // Status badge
    let statusText, statusColor, symbol;
    if      (latency < 100) { statusText = "QUANTUM"; symbol = "𓂀"; statusColor = "#00ffcc"; }
    else if (latency < 180) { statusText = "HYPER";   symbol = "✦";   statusColor = "#40ffaa"; }
    else if (latency < 280) { statusText = "NOMINAL"; symbol = "⚡";   statusColor = "#ffea00"; }
    else if (latency < 450) { statusText = "UNSTABLE";symbol = "⚠";   statusColor = "#ffaa00"; }
    else                    { statusText = "CRITICAL";symbol = "☠";   statusColor = "#ff3366"; }

    const sw = 320, sh = 68;
    ctx.fillStyle = statusColor + '22';
    ctx.shadowColor = statusColor;
    ctx.shadowBlur = 40;
    roundRect(ctx, cx - sw/2, cy + 120, sw, sh, 22);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = statusColor;
    ctx.font = 'bold 32px Arial';
    ctx.fillText(`${symbol} ${statusText}`, cx, cy + 162);

    // Footer
    ctx.fillStyle = 'rgba(180,240,255,0.7)';
    ctx.font = 'italic 17px Arial';
    const timeStr = moment().tz("Asia/Dhaka").format("DD MMM YYYY  •  HH:mm:ss");
    ctx.fillText(`乛 Xenos ゎ  •  ${timeStr}  •  v6.1`, cx, H - 28);

    // ─── Save & Send Image Only ┣━━━━━━━━━━━━━━━┫────────────
    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);
    const file = path.join(cacheDir, `neo-ping-${Date.now()}.png`);

    const buffer = canvas.toBuffer('image/png', { compressionLevel: 6 });
    await fs.writeFile(file, buffer);

    // Only image — no text in body
    await message.reply({
      attachment: fs.createReadStream(file)
    }).catch(console.error);

    // Clean up after ~15 seconds
    setTimeout(() => fs.unlink(file).catch(() => {}), 15000);
  }
};

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y,     x + w, y + r, r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.arcTo(x,     y + h, x,     y + h - r, r);
  ctx.arcTo(x,     y,     x + r, y,         r);
  ctx.closePath();
  }
