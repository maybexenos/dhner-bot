module.exports = {
  config: {
    name: "gcadmin",
    aliases: ['groupadmin'],
    version: "2.0",
    author: "S1FU",
    countDown: 5,
    role: 1, // Chỉ Admin nhóm mới dùng được lệnh này
    description: {
      en: "Advanced Group Admin Manager",
      vi: "Quản lý Quản trị viên nhóm nâng cao"
    },
    category: "Hệ Thống",
    guide: {
      en: "『 {p}{n} add [reply/mention/id] 』➜ Promote to Admin\n『 {p}{n} remove [reply/mention/id] 』➜ Demote Admin",
      vi: "『 {p}{n} add [reply/tag/id] 』➜ Thăng chức Admin\n『 {p}{n} remove [reply/tag/id] 』➜ Gỡ chức Admin"
    }
  },

  onStart: async function ({ api, event, args, threadsData }) {
    const { threadID, messageID, senderID, type, messageReply, mentions } = event;
    const action = args[0]?.toLowerCase();
    
    if (!["add", "-a", "remove", "-r"].includes(action)) {
      return api.sendMessage(`━━━━━━━━━━━━━━━\n『 ⚠️ 』 ➜ 𝗜𝗡𝗩𝗔𝗟𝗜𝗗 𝗦𝗬𝗡𝗧𝗔𝗫\n━━━━━━━━━━━━━━━\n${this.config.guide.en}`, threadID, messageID);
    }

    let uIDs = [];
    if (type === "message_reply") {
      uIDs.push(messageReply.senderID);
    } else if (Object.keys(mentions).length > 0) {
      uIDs = Object.keys(mentions);
    } else if (args[1]) {
      uIDs.push(args[1]);
    } else {
      uIDs.push(senderID);
    }

    const isAdding = action === "add" || action === "-a";
    
    for (const uID of uIDs) {
      try {
        const userInfo = await api.getUserInfo(uID);
        const name = userInfo[uID]?.name || "User";

        await api.changeAdminStatus(threadID, uID, isAdding);

        const statusMsg = isAdding 
          ? `『 ✅ 』 ➜ 𝗣𝗥𝗢𝗠𝗢𝗧𝗘𝗗: ${name}\n『 🛡️ 』 ➜ Role: 𝗚𝗿𝗼𝘂𝗽 𝗔𝗱𝗺𝗶𝗻`
          : `『 ❌ 』 ➜ 𝗗𝗘𝗠𝗢𝗧𝗘𝗗: ${name}\n『 👥 』 ➜ Role: 𝗠𝗲𝗺𝗯𝗲𝗿`;

        api.sendMessage(`━━━━━━━━━━━━━━━━━━\n${statusMsg}\n━━━━━━━━━━━━━━━━━━`, threadID);
      } catch (err) {
        api.sendMessage(`『 🛑 』 ➜ 𝗘𝗥𝗥𝗢𝗥: Bot needs Admin privileges to perform this action!`, threadID);
        break;
      }
    }
  }
};