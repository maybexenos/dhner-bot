<div align="center">

<img src="https://i.imgur.com/yLHpzlq.jpeg" alt="ZERO BOT Banner" width="100%" style="border-radius:16px;">

<br/>

# 𝒁𝑬𝑹𝑶 - 𝑩𝑶𝑻 🎀

### ✦ *Advanced Facebook Messenger AI Chat Bot* ✦
#### Modified & Enhanced by **SiFu** · Based on **GoatBot V2**

<br/>

![Version](https://img.shields.io/badge/Version-V2%20Advance-blueviolet?style=for-the-badge&logo=github)
![Node](https://img.shields.io/badge/Node.js-v20-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-Facebook%20Messenger-1877F2?style=for-the-badge&logo=messenger&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-ff69b4?style=for-the-badge)

<br/>

[![Stars](https://img.shields.io/github/stars/Ewr-SiFu/ZEROxGOAT-V2?style=for-the-badge&logo=github&color=f5a623&label=⭐%20Stars)](https://github.com/Ewr-SiFu/ZEROxGOAT-V2)
[![Forks](https://img.shields.io/github/forks/Ewr-SiFu/ZEROxGOAT-V2?style=for-the-badge&logo=github&color=5ca9fd&label=🍴%20Forks)](https://github.com/Ewr-SiFu/ZEROxGOAT-V2/fork)
[![Issues](https://img.shields.io/github/issues/Ewr-SiFu/ZEROxGOAT-V2?style=for-the-badge&logo=github&color=ff7043&label=🐛%20Issues)](https://github.com/Ewr-SiFu/ZEROxGOAT-V2/issues)

</div>

---

<div align="center">

## ✨ What is ZERO-BOT?

</div>

> **ZERO-BOT** is a next-generation Facebook Messenger chatbot built on the powerful **GoatBot V2** framework. It comes packed with AI-powered conversations, 300+ commands, a beautiful web dashboard for cookie management, and one-click cloud deployment support.

---

<div align="center">

## 🚀 Features

</div>

<table>
  <tr>
    <td width="50%">

### 🤖 Core Bot
- ✅ **300+ Commands** loaded at startup
- ✅ **AI Conversations** — Smart multi-model AI
- ✅ **Auto-reply system** with full customization
- ✅ **Group & DM support** for all inbox types
- ✅ **Prefix-based commands** (`😅` default)
- ✅ **Event handlers** for reactions, joins & more

</td>
    <td width="50%">

### 🌐 Web Dashboard
- ✅ **Secure Login System** — Register/Login/Logout
- ✅ **Cookie Manager** — AppState, raw, Netscape, token
- ✅ **Live Bot Reload** — No restart needed after cookie change
- ✅ **MongoDB Integration** — Group & user data persisted
- ✅ **Health Check Endpoint** at `/health`
- ✅ **Docker-ready** for Railway & Render

</td>
  </tr>
  <tr>
    <td width="50%">

### ⚡ Performance
- 🔥 **Lightning Fast** startup (under 15s)
- 🔥 **MQTT-optimized** for Facebook's protocol (mqtt@4)
- 🔥 **Auto cookie refresh** every session
- 🔥 **MQTT auto-restart** every 1 hour
- 🔥 **146+ groups**, 2800+ users supported

</td>
    <td width="50%">

### 🛡️ Security & Stability
- 🔐 **Cookie-only login** — no email/password stored
- 🔐 **Session-based auth** with bcrypt hashing
- 🔐 **Rate limiting** on web API
- 🔐 **Auto re-login** on session expiry
- 🔐 **Restart on failure** policy

</td>
  </tr>
</table>

---

<div align="center">

## ☁️ One-Click Deploy

</div>

<div align="center">

<table>
  <tr>
    <td align="center" width="200">
      <b>🚂 Railway</b><br/><br/>
      <a href="https://railway.app/new/template?template=https://github.com/Ewr-SiFu/ZEROxGOAT-V2">
        <img src="https://img.shields.io/badge/Deploy%20on%20Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white" />
      </a>
    </td>
    <td align="center" width="200">
      <b>🎨 Render</b><br/><br/>
      <a href="https://render.com/deploy?repo=https://github.com/Ewr-SiFu/ZEROxGOAT-V2">
        <img src="https://img.shields.io/badge/Deploy%20on%20Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" />
      </a>
    </td>
    <td align="center" width="200">
      <b>🟠 Replit</b><br/><br/>
      <a href="https://replit.com/github/Ewr-SiFu/ZEROxGOAT-V2">
        <img src="https://img.shields.io/badge/Deploy%20on%20Replit-F26207?style=for-the-badge&logo=replit&logoColor=white" />
      </a>
    </td>
    <td align="center" width="200">
      <b>💜 Heroku</b><br/><br/>
      <a href="https://dashboard.heroku.com/new-app?template=https://github.com/Ewr-SiFu/ZEROxGOAT-V2">
        <img src="https://img.shields.io/badge/Deploy%20on%20Heroku-430098?style=for-the-badge&logo=heroku&logoColor=white" />
      </a>
    </td>
  </tr>
</table>

</div>

---

<div align="center">

## 🔧 Setup Guide

</div>

### Step 1 — Clone the repo

```bash
git clone https://github.com/Ewr-SiFu/ZEROxGOAT-V2.git
cd ZEROxGOAT-V2
npm install
```

### Step 2 — Configure `config.json`

```json
{
  "database": {
    "uriMongodb": "mongodb+srv://YOUR_MONGO_URI"
  },
  "prefix": "😅",
  "language": "en"
}
```

### Step 3 — Add Your Facebook Cookies

Open the **web dashboard** and paste your AppState cookies:

```bash
npm run dev
# Visit: http://localhost:5000
# Register → Login → Paste cookies in Cookie Manager
```

> 💡 Supports **AppState JSON**, **Raw cookie string**, **Token**, and **Netscape** format

### Step 4 — Run the Bot

```bash
# Development
npm run dev

# Production (Docker)
docker build -t zero-bot .
docker run -p 5000:5000 zero-bot
```

---

<div align="center">

## 🌍 Environment Variables

</div>

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Optional | Overrides the URI in `config.json` |
| `SESSION_SECRET` | Recommended | Secret key for web session security |
| `PORT` | Optional | Web server port (default: `5000`) |
| `NODE_ENV` | Auto-set | `production` on cloud deploy |

---

<div align="center">

## 📁 Project Structure

</div>

```
ZEROxGOAT-V2/
├── 📂 bot/               — Bot login & script loader
├── 📂 botrunner/         — CJS-compatible bot runner
├── 📂 client/            — React web dashboard (frontend)
├── 📂 server/            — Express API server (backend)
├── 📂 scripts/cmds/      — 300+ bot commands
├── 📂 scripts/events/    — Event handlers
├── 📂 func/secrets/      — FCA-SIFU (Facebook API)
├── 📄 config.json        — Bot configuration
├── 📄 account.txt        — Facebook cookies (auto-managed)
├── 📄 Dockerfile         — Docker deployment config
├── 📄 railway.json       — Railway deploy config
└── 📄 render.yaml        — Render deploy config
```

---

<div align="center">

## 👑 Credits

</div>

<div align="center">

<table>
  <tr>
    <td align="center" width="50%">
      <img src="https://i.imgur.com/SLtCLGs.jpeg" width="80" style="border-radius:50%"><br/>
      <b>MD SIFAT</b><br/>
      <sub>Developer & Maintainer</sub><br/>
      <a href="https://www.facebook.com/maybexenos">
        <img src="https://img.shields.io/badge/Facebook-1877F2?style=flat&logo=facebook&logoColor=white" />
      </a>
      <a href="https://github.com/Ewr-SiFu">
        <img src="https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white" />
      </a>
    </td>
    <td align="center" width="50%">
      <img src="https://avatars.githubusercontent.com/u/92004954?v=4" width="80" style="border-radius:50%"><br/>
      <b>ntkhang03</b><br/>
      <sub>Original GoatBot V2 Creator</sub><br/>
      <a href="https://github.com/ntkhang03">
        <img src="https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white" />
      </a>
    </td>
  </tr>
</table>

<br/>

**Special Thanks** → *あ Team Heartless あ* 💖

</div>

---

<div align="center">

## 💬 Community & Support

[![YouTube](https://img.shields.io/badge/YouTube-Subscribe-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtube.com/@maybes1fu)
[![Facebook](https://img.shields.io/badge/Facebook-Follow-1877F2?style=for-the-badge&logo=facebook&logoColor=white)](https://www.facebook.com/profile.php?id=100087331405932)
[![FB Group](https://img.shields.io/badge/Facebook%20Group-Join-1877F2?style=for-the-badge&logo=facebook&logoColor=white)](https://facebook.com/groups/931837556457123/)
[![Messenger](https://img.shields.io/badge/Messenger%20Group-Join-0099FF?style=for-the-badge&logo=messenger&logoColor=white)](https://m.me/j/AbZyEjKlW84rxu2t/?send_source=gc%3Acopy_invite_link_c)
[![Telegram](https://img.shields.io/badge/Telegram-Join-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/Ewr-sifuh4x)

<br/>

<img src="https://count.getloli.com/get/@:Ewr-sifu?theme=gelbooru" alt="Visitor Count" />

<br/><br/>

> ⭐ **If you find this useful, please give it a star!** ⭐
>
> *Made with ❤️ by SiFu for the Messenger bot community*

<br/>

![Footer](https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer)

</div>
