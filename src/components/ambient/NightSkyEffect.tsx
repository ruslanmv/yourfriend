import { useEffect, useState } from 'react';
import type { Theme } from '../../types';

const MIN_BURST_DELAY_MS = 60_000;
const MAX_BURST_DELAY_MS = 120_000;
const BURST_VISIBLE_MS = 2_800;

type StarBurst = {
  count: 2 | 3;
};

export function NightSkyEffect({ theme }: { theme: Theme }) {
  const [burst, setBurst] = useState<StarBurst | null>(null);

  useEffect(() => {
    setBurst(null);
    if (theme !== 'dark') return;

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

        setBurst({ count: Math.random() < 0.5 ? 2 : 3 });
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
  }, [theme]);

  if (theme !== 'dark' || !burst) return null;

  return <div className="night-sky-effect" aria-hidden="true">
    {Array.from({ length: burst.count }, (_, index) => (
      <span key={index} className={`shooting-star shooting-star--${index + 1}`}/>
    ))}
  </div>;
}
