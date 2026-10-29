import Link from 'next/link';
import { adminCategory } from '@/lib/admin-content';
import { categoryPath } from '@/lib/admin-navigation';
import { EntryForm, DeleteForm } from '@/components/admin-forms';
export default async function EditCategoryPage({ params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await params;
  const { category } = await adminCategory(categoryId);
  return <><div className="admin-heading"><div><h1>Modifier la catégorie</h1><p><Link href={categoryPath(category.id)}>← {category.name}</Link></p></div><Link className="button button-secondary" href={`/admin/preview/categories/${category.id}`}>Prévisualiser ↗︎</Link></div><EntryForm kind="categories" entry={category} /><DeleteForm kind="categories" id={category.id} /></>;
}
