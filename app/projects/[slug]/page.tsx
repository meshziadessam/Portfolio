import { Readme } from '../../../components/Readme';
import 'highlight.js/styles/github-dark.css';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { readProjects } from '../../../lib/projects';

type Props = {params: Promise<{slug:string}>};

async function getProject(params: Props['params']) {
  const {slug} = await params;
  return readProjects().find(project => project.slug === slug) ?? notFound();
}

export const dynamicParams = false;
export function generateStaticParams() {
  return readProjects().map(({slug}) => ({slug}));
}

export async function generateMetadata({params}: Props) {
  const {title,description} = await getProject(params);
  return {title, description, openGraph:{title,description}};
}

export default async function Project({params}: Props) {
  const project = await getProject(params);
  const richContent = project.markdown ? <Readme source={project.markdown}/> : null;
  return <div className="shell page">
    <Link className="text-link" href="/projects/"><ArrowLeft size={17}/> All projects</Link>
    <header className="case-header">
      <p className="eyebrow">{project.category}{project.demo && ' / Concept project'}</p>
      <h1 className="entrance">{project.title}</h1>
      <p className="lede">{project.description}</p>
      <ul className="tags" aria-label="Technologies">{project.tools.map(tool => <li key={tool}>{tool}</li>)}</ul>
      {project.link && <a className="button" href={project.link}>View project <ArrowUpRight size={18}/></a>}
    </header>
    <article className="prose">{richContent}{project.sections.map(section =>
      <section key={section.title}><h2>{section.title}</h2><p>{section.text}</p></section>
    )}</article>
  </div>;
}