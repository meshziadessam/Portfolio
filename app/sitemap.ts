import type { MetadataRoute } from 'next';
import { readWriteups } from '../lib/writeups';
import { site } from '../config/site';
import { readProjects } from '../lib/projects';

export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = site.url;
  if (!origin) return [];
  const paths = ['/', '/projects/', '/about/', ...readProjects().map(({slug}) => '/projects/' + slug + '/')];
  paths.push('/writeups/', ...readWriteups().map(({slug}) => '/writeups/' + slug + '/'));
  return paths.map(path => ({url:new URL(path.slice(1),origin.replace(/\/?$/, '/')).href}));
}