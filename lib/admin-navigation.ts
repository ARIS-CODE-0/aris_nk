export const adminSections = [
  { kind: 'skills', label: 'Compétences' },
  { kind: 'services', label: 'Services' },
  { kind: 'projects', label: 'Projets' },
] as const;
export const categoryPath = (id: string) => `/admin/skills/categories/${id}`;
