import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';
const admin = '00000000-0000-4000-8000-000000000001';
const other = '00000000-0000-4000-8000-000000000002';
const category = '00000000-0000-4000-8000-000000000003';
const hiddenCategory = '00000000-0000-4000-8000-000000000004';
const publishedProject = '00000000-0000-4000-8000-000000000005';
const draftProject = '00000000-0000-4000-8000-000000000006';
let db: PGlite;
async function as(role: 'anon' | 'authenticated', uid = '') { await db.exec('reset role'); await db.query("select set_config('request.jwt.claim.sub', $1, false)", [uid]); await db.exec(`set role ${role}`); }
beforeAll(async () => {
  db = new PGlite();
  // Minimal Supabase auth/storage contracts; the actual application migration is executed unchanged.
  await db.exec(`create role anon; create role authenticated; create schema auth; create schema storage;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema public,auth,storage to anon,authenticated;
    grant execute on function auth.uid() to anon,authenticated;
    create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects(id uuid primary key default gen_random_uuid(), bucket_id text, name text);
    alter table storage.objects enable row level security;
    grant select,insert,update,delete on storage.objects to anon,authenticated;`);
  await db.exec(await readFile('supabase/migrations/202610290001_portfolio.sql', 'utf8'));
  await db.exec(`insert into auth.users values ('${admin}'), ('${other}');
    insert into public.administrators(user_id) values ('${admin}');
    insert into public.categories(id,name,published) values ('${category}','Développement',true), ('${hiddenCategory}','Marketing',false);
    insert into public.skills(name,category_id,published) values ('HTML','${category}',true), ('Secret','${category}',false), ('SEO','${hiddenCategory}',true);
    insert into public.projects(id,title,slug,summary,description,project_type,published) values
    ('${publishedProject}','Public','public','Résumé','Description','personal',true), ('${draftProject}','Privé','prive','Résumé','Description','personal',false);
    insert into public.project_assets(project_id,path,alt) values ('${publishedProject}','public.png','Public'), ('${draftProject}','draft.png','Privé');
    insert into storage.objects(bucket_id,name) values ('project-media','public.png'), ('project-media','draft.png'), ('project-media','orphan.png');`);
  await db.exec(await readFile('supabase/migrations/202610290002_automatic_order.sql', 'utf8'));
});
afterAll(async () => { await db.close(); });
describe('Accès réels PostgreSQL / RLS', () => {
  it('ne montre que les compétences publiées des catégories publiées', async () => { await as('anon'); const result = await db.query<{name:string}>('select name from public.skills'); expect(result.rows.map(r => r.name)).toEqual(['HTML']); });
  it('cache les projets, métadonnées et fichiers des brouillons aux visiteurs', async () => { await as('anon'); expect((await db.query('select * from public.projects')).rows).toHaveLength(1); expect((await db.query('select * from public.project_assets')).rows).toHaveLength(1); expect((await db.query<{name:string}>('select name from storage.objects')).rows.map(r => r.name)).toEqual(['public.png']); });
  it('refuse les écritures anonymes', async () => { await as('anon'); await expect(db.exec("insert into public.categories(name) values ('Intrusion')")).rejects.toThrow(); await expect(db.exec("insert into storage.objects(bucket_id,name) values ('project-media','intrusion.png')")).rejects.toThrow(); });
  it('un utilisateur authentifié ordinaire ne peut pas écrire ou se promouvoir', async () => { await as('authenticated', other); expect((await db.query<{is_admin:boolean}>('select public.is_admin()')).rows[0].is_admin).toBe(false); await expect(db.exec("insert into public.categories(name) values ('Intrusion')")).rejects.toThrow(); await expect(db.exec(`update public.administrators set user_id='${other}'`)).rejects.toThrow(); expect((await db.query('select * from public.projects')).rows).toHaveLength(1); });
  it('permet à l’administrateur de lire et gérer les brouillons', async () => { await as('authenticated', admin); expect((await db.query('select * from public.projects')).rows).toHaveLength(2); await db.exec("insert into public.services(title,summary,description) values ('Service test','Résumé','Description')"); expect((await db.query('select * from public.services')).rows).toHaveLength(1); expect((await db.query('select * from storage.objects')).rows).toHaveLength(3); });
  it('protège la catégorie non vide et le slug unique', async () => { await as('authenticated', admin); await expect(db.exec(`delete from public.categories where id='${category}'`)).rejects.toThrow(); await expect(db.exec("insert into public.projects(title,slug,summary,description,project_type) values ('Doublon','public','Résumé','Description','personal')")).rejects.toThrow(); });
  it('reflète publication, dépublication et déplacement sans redéploiement', async () => { await as('authenticated', admin); await db.exec(`update public.categories set published=true where id='${hiddenCategory}'; update public.projects set published=false where id='${publishedProject}';`); await as('anon'); expect((await db.query('select * from public.skills')).rows).toHaveLength(2); expect((await db.query('select * from storage.objects')).rows).toHaveLength(0); await as('authenticated', admin); await db.exec(`update public.skills set category_id='${category}' where category_id='${hiddenCategory}'; delete from public.categories where id='${hiddenCategory}';`); await as('anon'); expect((await db.query('select * from public.skills')).rows).toHaveLength(2); });
});

