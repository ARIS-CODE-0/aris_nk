import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { projectAssets } from '@/lib/data';
import { isKind, type Category, type Skill, type Service, type Project } from '@/lib/types';
import { Skills } from '@/components/ui';
import { ServiceDetail } from '@/components/service';
import { ProjectDetail } from '@/components/project';
export default async function PreviewPage({ params }: { params: Promise<{ kind: string; id: string }> }) {
  const { kind, id } = await params;
  if (!isKind(kind) || !z.string().uuid().safeParse(id).success) notFound();
  const db = await requireAdmin();
  const { data: entry, error } = await db.from(kind).select('*').eq('id', id).maybeSingle();
  if (error) throw new Error('Prévisualisation indisponible.');
  if (!entry) notFound();
  let content;
  if (kind === 'projects') content = <ProjectDetail project={entry as Project} assets={await projectAssets(id, db)} />;
  else if (kind === 'services') content = <ServiceDetail service={entry as Service} />;
  else {
    const categoryId = kind === 'categories' ? id : entry.category_id;
    const { data: category, error: categoryError } = await db.from('categories').select('*').eq('id', categoryId).single();
    const { data: skills, error: skillsError } = await db.from('skills').select('*').eq('category_id', categoryId).order('sort_order').order('created_at');
    if (categoryError || skillsError) throw new Error('Impossible de prévisualiser les compétences.');
    const visibleSkills = kind === 'skills' ? (skills as Skill[]).filter(s => s.published || s.id === id) : skills as Skill[];
    content = <div className="container preview-section"><h1>Mes compétences<span className="text-blue">.</span></h1><Skills categories={[category as Category]} skills={visibleSkills} /></div>;
  }
  return <div className="preview-body"><div className="preview-banner"><span>PRÉVISUALISATION PRIVÉE · peut inclure des brouillons</span><Link href={`/admin/${kind}/${id}`}>← Revenir à l’édition</Link></div>{content}</div>;
}
