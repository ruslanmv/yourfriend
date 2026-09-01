import { Icon } from '../ui/Icon';

const items = [
  ['camera','On-demand capture','You decide when anything is captured—clips, screenshots, voice, or context.'],
  ['shield','Visible consent indicators','Clear, always-on indicators show when input or shared content is active.'],
  ['lock','No background streaming','Nothing continuously watches, streams, or stores content in the background.'],
] as const;

export function PrivacySection() {
  return <section className="section section--privacy" id="privacy"><div className="container"><div className="center-label">Private by default</div><div className="privacy-grid">{items.map(([icon,title,body]) => <article className="privacy-card" key={title}><span className="icon-orb"><Icon name={icon}/></span><div><h3>{title}</h3><p>{body}</p></div></article>)}</div><p className="security-line"><Icon name="shield"/> Enterprise-grade security principles. Your data, your rules.</p></div></section>;
}
