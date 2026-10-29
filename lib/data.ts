import 'server-only';
import { configured, publicClient } from './supabase/server';
import type { Category, Skill, Project, Service, Asset } from './types';
export async function publicContent() {
  if (!configured()) return { categories: [] as Category[], skills: [] as Skill[], services: [] as Service[], projects: [] as Project[] };
  const db = publicClient();
  const results = await Promise.all(['categories', 'skills', 'services', 'projects'].map(t => db.from(t).select('*').eq('published', true).order('sort_order').order('created_at')));
  if (results.some(r => r.error)) throw new Error('Impossible de charger les contenus.');
  return { categories: results[0].data as Category[], skills: results[1].data as Skill[], services: results[2].data as Service[], projects: results[3].data as Project[] };
}
export async function projectAssets(projectId: string, db = publicClient()): Promise<Asset[]> {
  const { data, error } = await db.from('project_assets').select('*').eq('project_id', projectId).order('sort_order').order('created_at');
  if (error) throw new Error('Impossible de charger les images.');
  return Promise.all((data || []).map(async (asset: Asset) => {
    const { data, error } = await db.storage.from('project-media').createSignedUrl(asset.path, 300);
    if (error) throw new Error('Impossible de charger une image.');
    return { ...asset, url: data.signedUrl };
  }));
}