async function rollbackTest(run: () => Promise<void>) {
  await as('authenticated', admin);
  await db.exec('begin');
  try { await run(); } finally { await db.exec('rollback'); }
}
describe('Ordre automatique des contenus', () => {
  it('conserve les positions antérieures à la migration', async () => {
    await as('authenticated', admin);
    const r = await db.query<{sort_order:number}>('select sort_order from public.categories where id=$1', [category]);
    expect(r.rows[0].sort_order).toBe(0);
  });
  it('ajoute les catégories après le maximum existant, même avec une ancienne valeur fournie', async () => rollbackTest(async () => {
    await db.query('update public.categories set sort_order=8 where id=$1', [category]);
    const r = await db.query<{sort_order:number}>("insert into public.categories(name,sort_order) values ('Test A',0), ('Test B',0) returning sort_order");
    expect(r.rows.map(x => x.sort_order)).toEqual([9,10]);
  }));
  it('calcule les positions indépendamment par catégorie et conserve les éditions', async () => rollbackTest(async () => {
    const groups = await db.query<{id:string}>("insert into public.categories(name) values ('Groupe A'),('Groupe B') returning id");
    const [a,b]=groups.rows.map(x => x.id);
    const r=await db.query<{id:string;sort_order:number}>('insert into public.skills(name,category_id) values ($1,$2),($3,$2),($4,$5) returning id,sort_order',['A',a,'B','C',b]);
    expect(r.rows.map(x=>x.sort_order)).toEqual([0,1,0]);
    await db.query('update public.skills set name=$1, category_id=$2, sort_order=7 where id=$3',['Nouveau nom',a,r.rows[0].id]);
    const appended=await db.query<{sort_order:number}>('insert into public.skills(name,category_id) values ($1,$2) returning sort_order',['D',a]);
    expect(appended.rows[0].sort_order).toBe(8);
    const moved=await db.query<{sort_order:number}>('update public.skills set category_id=$1 where id=$2 returning sort_order',[b,r.rows[0].id]);
    expect(moved.rows[0].sort_order).toBe(1);
  }));
  it('attribue automatiquement les positions des projets et services', async () => rollbackTest(async () => {
    const max=await db.query<{n:number}>('select coalesce(max(sort_order),-1) as n from public.projects');
    const r=await db.query<{sort_order:number}>("insert into public.projects(title,slug,summary,description,project_type) values ('Test','auto-test','Résumé','Description','personal') returning sort_order");
    expect(r.rows[0].sort_order).toBe(max.rows[0].n+1);
    const r2=await db.query<{sort_order:number}>("insert into public.services(title,summary,description) values ('Test A','Résumé','Description'),('Test B','Résumé','Description') returning sort_order");
    expect(r2.rows[1].sort_order).toBe(r2.rows[0].sort_order+1);
  }));
  it('calcule les images par projet et laisse modifier leur ordre ensuite', async () => rollbackTest(async () => {
    await db.query('update public.project_assets set sort_order=4 where project_id=$1',[publishedProject]);
    const r=await db.query<{id:string;sort_order:number}>('insert into public.project_assets(project_id,path,alt) values ($1,$2,$3),($4,$5,$6) returning id,sort_order',[publishedProject,'test-1.png','Image',draftProject,'test-2.png','Autre image']);
    expect(r.rows.map(x=>x.sort_order)).toEqual([5,1]);
    const update=await db.query<{sort_order:number}>('update public.project_assets set sort_order=2 where id=$1 returning sort_order',[r.rows[0].id]);
    expect(update.rows[0].sort_order).toBe(2);
  }));
});

describe('Publication des services', () => {
  it('masque les brouillons et retire les services dépubliés aux visiteurs', async () => rollbackTest(async () => {
    const created = await db.query<{id:string}>("insert into public.services(title,summary,description) values ('Test publication','Résumé','Description privée') returning id");
    const id=created.rows[0].id;
    await as('anon');expect((await db.query('select id from public.services where id=$1',[id])).rows).toHaveLength(0);
    await as('authenticated',admin);await db.query('update public.services set published=true where id=$1',[id]);
    await as('anon');expect((await db.query('select id from public.services where id=$1',[id])).rows).toHaveLength(1);
    await as('authenticated',admin);await db.query('update public.services set published=false where id=$1',[id]);
    await as('anon');expect((await db.query('select id from public.services where id=$1',[id])).rows).toHaveLength(0);
  }));
});
