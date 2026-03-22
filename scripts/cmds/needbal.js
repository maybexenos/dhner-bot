module.exports = {
    config: {
        name: "needbal",
        version: "1.0.0",
        role: 2,
        author: "NeoKEX",
        description: "Turn on/off the money system requirement",
        category: "admin",
        guide: "{pn} on | off",
        countDown: 5
    },

    onStart: async function ({ api, event, args, message }) {
        const { config } = global.GoatBot;
        const configHelper = require("../../func/configHelper.js");
        if (args[0] == "on") {
            config.needbal = true;
            configHelper.saveConfig(config, true);
            return message.reply("✅ | Money system requirement has been turned ON.");
        } else if (args[0] == "off") {
            config.needbal = false;
            configHelper.saveConfig(config, true);
            return message.reply("✅ | Money system requirement has been turned OFF.");
        } else {
            return message.reply(`Current state: ${config.needbal ? "ON" : "OFF"}\nUse {prefix}needbal on | off to change.`);
        }
    }
};