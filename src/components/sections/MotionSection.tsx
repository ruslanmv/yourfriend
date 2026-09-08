import { avatarConfig } from '../../config/avatar';
import { Icon } from '../ui/Icon';

const faceFrames = [
  { position: '50% 9%', scale: 2.15 },
  { position: '48% 10%', scale: 2.25 },
  { position: '51% 8%', scale: 2.35 },
  { position: '49% 11%', scale: 2.2 },
  { position: '52% 9%', scale: 2.3 },
] as const;

export function MotionSection() {
  return <section className="section section--motion" id="core"><div className="container motion-layout">
    <div className="section-intro"><div className="kicker">Animation + behavior stack</div><h2>Motion that responds<br/>to <em>context.</em></h2><p>The project blends procedural idle motion, VRM/VRMA clips, gaze, expressions, and behavior selection so the avatar can react without turning every moment into an animation.</p></div>
    <div className="motion-diagram" aria-label="3D Avatar Chatbot behavior and motion diagram">
      <span className="diagram-label">VRM / VRMA + Procedural Motion</span>
      <div className="motion-thumbs" aria-label="Close-up avatar motion frames">{faceFrames.map((frame, i) => <div className="motion-thumb" key={i}><img src={avatarConfig.posters.light} alt="" loading="lazy" style={{ objectPosition: frame.position, transform: `scale(${frame.scale})` }}/></div>)}</div>
      <div className="diagram-arrow">↓</div>
      <div className="diagram-box"><strong>Behavior Director</strong><small>Reflexes · Selection · Orchestration</small></div>
      <div className="context-box"><strong>Context signals</strong><span>Speech + emotion</span><span>Gaze</span><span>Together mode</span><span>Reduced motion</span></div>
      <div className="diagram-arrow">↓</div>
      <div className="experience-row"><span><Icon name="screen"/> Desktop</span><span>VR</span><span>AR</span><span>Mobile</span></div>
    </div>
  </div></section>;
}
