begin;
-- Keep existing positions; assign a new position only on insertion or group change.
-- Locks serialize simultaneous appends to the same list, including empty lists.
create function public.assign_content_order() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare
  list_scope text := '';
  next_position integer;
begin
  if tg_table_name = 'skills' then
    if tg_op = 'UPDATE' and new.category_id = old.category_id then return new; end if;
    list_scope := new.category_id::text;
  elsif tg_table_name = 'project_assets' then
    if tg_op = 'UPDATE' and new.project_id = old.project_id then return new; end if;
    list_scope := new.project_id::text;
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(tg_table_schema || '.' || tg_table_name || ':' || list_scope, 0));
  if tg_table_name = 'skills' then
    select coalesce(max(sort_order), -1) + 1 into next_position from public.skills where category_id = new.category_id;
  elsif tg_table_name = 'project_assets' then
    select coalesce(max(sort_order), -1) + 1 into next_position from public.project_assets where project_id = new.project_id;
  else
    execute pg_catalog.format('select coalesce(max(sort_order), -1) + 1 from %I.%I', tg_table_schema, tg_table_name) into next_position;
  end if;
  if next_position > 9999 then
    raise exception 'La liste a atteint sa capacité. Réorganisez les positions avant un nouvel ajout.' using errcode = '22003';
  end if;
  new.sort_order := next_position;
  return new;
end;
$$;
revoke all on function public.assign_content_order() from public, anon, authenticated;
create trigger categories_assign_order before insert on public.categories for each row execute function public.assign_content_order();
create trigger services_assign_order before insert on public.services for each row execute function public.assign_content_order();
create trigger projects_assign_order before insert on public.projects for each row execute function public.assign_content_order();
create trigger skills_assign_order before insert or update of category_id on public.skills for each row execute function public.assign_content_order();
create trigger assets_assign_order before insert or update of project_id on public.project_assets for each row execute function public.assign_content_order();
commit;
