import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Category, Skill, Service } from '@/lib/types';
import { SkillAccordions } from './skill-accordions';
export function Eyebrow({ index, children }: { index?: string; children: React.ReactNode }) { return <div className="eyebrow">{index && <span>{index}{' //'}</span>} {children}<span className="eyebrow-line" /></div>; }
export function Action({ href, children, secondary = false }: { href: string; children: React.ReactNode; secondary?: boolean }) { return <Link className={`button ${secondary ? 'button-secondary' : ''}`} href={href}>{children}<ArrowUpRight size={18} /></Link>; }
export function EmptyState({ title, children }: { title: string; children: React.ReactNode }) { return <div className="empty-state"><span className="empty-symbol" aria-hidden="true">↗︎</span><div><h3>{title}</h3><p>{children}</p></div><Link href="/contact" className="text-link">Me contacter <ArrowUpRight size={16} /></Link></div>; }
export function Skills({ categories, skills }: { categories: Category[]; skills: Skill[] }) {
  const visible = categories.filter(c => skills.some(s => s.category_id === c.id));
  if (!visible.length) return <EmptyState title="Mes compétences, bientôt ici.">Cette section s’enrichira au fil des produits que je construis et de ce que j’apprends.</EmptyState>;
  return <SkillAccordions categories={visible} skills={skills} />;
}
export function ServiceCard({ service, index = 0 }: { service: Service; index?: number }) { return <article className="service-card"><span className="mono text-blue">{String(index + 1).padStart(2, '0')}{' // SERVICE'}</span><h2>{service.title}</h2><p className="lead-small">{service.summary}</p><p className="prose">{service.description}</p><Action href="/contact">Me contacter</Action></article>; }
