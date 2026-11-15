import { readProjects } from '../../lib/projects';
import { ProjectCard } from '../../components/ProjectCard';

export const metadata = {title:'Projects', description:'Browse the project portfolio.'};

export default function Projects() {
  return <section className="shell page">
    <h1 className="entrance">Projects<span>.</span></h1>
    <div className="cards portfolio-cards">{readProjects().map(project => <ProjectCard key={project.slug} project={project}/>)}</div>
  </section>;
}