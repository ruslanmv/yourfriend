import { ambientScenes } from '../../config/ambientScenes';
import { useAmbientRotation } from '../../hooks/useAmbientRotation';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { Theme } from '../../types';

export function AmbientSlider({ theme }: { theme: Theme }) {
  const reducedMotion = useReducedMotion();
  const { index, goTo } = useAmbientRotation(ambientScenes, reducedMotion);
  return <div className="ambient" aria-label="Ambient scene selector">
    <div className="ambient__layers" aria-hidden="true">
      {ambientScenes.map((scene, i) => <div key={scene.id} className={`ambient__layer ${i === index ? 'is-active' : ''}`} style={{ backgroundImage: `url(${theme === 'dark' ? scene.darkImage : scene.lightImage})`, backgroundPosition: scene.focalPoint || 'center', transitionDuration: `${reducedMotion ? 0 : scene.transitionDuration}ms` }} />)}
    </div>
    <div className="ambient__controls">
      <div className="ambient__thumbs">
        {ambientScenes.map((scene, i) => <button key={scene.id} className={`ambient__thumb ${i === index ? 'is-active' : ''}`} onClick={() => goTo(i, true)} aria-label={`Show ${scene.label} ambient scene`} aria-current={i === index ? 'true' : undefined} style={{ backgroundImage: `url(${theme === 'dark' ? scene.darkImage : scene.lightImage})` }} />)}
      </div>
      <div className="ambient__status"><span className="ambient__pulse"/><span>Ambient scenes rotate slowly</span><span className="ambient__dots">{ambientScenes.map((s, i) => <i key={s.id} className={i === index ? 'is-active' : ''}/>)}</span></div>
    </div>
  </div>;
}
