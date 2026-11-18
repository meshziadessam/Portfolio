import 'highlight.js/styles/github-dark.css';
import { notFound } from 'next/navigation';

import { AdminWorkspace } from '../../components/AdminWorkspace';

export const metadata = {title: 'Add content', robots: {index: false}};

export default function AddContent() {
  if (process.env.NODE_ENV !== 'development' || process.env.PORTFOLIO_LOCAL_ADMIN !== '1') notFound();
  return <section className="shell page">
    
    <AdminWorkspace/>
  </section>;
}