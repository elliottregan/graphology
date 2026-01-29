# Build Tooling Modernization

This document describes the modernization of graphology's development toolchain, migrating from a traditional Node.js/npm setup to a Bun-based workflow.

## Overview

| Aspect | Before | After |
|--------|--------|-------|
| Package Manager | npm + Lerna 4.0 | Bun workspaces |
| Bundler | Rollup 2.70 + Babel 7.17 | Bun's native bundler |
| Test Runner | Mocha 9.2 | Bun's native test runner |
| Test Performance | ~413ms | ~150ms (2.75x faster) |

## Changes

### 1. Package Management: Lerna → Bun Workspaces

**Why change?**
- Lerna 4.x was effectively abandoned (later revived by Nx, but with different priorities)
- `lerna bootstrap` is slow and creates duplicate `node_modules` directories
- Modern package managers have built-in workspace support

**What changed:**
- Removed `lerna.json`
- Added `"workspaces": ["src/*"]` to root `package.json`
- Dependencies use `workspace:*` protocol for local packages
- Commands use `bun run --filter` instead of `lerna run`

**Benefits:**
- Faster dependency installation (symlinks instead of copies)
- Native workspace support without additional tooling
- Simpler configuration

### 2. Bundler: Rollup + Babel → Bun

**Why change?**
- Rollup + Babel required multiple plugins and configuration
- Babel transpilation was needed for older Node.js versions (no longer necessary)
- Bun includes a fast native bundler with built-in minification

**What changed:**
- Removed `rollup.config.js` and Babel configuration
- Created `build.ts` using Bun's `Bun.build()` API
- Simplified output generation for ESM, CJS, and UMD formats

**Benefits:**
- Single tool for bundling all formats
- No plugin dependencies (@rollup/plugin-*, rollup-plugin-babel, rollup-plugin-terser)
- TypeScript support out of the box
- Faster builds

### 3. Test Runner: Mocha → Bun Test

**Why change?**
- Mocha requires additional configuration for ESM
- Separate test framework adds dependencies
- Bun's test runner is significantly faster

**What changed:**
- Created `graphology.test.ts` with an adapter for existing tests
- The adapter converts Mocha's exports-style test format to Bun's `describe`/`it` format
- Removed `.mocharc.json` and `mocha` dependency
- Test command simplified to `bun test`

**Benefits:**
- 2.75x faster test execution (150ms vs 413ms)
- No additional test framework dependency
- Better ESM compatibility
- Existing test files remain unchanged (adapter handles conversion)

### 4. TypeScript Configuration

**What changed:**
- Added root `tsconfig.json` with strict settings
- Package-level configs extend the root config
- Target ES2020 (supported by all current Node.js LTS versions)
- Module resolution set to "bundler" for modern tooling compatibility

**Configuration highlights:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "declaration": true
  }
}
```

### 5. ESLint Configuration

**What changed:**
- Migrated to ESLint flat config format (`eslint.config.js`)
- Added TypeScript ESLint plugin and parser
- Integrated Prettier for formatting

## Migration Notes

### Running Commands

```bash
# Install dependencies
bun install

# Build graphology package
cd src/graphology && bun run build

# Run tests
bun test

# Lint
bun run lint

# Format
bun run format
```

### Compatibility

- **Node.js**: Built outputs remain compatible with Node.js 14+
- **Browsers**: UMD builds work in all modern browsers
- **TypeScript**: Full type definitions included

### Why Bun?

We evaluated several options:

| Tool | Pros | Cons |
|------|------|------|
| **pnpm** | Battle-tested, fast | Requires Node.js |
| **npm workspaces** | No new tools | Slower installs |
| **Bun** | Fastest, all-in-one | Newer ecosystem |

Bun was chosen because:
1. **All-in-one**: Package manager, bundler, test runner in a single tool
2. **Performance**: Fastest option across all operations
3. **Compatibility**: Passed all 808 existing tests without modification
4. **Simplicity**: Fewer configuration files and dependencies

### Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Bun compatibility issues | All tests pass; fallback to Node.js possible |
| Contributors unfamiliar with Bun | Bun CLI is npm-compatible (`bun install`, `bun run`) |
| CI/CD support | Bun has official GitHub Actions support |

## Future Improvements

1. **Convert source to TypeScript**: The JS source files can be gradually migrated to `.ts`
2. **Update other packages**: Apply similar modernization to other workspace packages
3. **Add Biome**: Consider replacing ESLint + Prettier with Biome for even faster linting
