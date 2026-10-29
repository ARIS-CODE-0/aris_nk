import { describe, it, expect } from 'vitest';
import { schemas, validateImage, imageSignature } from '../lib/validation';
const project = { title: 'Un projet', slug: 'un-projet', summary: 'Résumé', description: 'Description', project_type: 'personal', year: '', technologies: [], demo_url: '', code_url: '', published: false, sort_order: 0 };
describe('Validation des contenus', () => {
  it('accepte un projet sans liens ni année et reste en brouillon', () => { const value = schemas.projects.parse(project); expect(value.year).toBe(null); expect(value.demo_url).toBe(null); expect(value.published).toBe(false); });
  it('rejette les slugs invalides et les liens exécutables', () => { expect(schemas.projects.safeParse({ ...project, slug: '../Admin' }).success).toBe(false); expect(schemas.projects.safeParse({ ...project, demo_url: 'javascript:alert(1)' }).success).toBe(false); });
  it('exige une catégorie et un nom non vide pour une compétence', () => { expect(schemas.skills.safeParse({ name: ' ', published: true, sort_order: 0 }).success).toBe(false); expect(schemas.skills.safeParse({ name: 'CSS', category_id: '00000000-0000-4000-8000-000000000001', published: true, sort_order: 2 }).success).toBe(true); });
  it('rejette un ordre négatif et une description vide', () => { expect(schemas.services.safeParse({ title: 'Web', summary: 'Service', description: '', published: false, sort_order: -1 }).success).toBe(false); });
  it('refuse les SVG, les fichiers vides et les images trop lourdes', () => { expect(validateImage({ type: 'image/svg+xml', size: 100 })).toBeTruthy(); expect(validateImage({ type: 'image/png', size: 0 })).toBeTruthy(); expect(validateImage({ type: 'image/png', size: 3*1024*1024+1 })).toBeTruthy(); expect(validateImage({ type: 'image/webp', size: 500 })).toBeNull(); });
  it('détecte les fichiers déguisés en image', () => { expect(imageSignature(new TextEncoder().encode('<script>bad</script>'), 'image/png')).toBe(false); expect(imageSignature(new Uint8Array([137,80,78,71,13,10,26,10]), 'image/png')).toBe(true); });
});
