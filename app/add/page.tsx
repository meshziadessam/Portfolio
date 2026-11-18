import 'highlight.js/styles/github-dark.css';
import { notFound } from 'next/navigation';
import { WordImport } from '../../components/WordImport';
import { ContentEditor } from '../../components/ContentEditor';

export const metadata = {title: 'Add content', robots: {index: false}};

export default function AddContent() {
  if (process.env.NODE_ENV !== 'development' || process.env.PORTFOLIO_LOCAL_ADMIN !== '1') notFound();
  return <section className="shell page">
    <p className="eyebrow editor-kicker">Workspace / New page</p>
    <WordImport/><ContentEditor/>
  </section>;
}