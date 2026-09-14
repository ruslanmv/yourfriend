/**
 * Where a scenic plate has to sit so its painted ground meets her feet.
 *
 * `background-size: cover` crops around the *centre* of the plate. That is fine for wallpaper and
 * wrong for a composition: the hero's aspect swings from 0.23 to 2.54 across the widths this site
 * actually gets (see `heroCalibration.ts`), so a centred crop slides the painted ground up and
 * down by tens of pixels while her feet stay put. She ends up hovering above a shoreline at one
 * width and buried in it at another — which is the defect this module exists to remove.
 *
 * The fix is to stop cropping centred and start fitting to a declared anchor: the scene says
 * "plate row `plateY` is the ground" and this says where to put the plate so that row renders at
 * her feet.
 *
 * ## The arithmetic
 *
 * Work in container units, where 1 is the hero's height and the hero's width is `heroAspect`.
 * Scale the plate so its rendered height is `k` container units. Its rendered width is then
 * `k * plateAspect`, and it covers the hero horizontally as long as `k * plateAspect >= heroAspect`,
 * i.e. `k >= heroAspect / plateAspect`.
 *
 * Cover picks exactly that minimum, which leaves *zero* vertical slack whenever the plate is wider
 * than the hero — and then nothing can be positioned, because the plate is already exactly as tall
 * as the box. So take
 *
 *     k = max(1 + overscan, heroAspect / plateAspect)
 *
 * which guarantees at least `overscan` of the plate's height is available to slide. That is the
 * whole trick: a few percent of deliberate overscan buys the freedom to anchor.
 *
 * With `t` container units trimmed off the top, plate row F renders at `F * k - t`. Setting that
 * to the target row gives `t = F * k - target`, and CSS expresses the trim as a percentage
 * position `P` of the excess, so `P = t / (k - 1)`.
 *
 * `P` is clamped to [0, 1]: an anchor that would need to pull the plate past its own edge gets the
 * nearest achievable framing instead of a transparent gap. `overscanFor` picks enough overscan
 * that the clamp is not reached for any anchor/target pair this site uses, but the clamp stays as
 * the guarantee that no combination of numbers can ever expose the background through the plate.
 */

export interface PlateFit {
  /** `background-size`'s height, as a percentage of the hero. Width follows from the aspect. */
  readonly heightPercent: number;
  /** `background-position-y`, as a percentage. */
  readonly positionYPercent: number;
  /** True when the anchor could not be honoured exactly and the plate was held against an edge. */
  readonly clamped: boolean;
  /** How far the anchor missed, in fractions of hero height. Zero unless `clamped`. */
  readonly errorY: number;
}

/**
 * How far a plate may be enlarged past cover before it is visibly soft.
 *
 * A plate is already upscaled on a wide screen; the anchor asks for more on top of that. Past
 * roughly a third, the painterly plates this site ships start to read as blurry rather than as
 * atmospheric, so the anchor yields instead of the image quality. `fitPlate` reports the shortfall
 * in `errorY` rather than hiding it, and the calibration overlay draws it.
 */
export const DEFAULT_MAX_SCALE = 1.34;

/** Never fit a plate with less than this fraction of spare height. Roughly one letterbox bar. */
export const MIN_OVERSCAN = 0.06;

/**
 * How much overscan this anchor needs.
 *
 * Beyond the floor, an anchor that sits low in the plate but high in the hero (or the reverse)
 * needs proportionally more slack before the clamp bites. Solving `0 <= F*k - target <= k - 1` for
 * k gives `k >= (1 - target) / (1 - F)` on one side and `k >= target / F` on the other; take the
 * larger, with a little margin so rounding never lands exactly on the boundary.
 */
export function overscanFor(plateY: number, targetY: number): number {
  const needTop = plateY > 0 ? targetY / plateY : 1;
  const needBottom = plateY < 1 ? (1 - targetY) / (1 - plateY) : 1;
  return Math.max(1 + MIN_OVERSCAN, needTop, needBottom) * 1.01 - 1;
}

/**
 * Fit a plate to the hero so `anchor.plateY` renders at `targetY`.
 *
 * `heroAspect` and `plateAspect` are width/height. `targetY` is already resolved — the caller
 * looks up the feet curve, because this module deliberately knows nothing about the avatar.
 */
export function fitPlate({
  heroAspect,
  plateAspect,
  plateY,
  targetY,
  maxScale = DEFAULT_MAX_SCALE,
}: {
  heroAspect: number;
  plateAspect: number;
  plateY: number;
  targetY: number;
  maxScale?: number;
}): PlateFit {
  const safeHero = Math.max(heroAspect, 0.01);
  const safePlate = Math.max(plateAspect, 0.01);
  // Cover has two conditions, not one: the plate must be at least as tall as the hero (k >= 1) and
  // at least as wide (k * plateAspect >= heroAspect). Only the second is `heroAspect / plateAspect`,
  // and on a phone that ratio is about 0.13 — so treating it alone as the floor lets the cap shrink
  // the plate to a fraction of the hero and open a transparent gap above and below it.
  const minK = Math.max(1, safeHero / safePlate);
  // The cap is only allowed to limit the *extra* height the anchor asked for, never that floor.
  const wantedK = Math.max(1 + overscanFor(plateY, targetY), minK);
  const k = Math.max(minK, Math.min(wantedK, minK * maxScale));

  const excess = k - 1;
  const wanted = plateY * k - targetY;
  const trim = Math.min(Math.max(wanted, 0), Math.max(excess, 0));
  const positionY = excess > 0 ? trim / excess : 0.5;
  const landed = plateY * k - trim;

  return {
    heightPercent: k * 100,
    positionYPercent: positionY * 100,
    clamped: Math.abs(landed - targetY) > 1e-6,
    errorY: landed - targetY,
  };
}

/** The plain centred cover crop, for a plate that declares no anchor. */
export function coverFit(heroAspect: number, plateAspect: number): PlateFit {
  const k = Math.max(1, Math.max(heroAspect, 0.01) / Math.max(plateAspect, 0.01));
  return { heightPercent: k * 100, positionYPercent: 50, clamped: false, errorY: 0 };
}

/**
 * Where plate row F actually renders under a given fit — the inverse, for tests and the overlay.
 *
 * Everything this module claims is checked through here rather than by re-deriving the algebra in
 * the test, so a sign error cannot agree with itself.
 */
export function renderedRow(fit: PlateFit, plateRow: number): number {
  const k = fit.heightPercent / 100;
  const trim = (fit.positionYPercent / 100) * (k - 1);
  return plateRow * k - trim;
}
