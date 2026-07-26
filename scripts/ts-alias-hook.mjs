/**
 * Lets plain `node` load the app's TypeScript modules, so verification scripts
 * can exercise the code that actually ships instead of keeping their own copy
 * (which silently rots the moment the real implementation changes).
 *
 * Node strips the types itself; this only teaches its resolver two things the
 * bundler normally handles:
 *   - the `@/` alias from tsconfig paths
 *   - extensionless relative imports (`./types` -> `./types.ts`)
 *
 * Usage: node --import ./scripts/ts-alias-hook.mjs scripts/<script>.mjs
 *
 * Only modules whose bindings are values need to resolve — anything imported
 * with `import type` is erased before the resolver ever sees it.
 */
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

register('./ts-alias-resolver.mjs', pathToFileURL(import.meta.filename));
