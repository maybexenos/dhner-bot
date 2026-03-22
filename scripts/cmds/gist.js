const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');


const baseApiUrl = async () => {
  try {
    const base = await axios.get('https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json');
    return base.data.gist;
  } catch (e) {
    return "https://xsaim8x-xxx-api.onrender.com"; 
  }
};

module.exports = {
  config: {
    name: "gist",
    version: "3.0",
    role: 1,
    author: " Xꫀᥒos",
    usePrefix: true,
    description: "Convert code or local files into Gist links.",
    category: "convert",
    guide: {
      en: "『 ɢɪꜱᴛ ᴘᴀɴᴇʟ 』" +
        "\n  ◸ Reply ◿ {pn} (to code)" +
        "\n  ◸ Cmds ◿ {pn} <filename>" +
        "\n  ◸ Events ◿ {pn} -e <filename>"
    },
    countDown: 2
  },

  onStart: async function ({ api, event, args }) {
    let fileName = args[0];
    let code = "";
    
    
    const st = (text) => {
      const m = {'a': '𝖺', 'b': '𝖻', 'c': '𝖼', 'd': '𝖽', 'e': '𝖾', 'f': '𝖿', 'g': '𝗀', 'h': '𝗁', 'i': '𝗂', 'j': '𝗃', 'k': '𝗄', 'l': '𝗅', 'm': '𝗆', 'n': '𝗇', 'o': '𝗈', 'p': '𝗉', 'q': '𝗊', 'r': '𝗋', 's': '𝗌', 't': '𝗍', 'u': '𝗎', 'v': '𝗏', 'w': '𝗐', 'x': '𝗑', 'y': '𝗒', 'z': '𝗓', 'A': '𝖠', 'B': '𝖡', 'C': '𝖢', 'D': '𝖣', 'E': '𝖤', 'F': '𝖥', 'G': '𝖦', 'H': '𝖧', 'I': '𝖨', 'J': '𝖩', 'K': '𝖪', 'L': '𝖫', 'M': '𝖬', 'N': '𝖭', 'O': '𝖮', 'P': '𝖯', 'Q': '𝖰', 'R': '𝖱', 'S': '𝖲', 'T': '𝖳', 'U': '𝖴', 'V': '𝖵', 'W': '𝖶', 'X': '𝖷', 'Y': '𝖸', 'Z': '𝖹'};
      return text.split('').map(c => m[c] || c).join('');
    };

    try {
      
      if (event.type === "message_reply") {
        code = event.messageReply.body;
        if (!code) return api.sendMessage("❌ | Replied message has no text.", event.threadID);
        
        fileName = fileName || `gist_${Date.now()}.js`;
        if (!fileName.endsWith(".js")) fileName += ".js";
      } 
      
      
      else if (fileName) {
        let folder = "cmds";
        let targetFile = fileName;

        if (args[0] === "-e") {
          folder = "events";
          targetFile = args[1];
          if (!targetFile) return api.sendMessage("⚠ | Usage: gist -e <filename>", event.threadID);
        }

        if (!targetFile.endsWith(".js")) targetFile += ".js";
        
        
        const filePath = path.join(process.cwd(), 'scripts', folder, targetFile);

        if (!fs.existsSync(filePath)) {
          return api.sendMessage(`❌ | File "${targetFile}" not found in ${folder} folder.`, event.threadID);
        }

        code = fs.readFileSync(filePath, "utf-8");
        fileName = targetFile;
      } 
      else {
        return api.sendMessage("⚠ | Reply to a code snippet OR provide a filename.", event.threadID);
      }

      
      const apiUrl = await baseApiUrl();
      const response = await axios.post(`${apiUrl}/gist`, {
        code: encodeURIComponent(code),
        nam: fileName
      });

      const gistLink = response.data?.data;
      if (!gistLink) throw new Error("API failed to provide a link.");

      const msg = 
`╭━━━━〔 𝔛𝔈𝔑𝔒𝔖 〕━━━╮
       ${st("Gist Created")} 

📄 ${st("File")}: ${fileName}
🔗 ${st("Link")}: ${gistLink}

━━━━━━━━━━━━━━━━━
🛡️ ${st("Status")}: Public / Raw
💀 ${st("System")}: 乛 Xꫀᥒos ゎ
━━━━━━━━━━━━━━━━━
   ${st("converted successfully")}!
╰━━━━━〔 ⚔️ 〕━━━━━╯`;

      return api.sendMessage(msg, event.threadID, event.messageID);

    } catch (err) {
      console.error("Gist Error:", err);
      return api.sendMessage(
        `❌ | ${st("Gist Generation Failed")}\n${err.message || "Unknown Server Error"}`, 
        event.threadID
      );
    }
  }
};
