import { Link } from 'react-router-dom';
import { site } from '../config/site';

export function LegalPage({ title }: { title: string }) {
  return <main className="legal-page"><div className="container legal-page__inner"><Link to="/" className="brand"><span className="brand__mark"/><strong>YourFriend</strong></Link><h1>{title}</h1><p>This site is a public showcase for the open-source <a href={site.repoUrl} target="_blank" rel="noopener noreferrer">{site.projectName}</a> project. The project source code, deployment instructions, and upstream license are available on GitHub.</p><h2>For your own deployment</h2><p>Review the licenses of every avatar, model, voice, AI provider, and third-party asset you choose to use. Also document the actual analytics, hosting, cookies, credential storage, capture features, and regional privacy rights that apply to your deployment.</p><Link to="/">← Back to home</Link></div></main>;
}
