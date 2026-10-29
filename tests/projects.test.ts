import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { Project } from '../lib/types';
vi.mock('next/link', async () => { const react=await import('react'); return { default: ({children,...props}:React.ComponentProps<'a'>) => react.createElement('a',props,children) }; });
vi.mock('next/image', async () => { const react=await import('react'); return { default: ({src,alt}:{src:string;alt:string}) => react.createElement('img',{src,alt}) }; });
import { ProjectCard, ProjectDetail } from '../components/project';
const project: Project = { id:'00000000-0000-4000-8000-000000000001',title:'Mon projet',slug:'mon-projet',summary:'Un résumé du projet',description:'Description détaillée',project_type:'personal',year:2026,technologies:['TypeScript'],demo_url:null,code_url:null,published:true,sort_order:0,created_at:'',updated_at:'' };
describe('Présentation des projets', () => {
  it('affiche un bouton Voir plus explicite vers la fiche même sans image', () => {
    const html=renderToStaticMarkup(React.createElement(ProjectCard,{project}));
    expect(html).toContain('class="button button-secondary project-more"');expect(html).toContain('aria-label="Voir plus : Mon projet"');expect(html).toContain('href="/projets/mon-projet"');expect(html).toContain('Voir plus');
  });
  it('affiche la couverture sur la carte', () => {
    const html=renderToStaticMarkup(React.createElement(ProjectCard,{project,cover:{id:'a',project_id:project.id,path:'a.png',alt:'Couverture',sort_order:0,url:'https://example.com/a.png'}}));
    expect(html).toContain('alt="Couverture"');expect(html).toContain('https://example.com/a.png');
  });
  it('affiche la première image en couverture et les suivantes dans la galerie', () => {
    const assets=[{id:'a',project_id:project.id,path:'a.png',alt:'Couverture',sort_order:0,url:'https://example.com/a.png'},{id:'b',project_id:project.id,path:'b.png',alt:'Galerie',sort_order:1,url:'https://example.com/b.png'}];
    const html=renderToStaticMarkup(React.createElement(ProjectDetail,{project,assets}));
    expect(html).toContain('class="detail-cover"');expect(html).toContain('class="project-gallery"');expect(html).toContain('alt="Couverture"');expect(html).toContain('alt="Galerie"');
  });
});
