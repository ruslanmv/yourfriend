const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

export const avatarConfig = {
  enableLiveVRM: import.meta.env.VITE_ENABLE_LIVE_VRM === 'true',
  model: asset('avatar/models/companion.vrm'),
  posters: {
    light: asset('avatar/posters/companion-light.svg'),
    dark: asset('avatar/posters/companion-dark.svg'),
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
