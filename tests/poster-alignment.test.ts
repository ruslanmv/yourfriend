import { describe, expect, it } from 'vitest';
import {
  LIVE_FRAMING,
  POSTER_BOUNDS,
  liveFraming,
  posterFraming,
  posterTransform,
  posterTransformStyle,
  transformedPosterFraming,
} from '../src/components/avatar/posterAlignment';

describe('poster and live avatar alignment', () => {
  it('starts from a genuine mismatch, which is the thing being fixed', () => {
    const poster = posterFraming();
    const live = liveFraming();
    expect(Math.abs(poster.height - live.height)).toBeGreaterThan(0.1);
    expect(Math.abs(poster.feet - live.feet)).toBeGreaterThan(0.02);
  });

  it('lands the transformed poster on the live framing exactly', () => {
    const after = transformedPosterFraming();
    const live = liveFraming();
    expect(after.height).toBeCloseTo(live.height, 9);
    expect(after.center).toBeCloseTo(live.center, 9);
    expect(after.feet).toBeCloseTo(live.feet, 9);
    expect(after.head).toBeCloseTo(live.head, 9);
  });

  it('shrinks the poster rather than enlarging it, so no resampling softens her', () => {
    expect(posterTransform().scale).toBeLessThan(1);
    expect(posterTransform().scale).toBeGreaterThan(0.8);
  });

  it('recomputes when the poster asset changes instead of drifting silently', () => {
    // A regenerated poster with different alpha bounds must produce a different transform, not the
    // same one: that is the whole reason this is derived rather than a magic number in the CSS.
    const tighter = posterFraming({ top: 0.1, bottom: 0.9, left: 0.3, right: 0.7 });
    const transform = posterTransform(tighter);
    const after = transformedPosterFraming(tighter, transform);
    expect(transform.scale).not.toBeCloseTo(posterTransform().scale, 4);
    expect(after.feet).toBeCloseTo(liveFraming().feet, 9);
  });

  it('tracks the camera constants rather than assuming them', () => {
    const framing = liveFraming({ padding: 1.05, verticalBias: 0 });
    expect(framing.height).toBeCloseTo(1 / 1.05, 9);
    expect(framing.center).toBeCloseTo(0.5, 9);
    // The shipped constants are the ones fitCameraToObject defaults to.
    expect(LIVE_FRAMING.padding).toBe(1.2);
    expect(LIVE_FRAMING.verticalBias).toBe(0.04);
  });

  it('keeps her inside the stage after the transform, head and feet both', () => {
    const after = transformedPosterFraming();
    expect(after.head).toBeGreaterThan(0);
    expect(after.feet).toBeLessThan(1);
  });

  it('emits custom properties the stylesheet can consume', () => {
    const style = posterTransformStyle();
    expect(style['--poster-align-scale']).toMatch(/^0\.\d+$/);
    expect(style['--poster-align-shift']).toMatch(/^-?\d+\.\d+%$/);
  });

  it('describes the poster asset that is actually in the repository', () => {
    // 900x1200, avatar rows 42-1169, columns 311-587. If the poster is regenerated these change.
    expect(POSTER_BOUNDS.top * 1200).toBeCloseTo(42, 6);
    expect(POSTER_BOUNDS.bottom * 1200).toBeCloseTo(1169, 6);
    expect(POSTER_BOUNDS.left * 900).toBeCloseTo(311, 6);
    expect(POSTER_BOUNDS.right * 900).toBeCloseTo(587, 6);
  });
});
