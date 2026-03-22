module.exports = {
  config: {
    name: "fork",
    aliases: ["repo", "source"],
    version: "1.0",
    author: "sifu",
    countDown: 3,
    role: 0,
    longDescription: "",
    category: "system",
    guide: { en: "{pn}" }
  },

  onStart: async function({ message }) {
    const text = " | Here is the updated fork:\n\nhttps://github.com/ewr-sifu/ZEROxGOAT-V2.git\n\n";
    
    message.reply(text);
  }
};
