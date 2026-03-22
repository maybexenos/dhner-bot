const moment = require("moment-timezone");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

async function renderTxnReceipt({ type, amount, bankBalance, userName, userID, extra = "" }) {
  const W = 1200, H = 800;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  try {
    const bg = await loadImage("https://i.postimg.cc/ryHfwpLJ/ezgif-22bfaf4827830f.jpg");
    ctx.drawImage(bg, 0, 0, W, H);
  } catch {
    const grd = ctx.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, "#ffe6f2");
    grd.addColorStop(1, "#f8e1ff");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
  }

  ctx.fillStyle = "rgba(255, 182, 193, 0.65)";
  ctx.fillRect(0, 0, W, H);

  const cardX = 80, cardY = 60, cardW = W - 160, cardH = H - 120, radius = 38;
  ctx.save();
  ctx.shadowColor = "rgba(255,105,180,0.4)";
  ctx.shadowBlur = 35;
  ctx.shadowOffsetX = 8;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = "#ffffff";
  ctx.roundRect(cardX, cardY, cardW, cardH, radius);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = "#ff9ec1";
  ctx.lineWidth = 4;
  ctx.setLineDash([6, 12]);
  ctx.strokeRect(cardX + 10, cardY + 10, cardW - 20, cardH - 20);
  ctx.setLineDash([]);

  ctx.fillStyle = "#ff85c0";
  ctx.globalAlpha = 0.7;
  for (let i = 0; i < 12; i++) {
    const x = cardX + Math.random() * cardW;
    const y = cardY + Math.random() * cardH;
    const size = 12 + Math.random() * 18;
    ctx.font = `${size}px Segoe UI Emoji`;
    ctx.fillText("♡", x, y);
  }
  ctx.globalAlpha = 1;

  try {
    const mark = await loadImage("https://i.postimg.cc/288zFmcg/shizuka-photo-5233.jpg");
    ctx.globalAlpha = 0.06;
    const mw = cardW * 0.65;
    const mh = mw * (mark.height / mark.width);
    ctx.drawImage(mark, cardX + (cardW - mw)/2, cardY + (cardH - mh)/2, mw, mh);
    ctx.globalAlpha = 1;
  } catch {}

  ctx.fillStyle = "#ff3f93";
  ctx.beginPath();
  ctx.moveTo(cardX, cardY + 30);
  ctx.lineTo(cardX + cardW, cardY + 30);
  ctx.lineTo(cardX + cardW - 40, cardY + 90);
  ctx.lineTo(cardX + 40, cardY + 90);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 48px 'Comic Sans MS', cursive, fantasy";
  ctx.textAlign = "center";
  ctx.fillText("Shizuka Bank  ˚୨୧⋆｡", cardX + cardW/2, cardY + 75);

  ctx.font = "italic 22px Arial";
  ctx.fillText(moment().tz("Asia/Dhaka").format("YYYY-MM-DD  •  HH:mm:ss"), cardX + cardW/2, cardY + 110);

  const titleGrd = ctx.createLinearGradient(cardX + cardW/2 - 200, 0, cardX + cardW/2 + 200, 0);
  titleGrd.addColorStop(0, "#ff1493");
  titleGrd.addColorStop(1, "#db7093");
  ctx.fillStyle = titleGrd;
  ctx.font = "bold 64px 'Segoe UI', sans-serif";
  ctx.fillText(`${type} ${extra ? extra : "Receipt"} ♡`, cardX + cardW/2, cardY + 190);

  const sx = cardX + 80, sy = cardY + 260, lh = 60;
  ctx.textAlign = "left";
  ctx.fillStyle = "#2d0b1e";
  ctx.font = "bold 32px Arial";
  ["Account Holder", "Account ID", "Amount", "Current Balance"].forEach((label, i) => {
    ctx.fillText(label, sx, sy + i * lh);
  });

  ctx.textAlign = "right";
  ctx.fillStyle = "#4a148c";
  ctx.font = "28px Arial";
  ctx.fillText(userName, cardX + cardW - 80, sy);
  ctx.fillText(userID.toString(), cardX + cardW - 80, sy + lh);

  ctx.font = "bold 38px Arial";
  ctx.fillStyle = type.includes("Deposit") || type.includes("Received") || type.includes("Daily") || type.includes("Level") ? "#2e7d32" : "#c62828";
  ctx.fillText(`$${amount.toLocaleString("en-US")}`, cardX + cardW - 80, sy + lh * 2);

  ctx.font = "28px Arial";
  ctx.fillStyle = "#4a148c";
  ctx.fillText(`$${bankBalance.toLocaleString("en-US")}`, cardX + cardW - 80, sy + lh * 3);

  try {
    const id = "SB-" + Date.now().toString(36).toUpperCase().slice(-8);
    const qr = await loadImage(`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(type + " | UID:" + userID + " | TXN:" + id)}`);
    ctx.drawImage(qr, cardX + 100, cardY + cardH - 220, 160, 160);
  } catch {}

  ctx.beginPath();
  ctx.arc(cardX + cardW - 160, cardY + cardH - 140, 50, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 64, 129, 0.18)";
  ctx.fill();
  ctx.strokeStyle = "#ff4081";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = "#ff4081";
  ctx.font = "bold 24px Arial";
  ctx.textAlign = "center";
  ctx.fillText("SHIZUKA ♡", cardX + cardW - 160, cardY + cardH - 130);

  return canvas.toBuffer("image/png");
}

