import { experiences } from '../../config/site';
import { Icon } from '../ui/Icon';

export function ExperienceSection() {
  return <section className="section section--experiences" id="experiences"><div className="container">
    <div className="experience-grid">{experiences.map((item, i) => <article className="experience-card" key={item.id}><div className="experience-card__top"><span className="icon-orb"><Icon name={item.icon}/></span><span className="card-index">0{i+1}</span></div><h3>{item.title}</h3><p>{item.body}</p><a href="#presence">Learn more <span>→</span></a></article>)}</div>
  </div></section>;
}
