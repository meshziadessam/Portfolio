import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Project } from '../lib/projects';

export function ProjectCard({project}: {project: Project}) {
  return <Link className="case-card" href={'/projects/' + project.slug + '/'}>
    <div className={'case-art ' + project.visual} aria-hidden="true"><i/><i/><i/></div>
    <div className="case-copy">
      <p className="eyebrow">{project.category}{project.demo && ' / Concept project'}</p>
      <h3>{project.title} <ArrowUpRight size={20} aria-hidden="true"/></h3>
      <p>{project.description}</p>
      <p className="case-meta">{project.tools.join(' · ')}</p>
    </div>
  </Link>;
}