import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function Missing() {
  return <section className="shell page missing">
    <p className="eyebrow">404</p>
    <h1>Page not found<span>.</span></h1>
    <p className="lede">This page may have moved or the address may be incorrect.</p>
    <Link className="button" href="/"><ArrowLeft size={18}/> Back to home</Link>
  </section>;
}