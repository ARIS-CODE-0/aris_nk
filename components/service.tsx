import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import type { Service } from '@/lib/types';
import { Action, Eyebrow } from './ui';
export function ServiceCard({ service, index = 0 }: { service: Service; index?: number }) {
  return <article className="service-card">
    <span className="mono text-blue">{String(index + 1).padStart(2, '0')}{' // SERVICE'}</span>
    <h2>{service.title}</h2>
    <p className="lead-small">{service.summary}</p>
    <Link href={`/services/${service.id}`} className="button button-secondary" aria-label={`Voir plus : ${service.title}`}>Voir plus <ArrowUpRight size={18} /></Link>
  </article>;
}
export function ServiceDetail({ service }: { service: Service }) {
  return <article className="container service-detail">
    <Link href="/services" className="back-link mono"><ArrowLeft size={16} /> TOUS LES SERVICES</Link>
    <Eyebrow>SERVICE</Eyebrow>
    <h1>{service.title}<span className="text-blue">.</span></h1>
    <p className="lead service-intro">{service.summary}</p>
    <div className="service-body"><h2>En détail</h2><p className="prose">{service.description}</p></div>
    <div className="service-contact"><div><h2>Une question sur ce service ?</h2><p>Écris-moi pour en savoir plus et échanger sur tes besoins.</p></div><Action href="/contact">Me contacter</Action></div>
  </article>;
}
