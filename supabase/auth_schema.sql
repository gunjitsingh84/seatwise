-- SeatWise authentication and activity tracking
-- Run this in the Supabase SQL Editor.

create table if not exists public.admin_users (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    phone text not null unique,
    pin text not null check (pin ~ '^[0-9]{4}$'),
    must_change_pin boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.admin_users(id) on delete set null,
    action text not null,
    details jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

create index if not exists idx_activity_logs_user_id
    on public.activity_logs(user_id);

create index if not exists idx_activity_logs_created_at
    on public.activity_logs(created_at desc);

create or replace function public.set_admin_users_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists admin_users_set_updated_at on public.admin_users;

create trigger admin_users_set_updated_at
before update on public.admin_users
for each row
execute function public.set_admin_users_updated_at();

-- Development/prototype policies.
-- Replace these with authenticated-user policies when Supabase Auth is introduced.
alter table public.admin_users enable row level security;
alter table public.activity_logs enable row level security;

drop policy if exists "Allow public signup" on public.admin_users;
create policy "Allow public signup"
on public.admin_users
for insert
to anon
with check (true);

drop policy if exists "Allow public login lookup" on public.admin_users;
create policy "Allow public login lookup"
on public.admin_users
for select
to anon
using (true);

drop policy if exists "Allow public pin update" on public.admin_users;
create policy "Allow public pin update"
on public.admin_users
for update
to anon
using (true)
with check (true);

drop policy if exists "Allow activity logging" on public.activity_logs;
create policy "Allow activity logging"
on public.activity_logs
for insert
to anon
with check (true);

-- No public delete/update policies are created for activity logs so the audit trail cannot
-- be casually modified through the browser client.
