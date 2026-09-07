-- SeatWise Academic Session Support
-- Academic year runs from 1 April through 31 March.

create or replace function public.get_current_academic_session()
returns text
language sql
stable
as $$
    select case
        when extract(month from current_date) >= 4 then
            extract(year from current_date)::int::text || '-' || (extract(year from current_date)::int + 1)::text
        else
            (extract(year from current_date)::int - 1)::text || '-' || extract(year from current_date)::int::text
    end;
$$;

create or replace function public.get_academic_session_start_date()
returns date
language sql
stable
as $$
    select case
        when extract(month from current_date) >= 4
            then make_date(extract(year from current_date)::int, 4, 1)
        else
            make_date(extract(year from current_date)::int - 1, 4, 1)
    end;
$$;

create or replace function public.get_academic_session_end_date()
returns date
language sql
stable
as $$
    select (public.get_academic_session_start_date() + interval '1 year - 1 day')::date;
$$;

create table if not exists public.academic_sessions (
    session_name text primary key,
    start_date date not null,
    end_date date not null,
    created_at timestamptz not null default now(),
    constraint academic_sessions_date_check check (end_date >= start_date)
);

-- Store the current session immediately when the application loads.
insert into public.academic_sessions (session_name, start_date, end_date)
values (
    public.get_current_academic_session(),
    public.get_academic_session_start_date(),
    public.get_academic_session_end_date()
)
on conflict (session_name) do update set
    start_date = excluded.start_date,
    end_date = excluded.end_date;

-- Keep the class structure associated with the academic session in which it is created/updated.
alter table public.classes
    add column if not exists academic_session text;

update public.classes
set academic_session = public.get_current_academic_session()
where academic_session is null;

alter table public.classes
    alter column academic_session set default public.get_current_academic_session();

create or replace function public.set_current_academic_session_on_class()
returns trigger
language plpgsql
as $$
begin
    new.academic_session := public.get_current_academic_session();
    return new;
end;
$$;

drop trigger if exists set_current_academic_session_on_class on public.classes;

create trigger set_current_academic_session_on_class
before insert or update on public.classes
for each row
execute function public.set_current_academic_session_on_class();

-- Preserve one section per class per academic session.
create unique index if not exists classes_session_class_section_uidx
on public.classes (academic_session, class_number, section);

-- Allow the browser-based SeatWise prototype to use the session table.
grant select, insert, update on public.academic_sessions to anon, authenticated;
grant select, insert, update on public.academic_sessions to service_role;

-- Expose the session helper functions to the browser client.
grant execute on function public.get_current_academic_session() to anon, authenticated;
grant execute on function public.get_academic_session_start_date() to anon, authenticated;
grant execute on function public.get_academic_session_end_date() to anon, authenticated;
