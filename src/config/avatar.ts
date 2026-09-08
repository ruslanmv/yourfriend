const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
const projectAsset = (path: string) => `https://raw.githubusercontent.com/ruslanmv/3D-Avatar-Chatbot/master/${path}`;

export const avatarConfig = {
  enableLiveVRM: import.meta.env.VITE_ENABLE_LIVE_VRM === 'true',
  // Same CC0 VRM shipped by the open-source project that this page showcases.
  model: projectAsset('vendor/avatars/AvatarSample_A.vrm'),
  // Real capture from the 3D Avatar Chatbot build. The old vector portraits remain
  // only as emergency fallbacks if the remote project asset cannot be loaded.
  posters: {
    light: projectAsset('assets/companion-fullscreen.png'),
    dark: projectAsset('assets/companion-fullscreen.png'),
  },
  fallbackPosters: {
    light: asset('avatar/posters/companion-light.svg'),
    dark: asset('avatar/posters/companion-dark.svg'),
  },
  source: {
    repository: 'https://github.com/ruslanmv/3D-Avatar-Chatbot',
    avatar: 'AvatarSample A',
    license: 'CC0',
  },
  performance: {
    desktopFPS: 30,
    desktopDPR: 1.5,
    mobileFPS: 24,
    mobileDPR: 1.25,
  },
  transition: { posterToLive: 750 },
  idleDelay: 1000,
} as const;
