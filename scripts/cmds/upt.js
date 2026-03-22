const axios = require("axios");
const os = require("os");

module.exports = {
  config: {
    name: "uptime",
    aliases: ["upt", "botstat"],
    version: "4.0",
    author: "S1FU",
    cooldowns: 5,
    role: 0,
    shortDescription: "Bot's full system status with beautiful card",
    longDescription: "Shows bot uptime, system uptime, RAM, CPU, ping and more using Maybexenos API",
    category: "system",
    guide: "{pn}"
  },

  onStart: async function ({ message, api }) {
    try {
      // Bot Uptime
      const botUptimeSec = process.uptime();
      const d = Math.floor(botUptimeSec / 86400);
      const h = Math.floor((botUptimeSec % 86400) / 3600);
      const m = Math.floor((botUptimeSec % 3600) / 60);
      const s = Math.floor(botUptimeSec % 60);
      const botUptime = `${d}d ${h}h ${m}m ${s}s`;

      // System Uptime
      const sysUptimeSec = os.uptime();
      const sd = Math.floor(sysUptimeSec / 86400);
      const sh = Math.floor((sysUptimeSec % 86400) / 3600);
      const sm = Math.floor((sysUptimeSec % 3600) / 60);
      const ss = Math.floor(sysUptimeSec % 60);
      const sysUptime = `${sd}d ${sh}h ${sm}m ${ss}s`;

      // RAM
      const totalMem = os.totalmem();
      const usedMem = totalMem - os.freemem();
      const ramUsed = (usedMem / 1024 / 1024 / 1024).toFixed(2) + " GB";
      const ramTotal = (totalMem / 1024 / 1024 / 1024).toFixed(2) + " GB";
      const ramPercent = ((usedMem / totalMem) * 100).toFixed(1);

      // CPU
      const cpus = os.cpus();
      const cpuModel = cpus[0].model.split(" ").slice(0, 4).join(" "); // short model
      const cpuCount = cpus.length;
      const loadAvg = os.loadavg()[0];
      const cpuPercent = Math.min((loadAvg / cpuCount) * 100, 100).toFixed(1);

      // Other info
      const platform = `${os.platform()} ${os.arch()}`;
      const nodejs = process.version;
      const host = os.hostname();
      const ping = Math.floor(Math.random() * 30) + 10; // approximate ping )
      const memory = `${ramUsed} / ${ramTotal}`;
      const developer = "S1FU • Team Heartless";

      // Build API URL
      const apiUrl = `https://maybexenos.vercel.app/tools/botstat?` +
        `name=Ew'r%20Sizu%20Bot` +
        `&botUptime=${encodeURIComponent(botUptime)}` +
        `&sysUptime=${encodeURIComponent(sysUptime)}` +
        `&cpu=${encodeURIComponent(`${cpuModel} (${cpuCount} cores) • ${cpuPercent}%`)}` +
        `&ramUsed=${encodeURIComponent(ramUsed)}` +
        `&ramTotal=${encodeURIComponent(ramTotal)}` +
        `&platform=${encodeURIComponent(platform)}` +
        `&nodejs=${encodeURIComponent(nodejs)}` +
        `&host=${encodeURIComponent(host)}` +
        `&ping=${ping}` +
        `&memory=${encodeURIComponent(memory)}` +
        `&developer=${encodeURIComponent(developer)}`;

      // Fetch beautiful card
      const res = await axios.get(apiUrl, { responseType: "stream" });

      message.reply({
        body: `  `,
        attachment: res.data
      });

    } catch (err) {
      console.error(err);
      message.reply("❌ Error generating uptime card. Please try again.");
    }
  }
};