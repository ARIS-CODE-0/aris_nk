import EntriesPage from '../[kind]/page';
export default function ProjectsAdminPage({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  return EntriesPage({ params: Promise.resolve({ kind: 'projects' }), searchParams });
}
