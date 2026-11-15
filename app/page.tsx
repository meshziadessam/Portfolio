import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { site } from '../config/site';
import { readProjects } from '../lib/projects';
import { readWriteups } from '../lib/writeups';
import { ProjectCard } from '../components/ProjectCard';
import { WriteupCard } from '../components/WriteupCard';
import { RadarGame } from '../components/RadarGame';

export default function Home() {
  const writeups = readWriteups().slice(0, 3);
  return <>
    <section className="hero" id="landing">
      <div className="hero-grid" aria-hidden="true"/>
      <RadarGame/>
      <div className="shell hero-content profile-layout">
        <div>
          <p className="eyebrow entrance"><span className="signal-dot"/>{site.role || 'Personal portfolio'}</p>
          <h1 className="entrance">{site.author || <>Follow the<br/><em>signal.</em></>}</h1>
          <p className="hero-description entrance">{site.biography || site.description}</p>
        </div>
      </div>
    </section>
    {writeups.length > 0 && <section className="shell section featured-writeups" data-reveal>
      <div className="section-head"><div><p className="eyebrow">Case library</p><h2>Recent writeups</h2></div>
        <Link className="text-link" href="/writeups/">View archive <ArrowRight size={18}/></Link></div>
      <div className="cards">{writeups.map(entry => <WriteupCard key={entry.slug} entry={entry}/>)}</div>
    </section>}
    <section id="work" className="shell section" data-reveal>
      <div className="section-head"><div><p className="eyebrow">Portfolio</p><h2>Selected projects</h2></div>
        <Link className="text-link" href="/projects/">All projects <ArrowRight size={18}/></Link></div>
      <div className="cards">{readProjects().slice(0,3).map(project => <ProjectCard key={project.slug} project={project}/>)}</div>
    </section>
  </>;
}