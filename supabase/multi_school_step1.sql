-- SeatWise Multi-School Foundation — Step 1
-- Run this migration in the Supabase SQL Editor before changing the application UI.
--
-- Goal:
-- 1. Create one school/tenant record for each school.
-- 2. Link every administrator to exactly one school.
-- 3. Keep existing admin accounts usable by assigning them to a legacy school.
--
-- IMPORTANT:
-- This step intentionally does NOT change login behavior or RLS policies yet.
-- Those will be handled in the next steps after the schema is confirmed.

begin;

-- ============================================================
-- 1. Schools / tenants
-- ============================================================
create table if not exists public.schools (
    id uuid primary key default gen_random_uuid(),
    school_name text not null,
    school_logo_url text,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_schools_active
    on public.schools(is_active);

-- Keep updated_at current.
create or replace function public.set_schools_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists schools_set_updated_at on public.schools;

create trigger schools_set_updated_at
before update on public.schools
for each row
execute function public.set_schools_updated_at();

-- ============================================================
-- 2. Add school_id to administrators
-- ============================================================
alter table public.admin_users
    add column if not exists school_id uuid references public.schools(id) on delete restrict;

create index if not exists idx_admin_users_school_id
    on public.admin_users(school_id);

-- ============================================================
-- 3. Preserve existing data
-- ============================================================
-- Existing SeatWise installations have administrators without a school.
-- Put those records into one temporary legacy school so no existing account
-- is left orphaned when school_id becomes mandatory.
insert into public.schools (school_name)
select 'Legacy School'
where not exists (
    select 1
    from public.schools
    where school_name = 'Legacy School'
);

update public.admin_users
set school_id = (
    select id
    from public.schools
    where school_name = 'Legacy School'
    order by created_at
    limit 1
)
where school_id is null;

-- After the backfill, every administrator must belong to a school.
alter table public.admin_users
    alter column school_id set not null;

commit;

-- ============================================================
-- Verification queries
-- ============================================================
-- Run these separately if you want to verify the migration:
--
-- select id, school_name, is_active from public.schools order by created_at;
--
-- select id, name, phone, school_id
-- from public.admin_users
-- order by created_at;
