import {
  profileForHeroWidth,
  resolveHeroRow,
  type HeroProfile,
} from '../../config/heroCalibration';
import type { AmbientScene, ScenePlate, Theme } from '../../types';
import { coverFit, fitPlate, type PlateFit } from './plateFit';

export interface ComposedScene {
  /** The plate actually shown. */
  readonly plate: ScenePlate;
  /** True when the portrait composition was asked for and the landscape plate stood in. */
  readonly fellBackToLandscape: boolean;
  /** Which composition the hero is in. */
  readonly profile: HeroProfile;
  /** How to size and position the plate. */
  readonly fit: PlateFit;
}

/**
 * Pick the plate for this theme and this hero shape.
 *
 * The fallback chain is deliberately shallow — portrait plate, else the landscape plate of the same
 * theme — because the alternative, falling back across themes, puts a noon sky behind a dark-mode
 * page. A missing portrait plate is a composition compromise; a missing theme is a bug, and the
 * type system already prevents it.
 */
export function resolveScenePlate(
  scene: AmbientScene,
  theme: Theme,
  portrait: boolean,
): { plate: ScenePlate; fellBackToLandscape: boolean } {
  const landscape = theme === 'dark' ? scene.plates.dark : scene.plates.light;
  if (!portrait) return { plate: landscape, fellBackToLandscape: false };
  const authored = theme === 'dark' ? scene.plates.darkPortrait : scene.plates.lightPortrait;
  if (authored) return { plate: authored, fellBackToLandscape: false };
  return { plate: landscape, fellBackToLandscape: true };
}

/**
 * Everything the stylesheet needs to put this scene behind this hero.
 *
 * Pure, and given the hero's measured box rather than reading the DOM, so the whole composition is
 * testable without a layout engine — which matters, because jsdom has no layout engine and the
 * parts of this that can be wrong are all arithmetic.
 */
export function composeScene({
  scene,
  theme,
  heroWidth,
  heroHeight,
}: {
  scene: AmbientScene;
  theme: Theme;
  heroWidth: number;
  heroHeight: number;
}): ComposedScene {
  const profile = profileForHeroWidth(heroWidth);
  const { plate, fellBackToLandscape } = resolveScenePlate(scene, theme, profile.id === 'portrait');
  const heroAspect = heroHeight > 0 ? heroWidth / heroHeight : 1;

  // A plate that fell back has not been composed for this shape, so honouring its anchor would be
  // claiming a precision it does not have. Centre it instead and let the contact shadow carry the
  // grounding until the portrait masters exist.
  const anchor = fellBackToLandscape ? undefined : plate.anchor;
  const fit = anchor
    ? fitPlate({
        heroAspect,
        plateAspect: plate.aspect,
        plateY: anchor.plateY,
        targetY: resolveHeroRow(anchor.heroY, profile, heroWidth),
      })
    : coverFit(heroAspect, plate.aspect);

  return { plate, fellBackToLandscape, profile, fit };
}

/** The CSS a composed scene turns into. Kept here so the test can assert the strings, not a mock. */
export function plateStyle(composed: ComposedScene): {
  backgroundImage: string;
  backgroundSize: string;
  backgroundPosition: string;
} {
  return {
    backgroundImage: `url(${composed.plate.src})`,
    backgroundSize: `auto ${composed.fit.heightPercent.toFixed(3)}%`,
    backgroundPosition: `50% ${composed.fit.positionYPercent.toFixed(3)}%`,
  };
}
