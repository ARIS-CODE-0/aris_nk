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
