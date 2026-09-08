import { Icon } from '../ui/Icon';

const benefits = [
  ['sound', 'Procedural motion', 'Breathing, blinking, gaze, head sway, and subtle body motion keep the character alive without a visibly repeating loop.'],
  ['person', 'Expressions + lip sync', 'VRM expressions, speech-driven mouth shapes, and emotion-aware animation make conversation visually responsive.'],
  ['brain', 'Face tracking', 'MediaPipe-powered webcam tracking can mirror blinks, gaze, mouth movement, and expressions onto supported avatars.'],
  ['leaf', 'Behavior Director', 'A layered behavior engine chooses reflexes, gestures, and companion actions while remaining optional and auditable.'],
] as const;

export function PresenceSection() {
  return <section className="section section--presence" id="presence"><div className="container presence-layout">
    <div className="section-intro"><div className="kicker">A real character engine</div><h2>Designed to feel<br/><em>alive.</em></h2><p>The open-source runtime combines animation, expressions, gaze, voice, and behavior systems instead of presenting a static chatbot portrait.</p></div>
    <div className="benefit-grid">{benefits.map(([icon,title,body]) => <div className="benefit" key={title}><span className="icon-orb icon-orb--small"><Icon name={icon}/></span><div><h3>{title}</h3><p>{body}</p></div></div>)}</div>
  </div></section>;
}
