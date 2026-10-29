import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Service } from '../lib/types';
const fakes=vi.hoisted(() => ({ configured: vi.fn(), publicClient: vi.fn(), requireAdmin: vi.fn(), result: { data: null as Service | null, error: null as null | {message:string} } }));
vi.mock('@/lib/supabase/server', () => ({ configured: fakes.configured, publicClient: fakes.publicClient }));
vi.mock('@/lib/auth', () => ({ requireAdmin: fakes.requireAdmin }));
vi.mock('@/lib/data', () => ({ projectAssets: vi.fn() }));
vi.mock('next/navigation', () => ({ notFound: () => { throw new Error('NOT_FOUND'); } }));
vi.mock('next/link', async () => {
  const react = await import('react');
  return { default: ({children,...props}: React.ComponentProps<'a'>) => react.createElement('a',props,children) };
});
import { ServiceCard, ServiceDetail } from '../components/service';
import ServicePage, { generateMetadata } from '../app/(public)/services/[id]/page';
import PreviewPage from '../app/admin/(protected)/preview/[kind]/[id]/page';
const service: Service = { id:'00000000-0000-4000-8000-000000000001',title:'Création de sites web',summary:'Un résumé bref pour la carte.',description:'La description complète, exclusivement sur la fiche.\nUne seconde ligne détaillée.',published:true,sort_order:0,created_at:'2026-10-29',updated_at:'2026-10-29' };
beforeEach(() => {
  vi.clearAllMocks();fakes.configured.mockReturnValue(true);fakes.result.data=service;fakes.result.error=null;
  const chain = { select:vi.fn(),eq:vi.fn(),maybeSingle:vi.fn(async()=>fakes.result) };
  chain.select.mockReturnValue(chain);chain.eq.mockReturnValue(chain);
  fakes.publicClient.mockReturnValue({from:()=>chain});fakes.requireAdmin.mockResolvedValue({from:()=>chain});
});
describe('Services : résumé sur la carte et description sur la fiche', () => {
  it('la carte omet la description et pointe vers la fiche stable', () => {
    const html=renderToStaticMarkup(React.createElement(ServiceCard,{service}));
    expect(html).toContain(service.summary);expect(html).not.toContain('La description complète');
    expect(html).toContain(`href="/services/${service.id}"`);expect(html).toContain('Voir plus');
  });
  it('la fiche affiche la description complète, le retour et le contact', () => {
    const html=renderToStaticMarkup(React.createElement(ServiceDetail,{service}));
    expect(html).toContain(service.description);expect(html).toContain('href="/services"');expect(html).toContain('href="/contact"');
  });
  it('un service introuvable ou masqué renvoie une 404', async () => {
    fakes.result.data=null;await expect(ServicePage({params:Promise.resolve({id:service.id})})).rejects.toThrow('NOT_FOUND');
  });
  it('une adresse invalide renvoie une 404 sans interroger la base', async () => {
    await expect(ServicePage({params:Promise.resolve({id:'invalide'})})).rejects.toThrow('NOT_FOUND');expect(fakes.publicClient).not.toHaveBeenCalled();
  });
  it('une panne de base reste une erreur et ne devient pas une fausse 404', async () => {
    fakes.result.error={message:'Indisponible'};await expect(ServicePage({params:Promise.resolve({id:service.id})})).rejects.toThrow('Impossible de charger le service');
  });
  it('les métadonnées utilisent le résumé et la bonne URL canonique', async () => {
    const metadata=await generateMetadata({params:Promise.resolve({id:service.id})});expect(metadata.description).toBe(service.summary);expect(metadata.alternates?.canonical).toBe(`/services/${service.id}`);
  });
  it('la prévisualisation privée affiche aussi la description d’un brouillon', async () => {
    fakes.result.data={...service,published:false};
    const preview=await PreviewPage({params:Promise.resolve({kind:'services',id:service.id})});const html=renderToStaticMarkup(preview);
    expect(html).toContain('PRÉVISUALISATION PRIVÉE');expect(html).toContain(service.description);
  });
});
