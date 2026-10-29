import 'server-only';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { requireAdmin } from './auth';
import type { Category } from './types';
export async function adminCategory(id: string) {
  if (!z.string().uuid().safeParse(id).success) notFound();
  const db = await requireAdmin();
  const { data, error } = await db.from('categories').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error('Impossible de charger la catégorie.');
  if (!data) notFound();
  return { db, category: data as Category };
}
