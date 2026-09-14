/**
 * The marketing hero's camera contract: yourfriend-marketing-hero-v1.
 *
 * Every number here was measured from the running site with Playwright at nineteen viewport
 * widths, not estimated from a screenshot and not borrowed from 3D-Avatar-Chatbot. The app
 * centres its avatar and frames her at 30 degrees in a viewport the user controls; this page puts
 * her in the right column of a two-column hero whose height is driven by copy and whose *aspect
 * therefore changes with the browser width*. The two compositions have almost nothing in common,
 * and a plate authored for one will not fit the other.
 *
 * ## What was measured
 *
 * The poster asset (`companion-waiting-standard.png`, 900x1200) carries the avatar in rows
 * 42-1169 and columns 311-587. Combined with `object-fit: contain` and the live
 * `.avatar-poster img` rectangle, that gives where she actually lands in the hero:
 *
 *     hero width   hero box        aspect   centre x   feet y   head y   eye level
 *          2560    2560x1006.8     2.543     0.642     0.753    0.256     0.485
 *          1920    1920x1006.8     1.907     0.689     0.743    0.246     0.475
 *          1600    1600x1006.8     1.589     0.732     0.734    0.237     0.466
 *          1440    1440x1006.8     1.430     0.739     0.734    0.237     0.466
 *          1280    1280x1006.8     1.271     0.721     0.731    0.234     0.463
 *          1180    1180x1006.8     1.172     0.720     0.731    0.234     0.463
 *          1024    1024x938.8      1.091     0.738     0.746    0.248     0.477
 *           900     900x938.8      0.959     0.742     0.728    0.264     0.477
 *           820     820x938.8      0.873     0.741     0.706    0.283     0.478
 *           768     768x938.8      0.818     0.740     0.695    0.286     0.474
 *     ---- layout breakpoint: 760px ----
 *           760     760x1266.5     0.600     0.499     0.833    0.491     0.648
 *           744     744x1266.5     0.588     0.499     0.833    0.491     0.648
 *           600     600x1285.3     0.467     0.499     0.835    0.498     0.653
 *           540     540x1281.7     0.421     0.499     0.835    0.497     0.652
 *           430     430x1286.6     0.334     0.499     0.836    0.507     0.658
 *           414     414x1287.6     0.322     0.499     0.837    0.520     0.665
 *           390     390x1252.6     0.311     0.499     0.834    0.527     0.668
 *           360     360x1321.9     0.272     0.499     0.844    0.576     0.702
 *           320     320x1372.4     0.233     0.499     0.839    0.604     0.712
 *
 * These are the figures *after* `posterAlignment` scales the poster to agree with the live camera.
 * The first pass measured the untransformed poster and read her feet three to four points lower;
 * those numbers are gone, because the alignment change invalidated them and a contract measured
 * against a layout the site no longer has is worse than no contract. Re-run
 * `tools/measure-hero.mjs` after any change to the hero grid, the avatar stage, the poster asset or
 * `fitCameraToObject`'s padding, and update this table in the same commit.
 *
 * Three things fall out of that table, and all three shape the art.
 *
 * **The split is the 760px layout breakpoint, not the aspect and not the orientation.** At 768px
 * the hero is 0.818 — taller than it is wide — and yet it is still the desktop composition, with
 * her on the right. One pixel of width below that and she is centred and 13 points lower. Picking
 * the profile by aspect (or by `orientation: portrait`) gets the 768-1024 tablet band wrong in
 * both directions, so `profileForHeroWidth` keys off the same 760px the stylesheets do.
 *
 * **The hero aspect is not a constant within a profile either.** Desktop runs 0.82 to 2.54
 * because the height is set by copy while the width is not; portrait runs 0.23 to 0.60 — nowhere
 * near 9:16. A plate is therefore *always* cover-cropped here, and the contract has to survive a
 * range of crops rather than match one aspect.
 *
 * **Her feet move more than a fixed ground line can absorb.** 0.695 to 0.753 on desktop: six
 * points, about sixty pixels. A plate with the ground painted at one row and dropped in with a
 * centred crop is correct at one width and wrong everywhere else. That is why `feetYAt` exists
 * and why `fitPlate` positions the plate against it instead of centring.
 */

/** Below this hero width the stylesheets stack the hero and centre her; above it she is on the right. */
export const HERO_PORTRAIT_MAX_WIDTH = 760;

export const HERO_PROFILE_ID = 'yourfriend-marketing-hero-v1';

