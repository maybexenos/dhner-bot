module.exports = {
  config: {
    name: "ugly",
    version: "2.0",
    author: "乛 Xꫀᥒos ゎ",
    countDown: 5,
    role: 0,
    shortDescription: "Calculate ugliness level",
    longDescription: "Checks how ugly a person is with profile picture.",
    category: "fun",
    guide: "{pn} / {pn} @tag / reply to user"
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      
      let targetID;
      let targetName;

      if (event.type === "message_reply") {
        
        targetID = event.messageReply.senderID;
        targetName = await usersData.getName(targetID);
      } else if (Object.keys(event.mentions).length > 0) {
        
        targetID = Object.keys(event.mentions)[0];
        targetName = event.mentions[targetID].replace(/@/g, "");
      } else {
        
        targetID = event.senderID;
        targetName = await usersData.getName(targetID);
      }

      const uglyPercentage = Math.floor(Math.random() * 101);

      
      let comment = "";
      if (uglyPercentage < 20) comment = "Wow, you look like an Angel! 😳❤️";
      else if (uglyPercentage < 50) comment = "Not bad, you look decent. 👍";
      else if (uglyPercentage < 80) comment = "Damn! Put a mask on. 😷";
      else comment = "MY EYES! The mirror is broken! 🤮💔";

      const avatarURL = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      return api.sendMessage({
        body: `┏━━━〔 ═━┈┈┈┈┈━═ 〕━━━┓\n    ${targetName}\n  💩 Ugliness Level: ${uglyPercentage}%\n\n${comment}┗━━━━━━━━━━━━━━━┛`,
        attachment: await global.utils.getStreamFromURL(avatarURL)
      }, event.threadID, event.messageID);

    } catch (error) {
      console.error(error);
      return api.sendMessage("An error occurred while calculating ugliness!", event.threadID, event.messageID);
    }
  }
};