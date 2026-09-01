import { avatarConfig } from '../../config/avatar';

export function avatarQuality() {
  const mobile = window.matchMedia('(max-width: 1024px), (pointer: coarse)').matches;
  return mobile
    ? { fps: avatarConfig.performance.mobileFPS, dpr: avatarConfig.performance.mobileDPR }
    : { fps: avatarConfig.performance.desktopFPS, dpr: avatarConfig.performance.desktopDPR };
}
