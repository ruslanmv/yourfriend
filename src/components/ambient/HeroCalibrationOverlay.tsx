import { useEffect, useState } from 'react';
import { ambientScenes } from '../../config/ambientScenes';
import {
  HERO_PROFILE_ID,
  eyeLevelYAt,
  feetYAt,
  headYAt,
  profileForHeroWidth,
  resolveHeroRow,
  sampleCurve,
} from '../../config/heroCalibration';
import type { Theme } from '../../types';
import { composeScene } from './sceneComposition';
import { renderedRow } from './plateFit';

/**
 * The instrument the calibration was derived with, and the one that proves it is still true.
 *
 * Mounted only when the URL carries `?heroCalibration=1`, which nothing on the site links to and
 * nothing sets by itself: in ordinary use this renders `null` before it reads a single layout
 * value, so it cannot cost a paint or a measurement. It is deliberately not behind
 * `import.meta.env.DEV` as well — the numbers it draws are only interesting against a real
 * production build, and being able to open the deployed site with the overlay on is how a drift in
 * the contract gets caught after a CSS change rather than before one.
 *
 * What it draws, all of it from the same functions production uses:
 *   - the copy-safe box, which art must not compete with;
 *   - the avatar corridor, which art must keep clear of foreground clutter;
 *   - her measured head, centre and feet lines for this exact hero width;
 *   - the eye level, where a level camera puts the true horizon;
 *   - where the active scene's plate anchor *actually* lands, and by how much it missed;
 *   - the control exclusion zones.
 */
export function HeroCalibrationOverlay({ theme = 'light' }: { theme?: Theme }) {
  const [enabled, setEnabled] = useState(false);
  const [box, setBox] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const on = new URLSearchParams(window.location.search).get('heroCalibration') === '1';
    setEnabled(on);
    if (!on) return;

    const hero = document.querySelector('.hero');
    if (!hero) return;
    const read = () => {
      const rect = hero.getBoundingClientRect();
      setBox({ width: Math.round(rect.width), height: Math.round(rect.height) });
    };
    read();
    const observer = new ResizeObserver(read);
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  if (!enabled || !box) return null;

  const profile = profileForHeroWidth(box.width);
  const feet = feetYAt(profile, box.width);
  const head = headYAt(profile, box.width);
  const eye = eyeLevelYAt(profile, box.width);
  const centerX = sampleCurve(profile.centerXCurve, box.width);

  const scene = ambientScenes[0];
  const composed = composeScene({
    scene,
    theme,
    heroWidth: box.width,
    heroHeight: box.height,
  });
  const anchor = composed.fellBackToLandscape ? undefined : composed.plate.anchor;
  const anchorLanded = anchor ? renderedRow(composed.fit, anchor.plateY) : null;
  const anchorWanted = anchor ? resolveHeroRow(anchor.heroY, profile, box.width) : null;

  const pct = (value: number) => `${(value * 100).toFixed(2)}%`;

  return (
    <div className="hero-calibration" aria-hidden="true">
      <div
        className="hero-calibration__zone hero-calibration__zone--copy"
        style={{
          left: pct(profile.copySafe.x0),
          top: pct(profile.copySafe.y0),
          width: pct(profile.copySafe.x1 - profile.copySafe.x0),
          height: pct(profile.copySafe.y1 - profile.copySafe.y0),
        }}
      >
        <span>copy safe</span>
      </div>

      <div
        className="hero-calibration__zone hero-calibration__zone--corridor"
        style={{
          left: pct(profile.avatarCorridor.x0),
          top: 0,
          width: pct(profile.avatarCorridor.x1 - profile.avatarCorridor.x0),
          height: '100%',
        }}
      >
        <span>avatar corridor</span>
      </div>

      {profile.controlZones.map((zone) => (
        <div
          key={zone.id}
          className="hero-calibration__zone hero-calibration__zone--control"
          style={{
            left: pct(zone.x0),
            top: pct(zone.y0),
            width: pct(zone.x1 - zone.x0),
            height: pct(zone.y1 - zone.y0),
          }}
        >
          <span>{zone.id}</span>
        </div>
      ))}

      <Line y={head} kind="head" label={`head ${head.toFixed(4)}`} />
      <Line y={eye} kind="eye" label={`eye level / true horizon ${eye.toFixed(4)}`} />
      <Line y={feet} kind="feet" label={`feet ${feet.toFixed(4)}`} />
      {anchorLanded !== null && anchorWanted !== null && (
        <>
          <Line
            y={anchorLanded}
            kind="plate"
            label={`plate anchor lands ${anchorLanded.toFixed(4)}`}
          />
          <Line y={anchorWanted} kind="want" label={`anchor wants ${anchorWanted.toFixed(4)}`} />
        </>
      )}

      <div className="hero-calibration__axis" style={{ left: pct(centerX) }} />

      <div className="hero-calibration__readout">
        <strong>{HERO_PROFILE_ID}</strong>
        <br />
        profile {profile.id} · hero {box.width}×{box.height} · aspect{' '}
        {(box.width / box.height).toFixed(4)}
        <br />
        head {head.toFixed(4)} · eye {eye.toFixed(4)} · feet {feet.toFixed(4)} · centre x{' '}
        {centerX.toFixed(4)}
        <br />
        scene {scene.id} · plate {composed.plate.src.split('/').pop()}
        {composed.fellBackToLandscape ? ' (landscape fallback)' : ''}
        <br />
        fit height {composed.fit.heightPercent.toFixed(2)}% · position y{' '}
        {composed.fit.positionYPercent.toFixed(2)}%
        <br />
        anchor error{' '}
        {composed.fit.clamped
          ? `${(composed.fit.errorY * 100).toFixed(2)} pts (CLAMPED by max scale)`
          : 'exact'}
      </div>
    </div>
  );
}

function Line({ y, kind, label }: { y: number; kind: string; label: string }) {
  return (
    <div
      className={`hero-calibration__line hero-calibration__line--${kind}`}
      style={{ top: `${(y * 100).toFixed(3)}%` }}
    >
      <span>{label}</span>
    </div>
  );
}