// Loan receipt function (red theme)
async function renderLoanReceipt({ type, amount, remainingLoan, userName, userID }) {
  const W = 1200, H = 820;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  try {
    const bg = await loadImage("https://i.postimg.cc/ryHfwpLJ/ezgif-22bfaf4827830f.jpg");
    ctx.drawImage(bg, 0, 0, W, H);
  } catch {
    const grd = ctx.createLinearGradient(0, 0, W, H);
    grd.addColorStop(0, "#ffe0e9");
    grd.addColorStop(1, "#f8d7ff");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.fillStyle = "rgba(255, 105, 180, 0.55)";
  ctx.fillRect(0, 0, W, H);

  const cardX = 70, cardY = 55, cardW = W - 140, cardH = H - 110, radius = 42;
  ctx.save();
  ctx.shadowColor = "rgba(199, 21, 133, 0.5)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 15;
  ctx.fillStyle = "#fff0f5";
  ctx.roundRect(cardX, cardY, cardW, cardH, radius);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = "#db2777";
  ctx.lineWidth = 5;
  ctx.setLineDash([8, 14]);
  ctx.strokeRect(cardX + 12, cardY + 12, cardW - 24, cardH - 24);
  ctx.setLineDash([]);

  ctx.globalAlpha = 0.75;
  ctx.fillStyle = "#e11d48";
  for (let i = 0; i < 10; i++) {
    const x = cardX + 30 + Math.random() * (cardW - 60);
    const y = cardY + 80 + Math.random() * (cardH - 160);
    ctx.font = `${18 + Math.random() * 22}px Segoe UI Emoji`;
    ctx.fillText("💔", x, y);
  }
  ctx.globalAlpha = 1;

  try {
    const mark = await loadImage("https://i.postimg.cc/288zFmcg/shizuka-photo-5233.jpg");
    ctx.globalAlpha = 0.07;
    const mw = cardW * 0.62;
    const mh = mw * (mark.height / mark.width);
    ctx.drawImage(mark, cardX + (cardW - mw)/2, cardY + (cardH - mh)/2 - 20, mw, mh);
    ctx.globalAlpha = 1;
  } catch {}

  ctx.fillStyle = "#e11d48";
  ctx.beginPath();
  ctx.moveTo(cardX, cardY + 35);
  ctx.lineTo(cardX + cardW, cardY + 35);
  ctx.lineTo(cardX + cardW - 45, cardY + 95);
  ctx.lineTo(cardX + 45, cardY + 95);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 52px 'Comic Sans MS', cursive";
  ctx.textAlign = "center";
  ctx.fillText(type === "Loan Taken" ? "LOAN APPROVED 💸" : "LOAN REPAYMENT ♡", cardX + cardW/2, cardY + 78);

  ctx.font = "20px Arial";
  ctx.fillText(moment().tz("Asia/Dhaka").format("YYYY-MM-DD  •  HH:mm:ss"), cardX + cardW/2, cardY + 118);

  ctx.fillStyle = "#9f1239";
  ctx.font = "bold 68px Arial";
  ctx.fillText(type, cardX + cardW/2, cardY + 205);

  const sx = cardX + 90, sy = cardY + 280, lh = 62;
  ctx.textAlign = "left";
  ctx.fillStyle = "#4c1d95";
  ctx.font = "bold 34px Arial";
  ctx.fillText("Account Holder", sx, sy);
  ctx.fillText("Account ID", sx, sy + lh);
  ctx.fillText(type === "Loan Taken" ? "Loan Amount" : "Repaid Amount", sx, sy + lh * 2);
  ctx.fillText("Remaining Loan", sx, sy + lh * 3);

  ctx.textAlign = "right";
  ctx.fillStyle = "#1e3a8a";
  ctx.font = "29px Arial";
  ctx.fillText(userName, cardX + cardW - 90, sy);
  ctx.fillText(userID.toString(), cardX + cardW - 90, sy + lh);

  ctx.font = "bold 42px Arial";
  ctx.fillStyle = "#e11d48";
  ctx.fillText(`$${amount.toLocaleString("en-US")}`, cardX + cardW - 90, sy + lh * 2);

  ctx.font = "bold 38px Arial";
  ctx.fillStyle = remainingLoan > 0 ? "#b91c1c" : "#15803d";
  ctx.fillText(`$${remainingLoan.toLocaleString("en-US")}`, cardX + cardW - 90, sy + lh * 3);

  ctx.fillStyle = "#9f1239";
  ctx.font = "bold 26px Arial";
  ctx.fillText("⚠️ Daily penalty $5,000 until fully repaid", cardX + cardW/2, sy + lh * 4.2);

  try {
    const id = "LOAN-" + Date.now().toString(36).toUpperCase().slice(-8);
    const qr = await loadImage(`https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=LOAN|UID:${userID}|REM:${remainingLoan}`);
    ctx.drawImage(qr, cardX + 110, cardY + cardH - 210, 155, 155);
  } catch {}

  ctx.beginPath();
  ctx.arc(cardX + cardW - 155, cardY + cardH - 135, 52, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(225, 29, 72, 0.2)";
  ctx.fill();
  ctx.strokeStyle = "#e11d48";
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.fillStyle = "#e11d48";
  ctx.font = "bold 26px Arial";
  ctx.textAlign = "center";
  ctx.fillText("SHIZUKA", cardX + cardW - 155, cardY + cardH - 125);
  ctx.fillText("LOAN", cardX + cardW - 155, cardY + cardH - 98);

  return canvas.toBuffer("image/png");
}

async function renderBankTopLeaderboard(topUsers) {
  const W = 1000, H = 900 + topUsers.length * 60;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  const grd = ctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, "#fff0f5");
  grd.addColorStop(1, "#f8e1ff");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "rgba(255, 182, 193, 0.6)";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#ff3f93";
  ctx.fillRect(80, 60, W - 160, 140);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 58px 'Comic Sans MS', cursive";
  ctx.textAlign = "center";
  ctx.fillText("Shizuka Bank Top 10 ♡", W / 2, 140);

  ctx.font = "italic 28px Arial";
  ctx.fillText("Richest Bankers ૮₍ ˶•⤙•˶ ₎ა", W / 2, 190);

  const startY = 240;
  topUsers.forEach((user, i) => {
    const rankY = startY + i * 65;
    const rank = i + 1;

    ctx.fillStyle = rank === 1 ? "#ffd700" : rank === 2 ? "#c0c0c0" : rank === 3 ? "#cd7f32" : "#e0e0e0";
    ctx.beginPath();
    ctx.arc(140, rankY + 30, 45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 42px Arial";
    ctx.textAlign = "center";
    ctx.fillText(rank, 140, rankY + 48);

    if (rank === 1) {
      ctx.font = "40px Segoe UI Emoji";
      ctx.fillText("👑", 140, rankY + 10);
    }

    ctx.textAlign = "left";
    ctx.fillStyle = "#4a148c";
    ctx.font = "bold 34px Arial";
    ctx.fillText(user.name || user.userID, 220, rankY + 35);

    ctx.font = "28px Arial";
    ctx.fillText(`$${user.bankBalance.toLocaleString("en-US")}`, 220, rankY + 70);

    ctx.strokeStyle = "#ff9ec1";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, rankY + 85);
    ctx.lineTo(W - 100, rankY + 85);
    ctx.stroke();
  });

  ctx.fillStyle = "#ff4081";
  ctx.font = "italic 24px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Updated: " + moment().tz("Asia/Dhaka").format("DD/MM/YYYY HH:mm"), W / 2, H - 40);

  return canvas.toBuffer("image/png");
}

