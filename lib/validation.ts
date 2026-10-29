import { z } from 'zod';
const required = (max: number) => z.string().trim().min(1, 'Ce champ est obligatoire.').max(max, `Maximum ${max} caractères.`);
const url = z.union([z.literal(''), z.string().url('Lien invalide.').refine(v => /^https?:\/\//i.test(v), 'Utilisez un lien HTTP ou HTTPS.')]).transform(v => v || null);
const common = { published: z.boolean(), sort_order: z.coerce.number().int().min(0).max(9999) };
export const schemas = {
  categories: z.object({ ...common, name: required(100) }),
  skills: z.object({ ...common, name: required(100), category_id: z.string().uuid('Choisissez une catégorie.') }),
  services: z.object({ ...common, title: required(140), summary: required(350), description: required(15000) }),
  projects: z.object({ ...common, title: required(140), slug: required(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Utilisez des minuscules, chiffres et tirets.'), summary: required(350), description: required(20000), project_type: z.enum(['personal', 'professional']), year: z.preprocess(v => v === '' ? null : v, z.coerce.number().int().min(2000).max(2100).nullable()), technologies: z.array(required(60)).max(30), demo_url: url, code_url: url }),
};
export function validateImage(file: { size: number; type: string }) {
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) return 'Formats acceptés : JPEG, PNG, WebP et AVIF.';
  if (file.size === 0 || file.size > 3 * 1024 * 1024) return 'L’image doit peser entre 1 octet et 3 Mo.';
  return null;
}
export function imageSignature(bytes: Uint8Array, mime: string) {
  if (mime === 'image/jpeg') return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (mime === 'image/png') return [137,80,78,71,13,10,26,10].every((v,i) => bytes[i] === v);
  if (mime === 'image/webp') return new TextDecoder().decode(bytes.slice(0,4)) === 'RIFF' && new TextDecoder().decode(bytes.slice(8,12)) === 'WEBP';
  return mime === 'image/avif' && new TextDecoder().decode(bytes.slice(4,8)) === 'ftyp' && /avif|avis/.test(new TextDecoder().decode(bytes.slice(8,32)));
}
