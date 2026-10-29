begin;
-- One explicitly provisioned administrator. No self-registration or role escalation.
create table public.administrators (
  singleton boolean primary key default true check (singleton),
  user_id uuid not null unique references auth.users(id) on delete cascade
);
alter table public.administrators enable row level security;
revoke all on public.administrators from anon, authenticated;
create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.administrators where user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 100),
  published boolean not null default false,
  sort_order integer not null default 0 check (sort_order between 0 and 9999),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 100),
  category_id uuid not null references public.categories(id) on delete restrict,
  published boolean not null default false,
  sort_order integer not null default 0 check (sort_order between 0 and 9999),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) between 1 and 140),
  summary text not null check (length(trim(summary)) between 1 and 350),
  description text not null check (length(trim(description)) between 1 and 15000),
  published boolean not null default false,
  sort_order integer not null default 0 check (sort_order between 0 and 9999),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) between 1 and 140),
  slug text not null unique check (length(slug) <= 160 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  summary text not null check (length(trim(summary)) between 1 and 350),
  description text not null check (length(trim(description)) between 1 and 20000),
  project_type text not null check (project_type in ('personal','professional')),
  year integer check (year between 2000 and 2100),
  technologies text[] not null default '{}',
  demo_url text check (demo_url ~* '^https?://'),
  code_url text check (code_url ~* '^https?://'),
  published boolean not null default false,
  sort_order integer not null default 0 check (sort_order between 0 and 9999),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.project_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  path text not null unique,
  alt text not null check (length(trim(alt)) between 1 and 250),
  sort_order integer not null default 0 check (sort_order between 0 and 9999),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index skills_category_idx on public.skills(category_id);
create index project_assets_project_idx on public.project_assets(project_id);
create function public.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger categories_updated before update on public.categories for each row execute function public.touch_updated_at();
create trigger skills_updated before update on public.skills for each row execute function public.touch_updated_at();
create trigger services_updated before update on public.services for each row execute function public.touch_updated_at();
create trigger projects_updated before update on public.projects for each row execute function public.touch_updated_at();
create trigger assets_updated before update on public.project_assets for each row execute function public.touch_updated_at();

alter table public.categories enable row level security;
alter table public.skills enable row level security;
alter table public.services enable row level security;
alter table public.projects enable row level security;
alter table public.project_assets enable row level security;
create policy categories_read on public.categories for select to anon, authenticated using (published or public.is_admin());
create policy skills_read on public.skills for select to anon, authenticated using (public.is_admin() or (published and exists(select 1 from public.categories c where c.id = category_id and c.published)));
create policy services_read on public.services for select to anon, authenticated using (published or public.is_admin());
create policy projects_read on public.projects for select to anon, authenticated using (published or public.is_admin());
create policy assets_read on public.project_assets for select to anon, authenticated using (public.is_admin() or exists(select 1 from public.projects p where p.id = project_id and p.published));
create policy categories_admin on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy skills_admin on public.skills for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy services_admin on public.services for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy projects_admin on public.projects for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy assets_admin on public.project_assets for all to authenticated using (public.is_admin()) with check (public.is_admin());
revoke all on public.categories, public.skills, public.services, public.projects, public.project_assets from anon, authenticated;
grant select on public.categories, public.skills, public.services, public.projects, public.project_assets to anon;
grant select, insert, update, delete on public.categories, public.skills, public.services, public.projects, public.project_assets to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-media', 'project-media', false, 3145728, array['image/jpeg','image/png','image/webp','image/avif']);
create policy media_admin on storage.objects for all to authenticated
using (bucket_id = 'project-media' and public.is_admin())
with check (bucket_id = 'project-media' and public.is_admin());
create policy media_published_read on storage.objects for select to anon, authenticated
using (bucket_id = 'project-media' and exists (
  select 1 from public.project_assets a join public.projects p on p.id = a.project_id
  where a.path = name and p.published
));
commit;
