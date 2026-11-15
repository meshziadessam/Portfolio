import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export type Project = {
  slug: string;
  title: string;
  category: string;
  description: string;
  demo: boolean;
  visual: string;
  tools: string[];
  sections: {title: string; text: string}[];
  link?: string;
  markdown?: string;
};

export function readProjects(): Project[] {
  const directory = join(process.cwd(), 'content', 'projects');
  return readdirSync(directory)
    .filter(file => /^[a-z0-9]+(?:-[a-z0-9]+)*\.json$/.test(file))
    .map(file => {
      const data = JSON.parse(readFileSync(join(directory, file), 'utf8')) as Omit<Project, 'slug'> & {order?: number};
      return {...data, slug: file.slice(0, -5)};
    })
    .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || a.slug.localeCompare(b.slug));
}