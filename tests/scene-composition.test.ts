import { describe, expect, it } from 'vitest';
import { ambientScenes } from '../src/config/ambientScenes';
import { heroProfiles } from '../src/config/heroCalibration';
import { composeScene, plateStyle, resolveScenePlate } from '../src/components/ambient/sceneComposition';
import { coverFit, renderedRow } from '../src/components/ambient/plateFit';
import type { Theme } from '../src/types';

const THEMES: Theme[] = ['light', 'dark'];
const DESKTOP = { width: 1920, height: 1007 };
const PHONE = { width: 390, height: 1253 };

describe('the scene library', () => {
  it('ships the five scenes the page is built around', () => {
    expect(ambientScenes.map((scene) => scene.id)).toEqual([
      'ocean',
      'lake',
      'garden',
      'terrace',
      'sky',
    ]);
  });

  it('resolves a plate for every scene, theme and hero composition', () => {
    for (const scene of ambientScenes) {
      for (const theme of THEMES) {
        for (const portrait of [false, true]) {
          const { plate } = resolveScenePlate(scene, theme, portrait);
          expect(plate.src).toMatch(/\.webp$/);
          expect(plate.aspect).toBeGreaterThan(0);
        }
      }
    }
  });

  it('falls back to the landscape plate when a portrait one has not been authored yet', () => {
    // The portrait masters come from the 3D-Ambience-Studio batch. Until they land the mobile hero
    // must still show the scene rather than nothing, and it must say that it compromised.
    const scene = ambientScenes[0];
    const resolved = resolveScenePlate(scene, 'light', true);
    expect(resolved.plate.src).toBe(scene.plates.light.src);
    expect(resolved.fellBackToLandscape).toBe(true);
  });

  it('prefers an authored portrait plate over the fallback', () => {
    const scene = {
      ...ambientScenes[0],
      plates: {
        ...ambientScenes[0].plates,
        lightPortrait: { src: '/ambient/portrait/x.webp', aspect: 1080 / 1920 },
      },
    };
    const resolved = resolveScenePlate(scene, 'light', true);
    expect(resolved.plate.src).toBe('/ambient/portrait/x.webp');
    expect(resolved.fellBackToLandscape).toBe(false);
  });

  it('never crosses themes to find a plate', () => {
    for (const scene of ambientScenes) {
      expect(resolveScenePlate(scene, 'dark', true).plate.src).toBe(scene.plates.dark.src);
      expect(resolveScenePlate(scene, 'light', true).plate.src).toBe(scene.plates.light.src);
    }
  });

  it('drops the anchor when a plate stood in for a shape it was not composed for', () => {
    // Honouring a landscape plate's anchor inside a 0.31 hero would be claiming a precision the
    // picture does not have. Centre it instead.
    const composed = composeScene({
      scene: ambientScenes[0],
      theme: 'light',
      heroWidth: PHONE.width,
      heroHeight: PHONE.height,
    });
    expect(composed.fellBackToLandscape).toBe(true);
    expect(composed.fit.positionYPercent).toBe(50);
  });

  it('covers the hero at every measured width, in both themes and every scene', () => {
    const widths: [number, number][] = [
      [2560, 1007],
      [1920, 1007],
      [1440, 1007],
      [1024, 939],
      [768, 939],
      [760, 1267],
      [430, 1287],
      [320, 1372],
    ];
    for (const scene of ambientScenes) {
      for (const theme of THEMES) {
        for (const [width, height] of widths) {
          const composed = composeScene({ scene, theme, heroWidth: width, heroHeight: height });
          const k = composed.fit.heightPercent / 100;
          expect(k).toBeGreaterThanOrEqual(1);
          expect(k * composed.plate.aspect).toBeGreaterThanOrEqual(width / height - 1e-9);
          expect(renderedRow(composed.fit, 0)).toBeLessThanOrEqual(1e-9);
          expect(renderedRow(composed.fit, 1)).toBeGreaterThanOrEqual(1 - 1e-9);
        }
      }
    }
  });

  it('pulls every anchored horizon up off her feet, which is the defect it exists to fix', () => {
    // Cover-cropped, these plates land their horizon between 0.59 and 0.76 of the hero — on or
    // below her feet at 0.758, which is a place nobody can stand in front of. Anchored, every one
    // of them clears her knees.
    for (const scene of ambientScenes) {
      for (const theme of THEMES) {
        const composed = composeScene({
          scene,
          theme,
          heroWidth: DESKTOP.width,
          heroHeight: DESKTOP.height,
        });
        const anchor = composed.plate.anchor;
        if (!anchor) continue;
        const anchored = renderedRow(composed.fit, anchor.plateY);
        const centred = renderedRow(coverFit(DESKTOP.width / DESKTOP.height, composed.plate.aspect), anchor.plateY);
        expect(anchored).toBeLessThan(centred);
        expect(anchored).toBeLessThan(0.66);
      }
    }
  });

  it('leaves the pure-sky scene on the centred crop, because it has no horizon to anchor', () => {
    const sky = ambientScenes.find((scene) => scene.id === 'sky')!;
    expect(sky.plates.light.anchor).toBeUndefined();
    expect(sky.plates.dark.anchor).toBeUndefined();
    const composed = composeScene({
      scene: sky,
      theme: 'dark',
      heroWidth: DESKTOP.width,
      heroHeight: DESKTOP.height,
    });
    expect(composed.fit.positionYPercent).toBe(50);
  });

  it('turns a composition into CSS that does not re-assert cover', () => {
    const composed = composeScene({
      scene: ambientScenes[0],
      theme: 'light',
      heroWidth: DESKTOP.width,
      heroHeight: DESKTOP.height,
    });
    const style = plateStyle(composed);
    expect(style.backgroundImage).toBe(`url(${composed.plate.src})`);
    expect(style.backgroundSize).toMatch(/^auto \d+\.\d+%$/);
    expect(style.backgroundPosition).toMatch(/^50% \d+\.\d+%$/);
  });

  it('declares a plate aspect that matches the profile masters it will be regenerated against', () => {
    expect(heroProfiles.desktop.master.width / heroProfiles.desktop.master.height).toBeCloseTo(
      16 / 9,
      6,
    );
    expect(heroProfiles.portrait.master.width / heroProfiles.portrait.master.height).toBeCloseTo(
      9 / 16,
      6,
    );
  });

  it('gives every scene a tinted contact shadow and an honest sky-detail flag', () => {
    for (const scene of ambientScenes) {
      expect(scene.contactShadow).toMatch(/^rgba\(/);
      expect(['plain', 'rich']).toContain(scene.skyDetail);
      expect(scene.description.length).toBeGreaterThan(8);
    }
    expect(ambientScenes.find((scene) => scene.id === 'sky')?.skyDetail).toBe('rich');
  });
});
