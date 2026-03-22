const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "pending",
    aliases: ["pen"],
    version: "3.0",
    author: "乛 Xꫀᥒos ゎ",
    countDown: 5,
    role: 2,
    shortDescription: { en: "꒷꒦ Manage pending invites" },
    longDescription: { en: "Approve / Reject groups waiting for bot approval with stylish messages" },
    category: "owner",
    guide: { en: "{pn} → show list\nReply with numbers or c <numbers>" }
  },

  langs: {
    en: {
      invalid: "✘ Invalid choice → %1",
      refused:  "✦ %1 group(s) rejected\n𖤐 %2",
      approved: "✦ %1 group(s) approved\n𖤐 %2",
      fetchFail: "⚠ Failed to load pending list",
      empty:     "𓆩♡𓆪 No pending groups right now",
      list: `✶ PENDING THREADS ✶  ( %1 )\n\n%2\n
┏━━━〔 〕━━━┓
┣  Reply with:    ┣
┣  • 1 3 5        ┣ → approve
┣  • c 2 4        ┣ → cancel/reject
┗━━━━━━━━━━━━━━━┛`
    }
  },

  // ┣━━━━━━━━━━━━━━━┫┣━━━━━━━━━━━━━━━┫──────────

  onReply: async function ({ api, event, Reply, getLang }) {
    if (event.senderID !== Reply.author) return;

    const input = event.body.trim().toLowerCase();
    const { threadID, messageID } = event;

    const prefix    = global.GoatBot?.config?.prefix || ".";
    const botName   = "乛 SIZUKA ゎ";
    const heartLine = "✦──── ⋆⋅☆⋅⋆ ────✦";
    const timeNow   = moment().tz("Asia/Dhaka").format("ddd, DD MMM YYYY • HH:mm:ss");

    let actionCount = 0;
    let isCancel    = /^(c|cancel|reject|no)/i.test(input);

    const targets = input.replace(/^(c|cancel|reject|no)/i, "").trim().split(/\s+/).filter(Boolean);

    if (targets.length === 0) {
      return api.sendMessage("❛ Please enter number(s)", threadID, messageID);
    }

    for (const numStr of targets) {
      const num = parseInt(numStr);
      if (!num || num < 1 || num > Reply.queue.length) {
        return api.sendMessage(getLang("invalid", numStr), threadID, messageID);
      }

      const target = Reply.queue[num - 1];
      const targetID = target.threadID;

      const msg = isCancel
        ? `𓆩♡𓆪 ACCESS DENIED 𓆩♡𓆪
${heartLine}
✘ Bot       : ${botName}
✘ Prefix    : ${prefix}
✘ Action    : Rejected
✘ Time      : ${timeNow}
${heartLine}`
        : `✦ WELCOME TO THE FAMILY ✦
${heartLine}
✓ Bot       : ${botName}
✓ Prefix    : ${prefix}
✓ Activated : ${timeNow}
${heartLine}
Use ${prefix}help to explore commands ♡`;

      try {
        await api.sendMessage(msg, targetID);

        if (!isCancel) {
          // Try to set nickname (silent fail ok)
          await api.changeNickname(botName, targetID, api.getCurrentUserID()).catch(() => {});
        } else {
          // Remove bot from group on reject
          await api.removeUserFromGroup(api.getCurrentUserID(), targetID).catch(() => {});
        }

        actionCount++;
      } catch (e) {
        console.log(`Error on thread ${targetID}:`, e.message);
      }
    }

    const resultKey = isCancel ? "refused" : "approved";
    return api.sendMessage(
      getLang(resultKey, actionCount, timeNow),
      threadID,
      messageID
    );
  },

  // ┣━━━━━━━━━━━━━━━┫┣━━━━━━━━━━━━━━━┫──────────

  onStart: async function ({ api, event, getLang, commandName }) {
    const { threadID, messageID, senderID } = event;

    try {
      const [other, pending] = await Promise.all([
        api.getThreadList(100, null, ["OTHER"]),
        api.getThreadList(100, null, ["PENDING"])
      ]);

      const groups = [...(other || []), ...(pending || [])]
        .filter(t => t.isGroup && t.isSubscribed && t.threadID !== threadID);

      if (!groups.length) {
        return api.sendMessage(getLang("empty"), threadID, messageID);
      }

      let text = "";
      let i = 1;

      for (const g of groups) {
        const name = g.name || "No Name";
        text += ` ${i}. ${name} 𖥻 ${g.threadID}\n`;
        i++;
      }

      const listMsg = getLang("list", groups.length, text);

      return api.sendMessage(
        listMsg,
        threadID,
        (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName,
              author: senderID,
              queue: groups
            });
          }
        },
        messageID
      );

    } catch (err) {
      console.error(err);
      return api.sendMessage(getLang("fetchFail"), threadID, messageID);
    }
  }
};
