import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('production avatar feature flags', () => {
  it('keeps the live VRM hero enabled in production', async () => {
    const productionEnv = await readFile(new URL('../.env.production', import.meta.url), 'utf8');
    const liveVrmSetting = productionEnv
      .split(/\r?\n/)
      .find((line) => line.startsWith('VITE_ENABLE_LIVE_VRM='));

    expect(liveVrmSetting).toBe('VITE_ENABLE_LIVE_VRM=true');
  });
});
