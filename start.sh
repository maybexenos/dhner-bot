#!/bin/bash

WORKSPACE="$(cd "$(dirname "$0")" && pwd)"

ln -sf "$WORKSPACE/func/secrets/fca-sifu" "$WORKSPACE/node_modules/FCA-SIFU"
echo "FCA-SIFU module linked."

node "$WORKSPACE/dist/index.cjs" &
WEB_PID=$!
echo "Web dashboard started (PID: $WEB_PID)"

node "$WORKSPACE/botrunner/run.js" &
BOT_PID=$!
echo "Bot started (PID: $BOT_PID)"

wait_and_exit() {
    echo "Shutting down..."
    kill $WEB_PID $BOT_PID 2>/dev/null
    exit 0
}

trap wait_and_exit SIGTERM SIGINT

wait $BOT_PID
