import 'server-only';
import { redirect } from 'next/navigation';
import { configured, sessionClient } from './supabase/server';
export async function requireAdmin() {
  if (!configured()) redirect('/admin/login');
  const db = await sessionClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect('/admin/login');
  const { data, error } = await db.rpc('is_admin');
  if (error || !data) redirect('/admin/login?error=access');
  return db;
}
