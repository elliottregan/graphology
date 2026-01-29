/**
 * Script to migrate Jekyll docs to VitePress
 * Updates frontmatter format and removes Jekyll-specific syntax
 */
import {readdir, readFile, writeFile} from 'fs/promises';
import {join} from 'path';

const DOCS_DIR = join(import.meta.dir, '../docs');

async function migrateFile(filePath) {
  let content = await readFile(filePath, 'utf-8');

  // Remove Jekyll Kramdown attributes
  content = content.replace(/\{:\s*\.no_toc\s*\}/g, '');
  content = content.replace(/\{:\s*toc\s*\}/g, '');
  content = content.replace(/\{:toc\}/g, '');

  // Remove Jekyll TOC markers
  content = content.replace(/^\d+\.\s*TOC\s*$/gm, '');

  // Check if file has Jekyll frontmatter
  if (!content.startsWith('---')) {
    await writeFile(filePath, content);
    console.log(`Cleaned: ${filePath}`);
    return;
  }

  // Extract frontmatter and content
  const endOfFrontmatter = content.indexOf('---', 3);
  if (endOfFrontmatter === -1) {
    await writeFile(filePath, content);
    return;
  }

  const frontmatter = content.slice(4, endOfFrontmatter).trim();
  let body = content.slice(endOfFrontmatter + 4);

  // Parse Jekyll frontmatter
  const lines = frontmatter.split('\n');
  const newFrontmatter = [];

  for (const line of lines) {
    // Skip Jekyll-specific fields
    if (line.startsWith('layout:')) continue;
    if (line.startsWith('nav_order:')) continue;
    if (line.startsWith('parent:')) continue;
    if (line.startsWith('has_children:')) continue;
    if (line.startsWith('has_toc:')) continue;
    if (line.startsWith('aux_links:')) continue;
    if (line.match(/^\s+"/)) continue; // Skip aux_links values

    // Keep title and other relevant fields
    if (line.startsWith('title:')) {
      newFrontmatter.push(line);
    }
  }

  // Build new content
  let newContent;
  if (newFrontmatter.length > 0) {
    newContent = `---\n${newFrontmatter.join('\n')}\n---\n${body}`;
  } else {
    newContent = body.trim() + '\n';
  }

  await writeFile(filePath, newContent);
  console.log(`Migrated: ${filePath}`);
}

async function migrateDirectory(dir) {
  const entries = await readdir(dir, {withFileTypes: true});

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip .vitepress directory
      if (entry.name === '.vitepress') continue;
      await migrateDirectory(fullPath);
    } else if (entry.name.endsWith('.md')) {
      await migrateFile(fullPath);
    }
  }
}

console.log('Migrating Jekyll docs to VitePress format...');
await migrateDirectory(DOCS_DIR);
console.log('Migration complete!');
