const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "rip",
    version: "1.2",
    author: "SiFu", 
    countDown: 5,
    role: 0,
    shortDescription: "Put user avatar into RIP image",
    longDescription: "Generates a RIP image with the user's avatar. Works with Mentions, Replies, or Self.",
    category: "fun",
    guide: {
      vi: "{pn} [@tag | reply | blank]",
      en: "{pn} [@tag | reply | blank]"
    }
  },

  onStart: async function ({ event, message, usersData }) {
    try {
      let uid;

      // Logic to determine the Target ID
      if (Object.keys(event.mentions).length > 0) {
        // 1. If someone is mentioned, use that ID
        uid = Object.keys(event.mentions)[0];
      } else if (event.type === "message_reply") {
        // 2. If it's a reply to a message, use the ID of the message author
        uid = event.messageReply.senderID;
      } else {
        // 3. If neither, use the sender's own ID (Self)
        uid = event.senderID;
      }

      // Get Avatar URL
      const avatarURL = await usersData.getAvatarUrl(uid);
      
      // Generate Image
      const img = await new DIG.Rip().getImage(avatarURL);
      
      // Save Path
      const pathSave = `${__dirname}/tmp/${uid}_Rip.png`;
      fs.writeFileSync(pathSave, Buffer.from(img));

      // Send Message with attachment
      message.reply({
        body: "Rest In Peace ⚰️",
        attachment: fs.createReadStream(pathSave)
      }, () => {
        // Delete file after sending to save space
        fs.unlinkSync(pathSave);
      });

    } catch (error) {
      console.error(error);
      message.reply("An error occurred while generating the image.");
    }
  }
};
