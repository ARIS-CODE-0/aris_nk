'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { configured, sessionClient } from '@/lib/supabase/server';
import { isKind, type Kind } from '@/lib/types';
import { schemas, validateImage, imageSignature } from '@/lib/validation';
import { z } from 'zod';
import { categoryPath } from '@/lib/admin-navigation';
export type FormState = { error?: string; success?: string };
function dbError(code?: string) {
  if (code === '22003') return 'La liste a atteint sa capacité. Réorganisez les positions avant un nouvel ajout.';
  if (code === '23505') return 'Cet identifiant existe déjà. Choisissez un autre slug.';
  if (code === '23503') return 'Cette catégorie contient encore des compétences. Déplacez-les ou supprimez-les avant de la supprimer.';
  return 'L’opération a échoué. Vérifiez les champs et réessayez.';
}
function validId(value: FormDataEntryValue | null) { return z.string().uuid().safeParse(value); }
export async function login(_previous: FormState, form: FormData): Promise<FormState> {
  if (!configured()) return { error: 'La connexion administrateur n’est pas encore configurée.' };
  const email = String(form.get('email') || '').trim();
  const password = String(form.get('password') || '');
  if (!z.string().email().safeParse(email).success || !password) return { error: 'Saisissez votre e-mail et votre mot de passe.' };
  const db = await sessionClient();
  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error) return { error: 'Connexion impossible. Vérifiez vos identifiants ou réessayez plus tard.' };
  const { data: admin } = await db.rpc('is_admin');
  if (!admin) { await db.auth.signOut(); return { error: 'Ce compte n’a pas accès à l’administration.' }; }
  redirect('/admin');
}
export async function logout() { if (configured()) { const db = await sessionClient(); await db.auth.signOut(); } redirect('/admin/login'); }
export async function saveEntry(kind: Kind, _previous: FormState, form: FormData): Promise<FormState> {
  const db = await requireAdmin();
  if (!isKind(kind)) return { error: 'Type de contenu invalide.' };
  const id = form.get('id');
  if (id && !validId(id).success) return { error: 'Identifiant invalide.' };
  const values: Record<string, unknown> = Object.fromEntries(form.entries());
  if (!id) values.sort_order = 0; // Validated placeholder; PostgreSQL assigns the actual order atomically.
  values.published = form.get('published') === 'on';
  if (kind === 'projects') values.technologies = [...new Set(String(form.get('technologies') || '').split(',').map(t => t.trim()).filter(Boolean))];
  const parsed = schemas[kind].safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues.map(i => i.message).join(' ') };
  const payload: Record<string, unknown> = parsed.data;
  if (!id) delete payload.sort_order;
  const result = id ? await db.from(kind).update(payload).eq('id', id).select('id').single() : await db.from(kind).insert(payload).select('id').single();
  if (result.error) return { error: dbError(result.error.code) };
  revalidatePath('/', 'layout');
  if (kind === 'categories') redirect(`${categoryPath(result.data.id)}?saved=1`);
  if (kind === 'skills') redirect(`${categoryPath(String(payload.category_id))}?saved=1`);
  redirect(`/admin/${kind}/${result.data.id}?saved=1`);
}
export async function deleteEntry(kind: Kind, _previous: FormState, form: FormData): Promise<FormState> {
  const db = await requireAdmin();
  const id = validId(form.get('id'));
  if (!isKind(kind) || !id.success || form.get('confirm') !== 'on') return { error: 'Confirmez la suppression.' };
  let paths: string[] = [];
  if (kind === 'projects') {
    const { data, error } = await db.from('project_assets').select('path').eq('project_id', id.data);
    if (error) return { error: dbError() };
    paths = (data || []).map(a => a.path);
    if (paths.length) {
      const { error: storageError } = await db.storage.from('project-media').remove(paths);
      if (storageError) return { error: 'Impossible de supprimer les images. Réessayez avant de supprimer le projet.' };
    }
  }
  const { data: deleted, error } = await db.from(kind).delete().eq('id', id.data).select('*').single();
  if (error) return { error: dbError(error.code) };
  revalidatePath('/', 'layout');
  if (kind === 'categories') redirect('/admin/skills?deleted=1');
  if (kind === 'skills') redirect(`${categoryPath(deleted.category_id)}?deleted=1`);
  redirect(`/admin/${kind}?deleted=1`);
}
export async function uploadAsset(_previous: FormState, form: FormData): Promise<FormState> {
  const db = await requireAdmin();
  const project = validId(form.get('project_id'));
  const file = form.get('file');
  const alt = String(form.get('alt') || '').trim();
  if (!project.success || !(file instanceof File) || !alt || alt.length > 250) return { error: 'Choisissez une image et un texte alternatif (250 caractères maximum).' };
  const invalid = validateImage(file);
  if (invalid) return { error: invalid };
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!imageSignature(bytes, file.type)) return { error: 'Le fichier ne correspond pas au format d’image annoncé.' };
  const { data: parent } = await db.from('projects').select('id').eq('id', project.data).single();
  if (!parent) return { error: 'Projet introuvable.' };
  const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' }[file.type];
  const path = `${project.data}/${crypto.randomUUID()}.${extension}`;
  const { error } = await db.storage.from('project-media').upload(path, bytes, { contentType: file.type, upsert: false });
  if (error) return { error: 'Téléversement impossible. Vérifiez votre connexion puis réessayez.' };
  const { error: insertError } = await db.from('project_assets').insert({ project_id: project.data, path, alt });
  if (insertError) { await db.storage.from('project-media').remove([path]); return { error: 'L’image n’a pas pu être associée au projet.' }; }
  revalidatePath('/', 'layout');
  redirect(`/admin/projects/${project.data}?uploaded=1`);
}
export async function updateAsset(_previous: FormState, form: FormData): Promise<FormState> {
  const db = await requireAdmin();
  const id = validId(form.get('id'));
  const alt = String(form.get('alt') || '').trim();
  const sort = z.coerce.number().int().min(0).max(9999).safeParse(form.get('sort_order'));
  if (!id.success || !alt || alt.length > 250 || !sort.success) return { error: 'Saisissez un texte alternatif et un ordre valides.' };
  const { data, error } = await db.from('project_assets').update({ alt, sort_order: sort.data }).eq('id', id.data).select('project_id').single();
  if (error) return { error: dbError(error.code) };
  revalidatePath('/', 'layout');
  redirect(`/admin/projects/${data.project_id}?saved=1`);
}
export async function deleteAsset(_previous: FormState, form: FormData): Promise<FormState> {
  const db = await requireAdmin();
  const id = validId(form.get('id'));
  if (!id.success || form.get('confirm') !== 'on') return { error: 'Confirmez la suppression de cette image.' };
  const { data: asset } = await db.from('project_assets').select('*').eq('id', id.data).single();
  if (!asset) return { error: 'Image introuvable.' };
  const { error: storageError } = await db.storage.from('project-media').remove([asset.path]);
  if (storageError) return { error: 'Impossible de supprimer le fichier. Réessayez.' };
  const { error } = await db.from('project_assets').delete().eq('id', id.data);
  if (error) return { error: dbError() };
  revalidatePath('/', 'layout');
  redirect(`/admin/projects/${asset.project_id}?removed=1`);
}
