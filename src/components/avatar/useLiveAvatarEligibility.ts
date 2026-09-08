import { avatarConfig } from '../../config/avatar';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useWebGLCapability } from './useWebGLCapability';

interface DeviceNavigator extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

export function useLiveAvatarEligibility(visible: boolean) {
  const reducedMotion = useReducedMotion();
  const webGL2 = useWebGLCapability();
  const nav = navigator as DeviceNavigator;
  const enoughMemory = nav.deviceMemory === undefined || nav.deviceMemory >= 4;
  const enoughCores = nav.hardwareConcurrency === undefined || nav.hardwareConcurrency >= 4;
  const dataSaver = nav.connection?.saveData === true;

  // Mobile already has a lower FPS/DPR profile in AvatarQuality. Let capable
  // phones render the actual VRM instead of permanently showing the poster.
  return avatarConfig.enableLiveVRM && webGL2 && !reducedMotion && !dataSaver && enoughMemory && enoughCores && visible;
}
