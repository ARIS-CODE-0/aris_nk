import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { EntryForm } from '@/components/admin-forms';
export default async function NewCategoryPage() {
  await requireAdmin();
  return <><div className="admin-heading"><div><h1>Ajouter une catégorie</h1><p><Link href="/admin/skills">← Retour aux compétences</Link></p></div></div><EntryForm kind="categories" /></>;
}
