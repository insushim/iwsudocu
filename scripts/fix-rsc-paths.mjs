/**
 * Post-build script to fix Next.js 16 RSC payload file paths for static hosting.
 *
 * Next.js 16 generates: <page>/__next.<page>/__PAGE__.txt (directory structure)
 * But client requests: <page>/__next.<page>.__PAGE__.txt (flat dot-separated path)
 *
 * This script copies the nested files to the flat path format that the client expects.
 */
import { readdirSync, statSync, copyFileSync, existsSync } from 'fs';
import { join, basename } from 'path';

const outDir = join(process.cwd(), 'out');

function fixRscPaths(dir) {
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      // Check if this directory matches __next.<segment> pattern
      if (entry.startsWith('__next.')) {
        const pageFile = join(fullPath, '__PAGE__.txt');
        if (existsSync(pageFile)) {
          // Copy __next.<segment>/__PAGE__.txt → __next.<segment>.__PAGE__.txt
          const flatPath = join(dir, `${entry}.__PAGE__.txt`);
          copyFileSync(pageFile, flatPath);
          console.log(`  Copied: ${entry}/__PAGE__.txt → ${entry}.__PAGE__.txt`);
        }
      } else if (!entry.startsWith('_next') && !entry.startsWith('.')) {
        // Recurse into page directories (but not _next static assets)
        fixRscPaths(fullPath);
      }
    }
  }
}

console.log('Fixing RSC payload paths for static hosting...');
fixRscPaths(outDir);
console.log('Done!');