async function renderTotalBalanceCard({ userName, userID, wallet, bank, loan, netTotal }) {
  const W = 1100, H = 780;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  try {
    const bg = await loadImage("https://i.postimg.cc/ryHfwpLJ/ezgif-22bfaf4827830f.jpg");
    ctx.drawImage(bg, 0, 0, W, H);
  } catch {
    const grd = ctx.createLinearGradient(0, 0, W, H);
    grd.addColorStop(0, "#f9e6f0");
    grd.addColorStop(1, "#e6d9ff");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
  }

  ctx.fillStyle = "rgba(255, 105, 180, 0.5)";
  ctx.fillRect(0, 0, W, H);

  const cardX = 70, cardY = 50, cardW = W - 140, cardH = H - 100, radius = 40;
  ctx.save();
  ctx.shadowColor = "rgba(219, 39, 119, 0.45)";
  ctx.shadowBlur = 38;
  ctx.shadowOffsetY = 14;
  ctx.fillStyle = "#ffffff";
  ctx.roundRect(cardX, cardY, cardW, cardH, radius);
  ctx.fill();
  ctx.restore();

  ctx.globalAlpha = 0.8;
  ctx.fillStyle = "#ff85c0";
  for (let i = 0; i < 8; i++) {
    const x = cardX + 50 + Math.random() * (cardW - 100);
    const y = cardY + 100 + Math.random() * (cardH - 200);
    ctx.font = `${20 + Math.random() * 25}px Segoe UI Emoji`;
    ctx.fillText("✧", x, y);
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = "#ff3f93";
  ctx.fillRect(cardX, cardY + 20, cardW, 100);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 52px 'Comic Sans MS', cursive";
  ctx.textAlign = "center";
  ctx.fillText("Total Net Worth ♡", cardX + cardW / 2, cardY + 85);

  ctx.font = "24px Arial";
  ctx.fillText(userName, cardX + cardW / 2, cardY + 130);

  const sx = cardX + 100, sy = cardY + 220, lh = 70;
  ctx.textAlign = "left";
  ctx.fillStyle = "#111827";
  ctx.font = "bold 36px Arial";

  ctx.fillText("Wallet Balance", sx, sy);
  ctx.fillText("Bank Balance", sx, sy + lh);
  ctx.fillText("Outstanding Loan", sx, sy + lh * 2);
  ctx.fillText("Net Total", sx, sy + lh * 3.5);

  ctx.textAlign = "right";
  ctx.font = "32px Arial";
  ctx.fillStyle = "#374151";
  ctx.fillText(`$${wallet.toLocaleString("en-US")}`, cardX + cardW - 100, sy);
  ctx.fillText(`$${bank.toLocaleString("en-US")}`, cardX + cardW - 100, sy + lh);

  ctx.fillStyle = loan > 0 ? "#dc2626" : "#059669";
  ctx.fillText(`$${loan.toLocaleString("en-US")}`, cardX + cardW - 100, sy + lh * 2);

  ctx.font = "bold 44px Arial";
  ctx.fillStyle = netTotal >= 0 ? "#7c3aed" : "#b91c1c";
  ctx.fillText(`$${netTotal.toLocaleString("en-US")}`, cardX + cardW - 100, sy + lh * 3.5);

  ctx.beginPath();
  ctx.arc(cardX + cardW - 140, cardY + cardH - 120, 48, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 64, 129, 0.2)";
  ctx.fill();
  ctx.strokeStyle = "#ff4081";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = "#ff4081";
  ctx.font = "bold 24px Arial";
  ctx.textAlign = "center";
  ctx.fillText("SHIZUKA", cardX + cardW - 140, cardY + cardH - 110);
  ctx.fillText("NET", cardX + cardW - 140, cardY + cardH - 80);

  return canvas.toBuffer("image/png");
}

async function renderDailyReceipt({ interest, bonus, total, bankBalance, userName, userID }) {
  return renderTxnReceipt({
    type: "Daily Reward",
    amount: total,
    bankBalance,
    userName,
    userID,
    extra: "(Interest + Bonus)"
  });
}

async function renderLevelUpReceipt({ level, bankBalance, userName, userID }) {
  return renderTxnReceipt({
    type: "Level Up",
    amount: level,
    bankBalance,
    userName,
    userID,
    extra: "Congratulations!"
  });
}

async function renderTransferReceipt({ type, amount, targetName, bankBalance, userName, userID }) {
  return renderTxnReceipt({
    type,
    amount,
    bankBalance,
    userName,
    userID,
    extra: type.includes("Sent") ? `to ${targetName}` : `from ${targetName}`
  });
}

async function renderHistoryReceipt(transactions, userName, userID) {
  const W = 1000, H = 800 + transactions.length * 45;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#fff0f5";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#ff3f93";
  ctx.font = "bold 48px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Transaction History ♡", W/2, 80);

  ctx.font = "24px Arial";
  ctx.fillText(userName, W/2, 130);

  let y = 180;
  transactions.forEach(t => {
    ctx.fillStyle = "#4a148c";
    ctx.font = "22px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`${t.date}  •  $${t.amount.toLocaleString()}  •  ${t.desc}`, 80, y);
    y += 45;
  });

  return canvas.toBuffer("image/png");
}

