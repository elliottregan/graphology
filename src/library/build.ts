/**
 * Graphology Library Build Script
 * ================================
 *
 * Uses Bun to build the library bundle.
 */
import {existsSync} from 'fs';
import {rm} from 'fs/promises';
import path from 'path';

const ROOT = import.meta.dir;
const DIST = path.join(ROOT, 'dist');

async function clean() {
  if (existsSync(DIST)) {
    await rm(DIST, {recursive: true});
  }
}

async function buildUMD() {
  // Build unminified UMD
  const result = await Bun.build({
    entrypoints: [path.join(ROOT, 'browser.js')],
    outdir: DIST,
    format: 'iife',
    target: 'browser',
    sourcemap: 'external',
    naming: 'graphology-library.js',
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  });

  if (!result.success) {
    console.error('UMD build failed:', result.logs);
    process.exit(1);
  }

  // Build minified UMD
  const minResult = await Bun.build({
    entrypoints: [path.join(ROOT, 'browser.js')],
    outdir: DIST,
    format: 'iife',
    target: 'browser',
    sourcemap: 'external',
    minify: true,
    naming: 'graphology-library.min.js',
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  });

  if (!minResult.success) {
    console.error('UMD minified build failed:', minResult.logs);
    process.exit(1);
  }
}

async function main() {
  console.log('Cleaning dist...');
  await clean();

  console.log('Building UMD bundles...');
  await buildUMD();

  console.log('Build complete!');
}

main().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
