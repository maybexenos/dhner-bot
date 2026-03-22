<div align="center">

<img src="https://i.imgur.com/s7WMgv2.jpeg">

## Advanced Facebook Chat API

***Reliable · Real-time***


<div/>


---
<div align="center">

 **╔───━「*Credits*」━───╗**

 **┆Tєαᴍ ☣︎ нєαятℓєѕѕ┆**
 **═━──────━═**
 <div align="center">
  
 ***乛 Xꫀᥒos ゎ***
 ***乛 S1FU ゎ***
 
 **╚═━─────────━═╝**
 
---

[![Version](https://img.shields.io/npm/v/fca-sifu?style=for-the-badge&logo=npm&logoColor=white&color=cb3837)](https://www.npmjs.com/package/fca-sifu)
[![Downloads](https://img.shields.io/npm/dm/fca-sifu?style=for-the-badge&logo=npm&logoColor=white&color=ff6b6b)](https://www.npmjs.com/package/fca-sifu)
[![License](https://img.shields.io/badge/License-MIT-4ade80?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![GitHub Stars](https://img.shields.io/github/stars/ewr-sifu/FCA-SIFU?style=for-the-badge&logo=github&logoColor=white&color=f59e0b)](https://github.com/ewr-sifu/FCA-SIFU)
[![GitHub Issues](https://img.shields.io/github/issues/ewr-sifu/FCA-SIFU?style=for-the-badge&logo=github&logoColor=white&color=ef4444)](https://github.com/ewr-sifu/FCA-SIFU/issues)

<br/>

> **FCA-SIFU**
> ***is a powerful, production-grade Facebook Chat API client engineered for bot developers who demand stability, speed, and stealth. Built from the ground up with anti-suspension intelligence, MQTT real-time messaging, and a clean modular architecture.***

<br/>

**Developed & Maintained by [S1FU](https://github.com/ewr-sifu)**  
*Inspired by ws3-fca • fca-priyansh • fca-unofficial • kex-fca *

</div>

---

## Table of Contents

- [Why FCA-SIFU?](#-why-fca-sifu)
- [Features](#-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [Anti-Suspension System](#-anti-suspension-system)
- [End-to-End Encryption](#-end-to-end-encryption)
- [API Reference](#-api-reference)
- [Examples](#-examples)
- [Security Warning](#-security-warning)
- [Credits](#-credits)
- [License](#-license)

---

## Why FCA-SIFU?

| Feature | FCA-SIFU | Other FCA Forks |
|---|:---:|:---:|
| Anti-Suspension Circuit Breaker | ✅ | ❌ |
| MQTT + HTTP Dual Protocol | ✅ | Partial |
| Session Fingerprint Locking | ✅ | ❌ |
| Application-Layer E2EE (X25519) | ✅ | ❌ |
| AI Theme Generation | ✅ | ❌ |
| Production Health Monitor | ✅ | ❌ |
| Sliding-Window Rate Limiter | ✅ | ❌ |
| Auto Token Refresh | ✅ | ❌ |
| SQLite-Backed Cache | ✅ | ❌ |
| Warmup Mode for Fresh Sessions | ✅ | ❌ |

---

## Features

<details>
<summary><b>Authentication & Session Management</b></summary>

- Cookie array login (`appState`) — safest method for long-running bots
- Email/password login with TOTP/2FA support
- Session fingerprint locking — User-Agent, Sec-Ch-Ua, locale, timezone locked per session
- AppState auto-backup and restore on restart
- TokenRefreshManager with randomized intervals to keep sessions alive

</details>

<details>
<summary><b>Real-time Messaging</b></summary>

- MQTT and HTTP messaging with automatic protocol fallback
- Send text, attachments, stickers, emoji, mentions, and location
- Message editing, unsend, forward, and delete
- Message reactions via HTTP and MQTT
- Pin/unpin messages, list pinned messages
- Humanized typing simulation before every send

</details>

<details>
<summary><b>Anti-Suspension Intelligence</b></summary>

- **Circuit Breaker** — halts activity after repeated suspension signals, resumes after cooldown
- **60+ suspension signal patterns** — checkpoints, spam flags, rate limits, identity verification, policy violations, session expiry, and more
- Adaptive per-thread delay that increases with session volume
- Hourly and daily message volume limits with automatic warning pauses
- Warmup mode for fresh sessions — gradually increases allowed message rate
- PostSafe guard — detects auth failures and checkpoint responses in real-time
- MQTT watchdog — detects stale connections and forces clean reconnect

</details>

<details>
<summary><b>Thread & Group Management</b></summary>

- Get thread info, history, pictures, and lists
- Create groups, add/remove members, change admin status
- Update group image, name, color, emoji
- Archive, mute, delete threads
- Create polls, manage notes and rules
- Search threads by name, handle message requests

</details>

<details>
<summary><b>Themes, Stickers & Customization</b></summary>

- Browse 90+ Messenger themes, apply themes via MQTT
- Generate AI-powered themes with text prompts
- Search stickers, browse packs, add packs, get AI stickers
- Change thread color, emoji, and nicknames

</details>

<details>
<summary><b>Security & Monitoring</b></summary>

- Application-layer E2EE using X25519 + HKDF + AES-256-GCM
- `api.getHealthStatus()` — MQTT status, token refresh stats, rate limiter metrics
- Built-in `ProductionMonitor` for request/error/performance telemetry
- Full proxy support via the `proxy` login option

</details>

---

## Installation

> **Requirements:** Node.js v18.0.0 or higher

```bash
# npm
npm install fca-sifu

# yarn
yarn add fca-sifu

# pnpm
pnpm add fca-sifu
```

---

## Quick Start

```js
const fs   = require("fs");
const { login } = require("fca-sifu");

const appState = JSON.parse(fs.readFileSync("appstate.json", "utf8"));

login({ appState }, {
  online: true,
  listenEvents: true,
  autoMarkRead: true,
  autoReconnect: true,
  simulateTyping: true,
}, (err, api) => {
  if (err) return console.error("Login failed:", err);

  console.log("Logged in as:", api.getCurrentUserID());

  api.listenMqtt((err, event) => {
    if (err || event.type !== "message" || !event.body) return;

    if (event.body === "/ping") {
      api.sendMessage("pong!", event.threadID);
    }
  });
});
```

---

## Configuration

All options are passed as the second argument to `login()`:

```js
login({ appState }, {
  // --- Behavior ---
  online: true,                   // Appear online
  selfListen: false,              // Receive own messages
  listenEvents: true,             // Receive thread/group events
  listenTyping: false,            // Receive typing events
  updatePresence: false,          // Broadcast presence

  // --- Auto Actions ---
  autoMarkDelivery: false,        // Auto-mark as delivered
  autoMarkRead: true,             // Auto-mark threads as read
  autoReconnect: true,            // MQTT auto-reconnect

  // --- Stealth & Anti-Detection ---
  simulateTyping: true,           // Humanized typing delays
  randomUserAgent: false,         // Rotate User-Agent per session
  stealthMode: false,             // Extra stealth request headers
  persona: "desktop",             // "desktop" or "android"

  // --- Rate Limiting ---
  maxConcurrentRequests: 5,       // Max parallel HTTP requests
  maxRequestsPerMinute: 50,       // Sliding-window rate cap
  requestCooldownMs: 60000,       // Per-endpoint cooldown (ms)
  errorCacheTtlMs: 300000,        // Error suppression TTL (ms)

  // --- Network ---
  proxy: "http://user:pass@host:port",  // Optional proxy

  // --- Session ---
  forceLogin: false,              // Force fresh login
}, callback);
```

---

## Anti-Suspension System

The anti-suspension system is **active by default** and runs silently in the background.

### Circuit Breaker

Trips automatically after detecting **2+ suspension signals** (checkpoints, spam flags, rate limits, etc.). Pauses all activity for **45 minutes** by default.

```js
const { globalAntiSuspension } = require("fca-sifu/src/utils/antiSuspension");

// Manually trip the breaker (e.g., after spotting a custom warning)
globalAntiSuspension.tripCircuitBreaker("manual_pause", 30 * 60 * 1000); // 30 min

// Reset after resolving the issue
globalAntiSuspension.resetCircuitBreaker();

// Inspect current status
console.log(globalAntiSuspension.getConfig());
```

### Warmup Mode

Use warmup mode when starting a **fresh or recovered session** to gradually ramp up message rate:

```js
const { globalAntiSuspension } = require("fca-sifu/src/utils/antiSuspension");

globalAntiSuspension.enableWarmup();
// Limits to 25 messages/hour for the first 20 minutes
```

### Health Status

```js
const status = api.getHealthStatus();
console.log(status);
/*
{
  mqtt: { connected: true, reconnects: 0 },
  tokenRefresh: { lastRefresh: '2026-03-15T12:00:00Z', count: 3 },
  rateLimiter: { requestsThisMinute: 12, throttled: false },
  antiSuspension: { tripped: false, signalsDetected: 0 }
}
*/
```

---

## End-to-End Encryption

Application-layer E2EE for DMs using **X25519 + HKDF + AES-256-GCM** — fully opt-in.

```js
// Enable E2EE for the current session
api.e2ee.enable();

// Get this bot's public key to share with your peer
const myPublicKey = api.e2ee.getPublicKey();
console.log("Share this key:", myPublicKey);

// Register the peer's public key for a specific DM thread
api.e2ee.setPeerKey(threadID, peerPublicKeyBase64);

// From this point on, messages in that thread are:
// - Auto-encrypted before sending
// - Auto-decrypted on receive
api.sendMessage("This message is end-to-end encrypted!", threadID);

// Check if a peer key is registered
if (api.e2ee.hasPeer(threadID)) {
  console.log("E2EE active for this thread");
}

// Disable or remove
api.e2ee.clearPeerKey(threadID);
api.e2ee.disable();
```

---

## API Reference

### Authentication
| Method | Description |
|---|---|
| `login(credentials, options, callback)` | Log in and receive the API object |
| `api.logout()` | End the session cleanly |
| `api.getAppState()` | Export current session cookies |
| `api.getCurrentUserID()` | Get the logged-in user's ID |

### Messaging
| Method | Description |
|---|---|
| `api.sendMessage(msg, threadID)` | Send via HTTP with MQTT fallback |
| `api.sendMessageMqtt(msg, threadID)` | Send directly over MQTT |
| `api.editMessage(text, messageID)` | Edit a sent message |
| `api.unsendMessage(messageID, threadID)` | Retract a message for everyone |
| `api.forwardMessage(messageID, threadID)` | Forward to another thread |
| `api.deleteMessage(messageIDs)` | Delete locally |
| `api.shareContact(senderID, threadID)` | Share a user's contact card |

### Reactions & Status
| Method | Description |
|---|---|
| `api.setMessageReaction(reaction, messageID)` | React via HTTP |
| `api.setMessageReactionMqtt(reaction, messageID, threadID)` | React via MQTT |
| `api.sendTypingIndicator(isTyping, threadID)` | Show or hide typing indicator |
| `api.markAsRead(threadID)` | Mark a thread as read |
| `api.markAsReadAll()` | Mark all threads as read |
| `api.markAsSeen()` | Mark all messages as seen |
| `api.markAsDelivered(threadID, messageID)` | Mark as delivered |

### Threads
| Method | Description |
|---|---|
| `api.getThreadInfo(threadID)` | Fetch thread metadata |
| `api.getThreadList(limit, timestamp, tags)` | List all threads |
| `api.getThreadHistory(threadID, amount, timestamp)` | Fetch message history |
| `api.getThreadPictures(threadID, offset, limit)` | Fetch thread images |
| `api.searchForThread(name)` | Search threads by name |
| `api.createNewGroup(participantIDs, name?)` | Create a new group |
| `api.deleteThread(threadID)` | Delete a thread |
| `api.muteThread(threadID, muteSeconds)` | Mute a thread |
| `api.changeArchivedStatus(threadID, archive)` | Archive or unarchive |
| `api.pinMessage(action, threadID, messageID?)` | Pin, unpin, or list pinned |
| `api.createPoll(title, threadID, options?)` | Create a poll |
| `api.handleMessageRequest(threadID, accept)` | Accept or decline a request |

### Group Admin
| Method | Description |
|---|---|
| `api.addUserToGroup(userID, threadID)` | Add a member |
| `api.removeUserFromGroup(userID, threadID)` | Remove a member |
| `api.changeAdminStatus(threadID, userID, isAdmin)` | Promote or demote |
| `api.changeGroupImage(image, threadID)` | Change the group photo |
| `api.gcname(name, threadID)` | Rename the group |

### Users & Friends
| Method | Description |
|---|---|
| `api.getUserInfo(id)` | Basic user info |
| `api.getUserInfoV2(id)` | Extended user info |
| `api.getUserID(name)` | Resolve name to user ID |
| `api.getFriendsList()` | Get the full friends list |
| `api.getBotInfo()` | Info about the bot's account |
| `api.unfriend(userID)` | Unfriend a user |
| `api.changeBlockedStatus(userID, block)` | Block or unblock |
| `api.follow(userID, follow)` | Follow or unfollow |

### Themes & Customization
| Method | Description |
|---|---|
| `api.getTheme(threadID)` | List all available themes |
| `api.getThemeInfo(threadID)` | Get the current thread theme |
| `api.setThreadThemeMqtt(threadID, themeID)` | Apply a theme via MQTT |
| `api.createAITheme(prompt)` | Generate an AI theme |
| `api.changeThreadColor(color, threadID)` | Set thread color |
| `api.changeThreadEmoji(emoji, threadID)` | Set thread emoji |
| `api.nickname(nickname, threadID, participantID)` | Set a participant's nickname |

### Stickers
| Method | Description |
|---|---|
| `api.stickers.search(query)` | Search stickers by keyword |
| `api.stickers.listPacks()` | List installed sticker packs |
| `api.stickers.getStorePacks()` | Browse the sticker store |
| `api.stickers.addPack(packID)` | Add a sticker pack |
| `api.stickers.getStickersInPack(packID)` | List stickers in a pack |
| `api.stickers.getAiStickers(options?)` | Generate AI stickers |

### E2EE
| Method | Description |
|---|---|
| `api.e2ee.enable()` | Enable E2EE for this session |
| `api.e2ee.disable()` | Disable E2EE |
| `api.e2ee.getPublicKey()` | Export this bot's public key |
| `api.e2ee.setPeerKey(threadID, key)` | Register a peer's public key |
| `api.e2ee.hasPeer(threadID)` | Check if a peer key exists |
| `api.e2ee.clearPeerKey(threadID)` | Remove a peer's key |

### Health & Social
| Method | Description |
|---|---|
| `api.getHealthStatus()` | MQTT, token, rate limiter diagnostics |
| `api.comment(msg, postID)` | Comment on a post |
| `api.share(postID)` | Share a post |

---

## Examples

### Basic Bot

```js
const fs = require("fs");
const { login } = require("fca-sifu");

const appState = JSON.parse(fs.readFileSync("appstate.json", "utf8"));

login({ appState }, { autoReconnect: true, simulateTyping: true }, (err, api) => {
  if (err) throw err;

  api.listenMqtt((err, event) => {
    if (err || event.type !== "message") return;
    if (event.body === "/ping") api.sendMessage("pong!", event.threadID);
  });
});
```

### Command-Based Bot

```js
const fs   = require("fs");
const path = require("path");
const { login } = require("fca-sifu");

const appState = JSON.parse(fs.readFileSync("appstate.json", "utf8"));
const PREFIX = "/";

login({ appState }, { online: true, selfListen: false, autoReconnect: true }, async (err, api) => {
  if (err) throw err;

  const commands = new Map();
  const cmdDir = path.join(__dirname, "commands");

  if (fs.existsSync(cmdDir)) {
    fs.readdirSync(cmdDir)
      .filter(f => f.endsWith(".js"))
      .forEach(file => {
        const cmd = require(path.join(cmdDir, file));
        if (cmd.name && typeof cmd.execute === "function") {
          commands.set(cmd.name.toLowerCase(), cmd);
        }
      });
  }

  console.log(`Loaded ${commands.size} command(s)`);

  api.listenMqtt(async (err, event) => {
    if (err || event.type !== "message" || !event.body?.startsWith(PREFIX)) return;

    const [name, ...args] = event.body.slice(PREFIX.length).trim().split(/ +/);
    const cmd = commands.get(name.toLowerCase());
    if (!cmd) return;

    try {
      await cmd.execute({ api, event, args });
    } catch (e) {
      api.sendMessage(`Error: ${e.message}`, event.threadID);
    }
  });
});
```

### AI Themes

```js
// Generate an AI theme from a text prompt
const themes = await api.createAITheme("neon cyberpunk purple ocean");
if (themes?.length) {
  await api.setThreadThemeMqtt(threadID, themes[0].id);
  console.log("Applied AI theme:", themes[0].id);
}

// Browse and apply standard themes
const available = await api.getTheme(threadID);
await api.setThreadThemeMqtt(threadID, available[0].id);

// Check active theme info
const info = await api.getThemeInfo(threadID);
console.log("Color:", info.color, "| Emoji:", info.emoji);
```

---

## Getting Started — Obtain `appstate.json`

1. Install a cookie export extension:
   - **Chrome / Edge:** C3C FbState or CookieEditor
   - **Firefox:** Cookie-Editor

2. Log in to Facebook in your browser

3. Export cookies as JSON, save as `appstate.json`:

```json
[
  { "key": "c_user", "value": "YOUR_USER_ID" },
  { "key": "xs",     "value": "YOUR_XS_VALUE" }
]
```

4. Reference in your bot:

```js
const { login } = require("fca-sifu");
const appState  = require("./appstate.json");

login({ appState }, {}, (err, api) => { /* ... */ });
```

See [COOKIE_LOGIN.md](COOKIE_LOGIN.md) for more formats and troubleshooting tips.

---

## Security Warning

> `appstate.json` contains your **live Facebook session** — treat it like a password.


- **Never** commit `appstate.json` to version control
- **Never** share it publicly or in Discord servers
- Add it to `.gitignore` immediately
- Use environment variables or a secrets manager in production deployments


---


## Documentation


| Resource | Description |
|---|---|
| [COOKIE_LOGIN.md](COOKIE_LOGIN.md) | Cookie authentication formats and tips |
| [CHANGELOG.md](CHANGELOG.md) | Version history and release notes |
| [examples/](examples/) | Ready-to-run bot examples |


</div>

---

## License

Released under the **MIT License** — free to use, modify, and distribute.  
Attribution is appreciated.

See [LICENSE](LICENSE) for the full license text.

---

<div align="center">

**[npm](https://www.npmjs.com/package/fca-sifu)** · **[GitHub](https://github.com/ewr-sifu/FCA-SIFU)** · **[Issues](https://github.com/ewr-sifu/FCA-SIFU/issues)**

<br/>

*Made with ♥️ by S1FU*

*Copyright (c) 2026 S1FU — All rights reserved*


</div>
