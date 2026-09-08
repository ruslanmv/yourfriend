import { avatarConfig } from '../../config/avatar';
import { Icon } from '../ui/Icon';

const motionSources = ['VRMA clips', 'Procedural idle', 'Gaze', 'Expressions', 'Lip sync'] as const;

export function MotionSection() {
  return <section className="section section--motion" id="core"><div className="container motion-layout">
    <div className="section-intro"><div className="kicker">Animation + behavior stack</div><h2>Motion that responds<br/>to <em>context.</em></h2><p>The project blends procedural idle motion, VRM/VRMA clips, gaze, expressions, and behavior selection so the avatar can react without turning every moment into an animation.</p></div>
    <div className="motion-diagram" aria-label="3D Avatar Chatbot behavior and motion diagram">
      <span className="diagram-label">VRM / VRMA + Procedural Motion</span>
      <div className="motion-preview">
        <div className="motion-portrait">
          <img
            src={avatarConfig.motionPortrait}
            alt="Close-up of the companion avatar"
            loading="lazy"
            onError={(event) => {
              const image = event.currentTarget;
              if (image.dataset.fallbackApplied === 'true') return;
              image.dataset.fallbackApplied = 'true';
              image.src = avatarConfig.fallbackPosters.light;
            }}
          />
        </div>
        <div className="motion-sources" aria-label="Motion sources">
          {motionSources.map((source) => <span key={source}>{source}</span>)}
        </div>
      </div>
      <div className="diagram-arrow">↓</div>
      <div className="diagram-box"><strong>Behavior Director</strong><small>Reflexes · Selection · Orchestration</small></div>
      <div className="context-box"><strong>Context signals</strong><span>Speech + emotion</span><span>Gaze</span><span>Together mode</span><span>Reduced motion</span></div>
      <div className="diagram-arrow">↓</div>
      <div className="experience-row"><span><Icon name="screen"/> Desktop</span><span>VR</span><span>AR</span><span>Mobile</span></div>
    </div>
  </div></section>;
}
