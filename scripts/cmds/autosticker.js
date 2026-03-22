const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "autosticker",
    version: "4.6",
    author: "乛 Xꫀᥒos ゎ",
    countDown: 2,
    role: 0,
    aliases: ["as", "stickauto"],
    category: "fun",
    shortDescription: { en: "𓆩♡𓆪 Random sticker reply" },
    longDescription: { en: "Auto-reply random sticker when someone sends one" },
    guide: {
      en: `Just send any sticker → bot replies with random one
${global.GoatBot.config.prefix}autosticker list     → total count
${global.GoatBot.config.prefix}autosticker listall  → all sticker IDs`
    }
  },

  onStart: async function () {},

  onChat: async function ({ api, event }) {
    const { attachments, type, threadID, messageID, body } = event;

    const stickerList = [
      "997237917529747", "610031329418350", "610502019371281", "610569272697889",
      "610569976031152", "476425823021014", "476426593020937", "476429343020662",
      "476425429687720", "1303078524468983", "1303078351135667", "1303076361135866",
      "1303077221135780", "587748556953567", "587538733641216", "587532536975169",
      "587534000308356", "8298078730277844", "2041012262792914", "788171644590353",
      "2041021119458695", "456545803421865", "2041015016125972", "456536873422758",
      "456539756755803", "456538446755934", "456537923422653", "551710548197410",
      "3258106924322842", "3258108400989361", "529234074205621", "2041012539459553",
      "2041012109459596", "2041011389459668", "2041011836126290", "2041012406126233"
    ];

    // ─── List total ┣━━━━━━━━━━━━━━━┫┣━━━━━━━━━━━━━━━┫────────────
    if (body?.toLowerCase() === "/autosticker list") {
      return api.sendMessage(
        `✶ Total stickers: ${stickerList.length} 𓆩♡𓆪`,
        threadID, messageID
      );
    }

    // ─── List all IDs ┣━━━━━━━━━━━━━━━┫┣━━━━━━━━━━━━━━━┫──────────
    if (body?.toLowerCase() === "/autosticker listall") {
      let text = `꒷꒦⋅⋆⋅  Sticker ID Collection  ⋅⋆⋅꒷꒦\n\n`;
      
      stickerList.forEach((id, i) => {
        text += `  ${String(i + 1).padStart(2, "0")}  •  ${id}\n`;
      });

      text += `\n━━━━━━━━━━━━━━━━━━━\n` +
              `Total: ${stickerList.length}  𖤐`;

      return api.sendMessage(text, threadID, messageID);
    }

    // ─── Auto-reply random sticker ┣━━━━━━━━━━━━━━━┫───────────────
    if (type === "message" && attachments?.[0]?.type === "sticker") {
      const randomId = stickerList[Math.floor(Math.random() * stickerList.length)];
      
      api.sendMessage({
        sticker: randomId
      }, threadID, messageID);
    }
  }
};