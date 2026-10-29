import type { Metadata } from 'next';
import { ServiceCard } from '@/components/service';
import { publicContent } from '@/lib/data';
import { Eyebrow, EmptyState } from '@/components/ui';
export const metadata: Metadata = { title: 'Services', description: 'Échangeons sur vos besoins et construisons une solution web adaptée à votre projet.', alternates: { canonical: '/services' } };
export default async function ServicesPage() { const { services } = await publicContent(); return <div className="container page-content"><Eyebrow index="02">TRAVAILLONS ENSEMBLE</Eyebrow><h1>Ton projet.<br />Construisons-le<span className="text-blue">.</span></h1><p className="page-lead">Chaque idée a son contexte, ses besoins et ses ambitions.<br />Commençons par en parler pour trouver la bonne approche.</p>{services.length ? <div className="services-grid">{services.map((s,i) => <ServiceCard key={s.id} service={s} index={i} />)}</div> : <EmptyState title="Une idée à concrétiser ?">Mes prestations seront bientôt détaillées ici. Tu peux déjà me contacter pour discuter de ton besoin.</EmptyState>}</div>; }
