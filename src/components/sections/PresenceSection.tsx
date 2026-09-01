import { Icon } from '../ui/Icon';

const benefits = [
  ['sound', 'Quiet by design', 'Calm presence that adapts to you. Comfortable silence is part of the experience.'],
  ['person', 'Embodied insight', 'Thoughtful responses grounded in context, memory, and what you are experiencing together.'],
  ['brain', 'Memory that respects you', 'Remembers the right things for the right reasons—so every moment feels continuous.'],
  ['leaf', 'Restraint is intelligent', 'Knows when to hold back, when to guide, and when to simply be there.'],
] as const;

export function PresenceSection() {
  return <section className="section section--presence" id="presence"><div className="container presence-layout">
    <div className="section-intro"><div className="kicker">Presence over chatter</div><h2>Designed to know<br/>when to <em>speak.</em></h2><p>YourFriend listens without interrupting, notices the moment, remembers what matters, and responds with restraint.</p></div>
    <div className="benefit-grid">{benefits.map(([icon,title,body]) => <div className="benefit" key={title}><span className="icon-orb icon-orb--small"><Icon name={icon}/></span><div><h3>{title}</h3><p>{body}</p></div></div>)}</div>
  </div></section>;
}
