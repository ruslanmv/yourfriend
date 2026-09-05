import { avatarConfig } from '../../config/avatar';
import { Icon } from '../ui/Icon';

export function MotionSection() {
  return <section className="section section--motion" id="core"><div className="container motion-layout">
    <div className="section-intro"><div className="kicker">Ambient motion system</div><h2>Calm motions, curated<br/>for <em>presence.</em></h2><p>YourFriend uses breathing, gaze, micro posture changes, small gestures, and carefully selected motion clips to feel alive without becoming distracting.</p></div>
    <div className="motion-diagram" aria-label="Ambient motion system diagram">
      <span className="diagram-label">Curated Motion Library</span>
      <div className="motion-thumbs">{[0,1,2,3,4].map(i => <div className="motion-thumb" key={i}><img src={avatarConfig.posters.light} alt="" loading="lazy" style={{ objectPosition: `${72 + i * 3}% center` }}/></div>)}</div>
      <div className="diagram-arrow">↓</div>
      <div className="diagram-box"><strong>Frontend Rotation Engine</strong><small>Blend · Transitions · Timing</small></div>
      <div className="context-box"><strong>Context hints</strong><span>Time of day</span><span>Theme</span><span>Session length</span><span>Reduced motion</span></div>
      <div className="diagram-arrow">↓</div>
      <div className="experience-row"><span><Icon name="screen"/> Desktop</span><span>VR</span><span>AR</span><span>Mobile</span></div>
    </div>
  </div></section>;
}
