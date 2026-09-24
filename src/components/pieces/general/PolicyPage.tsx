import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { SEOHead } from '../../utility/SEOHead';
import { serviceInformation } from '../../../content/service-information';

export interface PolicySection { title: string; paragraphs: string[]; bullets?: string[] }
interface Props { title: string; description: string; path: string; sections: PolicySection[] }

export function PolicyPage({ title, description, path, sections }: Props) {
  return <div className="nt-information min-h-screen bg-background py-12">
    <SEOHead title={title} description={description} canonicalPath={path} />
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <header className="rounded-3xl bg-[#031335] px-6 py-12 text-center text-white">
        <FileText className="mx-auto mb-5" size={32} />
        <p className="text-sm uppercase tracking-widest text-blue-200">Naitrust · Clear terms, shared confidence</p>
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{title}</h1>
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-blue-100">{description}</p>
        <p className="mt-5 text-sm text-blue-200">Last updated: {serviceInformation.updated}</p>
      </header>
      <aside className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-6" aria-label="Service availability">
        <h2 className="font-bold">Current service availability</h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">{serviceInformation.availability}</p>
      </aside>
      <nav aria-label="On this page" className="my-8 flex flex-wrap gap-x-5 gap-y-3 text-sm">
        {sections.map((section, index) => <a key={section.title} href={`#section-${index + 1}`} className="text-primary underline underline-offset-4">{section.title}</a>)}
      </nav>
      <div className="space-y-5">{sections.map((section, index) => <section key={section.title} id={`section-${index + 1}`} className="scroll-mt-28 rounded-2xl border bg-card p-6 sm:p-8">
        <h2 className="text-xl font-bold">{index + 1}. {section.title}</h2>
        {section.paragraphs.map(text => <p key={text} className="mt-3 text-sm leading-7 text-muted-foreground">{text}</p>)}
        {section.bullets && <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-muted-foreground">{section.bullets.map(text => <li key={text}>{text}</li>)}</ul>}
      </section>)}</div>
      <aside className="mt-8 rounded-2xl border p-6 text-sm leading-7">
        <p><strong>{serviceInformation.company}</strong> · {serviceInformation.registration} · Nigeria</p>
        <p>Questions, complaints or privacy requests: <a className="text-primary underline" href={`mailto:${serviceInformation.contact}`}>{serviceInformation.contact}</a>.</p>
        <nav className="mt-4 flex flex-wrap gap-x-5 gap-y-2" aria-label="Related policies">
          {[['/terms', 'Terms'], ['/privacy', 'Privacy'], ['/compliance', 'Compliance'], ['/verification-policy', 'Verification'], ['/pricing', 'Fees'], ['/refund-policy', 'Refunds'], ['/complaints', 'Complaints'], ['/contact', 'Contact']].filter(([url]) => url !== path).map(([url, label]) => <Link key={url} to={url} className="text-primary underline">{label}</Link>)}
        </nav>
        {path === '/privacy' && <p className="mt-4">You may also raise a data protection complaint with the <a href="https://ndpc.gov.ng/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Nigeria Data Protection Commission</a>.</p>}
        {path === '/complaints' && <p className="mt-4">External channels include the <a href="https://fccpc.gov.ng/consumers/complaint-handling/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Federal Competition and Consumer Protection Commission</a> for consumer complaints and the <a href="https://ndpc.gov.ng/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Nigeria Data Protection Commission</a> for privacy complaints.</p>}
      </aside>
    </div>
  </div>;
}
