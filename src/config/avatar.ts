const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

const waitingStandardPoster = asset('avatar/posters/companion-waiting-standard.png');

export const avatarConfig = {
  enableLiveVRM: import.meta.env.VITE_ENABLE_LIVE_VRM === 'true',
  // Vendored locally so redesign work can still use the same CC0 VRM model.
  model: asset('avatar/models/cc0/AvatarSample_A.vrm'),
  // One canonical marketing render generated from the real application after
  // applying vendor/animations/vrma/waiting-standard.vrma. Using the same asset
  // in both themes avoids the previous screenshot -> T-pose visual jump.
  posters: {
    light: waitingStandardPoster,
    dark: waitingStandardPoster,
  },
  // Reuse the same authored pose in the animation/behavior section so the site
  // presents one coherent companion rather than unrelated avatar screenshots.
  motionPortrait: waitingStandardPoster,
  fallbackPosters: {
    light: asset('avatar/posters/companion-light.svg'),
    dark: asset('avatar/posters/companion-dark.svg'),
  },
  source: {
    repository: 'https://github.com/ruslanmv/3D-Avatar-Chatbot',
    avatar: 'AvatarSample A',
    license: 'CC0',
    localModel: 'public/avatar/models/cc0/AvatarSample_A.vrm',
    poster: 'public/avatar/posters/companion-waiting-standard.png',
    animation: 'vendor/animations/vrma/waiting-standard.vrma',
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
