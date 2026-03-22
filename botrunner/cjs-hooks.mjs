// ESM loader hook — runs in a separate worker thread.
// Its only job is to declare workspace .js files as CommonJS
// so the cjsLoader translator in the main thread calls Module._load,
// which has been patched by --require botrunner/cjs-compat.cjs.
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const sep = path.sep;

export async function load(url, context, nextLoad) {
    if (url.startsWith('file://')) {
        const filepath = fileURLToPath(url);
        if (
            filepath.endsWith('.js') &&
            filepath.startsWith(rootDir) &&
            !filepath.includes(`${sep}node_modules${sep}`) &&
            !filepath.includes(`${sep}fca-sifu${sep}`)
        ) {
            return { format: 'commonjs', shortCircuit: true };
        }
    }
    return nextLoad(url, context);
}
