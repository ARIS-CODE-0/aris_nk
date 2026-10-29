import type { MetadataRoute } from 'next';
import { publicContent } from '@/lib/data';
import { siteUrl } from '@/lib/site';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> { const { projects, services } = await publicContent(); return [...['', '/a-propos', '/projets', '/services', '/contact'].map(path => ({ url: `${siteUrl}${path}` })), ...projects.map(p => ({ url: `${siteUrl}/projets/${p.slug}`, lastModified: p.updated_at })), ...services.map(service => ({ url: `${siteUrl}/services/${service.id}`, lastModified: service.updated_at }))]; }
