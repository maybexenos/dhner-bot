function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

module.exports = {
  config: {
    name: "filteruser",
    version: "2.0.0",
    author: "S1FU",
    countDown: 5,
    role: 1,
    category: "𝖻𝗈𝗑 𝖼𝗁𝖺𝗍",
    description: { en: "𝖿𝗂𝗅𝗍𝖾𝗋 𝗆𝖾𝗆𝖻𝖾𝗋𝗌 𝖻𝗒 𝗆𝖾𝗌𝗌𝖺𝗀𝖾𝗌 𝗈𝗋 𝖽𝖾𝖺𝖽 𝖺𝖼𝖼𝗈𝗎𝗇𝗍𝗌" },
    guide: { en: "『 {pn} [<𝗇𝗎𝗆𝖻𝖾𝗋> | 𝖽𝗂𝖾] 』" }
  },

  onStart: async function ({ api, args, threadsData, message, event, commandName }) {
    const stylize = (text) => {
      const fonts = {
        "a":"𝖺","b":"𝖻","c":"𝖼","d":"𝖽","e":"𝖾","f":"𝖿","g":"𝗀","h":"𝗁","i":"𝗂","j":"𝗃","k":"𝗄","l":"𝗅","m":"𝗆",
        "n":"𝗇","o":"𝗈","p":"𝗉","q":"𝗊","r":"𝗋","s":"𝗌","t":"𝗍","u":"𝗎","v":"𝗏","w":"𝗐","x":"𝗑","y":"𝗒","z":"𝗓",
        "0":"𝟎","1":"𝟏","2":"𝟐","3":"𝟑","4":"𝟒","5":"𝟓","6":"𝟔","7":"𝟕","8":"𝟖","9":"𝟗"
      };
      return text.toString().toLowerCase().split('').map(char => fonts[char] || char).join('');
    };

    const threadData = await threadsData.get(event.threadID);
    if (!threadData.adminIDs.includes(api.getCurrentUserID())) {
      return message.reply(`✧ 𐃷 ${stylize("𝗉𝗅𝖾𝖺𝗌𝖾 𝗆𝖺𝗄𝖾 𝗆𝖾 𝖺𝗇 𝖺𝖽𝗆𝗂𝗇 𝖿𝗂𝗋𝗌𝗍")} Ი𐑼 𖹭`);
    }

    if (!isNaN(args[0])) {
      return message.reply(`✧ 𐃷 ${stylize("𝖽𝗈 𝗒𝗈𝗎 𝗋𝖾𝖺𝗅𝗅𝗒 𝗐𝖺𝗇𝗍 𝗍𝗈 𝗋𝖾𝗆𝗈𝗏𝖾 𝗆𝖾𝗆𝖻𝖾𝗋𝗌 𝗐𝗂𝗍𝗁 𝗅𝖾𝗌𝗌 𝗍𝗁𝖺𝗇")} ${args[0]} ${stylize("𝗆𝖾𝗌𝗌𝖺𝗀𝖾𝗌")}?\n\n🌷 ✨ ${stylize("𝗋𝖾𝖺𝖼𝗍 𝗍𝗈 𝖼𝗈𝗇𝖿𝗂𝗋𝗆")}... ᯓ★`, (err, info) => {
        global.GoatBot.onReaction.set(info.messageID, {
          author: event.senderID,
          messageID: info.messageID,
          minimum: Number(args[0]),
          commandName
        });
      });
    }

    if (args[0] == "die") {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const membersBlocked = threadInfo.userInfo.filter(user => user.type !== "User");
      
      if (membersBlocked.length === 0) return message.reply(`✧ 𐃷 ${stylize("𝗇𝗈 𝗅𝗈𝖼𝗄𝖾𝖽 𝖺𝖼𝖼𝗈𝗎𝗇𝗍𝗌 𝖿𝗈𝗎𝗇𝖽")} Ი𐑼 𖹭`);

      await message.reply(`🌷 ✨ ${stylize("𝖼𝗅𝖾𝖺𝗇𝗂𝗇𝗀 𝗎𝗉 𝖽𝖾𝖺𝖽 𝖺𝖼𝖼𝗈𝗎𝗇𝗍𝗌")}... ᯓ★`);
      let success = 0;

      for (const user of membersBlocked) {
        if (!threadData.adminIDs.includes(user.id)) {
          try {
            await api.removeUserFromGroup(user.id, event.threadID);
            success++;
          } catch (e) {}
          await sleep(700);
        }
      }
      return message.reply(`✨ ${stylize("𝗌𝗎𝖼𝖼𝖾𝗌𝗌𝖿𝗎𝗅𝗅𝗒 𝗋𝖾𝗆𝗈𝗏𝖾𝖽")} ${stylize(success)} ${stylize("𝖽𝖾𝖺𝖽 𝖺𝖼𝖼𝗈𝗎𝗇𝗍𝗌")} 𐃷 Ი𐑼`);
    }

    message.SyntaxError();
  },

  onReaction: async function ({ api, Reaction, event, threadsData, message }) {
    const { minimum = 1, author, messageID } = Reaction;
    if (event.userID != author) return;

    const stylize = (text) => {
      const fonts = {"a":"𝖺","b":"𝖻","c":"𝖼","d":"𝖽","e":"𝖾","f":"𝖿","g":"𝗀","h":"𝗁","i":"𝗂","j":"𝗃","k":"𝗄","l":"𝗅","m":"𝗆","n":"𝗇","o":"𝗈","p":"𝗉","q":"𝗊","r":"𝗋","s":"𝗌","t":"𝗍","u":"𝗎","v":"𝗏","w":"𝗐","x":"𝗑","y":"𝗒","z":"𝗓","0":"𝟎","1":"𝟏","2":"𝟐","3":"𝟑","4":"𝟒","5":"𝟓","6":"𝟔","7":"𝟕","8":"𝟖","9":"𝟗"};
      return text.toString().toLowerCase().split('').map(char => fonts[char] || char).join('');
    };

    const threadData = await threadsData.get(event.threadID);
    const botID = api.getCurrentUserID();
    const targets = threadData.members.filter(m => m.count < minimum && m.inGroup && m.userID != botID && !threadData.adminIDs.includes(m.userID));

    if (targets.length === 0) return message.reply(`✧ 𐃷 ${stylize("𝗇𝗈 𝗆𝖾𝗆𝖻𝖾𝗋𝗌 𝗆𝖾𝖾𝗍 𝗍𝗁𝗂𝗌 𝖼𝗋𝗂𝗍𝖾𝗋𝗂𝖺")} Ი𐑼 𖹭`);

    api.unsendMessage(messageID);
    await message.reply(`🌷 ✨ ${stylize("𝗋𝖾𝗆𝗈𝗏𝗂𝗇𝗀")} ${stylize(targets.length)} ${stylize("𝗂𝗇𝖺𝗿𝗍𝗂𝗏𝖾 𝗎𝗌𝖾𝗋𝗌")}... ᯓ★`);
    
    let success = 0;
    for (const member of targets) {
      try {
        await api.removeUserFromGroup(member.userID, event.threadID);
        success++;
      } catch (e) {}
      await sleep(700);
    }
    return message.reply(`✨ ${stylize("𝖿𝗂𝗅𝗍𝖾𝗋 𝖼𝗈𝗆𝗉𝗅𝖾𝗍𝖾!")} ${stylize(success)} ${stylize("𝗆𝖾𝗆𝖻𝖾𝗋𝗌 𝗄𝗂𝖼𝗄𝖾𝖽")} 𐃷 Ი𐑼`);
  }
};