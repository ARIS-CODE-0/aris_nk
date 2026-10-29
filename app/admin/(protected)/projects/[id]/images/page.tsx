import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { projectAssets } from '@/lib/data';
import { UploadForm, AssetEditor } from '@/components/admin-forms';
export default async function ProjectImagesPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const db = await requireAdmin();
  const { data: project, error } = await db.from('projects').select('id,title,published').eq('id', id).maybeSingle();
  if (error) throw new Error('Impossible de charger le projet.');
  if (!project) notFound();
  const assets = await projectAssets(id, db);
  const feedback = await searchParams;
  return <>
    <Link className="back-link" href="/admin/projects">← Tous les projets</Link>
    <div className="admin-heading"><div><h1>Images du projet</h1><p>{project.title}</p></div><div className="admin-heading-actions"><Link className="button button-secondary" href={`/admin/projects/${id}`}>Modifier le projet</Link><Link className="button button-secondary" href={`/admin/preview/projects/${id}`}>Prévisualiser ↗︎</Link></div></div>
    {(feedback.created || feedback.uploaded || feedback.saved || feedback.removed) && <p className="success-message" role="status">{feedback.created ? 'Projet enregistré. Ajoute maintenant ses images.' : feedback.uploaded ? 'Image ajoutée.' : feedback.removed ? 'Image supprimée.' : 'Image mise à jour.'}</p>}
    {!project.published && <p className="admin-note project-step-note">Ce projet est en brouillon. Ses images restent privées jusqu’à sa publication.</p>}
    <div className="project-media-layout">
      <section aria-labelledby="add-project-image" className="image-upload-panel"><h2 id="add-project-image">Ajouter une image</h2><p>La première image sert de couverture. Les suivantes apparaissent dans la galerie du projet.</p><UploadForm projectId={id} /></section>
      <section aria-labelledby="project-gallery-heading" className="image-gallery-panel"><h2 id="project-gallery-heading">Couverture et galerie</h2><p>{assets.length} image{assets.length !== 1 ? 's' : ''}. Tu peux modifier les descriptions, changer l’ordre ou supprimer une image.</p>{assets.length ? assets.map((asset, index) => <AssetEditor key={`${asset.id}-${asset.sort_order}-${asset.alt}`} asset={asset} isCover={index === 0} />) : <div className="empty-state"><div><h3>Aucune image pour ce projet.</h3><p>Ajoute une première image avec le formulaire ci-dessus.</p></div></div>}</section>
    </div>
  </>;
}
