import { useEffect, useMemo } from 'react';
import { preload } from 'react-dom';
import { ambientScenes } from '../../config/ambientScenes';
import type { AmbientRotation } from '../../hooks/useAmbientRotation';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { AmbientScene, Theme } from '../../types';
import { composeScene, plateStyle } from './sceneComposition';
import type { HeroBox } from '../../hooks/useHeroBox';

/**
 * The scene behind the hero, and the controls for choosing it.
 *
 * The plate is not simply dropped in with `background-size: cover` any more. Each layer is sized
 * and positioned from `composeScene`, which fits the plate's declared anchor against the measured
 * hero box — see `plateFit.ts` for why a centred crop cannot work on a hero whose aspect ranges
 * from 0.23 to 2.54.
 *
 * Only the *active* layer is given a picture. The five-layer crossfade used to paint all five
 * plates at once, so choosing a scene downloaded the whole set; now an inactive layer holds no
 * `background-image` at all.
 *
 * The rotation state lives in `Hero` rather than here because the contact shadow and the shooting
 * stars both have to know which scene is showing — the shadow takes its tint from it and the stars
 * stand down over a scene whose sky is already busy.
 */
export function AmbientSlider({
  theme,
  heroBox,
  rotation,
}: {
  theme: Theme;
  heroBox: HeroBox;
  rotation: AmbientRotation;
}) {
  const reducedMotion = useReducedMotion();
  const { index, paused, goTo } = rotation;
  const move = (delta: number) => goTo(index + delta, true);

  const composed = useMemo(
    () =>
      ambientScenes.map((scene) =>
        composeScene({
          scene,
          theme,
          heroWidth: heroBox.width,
          heroHeight: heroBox.height,
        }),
      ),
    [theme, heroBox.width, heroBox.height],
  );

  // Only the plate that is actually on screen at first paint is worth a preload hint; hinting the
  // whole set would restore exactly the download storm the thumbnails were introduced to remove.
  const firstSrc = composed[0]?.plate.src;
  useEffect(() => {
    if (firstSrc) preload(firstSrc, { as: 'image', fetchPriority: 'high' });
  }, [firstSrc]);

  return (
    <>
      <div className="ambient__layers" aria-hidden="true">
        {ambientScenes.map((scene, i) => (
          <div
            key={scene.id}
            className={`ambient__layer ${i === index ? 'is-active' : ''}`}
            data-scene={scene.id}
            style={{
              ...(i === index ? plateStyle(composed[i]) : {}),
              transitionDuration: `${reducedMotion ? 0 : scene.transitionDuration}ms`,
            }}
          />
        ))}
      </div>
      <div className="ambient__controls" aria-label="Choose an ambient scene">
        <div className="ambient__thumb-row">
          <button
            className="ambient__step"
            type="button"
            onClick={() => move(-1)}
            aria-label="Previous ambient scene"
          >
            ‹
          </button>
          <div className="ambient__thumbs">
            {ambientScenes.map((scene, i) => (
              <button
                key={scene.id}
                type="button"
                className={`ambient__thumb ${i === index ? 'is-active' : ''}`}
                onClick={() => goTo(i, true)}
                aria-label={`Show ${scene.label} ambient scene`}
                aria-current={i === index ? 'true' : undefined}
                title={scene.description}
                style={{ backgroundImage: `url(${thumbFor(scene, theme)})` }}
              />
            ))}
          </div>
          <button
            className="ambient__step"
            type="button"
            onClick={() => move(1)}
            aria-label="Next ambient scene"
          >
            ›
          </button>
        </div>
        <div className="ambient__status">
          <span className="ambient__pulse" aria-hidden="true" />
          <span>
            {reducedMotion
              ? 'Manual scene selection'
              : paused
                ? 'Manual selection · auto resumes soon'
                : 'Auto-rotating · click a scene'}
          </span>
          <span className="ambient__dots" aria-label="Ambient scene shortcuts">
            {ambientScenes.map((scene, i) => (
              <button
                key={scene.id}
                type="button"
                className={i === index ? 'is-active' : ''}
                onClick={() => goTo(i, true)}
                aria-label={`Show ${scene.label}`}
                aria-current={i === index ? 'true' : undefined}
              />
            ))}
          </span>
        </div>
      </div>
    </>
  );
}

function thumbFor(scene: AmbientScene, theme: Theme) {
  return theme === 'dark' ? scene.thumbs.dark : scene.thumbs.light;
}
