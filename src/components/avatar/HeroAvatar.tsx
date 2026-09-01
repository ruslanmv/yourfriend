import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
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
  const handleReady = useCallback(() => setLiveReady(true), []);
  const handleError = useCallback(() => setLiveReady(false), []);

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

  return <div ref={ref} className={`hero-avatar${liveReady ? ' is-live' : ''}`}>
    <AvatarPoster theme={theme} hidden={liveReady}/>
    {requested && <Suspense fallback={null}><LazyAvatarCanvas active={visible} onReady={handleReady} onError={handleError}/></Suspense>}
  </div>;
}
