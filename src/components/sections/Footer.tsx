import { Link } from 'react-router-dom';
import { site } from '../../config/site';

export function Footer() {
  return <footer className="footer"><div className="container footer__inner"><a className="brand" href="#top"><span className="brand__mark"/><strong>YourFriend</strong></a><nav><a href="#product">Project</a><a href="#experiences">Experiences</a><a href="#privacy">Privacy</a><a href="#open-source">Open Source</a><a href="#core">Core</a><a href={site.repoUrl} target="_blank" rel="noopener noreferrer">GitHub</a><a href={site.liveDemoUrl} target="_blank" rel="noopener noreferrer">Live demo</a><Link to="/privacy-policy">Privacy policy</Link><Link to="/terms">Terms</Link></nav><p>Showcase for the Apache-2.0 {site.projectName} project.</p></div></footer>;
}
