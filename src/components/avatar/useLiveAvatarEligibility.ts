import { avatarConfig } from '../../config/avatar';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useWebGLCapability } from './useWebGLCapability';

interface DeviceNavigator extends Navigator { deviceMemory?: number }

export function useLiveAvatarEligibility(visible: boolean) {
  const reducedMotion = useReducedMotion();
  const webGL2 = useWebGLCapability();
  const nav = navigator as DeviceNavigator;
  const mobile = typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 760px), (pointer: coarse)').matches;
  const enoughMemory = nav.deviceMemory === undefined || nav.deviceMemory >= 4;
  const enoughCores = nav.hardwareConcurrency === undefined || nav.hardwareConcurrency >= 4;
  return avatarConfig.enableLiveVRM && webGL2 && !reducedMotion && !mobile && enoughMemory && enoughCores && visible;
}
