import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { projectAssets } from '@/lib/data';
import { isKind, labels, type Category, type Entry } from '@/lib/types';
import { categoryPath } from '@/lib/admin-navigation';
import { EntryForm, DeleteForm, UploadForm, AssetEditor } from '@/components/admin-forms';
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
  const assets = kind === 'projects' && entry ? await projectAssets(id, db) : [];
  const feedback = await searchParams;
  return <><div className="admin-heading"><div><h1>{entry ? 'Modifier' : 'Ajouter'} · {labels[kind]}</h1><p><Link href={backHref}>← Retour à la liste</Link></p></div>{entry && <Link className="button button-secondary" href={`/admin/preview/${kind}/${id}`}>Prévisualiser ↗︎</Link>}</div>{(feedback.saved || feedback.uploaded || feedback.removed) && <p className="success-message" role="status">Modification enregistrée.</p>}{kind === 'skills' && !categories.length ? <p className="admin-note">Crée d’abord une <Link className="text-link" href="/admin/categories/new">catégorie ↗︎</Link> pour y ajouter des compétences.</p> : <EntryForm kind={kind} entry={entry} categories={categories} />}{kind === 'projects' && <section className="admin-media"><h2>Images du projet</h2><p>La première image dans l’ordre sert de couverture. Les suivantes forment la galerie. Les images d’un brouillon restent privées.</p>{entry ? <><div style={{ maxWidth: 800 }}>{assets.map(a => <AssetEditor key={`${a.id}-${a.sort_order}-${a.alt}`} asset={a} />)}</div><UploadForm projectId={id} /></> : <p className="admin-note">Enregistre d’abord le projet en brouillon pour ajouter ses images.</p>}</section>}{entry && <DeleteForm kind={kind} id={id} />}</>;
}
