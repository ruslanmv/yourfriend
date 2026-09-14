import { useEffect, useState } from 'react';
import type { AmbientScene, Theme } from '../../types';

type SkyDetail = AmbientScene['skyDetail'];

const MIN_BURST_DELAY_MS = 60_000;
const MAX_BURST_DELAY_MS = 120_000;
const BURST_VISIBLE_MS = 2_800;

type StarBurst = {
  count: 1 | 2;
};

/**
 * Occasional shooting stars, and the restraint to stop.
 *
 * The effect was written against flat gradient skies. The scenic plates are not flat: `open-sky`
 * and `starlight-sky` carry real cloud structure and their own stars, and a CSS streak drawn over
 * them does not read as a shooting star — it reads as a rendering artefact crossing a photograph.
 * So a scene declares how much sky it already has and this stands down over the busy ones, rather
 * than the page shipping two atmospheres fighting for the same patch of sky.
 *
 * The burst is also one or two stars now rather than two or three. Over a plain plate the old
 * count was a shower; the point was meant to be that you might catch one.
 */
export function NightSkyEffect({
  theme,
  skyDetail,
}: {
  theme: Theme;
  skyDetail: SkyDetail;
}) {
  const [burst, setBurst] = useState<StarBurst | null>(null);
  const busySky = skyDetail === 'rich';

  useEffect(() => {
    setBurst(null);
    if (theme !== 'dark' || busySky) return;

    const reducedMotion = typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    let showTimer: number | undefined;
    let hideTimer: number | undefined;
    let cancelled = false;

    const scheduleBurst = () => {
      const delay = MIN_BURST_DELAY_MS
        + Math.round(Math.random() * (MAX_BURST_DELAY_MS - MIN_BURST_DELAY_MS));

      showTimer = window.setTimeout(() => {
        if (cancelled) return;

        setBurst({ count: Math.random() < 0.5 ? 1 : 2 });
        hideTimer = window.setTimeout(() => {
          if (cancelled) return;
          setBurst(null);
          scheduleBurst();
        }, BURST_VISIBLE_MS);
      }, delay);
    };

    scheduleBurst();

    return () => {
      cancelled = true;
      if (showTimer !== undefined) window.clearTimeout(showTimer);
      if (hideTimer !== undefined) window.clearTimeout(hideTimer);
    };
  }, [theme, busySky]);

  if (theme !== 'dark' || busySky || !burst) return null;

  return <div className="night-sky-effect" aria-hidden="true">
    {Array.from({ length: burst.count }, (_, index) => (
      <span key={index} className={`shooting-star shooting-star--${index + 1}`}/>
    ))}
  </div>;
}
