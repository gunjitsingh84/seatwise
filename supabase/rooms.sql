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
