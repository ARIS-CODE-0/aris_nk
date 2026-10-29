import { beforeEach, describe, expect, it, vi } from 'vitest';
const fakes = vi.hoisted(() => ({ requireAdmin: vi.fn(), revalidate: vi.fn(), insert: vi.fn(), update: vi.fn(), remove: vi.fn(), from: vi.fn(), storageUpload: vi.fn(), storageRemove: vi.fn(), result: { data: { id: '00000000-0000-4000-8000-000000000010', category_id: '00000000-0000-4000-8000-000000000020', project_id: '00000000-0000-4000-8000-000000000010', path: 'test/image.png' }, error: null as null | {code:string} } }));
vi.mock('@/lib/auth', () => ({ requireAdmin: fakes.requireAdmin }));
vi.mock('@/lib/supabase/server', () => ({ configured: () => true, sessionClient: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: (path: string) => { throw new Error(`redirect:${path}`); } }));
vi.mock('next/cache', () => ({ revalidatePath: fakes.revalidate }));
import { saveEntry, deleteEntry, uploadAsset, updateAsset, deleteAsset } from '../app/admin/actions';
const categoryId = '00000000-0000-4000-8000-000000000020';
const id = '00000000-0000-4000-8000-000000000010';
function form(values: Record<string,string>) { const f = new FormData(); for (const [key,value] of Object.entries(values)) f.set(key,value); return f; }
beforeEach(() => {
  vi.clearAllMocks();
  fakes.result.error = null;
  const chain = { insert: fakes.insert, update: fakes.update, delete: fakes.remove, eq: vi.fn(), select: vi.fn(), single: vi.fn(async () => fakes.result) };
  for (const fn of [chain.insert, chain.update, chain.delete, chain.eq, chain.select]) fn.mockReturnValue(chain);
  fakes.from.mockReturnValue(chain);
  fakes.storageUpload.mockResolvedValue({ error: null });
  fakes.storageRemove.mockResolvedValue({ error: null });
  fakes.requireAdmin.mockResolvedValue({ from: fakes.from, storage: { from: () => ({ upload: fakes.storageUpload, remove: fakes.storageRemove }) } });
});
describe('Gestion des contenus et retour à la catégorie', () => {
  it('ajoute une compétence sans ordre saisi et revient à sa catégorie', async () => {
    await expect(saveEntry('skills', {}, form({ name: 'CSS', category_id: categoryId, published: 'on' }))).rejects.toThrow(`redirect:/admin/skills/categories/${categoryId}?saved=1`);
    expect(fakes.insert).toHaveBeenCalledWith({ name: 'CSS', category_id: categoryId, published: true });
  });
  it('ouvre la catégorie créée plutôt qu’un formulaire générique', async () => {
    await expect(saveEntry('categories', {}, form({ name: 'Développement' }))).rejects.toThrow(`redirect:/admin/skills/categories/${id}?saved=1`);
    expect(fakes.insert.mock.calls[0][0]).not.toHaveProperty('sort_order');
  });
  it('préserve le réordonnancement explicite lors de la modification', async () => {
    await expect(saveEntry('skills', {}, form({ id, name: 'CSS', category_id: categoryId, sort_order: '4' }))).rejects.toThrow('redirect:');
    expect(fakes.update.mock.calls[0][0]).toHaveProperty('sort_order', 4);
  });
  it('retourne à la catégorie après suppression d’une compétence', async () => {
    await expect(deleteEntry('skills', {}, form({ id, confirm: 'on' }))).rejects.toThrow(`redirect:/admin/skills/categories/${categoryId}?deleted=1`);
  });
  it('retourne à la page Compétences après suppression d’une catégorie', async () => {
    await expect(deleteEntry('categories', {}, form({ id, confirm: 'on' }))).rejects.toThrow('redirect:/admin/skills?deleted=1');
  });
  it('refuse la création d’une compétence sans catégorie', async () => {
    expect(await saveEntry('skills', {}, form({ name: 'CSS' }))).toHaveProperty('error');
    expect(fakes.insert).not.toHaveBeenCalled();
  });
  it('ne tente aucune écriture sans autorisation administrateur', async () => {
    fakes.requireAdmin.mockRejectedValueOnce(new Error('Accès refusé'));
    await expect(saveEntry('categories', {}, form({ name: 'Interdit' }))).rejects.toThrow('Accès refusé');
    expect(fakes.from).not.toHaveBeenCalled();
  });
});

describe('Images des projets', () => {
  it('passe directement aux images après création du projet', async () => {
    await expect(saveEntry('projects',{},form({title:'Projet',slug:'projet',summary:'Résumé',description:'Description',project_type:'personal',year:'',technologies:'',demo_url:'',code_url:''}))).rejects.toThrow(`redirect:/admin/projects/${id}/images?created=1`);
  });
  it('ajoute une image à un projet existant et reste dans sa page Images', async () => {
    const data=form({project_id:id,alt:'Couverture du projet'});
    data.set('file',new File([new Uint8Array([137,80,78,71,13,10,26,10])],'image.png',{type:'image/png'}));
    await expect(uploadAsset({},data)).rejects.toThrow(`redirect:/admin/projects/${id}/images?uploaded=1`);
    expect(fakes.storageUpload).toHaveBeenCalledOnce();
    expect(fakes.insert.mock.calls[0][0]).toMatchObject({project_id:id,alt:'Couverture du projet'});
    expect(fakes.insert.mock.calls[0][0]).not.toHaveProperty('sort_order');
  });
  it('refuse un format non pris en charge avant tout téléversement', async () => {
    const data=form({project_id:id,alt:'Image'});data.set('file',new File(['<svg/>'],'image.svg',{type:'image/svg+xml'}));
    expect(await uploadAsset({},data)).toHaveProperty('error');expect(fakes.storageUpload).not.toHaveBeenCalled();
  });
  it('revient à la galerie après modification et suppression', async () => {
    await expect(updateAsset({},form({id,alt:'Nouvelle description',sort_order:'2'}))).rejects.toThrow(`redirect:/admin/projects/${id}/images?saved=1`);
    await expect(deleteAsset({},form({id,confirm:'on'}))).rejects.toThrow(`redirect:/admin/projects/${id}/images?removed=1`);
    expect(fakes.storageRemove).toHaveBeenCalledWith(['test/image.png']);
  });
});
