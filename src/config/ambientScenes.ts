import type { AmbientScene } from '../types';

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

/**
 * The scene library behind the hero.
 *
 * Two things here are not obvious.
 *
 * **The horizon rows were read off the plates, not guessed.** Each landscape plate was rendered
 * with a labelled grid and its sea/sky line read to about half a percent, then refined with a
 * gradient search constrained to that reading. An unconstrained detector was tried first and
 * discarded: it locked onto the lit terrace lip and onto moon-path specular bands, and reported
 * horizons up to seven points away from the visible one. A number that confident and that wrong is
 * worse than no number, so the search is only ever allowed to refine a human reading.
 *
 * **Every plate anchors its horizon to the eyeline, and every one of them clamps.** A level camera
 * puts the horizon at its own height — 0.44 to 0.47 of the hero on desktop. These plates paint the
 * horizon at 0.59 to 0.92, which is to say they were composed as wallpaper, with the sea at the
 * bottom, and a centred cover crop lands their horizon almost exactly on her feet. That is the
 * "floating over water" look: she stands *on* the horizon, which nothing can do. Anchoring pulls
 * it as far up as `DEFAULT_MAX_SCALE` allows, which is a real improvement and still short of
 * correct. Closing the rest of the gap needs plates painted with the horizon at 0.452 (desktop
 * master) and 0.636 (portrait master) and with ground under her feet — that is what the
 * `yourfriend-marketing-hero-v1` profile in 3D-Ambience-Studio generates, and when those land the
 * anchors below become `{ plateY: <ground row>, heroY: 'feet' }` and stop clamping.
 *
 * Portrait plates are absent until that batch is generated. `resolveScenePlate` falls back to the
 * landscape plate, so the mobile hero keeps working rather than showing nothing — but a 16:9 plate
 * cover-cropped into a 0.31 hero keeps a fifth of its width and none of its composition, which is
 * exactly why the portrait masters exist.
 */

/** Every landscape plate in this set is 1672x941. */
const LANDSCAPE_ASPECT = 1672 / 941;

export const ambientScenes: AmbientScene[] = [
  {
    id: 'ocean',
    label: 'Ocean',
    description: 'Open water at sunrise and under moonlight',
    plates: {
      light: {
        src: asset('ambient/light/ocean-sunrise.webp'),
        aspect: LANDSCAPE_ASPECT,
        anchor: { plateY: 0.74, heroY: 'eyeline' },
      },
      dark: {
        src: asset('ambient/dark/ocean-moonlight.webp'),
        aspect: LANDSCAPE_ASPECT,
        anchor: { plateY: 0.59, heroY: 'eyeline' },
      },
    },
    thumbs: {
      light: asset('ambient/thumbs/light-ocean-sunrise.webp'),
      dark: asset('ambient/thumbs/dark-ocean-moonlight.webp'),
    },
    duration: 24000,
    transitionDuration: 3400,
    focalPoint: 'center',
    skyDetail: 'plain',
    contactShadow: 'rgba(24, 48, 82, 0.38)',
  },
  {
    id: 'lake',
    label: 'Lake',
    description: 'A still mountain lake',
    plates: {
      light: {
        src: asset('ambient/light/mountain-lake.webp'),
        aspect: LANDSCAPE_ASPECT,
        anchor: { plateY: 0.66, heroY: 'eyeline' },
      },
      dark: {
        src: asset('ambient/dark/mountain-lake-night.webp'),
        aspect: LANDSCAPE_ASPECT,
        anchor: { plateY: 0.659, heroY: 'eyeline' },
      },
    },
    thumbs: {
      light: asset('ambient/thumbs/light-mountain-lake.webp'),
      dark: asset('ambient/thumbs/dark-mountain-lake-night.webp'),
    },
    duration: 26000,
    transitionDuration: 3600,
    focalPoint: 'center',
    skyDetail: 'plain',
    contactShadow: 'rgba(18, 40, 74, 0.4)',
  },
  {
    id: 'garden',
    label: 'Garden',
    description: 'Stepping stones in a meditation garden',
    plates: {
      light: {
        src: asset('ambient/light/meditation-garden.webp'),
        aspect: LANDSCAPE_ASPECT,
        anchor: { plateY: 0.672, heroY: 'eyeline' },
      },
      dark: {
        src: asset('ambient/dark/meditation-garden-night.webp'),
        aspect: LANDSCAPE_ASPECT,
        anchor: { plateY: 0.676, heroY: 'eyeline' },
      },
    },
    thumbs: {
      light: asset('ambient/thumbs/light-meditation-garden.webp'),
      dark: asset('ambient/thumbs/dark-meditation-garden-night.webp'),
    },
    duration: 28000,
    transitionDuration: 3800,
    focalPoint: 'center',
    skyDetail: 'plain',
    contactShadow: 'rgba(40, 52, 44, 0.42)',
  },
  {
    id: 'terrace',
    label: 'Terrace',
    description: 'A coastal terrace above the sea',
    plates: {
      light: {
        src: asset('ambient/light/coastal-terrace.webp'),
        aspect: LANDSCAPE_ASPECT,
        anchor: { plateY: 0.598, heroY: 'eyeline' },
      },
      dark: {
        src: asset('ambient/dark/coastal-terrace-twilight.webp'),
        aspect: LANDSCAPE_ASPECT,
        anchor: { plateY: 0.654, heroY: 'eyeline' },
      },
    },
    thumbs: {
      light: asset('ambient/thumbs/light-coastal-terrace.webp'),
      dark: asset('ambient/thumbs/dark-coastal-terrace-twilight.webp'),
    },
    duration: 25000,
    transitionDuration: 3400,
    focalPoint: 'center',
    skyDetail: 'plain',
    contactShadow: 'rgba(58, 46, 38, 0.44)',
  },
  {
    id: 'sky',
    label: 'Open sky',
    description: 'High cloud and starlight',
    plates: {
      // No anchor, deliberately. The faint line at 0.92 of these two plates is the bottom edge of
      // a sky, not a horizon to stand in front of: anchoring it moves it four points and costs a
      // 34% enlargement of the only two plates whose whole subject is fine cloud detail. A scene
      // with no ground and no usable horizon is honest about it and takes the centred crop.
      light: { src: asset('ambient/light/open-sky.webp'), aspect: LANDSCAPE_ASPECT },
      dark: { src: asset('ambient/dark/starlight-sky.webp'), aspect: LANDSCAPE_ASPECT },
    },
    thumbs: {
      light: asset('ambient/thumbs/light-open-sky.webp'),
      dark: asset('ambient/thumbs/dark-starlight-sky.webp'),
    },
    duration: 27000,
    transitionDuration: 3600,
    focalPoint: 'center',
    // The only plates in the set with real sky interest of their own; the decorative shooting
    // stars are suppressed over them so two effects are not competing for the same patch of sky.
    skyDetail: 'rich',
    contactShadow: 'rgba(30, 44, 78, 0.34)',
  },
];
