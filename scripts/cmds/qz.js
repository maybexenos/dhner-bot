const axios = require("axios");

const sessions = new Map();
const QUIZ_API_URL = "https://saif-quiz.onrender.com/api/quiz";

// ফ্যান্সি ফন্ট জেনারেটর (অপ্টিমাইজড)
const fancy = (text) => {
  const map = {
    'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢', 'j': '𝐣',
    'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭',
    'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
    'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉',
    'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓',
    'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝙕',
    '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
  };
  return text.toString().split('').map(char => map[char] || char).join('');
};

module.exports = {
  config: {
    name: "quiz2",
    aliases: ["qz2", "kbc"],
    version: "30.0", // ভার্সন আপডেট
    author: "Saif",
    countDown: 15,
    role: 0,
    category: "game",
    description: "Advanced Quiz with Betting & Streak System"
  },

  onStart: async function ({ api, event, usersData, args }) {
    const { threadID, messageID, senderID } = event;
    const userData = await usersData.get(senderID);
    
    // ডাটা ইনিশিয়ালাইজেশন
    if (!userData.data) userData.data = {};
    if (!userData.data.quiz2Stats) {
      userData.data.quiz2Stats = { won: 0, played: 0, exp: 0, streak: 0, dailyUsage: 0, lastDate: "" };
    }

    // ডেইলি লিমিট রিসেট লজিক
    const today = new Date().toLocaleDateString();
    if (userData.data.quiz2Stats.lastDate !== today) {
      userData.data.quiz2Stats.dailyUsage = 0;
      userData.data.quiz2Stats.lastDate = today;
    }

    // র‍্যাঙ্কিং সিস্টেম
    if (args[0] === "rank" || args[0] === "top") {
      const allUsers = await usersData.getAll();
      const rankList = allUsers
        .filter(u => u.data && u.data.quiz2Stats)
        .sort((a, b) => (b.data.quiz2Stats.won || 0) - (a.data.quiz2Stats.won || 0))
        .slice(0, 10);

      let rankMsg = `🏆 𝐐𝐔𝐈𝐙 𝐋𝐄𝐀𝐃𝐄𝐑𝐁𝐎𝐀𝐑𝐃 🏆\n━━━━━━━━━━━━━━━━━━\n`;
      rankList.forEach((u, i) => {
        let medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🎗️";
        rankMsg += `${medal} ${i + 1}. ${u.name.slice(0, 15)} — Wins: ${fancy(u.data.quiz2Stats.won)}\n`;
      });
      return api.sendMessage(rankMsg, threadID, messageID);
    }

    // স্ট্যাটাস চেক
    if (args[0] === "stats") {
      const s = userData.data.quiz2Stats;
      const statsMsg = `📊 𝐏𝐋𝐀𝐘𝐄𝐑 𝐒𝐓𝐀𝐓𝐈𝐒𝐓𝐈𝐂𝐒\n━━━━━━━━━━━━━━━━━━\n👤 𝐍𝐚𝐦𝐞: ${userData.name}\n🏆 𝐖𝐢𝐧𝐬: ${fancy(s.won)}\n🎮 𝐏𝐥𝐚𝐲𝐞𝐝: ${fancy(s.played)}\n🔥 𝐒𝐭𝐫𝐞𝐚𝐤: ${fancy(s.streak)}\n✨ 𝐄𝐗𝐏: ${fancy(s.exp)}\n⏳ 𝐃𝐚𝐢𝐥𝐲: ${fancy(s.dailyUsage)}/𝟐𝟎\n━━━━━━━━━━━━━━━━━━`;
      return api.sendMessage(statsMsg, threadID, messageID);
    }

    // লিমিট চেক
    if (userData.data.quiz2Stats.dailyUsage >= 20) {
      return api.sendMessage(`⚠️ 𝐋𝐢𝐦𝐢𝐭 𝐑𝐞𝐚𝐜𝐡𝐞𝐝!\nBaby, today's quota is over. Come back tomorrow!`, threadID, messageID);
    }

    // বেটিং সিস্টেম (Betting System)
    let betAmount = 0;
    if (args[0] && !isNaN(args[0])) {
      betAmount = parseInt(args[0]);
      if (betAmount > userData.money) {
        return api.sendMessage(`⚠️ 𝐈𝐧𝐬𝐮𝐟𝐟𝐢𝐜𝐢𝐞𝐧𝐭 𝐁𝐚𝐥𝐚𝐧𝐜𝐞!\nYou have: $${fancy(userData.money)}`, threadID, messageID);
      }
      if (betAmount < 50) {
        return api.sendMessage(`⚠️ Minimum bet amount is $50.`, threadID, messageID);
      }
    }

    try {
      // API থেকে প্রশ্ন আনা
      const res = await axios.get(QUIZ_API_URL);
      const questions = res.data[0].questions;
      const q = questions[Math.floor(Math.random() * questions.length)];

      let optionsMsg = '';
      const options = ['a', 'b', 'c', 'd'];
      options.forEach(l => {
        if (q.options[l]) optionsMsg += `┣ ${fancy(l.toUpperCase())}. ${q.options[l]}\n`;
      });

      // প্রশ্নের মেসেজ ডিজাইন
      const header = betAmount > 0 ? `🎰 𝐁𝐄𝐓: $${fancy(betAmount)}` : `🎮 𝐍𝐎𝐑𝐌𝐀𝐋 𝐌𝐎𝐃𝐄`;
      const quizContent = `┏━━━〔 『 𝐐𝐔𝐈𝐙 𝐌𝐀𝐒𝐓𝐄𝐑 』 〕━━━┓\n┣ ${header}\n┣ 🔥 𝐒𝐭𝐫𝐞𝐚𝐤: ${fancy(userData.data.quiz2Stats.streak)}\n├───✦ 𝐐𝐮𝐞𝐬𝐭𝐢𝐨𝐧 ✦───\n┣ ${fancy(q.text)}\n├──────────────────\n${optionsMsg}┗━━━━━━━━━━━━━━━┛\nType A, B, C or D to answer.`;

      api.sendMessage(quizContent, threadID, (err, info) => {
        if (err) return;
        
        userData.data.quiz2Stats.dailyUsage += 1;
        usersData.set(senderID, { data: userData.data });

        // টাইমআউট হ্যান্ডলার
        const timeoutId = setTimeout(() => {
          if (sessions.has(info.messageID)) {
            sessions.delete(info.messageID);
            api.editMessage(`⏳ 𝐓𝐢𝐦𝐞'𝐬 𝐔𝐩!\nThe correct answer was: ${fancy(q.answer.toUpperCase())}`, info.messageID);
          }
        }, 30000); // ৩০ সেকেন্ড সময়

        // সেশন সংরক্ষণ
        sessions.set(info.messageID, {
          answer: q.answer,
          author: senderID,
          bet: betAmount,
          timeoutId
        });

        global.SizuBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          author: senderID,
          sessionId: info.messageID
        });

      }, messageID);
    } catch (e) {
      console.error(e);
      return api.sendMessage("❌ Error connecting to server.", threadID, messageID);
    }
  },

  onReply: async function ({ event, api, Reply, usersData }) {
    const { senderID, body, threadID, messageID } = event;
    const session = sessions.get(Reply.sessionId);

    // শুধু যে গেম শুরু করেছে সেই উত্তর দিতে পারবে
    if (!session || senderID !== Reply.author) return;

    clearTimeout(session.timeoutId);
    sessions.delete(Reply.sessionId);

    // ইউজারের উত্তর ডিলিট করে দেওয়া (Clean Chat)
    try { await api.unsendMessage(messageID); } catch (e) {}

    const isCorrect = body.trim().toLowerCase() === session.answer;
    let user = await usersData.get(senderID);
    let s = user.data.quiz2Stats;
    
    s.played += 1;

    let resultHeader = "";
    let statusBody = "";

    if (isCorrect) {
      s.won += 1;
      s.streak = (s.streak || 0) + 1;
      
      // রিওয়ার্ড ক্যালকুলেশন
      let baseReward = 500;
      let streakBonus = s.streak * 50; // প্রতি স্ট্রিকে ৫০ কয়েন বোনাস
      let betWin = session.bet > 0 ? session.bet * 2 : 0; // বাজি জিতলে ডাবল
      let totalWin = baseReward + streakBonus + betWin - (session.bet > 0 ? session.bet : 0); // নেট লাভ

      s.exp += 150;
      await usersData.set(senderID, { money: user.money + totalWin, data: user.data });

      resultHeader = `✅ 𝐂𝐎𝐑𝐑𝐄𝐂𝐓 𝐀𝐍𝐒𝐖𝐄𝐑`;
      statusBody = `💰 𝐖𝐨𝐧: $${fancy(totalWin)}\n🔥 𝐒𝐭𝐫𝐞𝐚𝐤: ${fancy(s.streak)}x\n✨ 𝐄𝐱𝐩: +${fancy(150)}`;
    } else {
      s.streak = 0; // ভুল করলে স্ট্রিক রিসেট
      let lostAmount = session.bet;
      
      if (lostAmount > 0) {
        await usersData.set(senderID, { money: user.money - lostAmount, data: user.data });
      } else {
        await usersData.set(senderID, { data: user.data });
      }

      resultHeader = `❌ 𝐖𝐑𝐎𝐍𝐆 𝐀𝐍𝐒𝐖𝐄𝐑`;
      statusBody = `✅ 𝐀𝐧𝐬𝐰𝐞𝐫: ${fancy(session.answer.toUpperCase())}\n💸 𝐋𝐨𝐬𝐭: $${fancy(lostAmount)}\n💔 𝐒𝐭𝐫𝐞𝐚𝐤 𝐁𝐫𝐨𝐤𝐞𝐧!`;
    }

    const resultMsg = `┏━━━〔 『 𝐐𝐔𝐈𝐙 𝐑𝐄𝐒𝐔𝐋𝐓 』 〕━━━┓\n┣ ${resultHeader}\n├─────────────────\n┣ ${statusBody}\n┣ 🏆 𝐓𝐨𝐭𝐚𝐥 𝐖𝐢𝐧𝐬: ${fancy(s.won)}\n┗━━━━━━━━━━━━━━━┛`;
    
    // আগের মেসেজ এডিট করে রেজাল্ট দেখানো
    return api.editMessage(resultMsg, Reply.sessionId);
  }
};