module.exports = {
  config: {
    name: "bank",
    aliases: ["b", "sb", "rin", "loan"],
    version: "3.2",
    author: "S1FU",
    countDown: 5,
    role: 0,
    description: { en: "Shizuka Bank • Full Kawaii Economy System" },
    category: "BANK",
    guide: {
      en: `bank deposit <amount>
bank withdraw <amount>
bank loan <amount>
bank repay <amount>
bank daily
bank levelup
bank balance
bank total / net
bank top / leaderboard
bank history
bank transfer @tag <amount>`
    }
  },

  langs: {
    en: {
      depositSuccess: "✧ Deposited $%1! ♡",
      withdrawSuccess: "✧ Withdrew $%1! ♡",
      loanSuccess: "💸 Loan approved! +$%1 in wallet",
      repaySuccess: "♡ Repaid $%1! Remaining: $%2",
      transferSuccess: "💌 Sent $%1 to %2!",
      transferReceived: "💕 Received $%1 from %2!",
      noLoan: "No active loan~",
      maxLoanLimit: "Max loan: $%1 (Lv %2)",
      insufficientForRepay: "Not enough in wallet!",
      dailyPenaltyApplied: "⚠️ $5,000 loan penalty deducted!",
      dailyClaimed: "✧ Interest: $%1  |  Bonus: $%2  →  Total: $%3 ♡",
      alreadyClaimed: "Already claimed today~",
      levelUpSuccess: "୨୧ Level up to %1! ♡",
      notEnoughForLevel: "Need $%1 more~",
      levelMax: "Max level reached~ ♡",
      noTransactions: "No history yet~ ♡",
      invalidAmount: "Invalid amount!",
      insufficientFunds: "Not enough money!",
      userNotFound: "User not found!",
      cannotTransferSelf: "Cannot transfer to yourself!"
    }
  },

  onStart: async function ({ message, args, event, usersData, getLang, api }) {
    if (this.config.author !== "S1FU") {
      return message.reply("⛔ Command locked! Author must be S1FU");
    }

    const { senderID, mentions } = event;
    let economy = await usersData.get(senderID, "data.economy") || {
      bankBalance: 0,
      loanAmount: 0,
      lastLoanPenaltyDate: "",
      lastDaily: "",
      transactions: [],
      bankLevel: 1
    };

    let userMoney = await usersData.get(senderID, "money") || 0;
    const action = args[0]?.toLowerCase() || "";

    const today = moment().tz("Asia/Dhaka").format("YYYY-MM-DD");
    const interestRate = 0.008 + (economy.bankLevel - 1) * 0.004;
    const maxLoan = economy.bankLevel * 75000;

    // Daily loan penalty
    if (economy.loanAmount > 0 && economy.lastLoanPenaltyDate !== today) {
      const penalty = Math.min(5000, userMoney);
      if (penalty > 0) {
        userMoney -= penalty;
        await usersData.set(senderID, { money: userMoney });
        economy.transactions.unshift({
          type: "loan_penalty",
          amount: penalty,
          date: moment().tz("Asia/Dhaka").format("DD/MM/YY • HH:mm"),
          desc: "Daily Loan Penalty"
        });
        if (economy.transactions.length > 25) economy.transactions.pop();
      }
      economy.lastLoanPenaltyDate = today;
      await usersData.set(senderID, economy, "data.economy");
      if (penalty > 0) message.reply(getLang("dailyPenaltyApplied"));
    }

    switch (action) {
      case "deposit":
      case "d": {
        const amt = parseInt(args[1]);
        if (!amt || amt <= 0) return message.reply(getLang("invalidAmount"));
        if (amt > userMoney) return message.reply(getLang("insufficientFunds"));

        userMoney -= amt;
        economy.bankBalance += amt;
        await usersData.set(senderID, { money: userMoney });
        await usersData.set(senderID, economy, "data.economy");

        economy.transactions.unshift({
          type: "deposit",
          amount: amt,
          date: moment().tz("Asia/Dhaka").format("DD/MM/YY • HH:mm"),
          desc: "Deposit"
        });
        if (economy.transactions.length > 25) economy.transactions.pop();
        await usersData.set(senderID, economy.transactions, "data.economy.transactions");

        const name = await usersData.getName(senderID) || senderID;
        const buf = await renderTxnReceipt({ type: "Deposit", amount: amt, bankBalance: economy.bankBalance, userName: name, userID: senderID });

        const file = `${__dirname}/cache/deposit_${senderID}.png`;
        await fs.writeFile(file, buf);
        await message.reply({ body: getLang("depositSuccess", amt.toLocaleString()), attachment: fs.createReadStream(file) });
        fs.unlink(file, () => {});
        break;
      }

      case "withdraw":
      case "w": {
        const amt = parseInt(args[1]);
        if (!amt || amt <= 0) return message.reply(getLang("invalidAmount"));
        if (amt > economy.bankBalance) return message.reply("Not enough in bank!");

        userMoney += amt;
        economy.bankBalance -= amt;
        await usersData.set(senderID, { money: userMoney });
        await usersData.set(senderID, economy, "data.economy");

        economy.transactions.unshift({
          type: "withdraw",
          amount: amt,
          date: moment().tz("Asia/Dhaka").format("DD/MM/YY • HH:mm"),
          desc: "Withdrawal"
        });
        if (economy.transactions.length > 25) economy.transactions.pop();
        await usersData.set(senderID, economy.transactions, "data.economy.transactions");

        const name = await usersData.getName(senderID) || senderID;
        const buf = await renderTxnReceipt({ type: "Withdrawal", amount: amt, bankBalance: economy.bankBalance, userName: name, userID: senderID });

        const file = `${__dirname}/cache/withdraw_${senderID}.png`;
        await fs.writeFile(file, buf);
        await message.reply({ body: getLang("withdrawSuccess", amt.toLocaleString()), attachment: fs.createReadStream(file) });
        fs.unlink(file, () => {});
        break;
      }

      case "loan":
      case "l":
      case "rin": {
        const amt = parseInt(args[1]);
        if (!amt || amt <= 0) return message.reply(getLang("invalidAmount"));

        if ((economy.loanAmount || 0) + amt > maxLoan) {
          return message.reply(getLang("maxLoanLimit", maxLoan.toLocaleString(), economy.bankLevel));
        }

        userMoney += amt;
        economy.loanAmount = (economy.loanAmount || 0) + amt;
        await usersData.set(senderID, { money: userMoney });
        await usersData.set(senderID, economy, "data.economy");

        economy.transactions.unshift({
          type: "loan_taken",
          amount: amt,
          date: moment().tz("Asia/Dhaka").format("DD/MM/YY • HH:mm"),
          desc: "Loan Taken"
        });
        if (economy.transactions.length > 25) economy.transactions.pop();
        await usersData.set(senderID, economy.transactions, "data.economy.transactions");

        const name = await usersData.getName(senderID) || senderID;
        const buf = await renderLoanReceipt({ type: "Loan Taken", amount: amt, remainingLoan: economy.loanAmount, userName: name, userID: senderID });

        const file = `${__dirname}/cache/loan_${senderID}.png`;
        await fs.writeFile(file, buf);
        await message.reply({ body: getLang("loanSuccess", amt.toLocaleString()), attachment: fs.createReadStream(file) });
        fs.unlink(file, () => {});
        break;
      }

      case "repay":
      case "r":
      case "porishod": {
        let amt = parseInt(args[1]);
        if (!amt || amt <= 0) return message.reply(getLang("invalidAmount"));

        const currentLoan = economy.loanAmount || 0;
        if (currentLoan === 0) return message.reply(getLang("noLoan"));
        if (amt > currentLoan) amt = currentLoan;
        if (amt > userMoney) return message.reply(getLang("insufficientForRepay"));

        userMoney -= amt;
        economy.loanAmount -= amt;
        await usersData.set(senderID, { money: userMoney });
        await usersData.set(senderID, economy, "data.economy");

        economy.transactions.unshift({
          type: "loan_repaid",
          amount: amt,
          date: moment().tz("Asia/Dhaka").format("DD/MM/YY • HH:mm"),
          desc: "Loan Repaid"
        });
        if (economy.transactions.length > 25) economy.transactions.pop();
        await usersData.set(senderID, economy.transactions, "data.economy.transactions");

        const name = await usersData.getName(senderID) || senderID;
        const buf = await renderLoanReceipt({ type: "Loan Repaid", amount: amt, remainingLoan: economy.loanAmount, userName: name, userID: senderID });

        const file = `${__dirname}/cache/repay_${senderID}.png`;
        await fs.writeFile(file, buf);
        await message.reply({ body: getLang("repaySuccess", amt.toLocaleString(), economy.loanAmount.toLocaleString()), attachment: fs.createReadStream(file) });
        fs.unlink(file, () => {});
        break;
      }

      case "daily": {
        if (economy.lastDaily === today) return message.reply(getLang("alreadyClaimed"));

        const interest = Math.floor(economy.bankBalance * interestRate);
        const bonus = 100 + economy.bankLevel * 60;
        const total = interest + bonus;

        economy.bankBalance += total;
        economy.lastDaily = today;
        await usersData.set(senderID, economy, "data.economy");

        economy.transactions.unshift({
          type: "daily_reward",
          amount: total,
          date: moment().tz("Asia/Dhaka").format("DD/MM/YY • HH:mm"),
          desc: "Daily Reward"
        });
        if (economy.transactions.length > 25) economy.transactions.pop();
        await usersData.set(senderID, economy.transactions, "data.economy.transactions");

        const name = await usersData.getName(senderID) || senderID;
        const buf = await renderDailyReceipt({ interest, bonus, total, bankBalance: economy.bankBalance, userName: name, userID: senderID });

        const file = `${__dirname}/cache/daily_${senderID}.png`;
        await fs.writeFile(file, buf);
        await message.reply({ body: getLang("dailyClaimed", interest.toLocaleString(), bonus.toLocaleString(), total.toLocaleString()), attachment: fs.createReadStream(file) });
        fs.unlink(file, () => {});
        break;
      }

      case "levelup": {
        const cost = economy.bankLevel * 25000;
        if (economy.bankBalance < cost) return message.reply(getLang("notEnoughForLevel", (cost - economy.bankBalance).toLocaleString()));
        if (economy.bankLevel >= 10) return message.reply(getLang("levelMax"));

        economy.bankBalance -= cost;
        economy.bankLevel += 1;
        await usersData.set(senderID, economy, "data.economy");

        const name = await usersData.getName(senderID) || senderID;
        const buf = await renderLevelUpReceipt({ level: economy.bankLevel, bankBalance: economy.bankBalance, userName: name, userID: senderID });

        const file = `${__dirname}/cache/levelup_${senderID}.png`;
        await fs.writeFile(file, buf);
        await message.reply({ body: getLang("levelUpSuccess", economy.bankLevel), attachment: fs.createReadStream(file) });
        fs.unlink(file, () => {});
        break;
      }

      case "transfer":
      case "t": {
        const amt = parseInt(args[args.length - 1]);
        if (!amt || amt <= 0) return message.reply(getLang("invalidAmount"));

        const targetID = Object.keys(mentions)[0];
        if (!targetID || targetID === senderID) return message.reply(getLang("cannotTransferSelf"));
        if (amt > userMoney) return message.reply(getLang("insufficientFunds"));

        const targetData = await usersData.get(targetID);
        if (!targetData) return message.reply(getLang("userNotFound"));

        userMoney -= amt;
        targetData.money = (targetData.money || 0) + amt;

        await usersData.set(senderID, { money: userMoney });
        await usersData.set(targetID, { money: targetData.money });

        const targetName = await usersData.getName(targetID) || targetID;
        const senderName = await usersData.getName(senderID) || senderID;

        economy.transactions.unshift({
          type: "transfer_sent",
          amount: amt,
          date: moment().tz("Asia/Dhaka").format("DD/MM/YY • HH:mm"),
          desc: `Sent to ${targetName}`
        });
        if (economy.transactions.length > 25) economy.transactions.pop();
        await usersData.set(senderID, economy.transactions, "data.economy.transactions");

        const buf = await renderTransferReceipt({
          type: "Transfer Sent",
          amount: amt,
          targetName,
          bankBalance: economy.bankBalance,
          userName: senderName,
          userID: senderID
        });

        const file = `${__dirname}/cache/transfer_${senderID}.png`;
        await fs.writeFile(file, buf);
        await message.reply({
          body: getLang("transferSuccess", amt.toLocaleString(), targetName),
          attachment: fs.createReadStream(file)
        });
        fs.unlink(file, () => {});

        break;
      }

      case "balance":
      case "b": {
        const estimated = Math.floor(economy.bankBalance * interestRate);
        const name = await usersData.getName(senderID) || senderID;

        message.reply(
          `✿ Shizuka Bank ✿\n\n` +
          `Hi ${name} ♡\n` +
          `Wallet ⋆ $${userMoney.toLocaleString()}\n` +
          `Bank   ⋆ $${economy.bankBalance.toLocaleString()} (Lv.${economy.bankLevel})\n` +
          `Daily Interest ⋆ ~$${estimated.toLocaleString()} (${(interestRate * 100).toFixed(2)}%)\n` +
          (economy.loanAmount > 0 ? `Loan   ⋆ $${economy.loanAmount.toLocaleString()} ⚠️\n` : "") +
          `Max Loan ⋆ $${maxLoan.toLocaleString()}`
        );
        break;
      }

      case "total":
      case "net":
      case "allbalance": {
        const wallet = userMoney;
        const bank = economy.bankBalance || 0;
        const loan = economy.loanAmount || 0;
        const net = wallet + bank - loan;
        const estimated = Math.floor(bank * interestRate);

        const name = await usersData.getName(senderID) || senderID;
        const buf = await renderTotalBalanceCard({
          userName: name,
          userID: senderID,
          wallet,
          bank,
          loan,
          netTotal: net
        });

        const file = `${__dirname}/cache/total_${senderID}.png`;
        await fs.writeFile(file, buf);

        await message.reply({
          body: `Net Worth: $${net.toLocaleString()} ${net >= 0 ? "♡" : "⚠️"}\nDaily interest preview: ~$${estimated.toLocaleString()} (${(interestRate * 100).toFixed(2)}%)`,
          attachment: fs.createReadStream(file)
        });
        fs.unlink(file, () => {});
        break;
      }

      case "top":
      case "leaderboard":
      case "rich":
      case "top10": {
        const allData = await usersData.getAll();
        const richList = [];

        for (const [uid, data] of Object.entries(allData)) {
          const eco = data.data?.economy || {};
          const bal = eco.bankBalance || 0;
          if (bal > 0) {
            const name = await usersData.getName(uid) || uid;
            richList.push({ userID: uid, name, bankBalance: bal });
          }
        }

        richList.sort((a, b) => b.bankBalance - a.bankBalance);
        const top10 = richList.slice(0, 10);

        if (top10.length === 0) return message.reply("No one has bank money yet~ ♡");

        const buf = await renderBankTopLeaderboard(top10);

        const file = `${__dirname}/cache/top_${Date.now()}.png`;
        await fs.writeFile(file, buf);
        await message.reply({
          body: "✦ Richest Bank Members ✦",
          attachment: fs.createReadStream(file)
        });
        fs.unlink(file, () => {});
        break;
      }

      case "history":
      case "h": {
        if (!economy.transactions?.length) return message.reply(getLang("noTransactions"));

        const name = await usersData.getName(senderID) || senderID;
        const buf = await renderHistoryReceipt(
          economy.transactions.slice(0, 15),
          name,
          senderID
        );

        const file = `${__dirname}/cache/history_${senderID}.png`;
        await fs.writeFile(file, buf);
        await message.reply({
          body: "✦ Your Transaction History ✦",
          attachment: fs.createReadStream(file)
        });
        fs.unlink(file, () => {});
        break;
      }

      default: {
        const name = await usersData.getName(senderID) || "cutie";
        const loan = economy.loanAmount || 0;
        const estimated = Math.floor(economy.bankBalance * interestRate);

        message.reply(
          `✿ Shizuka Bank ✿\n\n` +
          `Hi ${name} ♡\n` +
          `Wallet ⋆ $${userMoney.toLocaleString()}\n` +
          `Bank   ⋆ $${economy.bankBalance.toLocaleString()} (Lv.${economy.bankLevel})\n` +
          `Daily Interest ⋆ ~$${estimated.toLocaleString()} (${(interestRate * 100).toFixed(2)}%)\n` +
          (loan > 0 ? `Loan   ⋆ $${loan.toLocaleString()} ⚠️\n` : "") +
          `Max Loan ⋆ $${maxLoan.toLocaleString()}\n\n` +
          `Commands:\n` +
          `→ deposit / withdraw\n` +
          `→ loan / repay\n` +
          `→ daily / levelup\n` +
          `→ balance / total / top / history\n` +
          `→ transfer @tag <amount>`
        );
        break;
      }
    }
  }
};