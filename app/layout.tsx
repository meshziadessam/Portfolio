import type { Metadata } from 'next';
import Link from 'next/link';
import '@fontsource-variable/geist';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/barlow-condensed/600.css';
import './globals.css';
import { site } from '../config/site';

import { Nav } from '../components/Nav';
import { Effects } from '../animations/Effects';

export const metadata: Metadata = {
  metadataBase: site.url ? new URL(site.url) : undefined,
  title: {default: site.name, template: '%s | ' + site.name},
  description: site.description,
  openGraph: {type:'website', siteName:site.name, title:site.name, description:site.description},
};
export default function Layout({children}: Readonly<{children:React.ReactNode}>) {
  return <html lang="en"><body><a className="skip" href="#main">Skip to content</a>
    <Nav/><Effects/><main id="main">{children}</main>
    <footer><div className="shell footer-wrap"><Link className="brand" href="/">{site.name}</Link>
      <div className="footer-links"><Link href="/projects/">Projects</Link><Link href="/writeups/">Writeups</Link><Link href="/about/">About</Link>
      {site.github && <a href={site.github}>GitHub</a>}{site.linkedin && <a href={site.linkedin}>LinkedIn</a>}</div>
    </div></footer>
  </body></html>;
}
