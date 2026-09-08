const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
const projectAsset = (path: string) => `https://raw.githubusercontent.com/ruslanmv/3D-Avatar-Chatbot/master/${path}`;

export const avatarConfig = {
  enableLiveVRM: import.meta.env.VITE_ENABLE_LIVE_VRM === 'true',
  // Vendored locally so the landing page does not depend on a cross-repository
  // binary fetch at runtime. Other verified redesign models live beside it.
  model: asset('avatar/models/cc0/AvatarSample_A.vrm'),
  // Real capture from the 3D Avatar Chatbot build. The old vector portraits remain
  // only as emergency fallbacks if the remote project asset cannot be loaded.
  posters: {
    light: projectAsset('assets/companion-fullscreen.png'),
    dark: projectAsset('assets/companion-fullscreen.png'),
  },
  // Dedicated square companion portrait for close-up motion/behavior previews.
  // This avoids trying to extract a tiny face from the full application screenshot.
  motionPortrait: projectAsset('assets/companion-512.png'),
  fallbackPosters: {
    light: asset('avatar/posters/companion-light.svg'),
    dark: asset('avatar/posters/companion-dark.svg'),
  },
  source: {
    repository: 'https://github.com/ruslanmv/3D-Avatar-Chatbot',
    avatar: 'AvatarSample A',
    license: 'CC0',
    localModel: 'public/avatar/models/cc0/AvatarSample_A.vrm',
  },
  performance: {
    desktopFPS: 30,
    desktopDPR: 1.5,
    mobileFPS: 24,
    mobileDPR: 1.25,
  },
  transition: {
    minimumPosterMs: 1800,
    posterToLive: 900,
    stableFrames: 8,
  },
  idleDelay: 1000,
} as const;
