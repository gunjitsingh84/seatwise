-- SeatWise school-aware phone login
-- Run once in the Supabase SQL Editor.
-- This keeps the current phone-number login while allowing the browser
-- to retrieve the matched admin + school record without direct school SELECT.

create or replace function public.login_admin_by_phone(p_phone text)
returns table (
    id uuid,
    name text,
    phone text,
    school_id uuid,
    school_name text,
    school_logo_url text,
    is_active boolean
)
language sql
security definer
set search_path = public, pg_temp
stable
as $$
    select
        au.id,
        au.name,
        au.phone,
        au.school_id,
        s.school_name,
        s.school_logo_url,
        s.is_active
    from public.admin_users au
    left join public.schools s
        on s.id = au.school_id
    where au.phone = regexp_replace(coalesce(p_phone, ''), '\\D', '', 'g')
    limit 1;
$$;

revoke all on function public.login_admin_by_phone(text) from public;
grant execute on function public.login_admin_by_phone(text) to anon, authenticated;
