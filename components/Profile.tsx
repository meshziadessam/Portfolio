import Image from 'next/image';
import { Download } from 'lucide-react';
import { withBasePath } from '../lib/site-path';
import { site } from '../config/site';

export function Portrait() {
  if (!site.photo) return null;
  return <Image className="profile-photo" src={withBasePath(site.photo)} alt={site.author || 'Portfolio owner'} width={480} height={600}/>;
}

export function ResumeLink() {
  if (!site.cv) return null;
  return <a className="button" href={withBasePath(site.cv)} download>Download CV <Download size={18}/></a>;
}