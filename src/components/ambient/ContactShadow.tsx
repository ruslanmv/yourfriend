import { ambientScenes } from '../../config/ambientScenes';
import { feetYAt, profileForHeroWidth, sampleCurve } from '../../config/heroCalibration';
import type { HeroBox } from '../../hooks/useHeroBox';

/**
 * The soft ellipse under her feet.
 *
 * None of the shipped plates has ground painted in the avatar corridor — they are all sea and sky,
 * which is why she reads as floating however the plate is cropped. A contact shadow is the one
 * grounding cue that does not require the art to change. It is tinted per scene so it belongs to
 * that scene's light rather than being a generic grey smudge, and it sits at the *measured* feet
 * row for the current hero width rather than at a guessed offset from the bottom — which is the
 * whole point, because that row moves six percent of the hero's height across the widths this page
 * gets.
 *
 * Decorative and never announced. It is not suppressed under reduced motion, because it does not
 * move; it is suppressed while the avatar area is empty, because a shadow with nothing above it
 * reads as a rendering fault.
 */
export function ContactShadow({
  heroBox,
  sceneIndex,
  visible,
}: {
  heroBox: HeroBox;
  sceneIndex: number;
  visible: boolean;
}) {
  const scene = ambientScenes[sceneIndex] ?? ambientScenes[0];
  const profile = profileForHeroWidth(heroBox.width);
  const feet = feetYAt(profile, heroBox.width);
  const centerX = sampleCurve(profile.centerXCurve, heroBox.width);

  return (
    <div
      className={`hero__contact-shadow${visible ? ' is-visible' : ''}`}
      aria-hidden="true"
      data-scene={scene.id}
      style={{
        top: `${(feet * 100).toFixed(3)}%`,
        left: `${(centerX * 100).toFixed(3)}%`,
        // Wider than she is: a contact shadow spreads, and a shadow exactly as wide as the body
        // reads as a cut-out rather than as light falling around her.
        width: `${(profile.bodyWidth * 2.4 * 100).toFixed(3)}%`,
        background: `radial-gradient(closest-side, ${scene.contactShadow}, transparent 76%)`,
      }}
    />
  );
}
