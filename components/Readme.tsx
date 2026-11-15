import { withBasePath } from '../lib/site-path';
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';

export function Readme({source}: {source: string}) {
  return <div className="prose markdown-content">
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug, rehypeHighlight]} skipHtml urlTransform={url => withBasePath(defaultUrlTransform(url))}>
      {source}
    </ReactMarkdown>
  </div>;
}