/** A measured [hero width in px, fraction of hero height] sample. Interpolated between, clamped outside. */
export type MeasuredCurve = readonly (readonly [number, number])[];

export interface HeroProfile {
  /** Which of the two compositions this is. */
  readonly id: 'desktop' | 'portrait';
  /** Master size a plate for this profile is authored at. */
  readonly master: { readonly width: number; readonly height: number };
  /** Hero aspects this profile is responsible for, as measured. */
  readonly heroAspect: { readonly min: number; readonly max: number };
  /** Where her feet land, per hero width. The plate's ground is fitted to this. */
  readonly feetCurve: MeasuredCurve;
  /** Where the top of her head lands, per hero width. Art must not put clutter here. */
  readonly headCurve: MeasuredCurve;
  /** Where her centre line lands, per hero width. */
  readonly centerXCurve: MeasuredCurve;
  /**
   * Where a level camera's horizon must land, per hero width.
   *
   * Derived from the other two curves rather than measured separately: a level camera puts the
   * true horizon at its own height, and `fitCameraToObject` sets that to the avatar's vertical
   * centre plus four percent of her height. So `eye = (head + feet) / 2 - 0.04 * (feet - head)`.
   * Kept as a curve rather than a constant so the derivation stays visible and so a future change
   * to `verticalBias` shows up here rather than silently invalidating the art.
   */
  readonly eyeLevelCurve: MeasuredCurve;
  /** Widest measured body width as a fraction of hero width. */
  readonly bodyWidth: number;
  /** The corridor that must stay free of prominent foreground detail, in hero-width fractions. */
  readonly avatarCorridor: { readonly x0: number; readonly x1: number };
  /** Where the marketing copy sits, and must stay readable. */
  readonly copySafe: {
    readonly x0: number;
    readonly y0: number;
    readonly x1: number;
    readonly y1: number;
  };
  /** Controls that overlap the art and must not fight it. */
  readonly controlZones: readonly {
    readonly id: string;
    readonly x0: number;
    readonly y0: number;
    readonly x1: number;
    readonly y1: number;
  }[];
}

export const heroProfiles: Record<'desktop' | 'portrait', HeroProfile> = {
  /**
   * Desktop and tablet down to 761px: copy left, avatar right.
   *
   * The corridor is far wider than she is because her centre drifts from 0.642 at 2560 to 0.742
   * at 900 — the avatar box is a capped 600px inside a fluid grid column, so its centre is not a
   * fixed fraction of anything. Art that only clears her at 1920 has a tree through her at 1440.
   */
  desktop: {
    id: 'desktop',
    master: { width: 1920, height: 1080 },
    heroAspect: { min: 0.81, max: 2.55 },
    feetCurve: [
      [768, 0.695],
      [820, 0.7055],
      [900, 0.7277],
      [1024, 0.746],
      [1180, 0.7314],
      [1280, 0.7314],
      [1440, 0.7343],
      [1600, 0.7343],
      [1920, 0.7431],
      [2560, 0.7531],
    ],
    headCurve: [
      [768, 0.2863],
      [820, 0.2829],
      [900, 0.2638],
      [1024, 0.2484],
      [1180, 0.2342],
      [1280, 0.2342],
      [1440, 0.2372],
      [1600, 0.2372],
      [1920, 0.2459],
      [2560, 0.256],
    ],
    centerXCurve: [
      [768, 0.7404],
      [900, 0.7423],
      [1024, 0.7379],
      [1180, 0.7199],
      [1280, 0.721],
      [1440, 0.7391],
      [1600, 0.7322],
      [1920, 0.6893],
      [2560, 0.642],
    ],
    eyeLevelCurve: [
      [768, 0.4743],
      [900, 0.4772],
      [1024, 0.4773],
      [1280, 0.4629],
      [1440, 0.4659],
      [1600, 0.4659],
      [1920, 0.4746],
      [2560, 0.4847],
    ],
    bodyWidth: 0.1224,
    // 0.56 rather than 0.58: at 2560 her centre has drifted left to 0.642, and the corridor has to
    // contain the *widest* body (0.138, measured at 768) wherever that centre goes, not the narrow
    // body she happens to have at the width where she sits furthest left.
    avatarCorridor: { x0: 0.56, x1: 0.82 },
    copySafe: { x0: 0.0, y0: 0.16, x1: 0.5, y1: 0.78 },
    controlZones: [
      { id: 'header', x0: 0.0, y0: 0.0, x1: 1.0, y1: 0.09 },
      { id: 'scene-slider', x0: 0.0, y0: 0.84, x1: 0.42, y1: 1.0 },
      { id: 'audio', x0: 0.78, y0: 0.9, x1: 1.0, y1: 1.0 },
    ],
  },
  /**
   * 760px and below: copy above, avatar centred beneath it.
   *
   * Nothing about the desktop composition transfers. She is centred rather than right, her feet
   * are ten points lower, and she occupies 14-25% of the width rather than 5-12%. Her feet are
   * however almost perfectly stable here (0.833-0.844), because the mobile rules size her from
   * the viewport width rather than from a capped grid column.
   */
  portrait: {
    id: 'portrait',
    master: { width: 1080, height: 1920 },
    heroAspect: { min: 0.22, max: 0.61 },
    feetCurve: [
      [320, 0.8393],
      [360, 0.8436],
      [390, 0.8335],
      [414, 0.8369],
      [430, 0.8361],
      [540, 0.8349],
      [600, 0.8354],
      [760, 0.833],
    ],
    headCurve: [
      [320, 0.6042],
      [390, 0.527],
      [430, 0.5071],
      [540, 0.4965],
      [600, 0.4979],
      [760, 0.4905],
    ],
    centerXCurve: [
      [320, 0.4989],
      [760, 0.4994],
    ],
    eyeLevelCurve: [
      [320, 0.7124],
      [390, 0.668],
      [430, 0.6584],
      [540, 0.6522],
      [600, 0.6532],
      [760, 0.6481],
    ],
    bodyWidth: 0.2469,
    avatarCorridor: { x0: 0.3, x1: 0.7 },
    copySafe: { x0: 0.0, y0: 0.06, x1: 1.0, y1: 0.42 },
    controlZones: [
      { id: 'header', x0: 0.0, y0: 0.0, x1: 1.0, y1: 0.07 },
      { id: 'scene-slider', x0: 0.0, y0: 0.9, x1: 1.0, y1: 1.0 },
    ],
  },
};

