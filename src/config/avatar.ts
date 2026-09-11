const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

// The poster was regenerated with a genuinely transparent RGBA background in
// PR #23. Keep a revision token on the public-file URL so browsers/CDNs cannot
// reuse the earlier black-background response that had the same pathname.
const waitingStandardPoster = asset(
  'avatar/posters/companion-waiting-standard.png?v=transparent-20260908-1',
);

// Keep the marketing idle pinned to the exact source revision that produced
// the canonical waiting pose. This prevents an upstream animation update from
// changing the landing-page motion without a reviewed change here.
const waitingStandardAnimation =
  'https://raw.githubusercontent.com/ruslanmv/3D-Avatar-Chatbot/d6dc8536de80e728f847b720fec3963bfebeba40/vendor/animations/vrma/waiting-standard.vrma';

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
  animations: {
    waiting: waitingStandardAnimation,
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
    posterRevision: 'transparent-20260908-1',
    animation: 'vendor/animations/vrma/waiting-standard.vrma',
    animationRevision: 'd6dc8536de80e728f847b720fec3963bfebeba40',
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
