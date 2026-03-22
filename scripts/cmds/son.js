const activeFights = {};

module.exports = {
  config: {
    name: "son",
    version: "1.0.0",
    author: "S1FU",
    countDown: 5,
    role: 2,
    category: "fight",
    shortDescription: { en: "Automated insults for a mentioned user" },
    guide: { en: "{pn} @mention | {pn} off" }
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID, messageID, mentions, senderID } = event;

    if (args[0] === "off") {
      if (!activeFights[threadID]) {
        return message.reply(" age on kor chdna 😞");
      }
      delete activeFights[threadID];
      return message.reply("chdn off korlam ja muri kha ! 🗿");
    }

    const mention = Object.keys(mentions)[0];
    if (!mention) {
      return message.reply("mention den boss ore cde dei aktu.😞");
    }

    
    if (activeFights[threadID]) {
      return message.reply("ager Jon er cdn off kor age 🙂🙏");
    }

    api.getUserInfo(mention, (err, userInfo) => {
      if (err) return message.reply("user info err !oy Sala akta gay..!¡");

      let genderText;
      switch (userInfo[mention].gender) {
        case 1: genderText = "মাইয়া"; break;
        case 2: genderText = "পোলা"; break;
        default: genderText = "হিজড়া";
      }

      activeFights[threadID] = {
        targetID: mention,
        index: 0,
        gender: genderText
      };

      return message.reply(`😆 কিরে ${mentions[mention].replace("@", "")}! কেমন আছিস..‽`);
    });
  },

  onChat: async function ({ api, event, message }) {
    const { threadID, senderID } = event;

    if (!activeFights[threadID]) return;

    const fight = activeFights[threadID];

    if (senderID == fight.targetID) {
      const insults = [
        `খাংকির ${fight.gender}, তোর মার ভোদা তে গাধার মাল ফালাবো! 😈`,
        `তোর মা কে চুদে চুদে পল্টি মারবো, গাধার ${fight.gender}! 😡`,
        `বাড়ির পাশে আমার মাল ফেলে দিয়ে তোর মা কে চুদতে চাই! 🔥`,
        `চুদা খাওয়া তোর মার, আমি তোর মার ভোদায় টান দিবো! 💣`,
        `তোর মার গুদে ফুল ট্যাবলেট পুশ করে, গাধার ${fight.gender}! 😛`,
        `তোর বোনের মুখে মাল ফালানোর কথা ভাবি, মাগী ${fight.gender}!`,
        `তোর মাকে গাধার মতো চুদে তোর মা বলব "এটা কার মাল?"`,
        `তোর মার গুদে ইনপুট দিয়ে আউটপুট নেবো, পোলাপাইন ${fight.gender}!`,
        `তোর মার ভোদায় গাধার মতো মাল ফালিয়ে দেবো, আজকের রাতেই! 🔥`,
        `এখন মাগীর ${fight.gender} তোর মার ভোদা চুদে, এক টুকরা দেবো! 😠`,
        `তোর মা কে চুদে পল্টি মারবো, গাধার ${fight.gender}! 🤡`
      ];

      const currentInsult = insults[fight.index % insults.length];
      fight.index++;

      return message.reply(currentInsult);
    }
  }
};