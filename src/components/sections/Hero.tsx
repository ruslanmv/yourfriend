import { ambientScenes } from '../../config/ambientScenes';
import { useAmbientRotation } from '../../hooks/useAmbientRotation';
import { useHeroBox } from '../../hooks/useHeroBox';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { Theme } from '../../types';
import { site } from '../../config/site';
import { AmbientSlider } from '../ambient/AmbientSlider';
import { ContactShadow } from '../ambient/ContactShadow';
import { HeroCalibrationOverlay } from '../ambient/HeroCalibrationOverlay';
import { NightSkyEffect } from '../ambient/NightSkyEffect';
import { HeroAvatar } from '../avatar/HeroAvatar';

/**
 * The hero owns the scene selection, not the slider.
 *
 * Three things in here depend on which scene is showing — the plate itself, the tint and position
 * of the contact shadow under her feet, and whether the decorative shooting stars run at all — so
 * the rotation state sits at the point they share rather than being pushed down into the slider and
 * pulled back out through callbacks.
 *
 * It also owns the measured hero box. Everything that has to place something against the art works
 * in fractions of that box (see `heroCalibration.ts`), and there is exactly one observer for it.
 */
export function Hero({ theme }: { theme: Theme }) {
  const reducedMotion = useReducedMotion();
  const rotation = useAmbientRotation(ambientScenes, reducedMotion);
  const { ref, box } = useHeroBox<HTMLElement>();
  const scene = ambientScenes[rotation.index] ?? ambientScenes[0];

  return <section className="hero" id="product" ref={ref}>
    <div className="hero__wash" aria-hidden="true"/>
    <NightSkyEffect theme={theme} skyDetail={scene.skyDetail}/>
    <div className="hero__stage container">
      <div className="hero__content">
        <div className="hero__copy">
          <div className="eyebrow"><span className="eyebrow__spark">✦</span> Open source · Apache 2.0</div>
          <h1>AI companionship,<br/><em>with real presence.</em></h1>
          <p className="hero__lead">YourFriend showcases <strong>{site.projectName}</strong> — an open-source browser platform for animated VRM/GLB avatars, voice conversation, multi-provider AI, face tracking, and immersive VR/AR experiences.</p>
          <div className="hero__actions">
            <a className="button button--primary" href={site.repoUrl} target="_blank" rel="noopener noreferrer">View source <span aria-hidden="true">↗</span></a>
            <a className="button button--secondary" href={site.liveDemoUrl} target="_blank" rel="noopener noreferrer"><span aria-hidden="true">▶</span> Live demo</a>
          </div>
          <p className="hero__trust">◌&nbsp; Clone it, run it locally, or deploy your own companion. No sales gate.</p>
        </div>
        <HeroAvatar theme={theme}/>
      </div>
      <div className="hero__scene-row">
        <AmbientSlider theme={theme} heroBox={box} rotation={rotation}/>
      </div>
    </div>
    <ContactShadow heroBox={box} sceneIndex={rotation.index} visible={true}/>
    <HeroCalibrationOverlay/>
  </section>;
}
