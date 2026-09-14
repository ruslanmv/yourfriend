import { useEffect, useRef, useState } from 'react';

export interface HeroBox {
  width: number;
  height: number;
}

/**
 * The hero's measured box, for code that has to do real geometry against it.
 *
 * Seeded from `window.innerWidth` so the very first paint already picks the right composition —
 * measuring in an effect would render the desktop plate for one frame on a phone, which is a
 * visible flash of the wrong picture and a wasted 200KB download.
 *
 * Observing the element rather than the window is what keeps an orientation change from disturbing
 * the slider: this hook owns only the box, the rotation only changes the box, and the active scene
 * index lives in a different hook entirely. There is no path from a resize to the selection.
 *
 * Sizes are rounded to whole pixels before they reach state, so sub-pixel layout jitter during a
 * scroll or a font swap cannot drive a render loop.
 */
export function useHeroBox<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [box, setBox] = useState<HeroBox>(() => ({
    width: typeof window === 'undefined' ? 1440 : window.innerWidth,
    height: typeof window === 'undefined' ? 1007 : Math.round(window.innerWidth / 1.43),
  }));

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const read = () => {
      const rect = element.getBoundingClientRect();
      const next = { width: Math.round(rect.width), height: Math.round(rect.height) };
      if (next.width <= 0 || next.height <= 0) return;
      setBox((current) =>
        current.width === next.width && current.height === next.height ? current : next,
      );
    };

    read();
    if (typeof ResizeObserver !== 'function') {
      window.addEventListener('resize', read);
      return () => window.removeEventListener('resize', read);
    }
    const observer = new ResizeObserver(read);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, box };
}
