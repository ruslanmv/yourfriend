const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

// Existing, reviewed marketing renders are bundled from the preserved art library.
// Replace these with transparent canonical VRM renders when licensed exports exist.
const companionLight = new URL('../../docs/reference-images/companion-integrated/01-ocean-sunrise-companion.png', import.meta.url).href;
const companionDark = new URL('../../docs/reference-images/companion-integrated/01-ocean-moonlight-companion.png', import.meta.url).href;

export const avatarConfig = {
  enableLiveVRM: import.meta.env.VITE_ENABLE_LIVE_VRM === 'true',
  model: asset('avatar/models/companion.vrm'),
  posters: { light: companionLight, dark: companionDark },
  performance: {
    desktopFPS: 30,
    desktopDPR: 1.5,
    mobileFPS: 24,
    mobileDPR: 1.25,
  },
  transition: { posterToLive: 750 },
  idleDelay: 1000,
} as const;
