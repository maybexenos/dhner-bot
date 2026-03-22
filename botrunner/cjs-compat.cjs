// This file is preloaded in the MAIN THREAD via --require.
// It patches Module._load so that cjsLoader (ESM translator) and require()
// calls within CJS modules correctly force-load workspace .js files as CJS,
// bypassing the "type":"module" package.json check.

const Module = require('module');
const fs = require('fs');
const path = require('path');
const { fileURLToPath } = require('url');

const rootDir = path.resolve(__dirname, '..');
const sep = path.sep;

function isWorkspaceJs(filepath) {
    return (
        filepath.endsWith('.js') &&
        filepath.startsWith(rootDir) &&
        !filepath.includes(`${sep}node_modules${sep}`) &&
        !filepath.includes(`${sep}fca-sifu${sep}`)
    );
}

function toFilePath(request) {
    if (typeof request === 'string' && request.startsWith('file://')) {
        try { return fileURLToPath(request); } catch (_) { return null; }
    }
    return null;
}

function forceLoadCJS(filepath, parent) {
    if (Module._cache[filepath]) {
        return Module._cache[filepath].exports;
    }
    const m = new Module(filepath, parent);
    m.filename = filepath;
    m.paths = Module._nodeModulePaths(path.dirname(filepath));
    Module._cache[filepath] = m;
    try {
        m._compile(fs.readFileSync(filepath, 'utf8'), filepath);
        m.loaded = true;
        return m.exports;
    } catch (err) {
        delete Module._cache[filepath];
        throw err;
    }
}

const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
    // Handle file:// URLs passed by cjsLoader (ESM translator in main thread)
    const fromUrl = toFilePath(request);
    if (fromUrl && isWorkspaceJs(fromUrl)) {
        return forceLoadCJS(fromUrl, parent);
    }

    // Handle regular require() paths
    let filename;
    try {
        filename = Module._resolveFilename(request, parent, isMain);
    } catch (_) {
        return originalLoad.apply(this, arguments);
    }

    if (isWorkspaceJs(filename)) {
        return forceLoadCJS(filename, parent);
    }

    return originalLoad.apply(this, arguments);
};
