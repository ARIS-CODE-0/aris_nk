import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { isKind, labels, type Category, type Entry } from '@/lib/types';
import { categoryPath } from '@/lib/admin-navigation';
import { EntryForm, DeleteForm } from '@/components/admin-forms';
export default async function EditPage({ params, searchParams }: { params: Promise<{ kind: string; id: string }>; searchParams: Promise<Record<string, string>> }) {
  const { kind, id } = await params;
  if (!isKind(kind) || (id !== 'new' && !z.string().uuid().safeParse(id).success)) notFound();
  if (kind === 'categories') redirect(id === 'new' ? '/admin/skills/categories/new' : `${categoryPath(id)}/edit`);
  if (kind === 'skills' && id === 'new') redirect('/admin/skills');
  const db = await requireAdmin();
  let entry: Entry | undefined;
  if (id !== 'new') { const result = await db.from(kind).select('*').eq('id', id).maybeSingle(); if (result.error) throw new Error('Impossible de charger ce contenu.'); if (!result.data) notFound(); entry = result.data; }
  let categories: Category[] = [];
  if (kind === 'skills') { const { data, error } = await db.from('categories').select('*').order('sort_order'); if (error) throw new Error('Impossible de charger les catégories.'); categories = data || []; }
  const backHref = kind === 'skills' && entry && 'category_id' in entry ? categoryPath(entry.category_id) : `/admin/${kind}`;
  const feedback = await searchParams;
  return <><div className="admin-heading"><div><h1>{entry ? 'Modifier' : 'Ajouter'} · {labels[kind]}</h1><p><Link href={backHref}>← Retour à la liste</Link></p></div>{entry && <div className="admin-heading-actions">{kind === 'projects' && <Link className="button" href={`/admin/projects/${id}/images`}>Gérer les images</Link>}<Link className="button button-secondary" href={`/admin/preview/${kind}/${id}`}>Prévisualiser ↗︎</Link></div>}</div>{(feedback.saved || feedback.uploaded || feedback.removed) && <p className="success-message" role="status">Modification enregistrée.</p>}{kind === 'projects' && !entry && <p className="admin-note project-step-note">Enregistre d’abord le projet : tu passeras ensuite à l’ajout de sa couverture et de sa galerie.</p>}{kind === 'skills' && !categories.length ? <p className="admin-note">Crée d’abord une <Link className="text-link" href="/admin/categories/new">catégorie ↗︎</Link> pour y ajouter des compétences.</p> : <EntryForm kind={kind} entry={entry} categories={categories} />}{entry && <DeleteForm kind={kind} id={id} />}</>;
}
