import Link from 'next/link';
import { adminCategory } from '@/lib/admin-content';
import { categoryPath } from '@/lib/admin-navigation';
import type { Skill } from '@/lib/types';
export default async function CategoryPage({ params, searchParams }: { params: Promise<{ categoryId: string }>; searchParams: Promise<{ saved?: string; deleted?: string }> }) {
  const { categoryId } = await params;
  const { db, category } = await adminCategory(categoryId);
  const { data, error } = await db.from('skills').select('*').eq('category_id', category.id).order('sort_order').order('created_at');
  if (error) throw new Error('Impossible de charger les compétences de cette catégorie.');
  const skills = data as Skill[];
  const feedback = await searchParams;
  return <>
    <Link className="back-link" href="/admin/skills">← Toutes les catégories</Link>
    <div className="admin-heading"><div><h1>{category.name}</h1><p>{skills.length} compétence{skills.length !== 1 ? 's' : ''} dans cette catégorie.</p></div><div className="category-actions"><Link className="button button-secondary" href={`${categoryPath(category.id)}/edit`}>Modifier la catégorie</Link><Link className="button" href={`${categoryPath(category.id)}/new`}>Ajouter une compétence +</Link></div></div>
    {(feedback.saved || feedback.deleted) && <p className="success-message" role="status">{feedback.deleted ? 'Compétence supprimée.' : 'Modification enregistrée.'}</p>}
    {!category.published && <p className="admin-note category-note">Cette catégorie est en brouillon. Publie-la dans « Modifier la catégorie » pour afficher ses compétences publiées sur le site.</p>}
    {skills.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Compétence</th><th>État</th><th>Ordre</th><th>Actions</th></tr></thead><tbody>{skills.map(skill => <tr key={skill.id}><td>{skill.name}</td><td><span className={`badge ${skill.published ? '' : 'badge-draft'}`}>{skill.published ? 'Publiée' : 'Brouillon'}</span></td><td>{skill.sort_order}</td><td><div className="table-actions"><Link href={`/admin/skills/${skill.id}`}>Modifier</Link><Link href={`/admin/preview/skills/${skill.id}`}>Prévisualiser</Link></div></td></tr>)}</tbody></table></div> : <div className="empty-state"><div><h2>Aucune compétence dans cette catégorie.</h2><p>Utilise « Ajouter une compétence » pour commencer.</p></div></div>}
  </>;
}
