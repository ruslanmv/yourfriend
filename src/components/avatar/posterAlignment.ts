/**
 * Making the poster and the live avatar occupy the same place.
 *
 * These are two completely different renderings of the same character and, until this module, two
 * different framings of her:
 *
 * - The **poster** is a 900x1200 PNG whose opaque pixels run from row 42 to row 1169 and column
 *   311 to column 587. Drawn with `object-fit: contain` it fills the stage, so she occupies 93.9%
 *   of the stage's height with her centre at 50.5% of it.
 * - The **live canvas** is framed by `fitCameraToObject`, which pads the fit by 20% and biases the
 *   look-at point up by 4% of her height. So she occupies 1/1.2 = 83.3% of the frame, centred at
 *   50% + 4%/1.2 = 53.3%.
 *
 * The hand-off therefore made her shrink by 11% and drop by 3% of the stage in the same 900ms
 * crossfade — a visible pop at exactly the moment the page is trying to convince you she is real.
 *
 * The fix adjusts the **poster**, not the camera. Changing `padding` or `verticalBias` would move
 * the live framing to full bleed and break the headroom guarantee `avatarFraming.test.ts` pins
 * (her face must not sit on the top frame edge); it would also change the framing for every
 * viewport at once. Scaling the poster is a CSS transform on one element with no such reach.
 *
 * Everything below is derived from the two sets of constants rather than written down as a magic
 * transform, so a regenerated poster with different alpha bounds, or a change to the camera
 * padding, recomputes instead of silently drifting apart again.
 */

/** Where the avatar's opaque pixels sit in the poster, as fractions of the image. */
export interface PosterBounds {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export const POSTER_BOUNDS: PosterBounds = {
  top: 42 / 1200,
  bottom: 1169 / 1200,
  left: 311 / 900,
  right: 587 / 900,
};

export interface LiveFramingConstants {
  /** `fitCameraToObject`'s padding: the fraction of extra frame left around her. */
  padding: number;
  /** Its vertical bias: how far the look-at point sits above her centre, in body heights. */
  verticalBias: number;
}

/** The framing constants `fitCameraToObject` is called with. Must track its defaults. */
export const LIVE_FRAMING: LiveFramingConstants = { padding: 1.2, verticalBias: 0.04 };

export interface StageFraming {
  /** Her height as a fraction of the stage's height. */
  height: number;
  /** Her vertical centre as a fraction of the stage's height, measured from the top. */
  center: number;
  /** Her feet as a fraction of the stage's height. */
  feet: number;
  /** The top of her head as a fraction of the stage's height. */
  head: number;
}

/** Where the untransformed poster puts her on the stage. */
export function posterFraming(bounds: PosterBounds = POSTER_BOUNDS): StageFraming {
  const height = bounds.bottom - bounds.top;
  return {
    height,
    center: (bounds.top + bounds.bottom) / 2,
    feet: bounds.bottom,
    head: bounds.top,
  };
}

/** Where the live camera puts her on the same stage. */
export function liveFraming(framing: LiveFramingConstants = LIVE_FRAMING): StageFraming {
  const height = 1 / framing.padding;
  const center = 0.5 + framing.verticalBias / framing.padding;
  return { height, center, feet: center + height / 2, head: center - height / 2 };
}

export interface PosterTransform {
  /** Uniform scale to apply to the poster image. */
  scale: number;
  /** Translation along Y, as a percentage of the poster element's own height, applied before the scale. */
  translateYPercent: number;
}

/**
 * The transform that makes the poster agree with the live camera.
 *
 * CSS applies the functions in `transform: scale(s) translateY(t)` right to left, so the translate
 * happens first and is then scaled — which is why the translation is divided by the scale here. Get
 * that backwards and she lands 3% off, which is small enough to ship and large enough to see.
 */
export function posterTransform(
  poster: StageFraming = posterFraming(),
  live: StageFraming = liveFraming(),
): PosterTransform {
  const scale = live.height / poster.height;
  // Scaling about the element's centre (0.5) moves her centre to 0.5 + (posterCenter - 0.5) * scale.
  const centerAfterScale = 0.5 + (poster.center - 0.5) * scale;
  const shift = live.center - centerAfterScale;
  return { scale, translateYPercent: (shift / scale) * 100 };
}

/** Where the poster puts her once transformed — the check that the transform did what it claims. */
export function transformedPosterFraming(
  poster: StageFraming = posterFraming(),
  transform: PosterTransform = posterTransform(),
): StageFraming {
  const height = poster.height * transform.scale;
  const center =
    0.5 +
    (poster.center - 0.5) * transform.scale +
    (transform.translateYPercent / 100) * transform.scale;
  return { height, center, feet: center + height / 2, head: center - height / 2 };
}

/** The custom properties the stylesheet reads. */
export function posterTransformStyle(transform: PosterTransform = posterTransform()) {
  return {
    '--poster-align-scale': transform.scale.toFixed(5),
    '--poster-align-shift': `${transform.translateYPercent.toFixed(4)}%`,
  } as Record<string, string>;
}
