import Link from 'next/link';
import { adminCategory } from '@/lib/admin-content';
import { categoryPath } from '@/lib/admin-navigation';
import { EntryForm } from '@/components/admin-forms';
export default async function NewSkillPage({ params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await params;
  const { category } = await adminCategory(categoryId);
  return <><div className="admin-heading"><div><h1>Ajouter une compétence</h1><p><Link href={categoryPath(category.id)}>← {category.name}</Link></p></div></div><p className="category-context">Catégorie : <strong>{category.name}</strong></p>{!category.published && <p className="admin-note category-note">Cette catégorie est en brouillon. Ses compétences resteront masquées tant qu’elle n’est pas publiée.</p>}<EntryForm kind="skills" categoryId={category.id} /></>;
}
