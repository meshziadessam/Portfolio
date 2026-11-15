import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { readWriteups } from '../lib/writeups';

export function WriteupCard({entry}: {entry: ReturnType<typeof readWriteups>[number]}) {
  return <Link className="case-card" href={'/writeups/' + entry.slug + '/'}>
    <div className="case-art authentication" aria-hidden="true"><i/><i/><i/></div>
    <div className="case-copy">
      <p className="eyebrow">{entry.category}</p>
      <h3>{entry.title}<ArrowUpRight size={20} aria-hidden="true"/></h3>
      <p>{entry.description}</p>
      <time className="case-meta" dateTime={entry.date}>{entry.date}</time>
    </div>
  </Link>;
}