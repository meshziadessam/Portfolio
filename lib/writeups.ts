import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

export function readWriteups() {
  const directory = join(process.cwd(), 'content', 'writeups');
  return readdirSync(directory)
    .filter(file => /^[a-z0-9]+(?:-[a-z0-9]+)*\.mdx$/.test(file))
    .flatMap(file => {
      const {data, content} = matter(readFileSync(join(directory, file), 'utf8'));
      if (data.published !== true) return [];
      const {title, description, date, category} = data;
      if (typeof title !== 'string' || typeof description !== 'string' || typeof date !== 'string' || typeof category !== 'string') {
        throw new Error(file + ' requires title, description, date, and category strings.');
      }
      return [{slug: file.slice(0, -4), title, description, date, category, content, isMarkdown: data.format === 'markdown'}];
    }).sort((a, b) => b.date.localeCompare(a.date));
}