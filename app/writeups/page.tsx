import { readWriteups } from '../../lib/writeups';
import { WriteupCard } from '../../components/WriteupCard';

export const metadata = {title: 'Writeups'};

export default function Writeups() {
  const entries = readWriteups();
  return <section className="shell page">
    <p className="eyebrow entrance">Case library</p>
    <h1 className="entrance">Writeups<span>.</span></h1>
    <div className="cards">{entries.map(entry => <WriteupCard key={entry.slug} entry={entry}/>)}</div>
  </section>;
}