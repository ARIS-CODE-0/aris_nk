import type { Metadata } from 'next';
import Image from 'next/image';
import { Action, Eyebrow } from '@/components/ui';
import { site, siteUrl } from '@/lib/site';

const title = 'Aristote Nkomba : développeur web & SaaS builder à Lubumbashi';
const description = 'Découvre Aristote Nkomba, alias Aris NK : développeur web autodidacte depuis 2023 et SaaS builder à Lubumbashi, en RDC. Son parcours et ses projets.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/a-propos' },
  openGraph: { title: `${title} — Aris NK`, description, url: '/a-propos', images: ['/opengraph-image'] },
};

export default function AboutPage() {
  const personId = `${siteUrl}/#person`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': `${siteUrl}/a-propos#webpage`,
        url: `${siteUrl}/a-propos`,
        name: `${title} — Aris NK`,
        description,
        inLanguage: 'fr',
        mainEntity: { '@id': personId },
      },
      {
        '@type': 'Person',
        '@id': personId,
        name: site.fullName,
        alternateName: site.name,
        url: siteUrl,
        description: site.bio,
        jobTitle: 'Développeur web et SaaS builder',
        homeLocation: { '@type': 'Place', name: site.location },
        sameAs: site.socials.map(profile => profile.href),
        knowsAbout: ['Développement web', 'Création de SaaS', 'Développement full stack'],
      },
    ],
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
    <section className="container page-content about-intro" aria-labelledby="about-title">
      <div>
        <Eyebrow>ARISTOTE NKOMBA · ARIS NK</Eyebrow>
        <h1 id="about-title">Aristote Nkomba<span className="text-blue">.</span><br />Alias Aris NK.</h1>
        <p className="page-lead">Je suis Aristote Nkomba, aussi connu sous le nom d’Aris NK, développeur web et SaaS builder à Lubumbashi, en République démocratique du Congo (RDC). J’apprends en construisant des produits web et je partage ce que je découvre en chemin.</p>
        <div className="hero-actions"><Action href="/projets">Explorer mes projets</Action><Action href="/contact" secondary>Faire connaissance</Action></div>
      </div>
      <figure className="about-portrait">
        <Image src="/portrait.jpg" alt="Portrait illustré d’Aristote Nkomba (Aris NK), développeur web à Lubumbashi" width={640} height={640} sizes="(max-width: 767px) 90vw, 35vw" priority />
        <figcaption className="mono">LUBUMBASHI, RDC · AUTODIDACTE DEPUIS 2023</figcaption>
      </figure>
    </section>

    <section className="journey-section">
      <div className="container section">
        <div className="section-heading"><div><Eyebrow index="01">MON PARCOURS</Eyebrow><h2>La curiosité,<br />puis la pratique<span className="text-blue">.</span></h2></div><p>Du premier apprentissage du code à la création de mes propres produits.</p></div>
        <div className="timeline">{site.journey.map((step, index) => <article key={step.date} className="timeline-item"><div className="timeline-top"><span className="mono">{step.date}</span><span className="timeline-number" aria-hidden="true">0{index + 1}</span></div><div className="timeline-line" aria-hidden="true"><span /></div><h3>{step.title}</h3><p>{step.text}</p></article>)}</div>
      </div>
    </section>

    <section className="container section about-grid">
      <div><Eyebrow index="02">CE QUI M’ANIME</Eyebrow><h2>Transformer une idée<br />en quelque chose<br />d’utile<span className="text-blue">.</span></h2></div>
      <div className="about-copy">
        <p className="lead">Construire, comprendre et recommencer.</p>
        <p>Le développement web est pour moi une façon de donner forme aux idées. Depuis 2023, je développe mes compétences en autodidacte, à travers des projets personnels et les questions concrètes qu’ils soulèvent.</p>
        <p>Depuis début 2026, je me consacre plus sérieusement à la création de SaaS. Je veux partir de problèmes concrets pour concevoir des produits utiles, tout en continuant à apprendre les différentes facettes du développement full stack.</p>
        <p>Ce portfolio rassemble ce parcours en cours de construction. Mes projets permettent de découvrir ce que je fais, et les étapes de mon chemin expliquent comment j’y arrive.</p>
      </div>
    </section>

    <section className="container about-closing" aria-labelledby="about-follow-title">
      <Eyebrow index="03">CONSTRUIRE ET PARTAGER</Eyebrow>
      <h2 id="about-follow-title">Suivre le chemin<span className="text-blue">.</span></h2>
      <p>Je me lance aussi dans la création de contenu pour partager mes essais, mes apprentissages et l’avancée de mes produits. Retrouve-moi sur mes profils officiels ou écris-moi pour échanger.</p>
      <div className="about-profile-links">{site.socials.map(profile => <a className="text-link" key={profile.label} href={profile.href} target="_blank" rel="noopener noreferrer">{profile.label}<span aria-hidden="true">↗</span></a>)}</div>
      <Action href="/contact">Échangeons</Action>
    </section>
  </>;
}
