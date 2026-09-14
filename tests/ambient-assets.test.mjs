// @vitest-environment node

/**
 * Every URL the scene library names has to exist on disk.
 *
 * This lives in a .mjs file, like production-env.test.mjs, because the app's tsconfig has no Node
 * types: a filesystem check written in TypeScript there compiles in the editor and then fails the
 * production build, which is how it was found.
 *
 * It parses the config as text rather than importing it, because `ambientScenes.ts` reads
 * `import.meta.env.BASE_URL`, which only exists inside Vite.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(resolve(process.cwd(), 'src/config/ambientScenes.ts'), 'utf8');
const referenced = [...source.matchAll(/asset\('([^']+)'\)/g)].map((match) => match[1]);

describe('ambient scene assets', () => {
  it('names the plates and thumbnails the page expects', () => {
    // Five scenes: two plates and two thumbnails each.
    expect(referenced).toHaveLength(20);
  });

  it('ships every file it names', () => {
    for (const path of referenced) {
      expect(existsSync(resolve(process.cwd(), 'public', path))).toBe(true);
    }
  });

  it('keeps the thumbnails small enough that the button row is free', () => {
    const thumbs = referenced.filter((path) => path.startsWith('ambient/thumbs/'));
    expect(thumbs).toHaveLength(10);
    for (const path of thumbs) {
      const bytes = readFileSync(resolve(process.cwd(), 'public', path)).byteLength;
      expect(bytes).toBeLessThan(8 * 1024);
    }
  });

  it('keeps each full plate inside a sane per-file budget', () => {
    const plates = referenced.filter((path) => !path.startsWith('ambient/thumbs/'));
    expect(plates).toHaveLength(10);
    for (const path of plates) {
      const bytes = readFileSync(resolve(process.cwd(), 'public', path)).byteLength;
      expect(bytes).toBeLessThan(300 * 1024);
    }
  });
});
