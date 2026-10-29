import EditPage from '../../[kind]/[id]/page';
export default async function EditProjectPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
  return EditPage({ params: Promise.resolve({ kind: 'projects', id: (await params).id }), searchParams });
}
