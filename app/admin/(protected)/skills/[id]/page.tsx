import EditPage from '../../[kind]/[id]/page';
export default async function EditSkillPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
  const { id } = await params;
  return EditPage({ params: Promise.resolve({ kind: 'skills', id }), searchParams });
}
