const axios = require("axios");

module.exports = {
  config: {
    name: "infoip",
    version: "2.1",
    author: "Xenos",
    countDown: 5,
    role: 0,
    category: "system",
    description: "Get info of IP address with BD Time",
    guide: {
      en: "{pn} [ip address]"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID, messageID } = event;
    const ipAddr = args.join(" ");
    const line = "━━━━━━━━━━━━━━━━━━";

   
    const bdTime = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Dhaka",
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
    });

    if (!ipAddr) {
      return message.reply("⚠️ Please provide an IP address!\nExample: infoip 8.8.8.8");
    }

    try {
      const res = await axios.get(`http://ip-api.com/json/${ipAddr}`);
      const data = res.data;

      if (data.status === "fail") {
        return message.reply(`❌ Invalid IP Address: ${data.message}`);
      }

      const info = 
        `[ IP INFORMATION ]\n` +
        `${line}\n` +
        `● IP: ${data.query}\n` +
        `● Country: ${data.country} (${data.countryCode})\n` +
        `● Region: ${data.regionName}\n` +
        `│ City: ${data.city}\n` +
        `│ Zip: ${data.zip}\n` +
        `● ISP: ${data.isp}\n` +
        `│ Lat: ${data.lat}\n` +
        `│ Lon: ${data.lon}\n` +
        `${line}\n` +
        `Time: ${bdTime}`;

      return message.reply(info);

    } catch (err) {
      console.error(err);
      return message.reply("❌ Error fetching IP data.");
    }
  }
};