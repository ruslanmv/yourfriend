import { describe, expect, it } from 'vitest';
import {
  HERO_PORTRAIT_MAX_WIDTH,
  eyeLevelYAt,
  feetYAt,
  headYAt,
  heroProfiles,
  profileForHeroWidth,
  resolveHeroRow,
  sampleCurve,
} from '../src/config/heroCalibration';

describe('yourfriend-marketing-hero-v1', () => {
  it('switches composition at the stylesheets own breakpoint, not at an aspect of 1', () => {
    // 768x1024 is a hero narrower than it is tall and yet still the desktop composition. Picking
    // the profile by aspect put her on the wrong side of the page for the whole tablet band.
    expect(profileForHeroWidth(768).id).toBe('desktop');
    expect(profileForHeroWidth(HERO_PORTRAIT_MAX_WIDTH + 1).id).toBe('desktop');
    expect(profileForHeroWidth(HERO_PORTRAIT_MAX_WIDTH).id).toBe('portrait');
    expect(profileForHeroWidth(390).id).toBe('portrait');
  });

  it('reproduces the measured feet rows at the widths they were measured at', () => {
    const desktop = heroProfiles.desktop;
    expect(feetYAt(desktop, 1920)).toBeCloseTo(0.7431, 4);
    expect(feetYAt(desktop, 1024)).toBeCloseTo(0.746, 4);
    expect(feetYAt(desktop, 768)).toBeCloseTo(0.695, 4);
    expect(feetYAt(heroProfiles.portrait, 390)).toBeCloseTo(0.8335, 4);
  });

  it('keeps the non-monotonic step around 1024 instead of smoothing it away', () => {
    // Her feet peak at 1024 and drop again by 1180, where a second media query resizes the stage.
    // Any fit that loses this puts the ground line a visible distance out across the tablet band.
    const desktop = heroProfiles.desktop;
    expect(feetYAt(desktop, 1024)).toBeGreaterThan(feetYAt(desktop, 900));
    expect(feetYAt(desktop, 1180)).toBeLessThan(feetYAt(desktop, 1024));
  });

  it('clamps outside the measured range rather than extrapolating', () => {
    const desktop = heroProfiles.desktop;
    expect(feetYAt(desktop, 200)).toBe(desktop.feetCurve[0][1]);
    expect(feetYAt(desktop, 10_000)).toBe(desktop.feetCurve[desktop.feetCurve.length - 1][1]);
  });

  it('interpolates between samples', () => {
    expect(sampleCurve(
      [
        [100, 0],
        [200, 1],
      ],
      150,
    )).toBeCloseTo(0.5, 6);
  });

  it('puts the eye level where a level camera would, given the head and feet curves', () => {
    // eye = centre - verticalBias * height, with the 0.04 fitCameraToObject is called with.
    for (const width of [768, 1024, 1440, 1920, 2560]) {
      const profile = heroProfiles.desktop;
      const head = headYAt(profile, width);
      const feet = feetYAt(profile, width);
      const derived = (head + feet) / 2 - 0.04 * (feet - head);
      expect(eyeLevelYAt(profile, width)).toBeCloseTo(derived, 3);
    }
  });

  it('puts the horizon well above her feet, which is the whole point', () => {
    for (const width of [768, 1440, 1920, 2560]) {
      const profile = heroProfiles.desktop;
      expect(eyeLevelYAt(profile, width)).toBeLessThan(feetYAt(profile, width) - 0.2);
    }
  });

  it('resolves the two symbolic anchor targets against the curves', () => {
    const profile = heroProfiles.desktop;
    expect(resolveHeroRow('feet', profile, 1920)).toBe(feetYAt(profile, 1920));
    expect(resolveHeroRow('eyeline', profile, 1920)).toBe(eyeLevelYAt(profile, 1920));
    expect(resolveHeroRow(0.42, profile, 1920)).toBe(0.42);
  });

  it('keeps her inside the corridor the art must leave clear, at every measured width', () => {
    for (const profile of [heroProfiles.desktop, heroProfiles.portrait]) {
      for (const [width] of profile.centerXCurve) {
        const centre = sampleCurve(profile.centerXCurve, width);
        expect(centre - profile.bodyWidth / 2).toBeGreaterThanOrEqual(profile.avatarCorridor.x0);
        expect(centre + profile.bodyWidth / 2).toBeLessThanOrEqual(profile.avatarCorridor.x1);
      }
    }
  });

  it('keeps the copy-safe box clear of the avatar corridor', () => {
    for (const profile of [heroProfiles.desktop, heroProfiles.portrait]) {
      const overlapsHorizontally =
        profile.copySafe.x1 > profile.avatarCorridor.x0 &&
        profile.copySafe.x0 < profile.avatarCorridor.x1;
      // Portrait stacks them, so they may share columns as long as they do not share rows.
      if (overlapsHorizontally) {
        expect(profile.copySafe.y1).toBeLessThan(sampleCurve(profile.headCurve, 390));
      }
    }
  });
});
