import type { Theme } from '../../types';
import { site } from '../../config/site';
import { AmbientSlider } from '../ambient/AmbientSlider';
import { HeroAvatar } from '../avatar/HeroAvatar';
import { Button } from '../ui/Button';

export function Hero({ theme, onPreview }: { theme: Theme; onDemo: () => void; onPreview: () => void }) {
  return <section className="hero" id="product">
    <AmbientSlider theme={theme}/>
    <div className="hero__wash" aria-hidden="true"/>
    <div className="hero__content container">
      <div className="hero__copy">
        <div className="eyebrow"><span className="eyebrow__spark">✦</span> Slow ambient motion clips</div>
        <h1>AI companionship,<br/><em>with real presence.</em></h1>
        <p className="hero__lead">YourFriend is a voice-first 3D companion that watches with you, assists on screen, remembers context, and appears in VR, AR, and desktop experiences.</p>
        <div className="hero__actions"><a className="button button--primary" href={site.appUrl} target="_blank" rel="noopener noreferrer"><span>Meet Your Friend</span><span aria-hidden="true">→</span></a><Button onClick={onPreview} variant="secondary" icon="play">Watch Preview</Button></div>
        <p className="hero__trust">◌&nbsp; Real-time conversation. Natural. Private. Always on your side.</p>
      </div>
      <HeroAvatar theme={theme}/>
    </div>
  </section>;
}
