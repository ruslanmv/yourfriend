import { Button } from '../ui/Button';
export function FinalCTA({ onDemo, onPreview }: { onDemo: () => void; onPreview: () => void }) {
  return <section className="section section--cta" id="demo"><div className="container"><div className="final-cta"><div><div className="kicker">Ready when you are</div><h2>Experience <em>presence</em><br/>that feels real.</h2><p>YourFriend is more than an assistant.<br/>It’s someone who’s there—with you.</p></div><div className="final-cta__actions"><Button onClick={onDemo} icon="arrow">Request Demo</Button><Button onClick={onPreview} variant="secondary" icon="play">Watch Preview</Button></div><div className="lantern" aria-hidden="true"><span/></div></div></div></section>;
}
