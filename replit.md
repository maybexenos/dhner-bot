# ZERO TWO BOT 

A Facebook Messenger bot using personal accounts.

## Overview
- **Bot framework**: GoatBot V2 v1.5.35
- **Runtime**: Node.js 20
- **FCA Library**: FCA-SIFU (https://github.com/ewr-sifu/FCA-SIFU.git) — local copy at `./fca-sifu`
- **Start command**: `npm start` (runs `node index.js`)

## Architecture
- `index.js` — Entry point, spawns `Goat.js` and auto-restarts on exit code 2
- `Goat.js` — Main bot logic, loads utils, scripts, and dashboard
- `bot/login/login.js` — Handles Facebook login using FCA-SIFU
- `scripts/cmds/` — Bot commands
- `scripts/events/` — Bot event handlers
- `dashboard/` — Web dashboard (runs on port 5000)
- `fca-sifu/` — FCA-SIFU Facebook Chat API library (local copy)

## FCA Configuration
The FCA library used is **FCA-SIFU** from `https://github.com/ewr-sifu/FCA-SIFU.git`.
- Referenced in `package.json` as `"FCA-SIFU": "file:./fca-sifu"`
- Required in `bot/login/login.js` as `require("FCA-SIFU")`
- Required fix: removed `"type": "module"` from `fca-sifu/package.json` (code is CommonJS)
- Required fix: uses `https-proxy-agent@5` (v8 breaks CommonJS require)

## Key Dependencies Added for FCA-SIFU
- `axios-cookiejar-support`
- `tough-cookie`
- `deepdash`
- `https-proxy-agent@5`
- `jsonpath-plus`
- `lodash`
- `undici`

## Running
The workflow "Start application" runs `npm start` as a console workflow.
