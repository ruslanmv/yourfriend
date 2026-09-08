import { ambientScenes } from '../../config/ambientScenes';
import { useAmbientRotation } from '../../hooks/useAmbientRotation';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { Theme } from '../../types';

export function AmbientSlider({ theme }: { theme: Theme }) {
  const reducedMotion = useReducedMotion();
  const { index, paused, goTo } = useAmbientRotation(ambientScenes, reducedMotion);
  const move = (delta: number) => goTo(index + delta, true);

  return <>
    <div className="ambient__layers" aria-hidden="true">
      {ambientScenes.map((scene, i) => <div key={scene.id} className={`ambient__layer ${i === index ? 'is-active' : ''}`} style={{ backgroundImage: `url(${theme === 'dark' ? scene.darkImage : scene.lightImage})`, backgroundPosition: scene.focalPoint || 'center', transitionDuration: `${reducedMotion ? 0 : scene.transitionDuration}ms` }} />)}
    </div>
    <div className="ambient__controls" aria-label="Choose an ambient scene">
      <div className="ambient__thumb-row">
        <button className="ambient__step" type="button" onClick={() => move(-1)} aria-label="Previous ambient scene">‹</button>
        <div className="ambient__thumbs">
          {ambientScenes.map((scene, i) => <button key={scene.id} type="button" className={`ambient__thumb ${i === index ? 'is-active' : ''}`} onClick={() => goTo(i, true)} aria-label={`Show ${scene.label} ambient scene`} aria-current={i === index ? 'true' : undefined} style={{ backgroundImage: `url(${theme === 'dark' ? scene.darkImage : scene.lightImage})` }} />)}
        </div>
        <button className="ambient__step" type="button" onClick={() => move(1)} aria-label="Next ambient scene">›</button>
      </div>
      <div className="ambient__status">
        <span className="ambient__pulse" aria-hidden="true"/>
        <span>{reducedMotion ? 'Manual scene selection' : paused ? 'Manual selection · auto resumes soon' : 'Auto-rotating · click a scene'}</span>
        <span className="ambient__dots" aria-label="Ambient scene shortcuts">
          {ambientScenes.map((scene, i) => <button key={scene.id} type="button" className={i === index ? 'is-active' : ''} onClick={() => goTo(i, true)} aria-label={`Show ${scene.label}`} aria-current={i === index ? 'true' : undefined}/>) }
        </span>
      </div>
    </div>
  </>;
}
