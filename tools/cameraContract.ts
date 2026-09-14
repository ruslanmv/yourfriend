/**
 * The camera contract 3D-Ambience-Studio generates against, derived from the measured hero.
 *
 * The Studio cannot import `heroCalibration.ts`, and this repository cannot run the Studio. The
 * contract JSON is the seam, and it is *generated* rather than written, for the same reason the
 * chatbot generates its own: a hand-maintained copy of a measurement drifts the moment either side
 * changes, and the failure is silent — the art still generates, it just no longer fits.
 *
 *     npm run export:camera-contract
 *
 * `tests/camera-contract.test.ts` regenerates it and fails if the committed copy has drifted, so
 * re-measuring the hero without re-exporting cannot reach a commit.
 *
 * ## Deriving a camera from a layout
 *
 * The Studio's schema wants a photographic camera: a field of view, a pitch, an eye height, a
 * distance. The hero has none of those — it is a CSS box with a poster in it. But the three rows
 * that *were* measured (her head, her feet, and the eye level a level camera implies) are exactly
 * enough to recover one, because a pinhole camera looking at a figure of known height standing on
 * the ground projects those three rows and nothing else is free:
 *
 *     horizon  = eye height, always, whatever the pitch
 *     feet     = ground at distance d, seen from eye height h
 *     head     = the same point 1.6m higher
 *
 * Three equations, four unknowns (h, d, fov, pitch), so one is chosen rather than solved: the
 * camera distance is fixed at the same value for both profiles, because a marketing set where the
 * portrait plate is shot from a different distance than the landscape one looks like two different
 * places. Everything else is solved to land the measured rows exactly.
 */

import {
  HERO_PROFILE_ID,
  eyeLevelYAt,
  feetYAt,
  headYAt,
  heroProfiles,
  sampleCurve,
  type HeroProfile,
} from '../src/config/heroCalibration';

/** The nominal companion the whole contract is expressed against. Matches the VRM the site ships. */
const NOMINAL = { height: 1.6, width: 0.55, footY: 0 };

/**
 * One distance for both profiles, in metres.
 *
 * Free parameter, not a measurement. Six metres is what the landscape profile's own numbers imply
 * at the 30 degrees the live avatar camera uses, so picking it means the landscape plate agrees
 * with the WebGL camera and the portrait plate agrees with the landscape plate.
 */
const CAMERA_DISTANCE = 6.005;

const deg = (radians: number) => (radians * 180) / Math.PI;
const rad = (degrees: number) => (degrees * Math.PI) / 180;

/** The hero width at which a profile's master aspect is reproduced exactly. */
function heroWidthAtMasterAspect(profile: HeroProfile): number {
  // Hero height is effectively constant within a profile (1006.8 desktop above 1024, 1266.5
  // portrait), so the width that produces the master aspect follows directly from it.
  const heroHeight = profile.id === 'desktop' ? 1006.8 : 1266.5;
  return (profile.master.width / profile.master.height) * heroHeight;
}

/**
 * Solve the camera that projects these three rows.
 *
 * Two unknowns once the distance is fixed — the camera's height and its field of view — and the
 * pitch follows from them, because the horizon lands at `0.5 - tan(pitch)/tan(halfFov)/2` whatever
 * else is true. So: nested bisection, the inner one choosing a field of view that makes her the
 * right height on screen, the outer one choosing a camera height that puts her feet on the right
 * row.
 *
 * The first version of this skipped the outer loop and read the camera height straight off the
 * image, as `1.6 * (foot - horizon) / (foot - head)`. That treats the projection as linear, which
 * it is not: a metre near the camera covers more of the frame than a metre far from it, so the
 * horizon does not divide her in the same ratio on screen as it does in the world. It was half a
 * pixel out at 1080 — small enough to ship and wrong enough that the self-consistency test in
 * `tests/camera-contract.test.mjs` caught it, which is what that test is for.
 */
