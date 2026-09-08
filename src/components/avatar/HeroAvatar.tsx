import { lazy, Suspense, useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { avatarConfig } from '../../config/avatar';
import type { Theme } from '../../types';
import { AvatarPoster } from './AvatarPoster';
import { useAvatarVisibility } from './useAvatarVisibility';
import { useLiveAvatarEligibility } from './useLiveAvatarEligibility';

const LazyAvatarCanvas = lazy(() => import('./AvatarCanvas'));

type IdleWindow = Window & typeof globalThis & { requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };

export function HeroAvatar({ theme }: { theme: Theme }) {
  const [requested, setRequested] = useState(false);
  const [liveReady, setLiveReady] = useState(false);
  const { ref, visible } = useAvatarVisibility<HTMLDivElement>();
  const eligible = useLiveAvatarEligibility(visible);
  const liveActive = visible && eligible;
  const mountedAtRef = useRef(Date.now());
  const readyTimerRef = useRef<number | null>(null);
  const canGoLiveRef = useRef(liveActive);
  canGoLiveRef.current = liveActive;

  const clearReadyTimer = useCallback(() => {
    if (readyTimerRef.current === null) return;
    window.clearTimeout(readyTimerRef.current);
    readyTimerRef.current = null;
  }, []);

  const handleReady = useCallback(() => {
    if (!canGoLiveRef.current) return;
    clearReadyTimer();
    const elapsed = Date.now() - mountedAtRef.current;
    const remaining = Math.max(0, avatarConfig.transition.minimumPosterMs - elapsed);
    if (remaining === 0) {
      setLiveReady(true);
      return;
    }
    readyTimerRef.current = window.setTimeout(() => {
      readyTimerRef.current = null;
      if (canGoLiveRef.current) setLiveReady(true);
    }, remaining);
  }, [clearReadyTimer]);

  const handleError = useCallback(() => {
    clearReadyTimer();
    setLiveReady(false);
  }, [clearReadyTimer]);

  useEffect(() => {
    if (!eligible || requested) return;
    const idleWindow = window as IdleWindow;
    const request = idleWindow.requestIdleCallback;
    if (request) {
      const id = request(() => setRequested(true), { timeout: 1800 });
      return () => idleWindow.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(() => setRequested(true), avatarConfig.idleDelay);
    return () => window.clearTimeout(id);
  }, [eligible, requested]);

  useEffect(() => {
    if (liveActive) return;
    clearReadyTimer();
    setLiveReady(false);
  }, [clearReadyTimer, liveActive]);

  useEffect(() => () => clearReadyTimer(), [clearReadyTimer]);

  const style = { '--avatar-transition-ms': `${avatarConfig.transition.posterToLive}ms` } as CSSProperties;

  return <div ref={ref} className={`hero-avatar${liveReady ? ' is-live' : ''}`} data-live-state={liveReady ? 'live' : 'poster'} style={style}>
    <AvatarPoster theme={theme} hidden={liveReady}/>
    {requested && <Suspense fallback={null}><LazyAvatarCanvas active={liveActive} onReady={handleReady} onError={handleError}/></Suspense>}
  </div>;
}
