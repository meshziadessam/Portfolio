import { Readme } from '../../../components/Readme';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { compileMDX } from 'next-mdx-remote/rsc';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { readWriteups } from '../../../lib/writeups';
import 'highlight.js/styles/github-dark.css';

type Props = {params: Promise<{slug: string}>};

async function getEntry(params: Props['params']) {
  const {slug} = await params;
  return readWriteups().find(entry => entry.slug === slug) ?? notFound();
}

export const dynamicParams = false;
export function generateStaticParams() {
  return readWriteups().map(({slug}) => ({slug}));
}

export async function generateMetadata({params}: Props) {
  const {title, description} = await getEntry(params);
  return {title, description, openGraph: {title, description}};
}

export default async function Writeup({params}: Props) {
  const entry = await getEntry(params);
  const content = entry.isMarkdown ? <Readme source={entry.content}/> : (await compileMDX({source: entry.content, options: {mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug, rehypeHighlight],
  }}})).content;
  return <div className="shell page">
    <Link className="text-link" href="/writeups/"><ArrowLeft size={17}/> All writeups</Link>
    <header className="case-header">
      <p className="eyebrow">{entry.category}</p>
      <h1 className="entrance">{entry.title}</h1>
      <p className="lede">{entry.description}</p>
      <time className="case-meta" dateTime={entry.date}>{entry.date}</time>
    </header>
    <article className="prose">{content}</article>
  </div>;
}