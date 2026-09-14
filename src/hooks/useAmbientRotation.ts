import { useCallback, useEffect, useRef, useState } from 'react';
import type { AmbientScene } from '../types';

export interface AmbientRotation {
  /** Index of the scene on screen. */
  index: number;
  /** True while a manual choice is holding the rotation. */
  paused: boolean;
  /** Show a scene; `fromUser` also pauses the rotation for a while. */
  goTo: (next: number, fromUser?: boolean) => void;
}

export function useAmbientRotation(scenes: AmbientScene[], disabled = false): AmbientRotation {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const interactionTimer = useRef<number | null>(null);

  const goTo = useCallback((next: number, fromUser = false) => {
    setIndex((next + scenes.length) % scenes.length);
    if (fromUser) {
      setPaused(true);
      if (interactionTimer.current) window.clearTimeout(interactionTimer.current);
      interactionTimer.current = window.setTimeout(() => setPaused(false), 12000);
    }
  }, [scenes.length]);

  useEffect(() => {
    if (disabled || paused || document.hidden || scenes.length < 2) return;
    const delay = scenes[index]?.duration ?? 24000;
    const timer = window.setTimeout(() => goTo(index + 1), delay);
    return () => window.clearTimeout(timer);
  }, [disabled, paused, index, scenes, goTo]);

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  return { index, paused, goTo };
}
