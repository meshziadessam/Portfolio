'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { site } from '../config/site';

export function Nav() {
  const path = usePathname();
  const [open,setOpen] = useState(false);
  const links = [['/','Home'],['/projects/','Projects'],['/writeups/','Writeups'],['/about/','About']];
  return <header className="header"><div className="shell nav-wrap">
    <Link className="brand" href="/" onClick={() => setOpen(false)}>{site.author || site.name}</Link>
    <button className="menu" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
    <nav id="main-nav" aria-label="Main navigation" data-open={open}>
      {links.map(([href,label]) => {
        const active = href === '/' ? path === '/' : (path + '/').startsWith(href);
        return <Link key={href} href={href} aria-current={active ? 'page' : undefined} onClick={() => setOpen(false)}>{label}</Link>;
      })}
    </nav>
  </div></header>;
}
