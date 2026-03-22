const path = require('path');
const { createRequire } = require('module');
const fs = require('fs');

// Symlink FCA-SIFU module
const workspace = __dirname;
const fcaSifuSrc = path.join(workspace, 'func', 'secrets', 'fca-sifu');
const fcaSifuDest = path.join(workspace, 'node_modules', 'FCA-SIFU');
try {
    if (!fs.existsSync(fcaSifuDest)) {
        fs.symlinkSync(fcaSifuSrc, fcaSifuDest, 'dir');
    }
} catch (e) {
    // ignore if already linked
}

// Set working directory to workspace root
process.chdir(workspace);

const log = require('./logger/log.js');

function startProject() {
    try {
        // Clear module cache to allow restart
        Object.keys(require.cache).forEach(key => {
            if (!key.includes('node_modules') && key !== __filename) {
                delete require.cache[key];
            }
        });
        require('./Goat.js');
    } catch (err) {
        log.error('BOT', `Fatal error: ${err.message}`);
        log.info('BOT', 'Restarting in 5 seconds...');
        setTimeout(startProject, 5000);
    }
}

startProject();
