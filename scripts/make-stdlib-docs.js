/**
 * Script to generate standard library documentation from package READMEs
 * Updated for VitePress
 */
import {readFileSync, writeFileSync, existsSync, readdirSync, unlinkSync} from 'fs';
import {join, dirname} from 'path';
import {fileURLToPath} from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const libs = JSON.parse(readFileSync(join(__dirname, '../docs/_libs.json'), 'utf-8'));

const ARGUMENT_TYPE = /_(\?[^_]+)_/g;
const DEFAULT_TYPE = /\[`([^`]+)`\](?!\()/g;

const docsDirectory = join(__dirname, '../docs/standard-library');

const stdlib = Object.entries(libs).map(([name, description]) => {
  return {name, description};
});

// Clean existing generated files
const existingFiles = readdirSync(docsDirectory);
for (const file of existingFiles) {
  if (file.endsWith('.md') && file !== 'index.md') {
    unlinkSync(join(docsDirectory, file));
  }
}

const toc = stdlib
  .map(({name, description}) => {
    return `- [${name}](./${name}): *${description}*`;
  })
  .join('\n');

const indexContent = `---
title: Standard Library
---

# Standard Library

${toc}

## Interactive Rendering

If what you need is interactive rendering of your graphs, in web applications for instance,
be sure to check out [sigma.js](https://www.sigmajs.org/), a WebGL renderer
designed to work with \`graphology\` and which has been created for such endeavors.

## Installation

Any of the above packages can be installed through npm likewise (just change the name to
the desired package):

\`\`\`bash
npm install graphology-metrics
\`\`\`

For convenience, an aggregated package called \`graphology-library\` also exists
and depends on all the listed packages at once for convenience (albeit maybe
a little bit more complicated to optimize through tree-shaking).

You can install it thusly:

\`\`\`bash
npm install graphology-library
\`\`\`

If you do so, here is how to access the required packages:

\`\`\`js
// Importing a sub package
import * as metrics from 'graphology-library/metrics';

metrics.density(graph);

// Importing select parts of the library
import {metrics, layout} from 'graphology-library';

// Importing the whole library
import * as lib from 'graphology-library';

// Importing the browser-specific library
// (this is important for xml parsers and some layout's webworkers)
import * as lib from 'graphology-library/browser';
\`\`\`
`;

writeFileSync(join(docsDirectory, 'index.md'), indexContent);
console.log('Generated: index.md');

stdlib.forEach(({name}) => {
  const libPath = join(__dirname, '../src', name);

  let readme = readFileSync(join(libPath, 'README.md'), 'utf-8');

  const hasChangelog = existsSync(join(libPath, 'CHANGELOG.md'));
  const githubUrl = `https://github.com/graphology/graphology/tree/master/src/${name}`;

  // Transform links - only for documentation URLs, not badges/workflows
  // Transform graphology.github.io links to relative paths
  readme = readme.replace(/https:\/\/graphology\.github\.io\/standard-library/g, '/standard-library');
  readme = readme.replace(/https:\/\/graphology\.github\.io/g, '/');

  // Only transform direct library links (ending with library name or #anchor)
  // Don't transform workflow/badge URLs
  readme = readme.replace(
    /https:\/\/github\.com\/graphology\/graphology-([A-Za-z\-]+)(?=\)|\s|#|$)/g,
    '/standard-library/$1'
  );

  // Add styling to type annotations
  readme = readme.replace(ARGUMENT_TYPE, '<span class="code">$1</span>');
  readme = readme.replace(DEFAULT_TYPE, '<span class="default">$1</span>');

  // Build links section
  const links = [`[Library directory](${githubUrl})`];
  if (hasChangelog) {
    links.push(`[Changelog](${githubUrl}/CHANGELOG.md)`);
  }

  const content = `---
title: ${name}
---

<div class="lib-links">
${links.join(' | ')}
</div>

${readme}
`;

  writeFileSync(join(docsDirectory, `${name}.md`), content);
  console.log(`Generated: ${name}.md`);
});

console.log('\\nStandard library docs generation complete!');