function solveCamera({
  headY,
  footY,
  horizonY,
  distance,
}: {
  headY: number;
  footY: number;
  horizonY: number;
  distance: number;
}) {
  // Where a point `metresAboveGround` high at `distance` lands, for a given camera.
  const rowFor = (metresAboveGround: number, eyeHeight: number, halfFov: number) => {
    const pitch = Math.atan(Math.tan(halfFov) * (1 - 2 * horizonY));
    const angleBelowHorizon = Math.atan((eyeHeight - metresAboveGround) / distance);
    return 0.5 + Math.tan(angleBelowHorizon - pitch) / Math.tan(halfFov) / 2;
  };

  // Inner: the field of view that makes her the measured height on screen. She grows as the lens
  // narrows, so the search is monotonic.
  const fovFor = (eyeHeight: number) => {
    let lo = rad(2);
    let hi = rad(120);
    for (let i = 0; i < 120; i += 1) {
      const mid = (lo + hi) / 2;
      const span = rowFor(0, eyeHeight, mid) - rowFor(NOMINAL.height, eyeHeight, mid);
      if (span > footY - headY) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  };

  // Outer: the camera height that puts her feet on the measured row. Raising the camera pushes the
  // ground further down the frame, so this is monotonic too.
  let lo = 0.01;
  let hi = NOMINAL.height - 0.01;
  for (let i = 0; i < 120; i += 1) {
    const mid = (lo + hi) / 2;
    if (rowFor(0, mid, fovFor(mid)) < footY) lo = mid;
    else hi = mid;
  }
  const eyeHeight = (lo + hi) / 2;
  const halfFov = fovFor(eyeHeight);
  const pitch = Math.atan(Math.tan(halfFov) * (1 - 2 * horizonY));

  return {
    eyeHeight,
    halfFov,
    pitch,
    rowForDistance: (metres: number) =>
      0.5 + Math.tan(Math.atan(eyeHeight / metres) - pitch) / Math.tan(halfFov) / 2,
  };
}

const GROUND_DISTANCE_CANDIDATES = [1, 2, 3, 4, 5, 6, 8, 12, 16, 24, 32, 48];

const box = (zone: { x0: number; y0: number; x1: number; y1: number }) => ({
  x0: round(zone.x0),
  y0: round(zone.y0),
  x1: round(zone.x1),
  y1: round(zone.y1),
});
// Six places, not five: the test reprojects the *published* numbers and checks they land on the
// measured rows, and five places on the pitch and the eye height is only just enough to pass.
const round = (value: number, places = 6) => Number(value.toFixed(places));

function buildProfile(profile: HeroProfile) {
  const width = heroWidthAtMasterAspect(profile);
  const headY = headYAt(profile, width);
  const footY = feetYAt(profile, width);
  const horizonY = eyeLevelYAt(profile, width);
  const centerX = sampleCurve(profile.centerXCurve, width);
  const camera = solveCamera({ headY, footY, horizonY, distance: CAMERA_DISTANCE });

  // The safe zone is the *corridor*, not where she happens to be at this one width. Her centre
  // drifts a tenth of the frame across the widths this page gets, and art that only clears her at
  // the master aspect has a tree through her everywhere else. The rows are likewise the extremes
  // of the measured curves rather than this width's values.
  const feetRows = profile.feetCurve.map(([, y]) => y);
  const headRows = profile.headCurve.map(([, y]) => y);

  return {
    master: { width: profile.master.width, height: profile.master.height },
    fovDeg: round(deg(camera.halfFov) * 2),
    aspect: round(profile.master.width / profile.master.height, 6),
    pitchDeg: round(deg(camera.pitch)),
    eyeHeightMetres: round(camera.eyeHeight, 4),
    cameraDistanceMetres: round(CAMERA_DISTANCE, 4),
    horizonY: round(horizonY),
    headTopY: round(headY),
    footAnchor: { x: round(centerX), y: round(footY) },
    safeZone: {
      x0: round(profile.avatarCorridor.x0),
      x1: round(profile.avatarCorridor.x1),
      y0: round(Math.min(...headRows)),
      y1: round(Math.max(...feetRows)),
    },
    groundLines: GROUND_DISTANCE_CANDIDATES.map((metres) => ({
      metres,
      y: round(camera.rowForDistance(metres)),
    })).filter((line) => line.y > horizonY && line.y <= 1),
    // Regions the plate must keep smooth because type is composited over them. This is what makes
    // the contract a *marketing* one — the chatbot renders nothing over its backplate and publishes
    // none.
    //
    // Only the two zones where type sits on bare plate. The header bar and the audio chip are also
    // control zones, but both draw their own translucent surface with a backdrop blur behind them,
    // so the plate underneath is already softened. Publishing all four spent a quarter of the
    // prompt on constraints the layout had already satisfied, and diluted the one that matters:
    // the headline has no backing at all.
    quietZones: [
      { id: 'copy', ...box(profile.copySafe) },
      ...profile.controlZones
        .filter((zone) => zone.id === 'scene-slider')
        .map((zone) => ({ id: zone.id, ...box(zone) })),
    ],
  };
}

const contract = {
  schemaVersion: 1,
  id: HERO_PROFILE_ID,
  runtime: 'yourfriend',
  generatedBy: 'tools/export-camera-contract.ts',
  sourceOfTruth: 'src/config/heroCalibration.ts',
  nominalAvatar: NOMINAL,
  profiles: {
    landscape: buildProfile(heroProfiles.desktop),
    portrait: buildProfile(heroProfiles.portrait),
  },
};

export const cameraContract = contract;