/** Which composition a hero of this width is governed by. Keyed off the stylesheets' own breakpoint. */
export function profileForHeroWidth(heroWidth: number): HeroProfile {
  return heroWidth <= HERO_PORTRAIT_MAX_WIDTH ? heroProfiles.portrait : heroProfiles.desktop;
}

/**
 * Read a measured curve at an arbitrary hero width.
 *
 * Piecewise-linear rather than a fitted constant because the desktop feet curve is not monotonic:
 * it peaks at 0.761 at 1024 and falls to 0.747 by 1180, where a second media query takes over the
 * avatar's size. Any smooth fit misses that step by a visible amount.
 */
export function sampleCurve(curve: MeasuredCurve, heroWidth: number): number {
  if (curve.length === 0) return 0.5;
  if (heroWidth <= curve[0][0]) return curve[0][1];
  const last = curve[curve.length - 1];
  if (heroWidth >= last[0]) return last[1];
  for (let i = 1; i < curve.length; i += 1) {
    const [x1, y1] = curve[i];
    if (heroWidth <= x1) {
      const [x0, y0] = curve[i - 1];
      const t = (heroWidth - x0) / (x1 - x0);
      return y0 + (y1 - y0) * t;
    }
  }
  return last[1];
}

/** Where her feet land, as a fraction of hero height, at this hero width. */
export function feetYAt(profile: HeroProfile, heroWidth: number): number {
  return sampleCurve(profile.feetCurve, heroWidth);
}

/** Where the top of her head lands, as a fraction of hero height, at this hero width. */
export function headYAt(profile: HeroProfile, heroWidth: number): number {
  return sampleCurve(profile.headCurve, heroWidth);
}

/** Where a level camera's horizon belongs, as a fraction of hero height, at this hero width. */
export function eyeLevelYAt(profile: HeroProfile, heroWidth: number): number {
  return sampleCurve(profile.eyeLevelCurve, heroWidth);
}

/**
 * Turn a plate anchor's `heroY` into an actual row.
 *
 * `'feet'` is for a plate with real ground painted under her; `'eyeline'` is for a plate whose
 * only usable reference is its horizon, which on a level camera belongs at eye height no matter
 * how far away the water is.
 */
export function resolveHeroRow(
  heroY: number | 'feet' | 'eyeline',
  profile: HeroProfile,
  heroWidth: number,
): number {
  if (heroY === 'feet') return feetYAt(profile, heroWidth);
  if (heroY === 'eyeline') return eyeLevelYAt(profile, heroWidth);
  return heroY;
}
