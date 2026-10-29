import type { MetadataRoute } from 'next';
import { publicContent } from '@/lib/data';
import { siteUrl } from '@/lib/site';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> { const { projects } = await publicContent(); return [...['', '/projets', '/services', '/contact'].map(path => ({ url: `${siteUrl}${path}` })), ...projects.map(p => ({ url: `${siteUrl}/projets/${p.slug}`, lastModified: p.updated_at }))]; }
