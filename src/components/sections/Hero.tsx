import type { Theme } from '../../types';
import { site } from '../../config/site';
import { audioBestPractices } from '../../config/audio';
import { AmbientSlider } from '../ambient/AmbientSlider';
import { HeroAvatar } from '../avatar/HeroAvatar';

export function Hero({ theme }: { theme: Theme }) {
  return <section className="hero" id="product">
    <div className="hero__wash" aria-hidden="true"/>
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
          <details className="audio-practices">
            <summary><span>Immersive Audio Best Practices</span><small>10 rules</small></summary>
            <ol>
              {audioBestPractices.map((practice) => <li key={practice.title}><strong>{practice.title}</strong><span>{practice.detail}</span></li>)}
            </ol>
          </details>
          <p className="hero__trust">◌&nbsp; Clone it, run it locally, or deploy your own companion. No sales gate.</p>
        </div>
        <HeroAvatar theme={theme}/>
      </div>
      <div className="hero__scene-row">
        <AmbientSlider theme={theme}/>
      </div>
    </div>
  </section>;
}
