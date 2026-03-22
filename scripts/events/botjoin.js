module.exports = {
  config: {
    name: "botJoin",
    version: "2.2.1",
    author: "Xenos",
    category: "events",
    description: "Sends fancy welcome message + sets nickname when bot is added to group",
    envConfig: {
      // You can add delay/reaction settings here later if needed
    }
  },

  onStart: async function ({ api, event, usersData }) {
    if (event.logMessageType !== "log:subscribe") return;

    const botID = api.getCurrentUserID();
    const addedParticipants = event.logMessageData?.addedParticipants || [];

    // More robust bot detection (handles different key names)
    const botWasAdded = addedParticipants.some(user => {
      const uid = String(user.userFbId || user.userID || user.id || user.uid || "");
      return uid === botID;
    });

    if (!botWasAdded) return;

    const threadID = event.threadID;

    try {
      // ─── Safe config loading ─────────────────────────────────────
      const gConfig     = global.GoatBot?.config    || {};
      const prefix      = gConfig.prefix            || "!";
      const botName     = gConfig.name              || "乛 zero ゎ";
      const ownerName   = gConfig.adminName         || "SIFAT";
      const ownerIDs    = gConfig.adminBot          || [];
      const mainOwnerID = ownerIDs[0] || "";

      // ─── Thread information ──────────────────────────────────────
      const threadInfo  = await api.getThreadInfo(threadID);
      const groupName   = threadInfo.threadName || "Unnamed Group 💫";
      const memberCount = threadInfo.participantIDs?.length || addedParticipants.length + 1 || "many";

      // Try to find who added the bot (sometimes available in logs)
      let addedByName = "";
      let addedByID   = "";
      try {
        const adder = addedParticipants.find(u => 
          String(u.userFbId || u.userID || u.id) !== botID
        );
        if (adder) {
          addedByID   = adder.userFbId || adder.userID || adder.id || "";
          addedByName = (await usersData.get(addedByID))?.name || adder.name || "someone sweet";
        }
      } catch {}

      // ───  Welcome Message ──────────────────────
      const welcomeMsg = `✦ ───────────── ✦

🌸  ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ ᴛʜᴇ ᴄᴜᴛᴇsᴛ ᴄʜᴀᴛ ᴇᴠᴇʀ  🌸
      ɪ'ᴍ **${botName}** — ʏᴏᴜʀ ʟɪᴛᴛʟᴇ ʜᴇʟᴘᴇʀ ♡

${addedByName ? `💞 ᴀᴅᴅᴇᴅ ʙʏ ${addedByName}\n` : ""}

╭───── ✦ ɪɴ ғᴏ ✦ ─────╮
│ ɢʀᴏᴜᴘ ➤ ${groupName}
│ ᴍᴇᴍʙᴇʀs ➤ ${memberCount} ᴀɴɢᴇʟs
│ ᴘʀᴇғɪx ➤ ${prefix}
╰───── ✦       ✦ ─────╯

✦ ᴄᴏᴍᴍᴀɴᴅs ʏᴏᴜ sʜᴏᴜʟᴅ ᴛʀʏ ✦
→  ${prefix}help       → sʜᴏᴡ ᴀʟʟ ᴄᴏᴍᴍᴀɴᴅs
→  ${prefix}info       → ᴀʙᴏᴜᴛ ᴍᴇ ♡
→  ${prefix}rules      → ɢʀᴏᴜᴘ ɢᴜɪᴅᴇʟɪɴᴇs

💡 sᴍᴀʟʟ ʀᴇᴍɪɴᴅᴇʀs:
• ᴘʟᴇᴀsᴇ ᴅᴏɴ'ᴛ sᴘᴀᴍ ᴍᴇ ಥ_ಥ
• ʙᴇ ɴɪᴄᴇ ᴛᴏ ᴇᴠᴇʀʏᴏɴᴇ ૮₍ ˶ᵔ ᵕ ᵔ˶ ₎ა
• ʜᴀᴠᴇ ғᴜɴ & sᴛᴀʏ sᴀғᴇ ♡

ᴏᴡɴᴇʀ 𓆩♡𓆪  ${ownerName}
${mainOwnerID ? `fb.me/${mainOwnerID}` : ""}

ʟᴇᴛ's ᴍᴀᴋᴇ ᴛʜɪs ɢʀᴏᴜᴘ ᴀ ʟɪᴛᴛʟᴇ ᴘɪᴇᴄᴇ ᴏғ ʜᴇᴀᴠᴇɴ 🪽✨

────────────── ✦`;

      // 1. Try to set clean nickname (without prefix clutter)
      try {
        const cleanBotName = botName.replace(/[\[\]{}()<>!@#$%^&*+=~`|\\]/g, '').trim();
        await api.changeNickname(cleanBotName || "✦ Xenos ♡", threadID, botID);
      } catch (e) {
        console.log("[botJoin] Nickname failed →", e.message);
      }

      // 2. Send the beautiful welcome
      const msgSent = await api.sendMessage({
        body: welcomeMsg,
        mentions: mainOwnerID ? [{
          tag: ownerName,
          id: mainOwnerID
        }] : []
      }, threadID);

      // 3. Add some cute reactions (sequential = more natural)
      if (msgSent?.messageID) {
        const mid = msgSent.messageID;
        const reactions = ["✨", "🩷", "🪽", "😽", "🫶"];
        
        for (const emoji of reactions) {
          await new Promise(r => setTimeout(r, 400)); // tiny delay = looks organic
          api.setMessageReaction(emoji, mid, () => {}, true);
        }
      }

    } catch (error) {
      console.error("[botJoin] Error:", error.message || error);
      // Optional: send error to owner or log file
    }
  }
};