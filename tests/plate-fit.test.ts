import { describe, expect, it } from 'vitest';
import {
  DEFAULT_MAX_SCALE,
  MIN_OVERSCAN,
  coverFit,
  fitPlate,
  overscanFor,
  renderedRow,
} from '../src/components/ambient/plateFit';

const HERO_ASPECTS = [0.233, 0.334, 0.6, 0.818, 1.091, 1.43, 1.907, 2.543];
const PLATE_ASPECTS = [1672 / 941, 1920 / 1080, 1080 / 1920];

describe('fitting a plate to the hero', () => {
  it('lands the anchor exactly when the scale cap allows it', () => {
    for (const heroAspect of HERO_ASPECTS) {
      const fit = fitPlate({
        heroAspect,
        plateAspect: 1920 / 1080,
        plateY: 0.75,
        targetY: 0.75,
        maxScale: 8,
      });
      expect(fit.clamped).toBe(false);
      expect(renderedRow(fit, 0.75)).toBeCloseTo(0.75, 6);
    }
  });

  it('never renders the plate smaller than cover, whatever the anchor asks for', () => {
    for (const heroAspect of HERO_ASPECTS) {
      for (const plateAspect of PLATE_ASPECTS) {
        const fit = fitPlate({ heroAspect, plateAspect, plateY: 0.9, targetY: 0.1 });
        const heightUnits = fit.heightPercent / 100;
        expect(heightUnits).toBeGreaterThanOrEqual(1 - 1e-9);
        expect(heightUnits * plateAspect).toBeGreaterThanOrEqual(heroAspect - 1e-9);
      }
    }
  });

  it('never lets the plate slide off its own edge', () => {
    for (const heroAspect of HERO_ASPECTS) {
      for (const plateY of [0, 0.25, 0.5, 0.75, 1]) {
        for (const targetY of [0, 0.3, 0.6, 1]) {
          const fit = fitPlate({ heroAspect, plateAspect: 1672 / 941, plateY, targetY });
          expect(fit.positionYPercent).toBeGreaterThanOrEqual(0);
          expect(fit.positionYPercent).toBeLessThanOrEqual(100);
          // The whole hero has to stay covered: top of plate at or above 0, bottom at or below 1.
          expect(renderedRow(fit, 0)).toBeLessThanOrEqual(1e-9);
          expect(renderedRow(fit, 1)).toBeGreaterThanOrEqual(1 - 1e-9);
        }
      }
    }
  });

  it('reports the shortfall rather than hiding it when the scale cap bites', () => {
    // ocean-sunrise: the horizon is painted at 0.740 and wants to land at eye level, 0.456. Getting
    // it there needs a 2.1x blow-up of a 941px-tall plate, so the cap holds and the miss is real.
    const fit = fitPlate({
      heroAspect: 1.907,
      plateAspect: 1672 / 941,
      plateY: 0.74,
      targetY: 0.456,
    });
    expect(fit.clamped).toBe(true);
    expect(fit.errorY).toBeGreaterThan(0);
    expect(fit.heightPercent / 100).toBeLessThanOrEqual(DEFAULT_MAX_SCALE * 1.0001 * (1.907 / (1672 / 941)));
    // Still a large improvement on the centred crop, which lands the horizon on her feet.
    expect(renderedRow(fit, 0.74)).toBeLessThan(renderedRow(coverFit(1.907, 1672 / 941), 0.74));
  });

  it('keeps the centred crop available for a plate that declares no anchor', () => {
    const fit = coverFit(1.907, 1672 / 941);
    expect(fit.positionYPercent).toBe(50);
    expect(fit.clamped).toBe(false);
    expect(fit.heightPercent).toBeCloseTo((1.907 / (1672 / 941)) * 100, 6);
  });

  it('always leaves at least the minimum overscan to position within', () => {
    expect(overscanFor(0.5, 0.5)).toBeGreaterThanOrEqual(MIN_OVERSCAN);
    const fit = fitPlate({ heroAspect: 1.0, plateAspect: 1.0, plateY: 0.5, targetY: 0.5 });
    expect(fit.heightPercent / 100).toBeGreaterThanOrEqual(1 + MIN_OVERSCAN);
  });

  it('renderedRow inverts the fit, so the algebra cannot agree with itself by accident', () => {
    const fit = fitPlate({
      heroAspect: 1.43,
      plateAspect: 1.5,
      plateY: 0.62,
      targetY: 0.5,
      maxScale: 8,
    });
    const k = fit.heightPercent / 100;
    const trim = (fit.positionYPercent / 100) * (k - 1);
    expect(renderedRow(fit, 0.62)).toBeCloseTo(0.62 * k - trim, 12);
    expect(renderedRow(fit, 0.62)).toBeCloseTo(0.5, 9);
  });

  it('survives degenerate inputs instead of producing NaN', () => {
    const fit = fitPlate({ heroAspect: 0, plateAspect: 0, plateY: 0.5, targetY: 0.5 });
    expect(Number.isFinite(fit.heightPercent)).toBe(true);
    expect(Number.isFinite(fit.positionYPercent)).toBe(true);
  });
});
