import { site } from '../../config/site';
import { Button } from '../ui/Button';

export function FinalCTA({ onDemo, onPreview }: { onDemo: () => void; onPreview: () => void }) {
  return <section className="section section--cta" id="pricing"><div className="container"><div className="final-cta"><div><div className="kicker">Ready when you are</div><h2>Experience <em>presence</em><br/>that feels real.</h2><p>YourFriend is more than an assistant.<br/>It’s someone who’s there—with you.</p></div><div className="final-cta__actions"><a className="button button--primary" href={site.appUrl} target="_blank" rel="noopener noreferrer"><span>Meet Your Friend</span><span aria-hidden="true">→</span></a><Button onClick={onPreview} variant="secondary" icon="play">Watch Preview</Button><Button onClick={onDemo} variant="ghost">Request a demo</Button></div><div className="lantern" aria-hidden="true"><span/></div></div><span id="demo" className="anchor-target" aria-hidden="true"/></div></section>;
}
