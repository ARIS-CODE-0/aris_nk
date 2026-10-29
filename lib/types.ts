export type Kind = 'categories' | 'skills' | 'services' | 'projects';
export type Base = { id: string; published: boolean; sort_order: number; created_at: string; updated_at: string };
export type Category = Base & { name: string };
export type Skill = Base & { name: string; category_id: string };
export type Service = Base & { title: string; summary: string; description: string };
export type Project = Base & { title: string; slug: string; summary: string; description: string; project_type: 'personal' | 'professional'; year: number | null; technologies: string[]; demo_url: string | null; code_url: string | null };
export type Asset = { id: string; project_id: string; path: string; alt: string; sort_order: number; url?: string };
export type Entry = Category | Skill | Service | Project;
export const labels: Record<Kind, string> = { categories: 'Catégories', skills: 'Compétences', services: 'Services', projects: 'Projets' };
export function isKind(value: string): value is Kind { return ['categories', 'skills', 'services', 'projects'].includes(value); }
