/**
 * Graphology Build Script
 * =======================
 *
 * Uses Bun to build multiple output formats.
 */
import {$} from 'bun';
import {existsSync} from 'fs';
import {rm, cp} from 'fs/promises';
import path from 'path';

const ROOT = import.meta.dir;
const DIST = path.join(ROOT, 'dist');
const SRC = path.join(ROOT, 'src');

async function clean() {
  if (existsSync(DIST)) {
    await rm(DIST, {recursive: true});
  }
  const specsDir = path.join(ROOT, 'specs');
  if (existsSync(specsDir)) {
    await rm(specsDir, {recursive: true});
  }
}

async function buildESM() {
  const result = await Bun.build({
    entrypoints: [path.join(SRC, 'endpoint.esm.js')],
    outdir: DIST,
    format: 'esm',
    target: 'browser',
    sourcemap: 'external',
    naming: 'graphology.esm.js'
  });

  if (!result.success) {
    console.error('ESM build failed:', result.logs);
    process.exit(1);
  }

  // Also create .mjs version
  await cp(path.join(DIST, 'graphology.esm.js'), path.join(DIST, 'graphology.mjs'));
  if (existsSync(path.join(DIST, 'graphology.esm.js.map'))) {
    await cp(
      path.join(DIST, 'graphology.esm.js.map'),
      path.join(DIST, 'graphology.mjs.map')
    );
  }
}

async function buildCJS() {
  const result = await Bun.build({
    entrypoints: [path.join(SRC, 'endpoint.cjs.js')],
    outdir: DIST,
    format: 'cjs',
    target: 'node',
    sourcemap: 'external',
    naming: 'graphology.cjs.js'
  });

  if (!result.success) {
    console.error('CJS build failed:', result.logs);
    process.exit(1);
  }
}

async function buildUMD() {
  // Build unminified UMD (IIFE with global name)
  const result = await Bun.build({
    entrypoints: [path.join(SRC, 'endpoint.cjs.js')],
    outdir: DIST,
    format: 'iife',
    target: 'browser',
    sourcemap: 'external',
    naming: 'graphology.umd.js',
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
    entrypoints: [path.join(SRC, 'endpoint.cjs.js')],
    outdir: DIST,
    format: 'iife',
    target: 'browser',
    sourcemap: 'external',
    minify: true,
    naming: 'graphology.umd.min.js',
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  });

  if (!minResult.success) {
    console.error('UMD minified build failed:', minResult.logs);
    process.exit(1);
  }
}

async function copyTypes() {
  // Copy the TypeScript declaration file
  const srcTypes = path.join(SRC, 'endpoint.esm.d.ts');
  const distTypes = path.join(DIST, 'graphology.d.ts');

  if (existsSync(srcTypes)) {
    await cp(srcTypes, distTypes);
  }
}

async function main() {
  console.log('Cleaning dist...');
  await clean();

  console.log('Building ESM...');
  await buildESM();

  console.log('Building CJS...');
  await buildCJS();

  console.log('Building UMD...');
  await buildUMD();

  console.log('Copying type declarations...');
  await copyTypes();

  console.log('Build complete!');
}

main().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
