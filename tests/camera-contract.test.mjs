// @vitest-environment node

/**
 * The committed camera contract must still be what the calibration produces.
 *
 * `public/ambient/camera-contract.json` is the only thing 3D-Ambience-Studio knows about this
 * page's composition. Re-measuring the hero without re-exporting leaves the Studio generating art
 * for a layout that no longer exists — and the failure is silent, because the art still generates,
 * it just no longer fits. So this rebuilds it and fails on any drift.
 *
 * A .mjs file, like the other Node-side tests, because the app's tsconfig has no Node types.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { cameraContract } from '../tools/cameraContract';

const committed = JSON.parse(
  readFileSync(resolve(process.cwd(), 'public/ambient/camera-contract.json'), 'utf8'),
);

describe('the exported camera contract', () => {
  it('matches what the calibration produces today', () => {
    // If this fails: npm run export:camera-contract, and check the diff is the one you meant.
    expect(committed).toEqual(cameraContract);
  });

  it('solves a camera that reproduces the measured rows', () => {
    // The contract's own numbers have to be self-consistent: project a 1.6 m figure standing on
    // the ground with this camera and her head and feet must land where the hero measured them.
    for (const profile of Object.values(cameraContract.profiles)) {
      const halfFov = ((profile.fovDeg / 2) * Math.PI) / 180;
      const pitch = ((profile.pitchDeg ?? 0) * Math.PI) / 180;
      const row = (metresAboveGround) =>
        0.5 +
        Math.tan(
          Math.atan((profile.eyeHeightMetres - metresAboveGround) / profile.cameraDistanceMetres) -
            pitch,
        ) /
          Math.tan(halfFov) /
          2;

      expect(row(0)).toBeCloseTo(profile.footAnchor.y, 3);
      expect(row(1.6)).toBeCloseTo(profile.headTopY, 3);
      // Infinitely far away is the horizon, and it sits at eye height whatever the pitch.
      expect(row(profile.eyeHeightMetres)).toBeCloseTo(profile.horizonY, 3);
    }
  });

  it('keeps the avatar inside the keep-clear box it publishes', () => {
    for (const profile of Object.values(cameraContract.profiles)) {
      expect(profile.footAnchor.x).toBeGreaterThan(profile.safeZone.x0);
      expect(profile.footAnchor.x).toBeLessThan(profile.safeZone.x1);
      expect(profile.footAnchor.y).toBeLessThanOrEqual(profile.safeZone.y1);
      expect(profile.headTopY).toBeGreaterThanOrEqual(profile.safeZone.y0);
    }
  });

  it('never puts ground above the horizon or off the bottom of the frame', () => {
    for (const profile of Object.values(cameraContract.profiles)) {
      expect(profile.groundLines.length).toBeGreaterThan(3);
      for (const line of profile.groundLines) {
        expect(line.y).toBeGreaterThan(profile.horizonY);
        expect(line.y).toBeLessThanOrEqual(1);
      }
    }
  });

  it('publishes the headline as a quiet zone, clear of where she stands', () => {
    const landscape = cameraContract.profiles.landscape;
    const copy = landscape.quietZones.find((zone) => zone.id === 'copy');
    expect(copy).toBeDefined();
    // A quiet zone that overlaps the avatar corridor would ask the plate to be featureless exactly
    // where she needs ground under her feet.
    expect(copy.x1).toBeLessThanOrEqual(landscape.safeZone.x0);
  });

  it('describes the same profile id the site renders with', () => {
    expect(cameraContract.id).toBe('yourfriend-marketing-hero-v1');
    expect(cameraContract.profiles.landscape.master).toEqual({ width: 1920, height: 1080 });
    expect(cameraContract.profiles.portrait.master).toEqual({ width: 1080, height: 1920 });
  });
});
