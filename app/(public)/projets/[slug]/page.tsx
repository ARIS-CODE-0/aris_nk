import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { configured, publicClient } from '@/lib/supabase/server';
import { projectAssets } from '@/lib/data';
import { ProjectDetail } from '@/components/project';
import type { Project } from '@/lib/types';
async function getProject(slug: string): Promise<Project> {
  if (!configured()) notFound();
  const { data, error } = await publicClient().from('projects').select('*').eq('slug', slug).eq('published', true).maybeSingle();
  if (error) throw new Error('Impossible de charger le projet.');
  if (!data) notFound();
  return data;
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const p = await getProject((await params).slug); return { title: p.title, description: p.summary, alternates: { canonical: `/projets/${p.slug}` }, openGraph: { title: p.title, description: p.summary } }; }
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) { const p = await getProject((await params).slug); return <ProjectDetail project={p} assets={await projectAssets(p.id)} />; }
