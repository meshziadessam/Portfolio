import { ArrowUpRight, Award, Briefcase, GraduationCap, Languages, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { CertificatePreview } from '../../components/CertificatePreview';
import { Portrait, ResumeLink } from '../../components/Profile';
import { withBasePath } from '../../lib/site-path';
import { site } from '../../config/site';

export const metadata = {title: 'About'};

const socials = [['LinkedIn', site.linkedin], ['GitHub', site.github], ['Discord', site.discord]];
const monthYear = new Intl.DateTimeFormat('en-US', {month:'short', year:'numeric', timeZone:'UTC'});

function ProfileDate({start, end}: {start:string; end?:string}) {
  const format = (value:string) => value.length === 4 ? value : monthYear.format(new Date(value + '-01T00:00:00Z'));
  return <span className="profile-date"><time dateTime={start}>{format(start)}</time>
    {end && <> – <time dateTime={end}>{format(end)}</time></>}
  </span>;
}

export default function About() {
  const {education} = site;
  return <div className="shell page profile-page">
    <header className="about-hero">
      <div className="hero-grid" aria-hidden="true"/>
      <div>
        <p className="eyebrow entrance">{site.role}</p>
        <h1 className="entrance">{site.author}<span>.</span></h1>
        <p className="lede">{site.biography}</p>
        <div className="hero-actions">
          <ResumeLink/>
          {site.email && <a className="text-link" href={'mailto:' + site.email}><Mail size={17}/> Email me</a>}
        </div>
      </div>
      <div className="about-portrait">
        {site.photo ? <Portrait/> : <UserRound size={64} strokeWidth={1} aria-hidden="true"/>}
      </div>
    </header>

    <div className="profile-career">
      <section className="about-section detail-panel" data-reveal>
        <h2><Briefcase aria-hidden="true"/> Experience</h2>
        <ol className="experience-line">{site.experience.map(entry =>
          <li key={entry.title}>
            <ProfileDate start={entry.start} end={entry.end}/>
            <strong>{entry.title}</strong>
            <p>{entry.institution}</p>
          </li>
        )}</ol>
      </section>
      <section className="about-section detail-panel education-panel" data-reveal>
        <h2><GraduationCap aria-hidden="true"/> Education</h2>
        <div className="education-content"><div><ProfileDate start={education.start} end={education.end}/>
        <strong>{education.degree}</strong>
        <p>{education.institution}</p>
        <ul>{education.details.map(entry => <li key={entry}>{entry}</li>)}</ul></div>{education.image && <a className="text-link" href={withBasePath(education.image)} target="_blank" rel="noopener noreferrer">Reference <ArrowUpRight size={15} aria-hidden="true"/></a>}</div>
      </section>
    </div>

    <section className="about-section" data-reveal>
      <h2><ShieldCheck aria-hidden="true"/> Skills</h2>
      <ul className="skill-grid">{site.skills.map(skill => {
        const [category, ...details] = skill.split(': ');
        const items = details.join(': ').split(/,\s*(?:and\s+)?/).filter(Boolean);
        return <li key={skill}><strong>{category}</strong>
          {items.length > 0 && <ul className="skill-tags">{items.map(item => <li key={item}>{item}</li>)}</ul>}
        </li>;
      })}</ul>
    </section>

    <div className="profile-credentials">
      <section className="about-section detail-panel" data-reveal>
        <h2><Award aria-hidden="true"/> Certifications &amp; training</h2>
        <ul className="credential-list">{site.certifications.map(entry =>
          <li key={entry.title}>
            <div>{entry.image ? <CertificatePreview title={entry.title} image={entry.image}/> : <strong>{entry.title}</strong>}<p>{entry.institution}</p></div>
            <ProfileDate start={entry.date}/>
          </li>
        )}</ul>
      </section>
      <section className="about-section detail-panel" data-reveal>
        <h2><Languages aria-hidden="true"/> Languages</h2>
        <ul className="language-list">{site.languages.map(({name,level}) =>
          <li key={name}><strong>{name}</strong><span>{level}</span></li>
        )}</ul>
      </section>
    </div>

    {(site.email || socials.some(([,url]) => url)) && <section className="about-section contact-panel">
      <h2>Contact</h2>
      <div className="contact-links">
        {site.email && <a className="text-link" href={'mailto:' + site.email}><Mail size={17}/> {site.email}</a>}
        {socials.filter(([,url]) => url).map(([label,url]) =>
          <a key={label} className="text-link" href={url}>{label} <ArrowUpRight size={17}/></a>
        )}
      </div>
    </section>}
  </div>;
}