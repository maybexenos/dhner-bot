const Module = require('module');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

const originalLoad = Module._load;

Module._load = function (request, parent, isMain) {
    let filename;
    try {
        filename = Module._resolveFilename(request, parent, isMain);
    } catch (_) {
        return originalLoad.apply(this, arguments);
    }

    const isWorkspaceJs =
        filename.endsWith('.js') &&
        filename.startsWith(rootDir) &&
        !filename.includes(`${path.sep}node_modules${path.sep}`) &&
        !filename.includes('/func/secrets/fca-sifu/');

    if (isWorkspaceJs) {
        if (Module._cache[filename]) {
            return Module._cache[filename].exports;
        }
        const m = new Module(filename, parent);
        m.filename = filename;
        m.paths = Module._nodeModulePaths(path.dirname(filename));
        Module._cache[filename] = m;
        try {
            m._compile(fs.readFileSync(filename, 'utf8'), filename);
            m.loaded = true;
            return m.exports;
        } catch (err) {
            delete Module._cache[filename];
            throw err;
        }
    }

    return originalLoad.apply(this, arguments);
};

process.chdir(rootDir);
require('../index.js');
