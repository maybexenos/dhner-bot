#!/bin/bash
# Ensure FCA-SIFU module is symlinked before starting
WORKSPACE="$(cd "$(dirname "$0")" && pwd)"
ln -sf "$WORKSPACE/func/secrets/fca-sifu" "$WORKSPACE/node_modules/FCA-SIFU"
echo "FCA-SIFU module linked."

# Add libuuid to library path (needed by canvas native addon)
export LD_LIBRARY_PATH="/nix/store/05n35k0p8l969kfskxqhbqhy8il3a3cq-util-linux-minimal-2.40.1-lib/lib:${LD_LIBRARY_PATH}"

# Run the bot using botrunner/run.js which has its own "type":"commonjs" package.json
# This correctly loads all GoatBot CJS files even though root package.json has "type":"module"
node "$WORKSPACE/botrunner/run.js"
