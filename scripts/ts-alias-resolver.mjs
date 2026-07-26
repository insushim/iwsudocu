import { dirname, join, resolve as resolvePath } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SRC_DIR = resolvePath(dirname(fileURLToPath(import.meta.url)), '..', 'src');
const CANDIDATE_SUFFIXES = ['', '.ts', '.tsx', '/index.ts', '/index.tsx'];

export async function resolve(specifier, context, nextResolve) {
  // tsconfig paths: "@/*" -> "src/*"
  const target = specifier.startsWith('@/')
    ? pathToFileURL(join(SRC_DIR, specifier.slice(2))).href
    : specifier;

  let firstError;
  for (const suffix of CANDIDATE_SUFFIXES) {
    try {
      return await nextResolve(target + suffix, context);
    } catch (error) {
      firstError ??= error;
    }
  }
  throw firstError;
}
