import { Icon } from '../ui/Icon';

const items = [
  ['camera','On-demand capture','Camera and screen context are requested for specific actions instead of being silently sampled in the background.'],
  ['shield','Visible consent indicators','Capture state is visible in both the 2D interface and XR experiences, with revocation designed to stop in-flight sampling.'],
  ['lock','Local-first credentials','Provider API keys are stored in the browser and the project does not require a central server to collect your conversation data.'],
] as const;

export function PrivacySection() {
  return <section className="section section--privacy" id="privacy"><div className="container"><div className="center-label">Privacy you can inspect</div><div className="privacy-grid">{items.map(([icon,title,body]) => <article className="privacy-card" key={title}><span className="icon-orb"><Icon name={icon}/></span><div><h3>{title}</h3><p>{body}</p></div></article>)}</div><p className="security-line"><Icon name="shield"/> Privacy properties and behavior budgets are checked in the project’s CI.</p></div></section>;
}
