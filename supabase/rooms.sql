create table if not exists public.rooms (
    id uuid primary key default gen_random_uuid(),
    room_number text not null unique,
    room_name text,
    floor_number smallint not null check (floor_number between 0 and 9),
    bench_count integer not null check (bench_count > 0),
    av_available boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create or replace function public.set_rooms_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists rooms_updated_at on public.rooms;
create trigger rooms_updated_at
before update on public.rooms
for each row execute function public.set_rooms_updated_at();

alter table public.rooms enable row level security;

-- SeatWise currently uses its own PIN-based admin session rather than
-- Supabase Auth, so browser requests use the anon role. These policies
-- allow the Rooms CRUD UI to work with that architecture.
drop policy if exists "rooms_select" on public.rooms;
drop policy if exists "rooms_insert" on public.rooms;
drop policy if exists "rooms_update" on public.rooms;
drop policy if exists "rooms_delete" on public.rooms;

drop policy if exists "Allow public read access to rooms" on public.rooms;
drop policy if exists "Allow public insert access to rooms" on public.rooms;
drop policy if exists "Allow public update access to rooms" on public.rooms;
drop policy if exists "Allow public delete access to rooms" on public.rooms;

create policy "rooms_select"
on public.rooms
for select
to anon, authenticated
using (true);

create policy "rooms_insert"
on public.rooms
for insert
to anon, authenticated
with check (true);

create policy "rooms_update"
on public.rooms
for update
to anon, authenticated
using (true)
with check (true);

create policy "rooms_delete"
on public.rooms
for delete
to anon, authenticated
using (true);
