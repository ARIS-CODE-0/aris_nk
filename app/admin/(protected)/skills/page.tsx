import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { categoryPath } from '@/lib/admin-navigation';
import type { Category, Skill } from '@/lib/types';
export default async function SkillsHub({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const db = await requireAdmin();
  const [categoryResult, skillResult] = await Promise.all([
    db.from('categories').select('*').order('sort_order').order('created_at'),
    db.from('skills').select('id,category_id,published'),
  ]);
  if (categoryResult.error || skillResult.error) throw new Error('Impossible de charger les compétences.');
  const categories = categoryResult.data as Category[];
  const skills = skillResult.data as Pick<Skill, 'id' | 'category_id' | 'published'>[];
  return <>
    <div className="admin-heading"><div><h1>Compétences</h1><p>Ouvre une catégorie pour consulter et ajouter ses compétences.</p></div><Link className="button" href="/admin/skills/categories/new">Ajouter une catégorie +</Link></div>
    {(await searchParams).deleted && <p className="success-message" role="status">Catégorie supprimée.</p>}
    {categories.length ? <div className="category-grid">{categories.map(category => {
      const items = skills.filter(skill => skill.category_id === category.id);
      return <Link key={category.id} href={categoryPath(category.id)} className="category-card">
        <span className={`badge ${category.published ? '' : 'badge-draft'}`}>{category.published ? 'Publiée' : 'Brouillon'}</span>
        <h2>{category.name}</h2>
        <p>{items.length} compétence{items.length !== 1 ? 's' : ''} · {items.filter(s => s.published).length} publiée{items.filter(s => s.published).length !== 1 ? 's' : ''}</p>
        <span className="text-link">Gérer les compétences ↗︎</span>
      </Link>;
    })}</div> : <div className="empty-state"><div><h2>Aucune catégorie pour le moment.</h2><p>Crée ta première catégorie, puis ajoute ses compétences depuis sa page.</p></div></div>}
  </>;
}
