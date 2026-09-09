-- SeatWise Multi-School — Step 2
-- Phone-only login + school account creation foundation.
-- Run after multi_school_step1.sql.
--
-- This step removes PIN validation from the database while keeping the old
-- columns temporarily for backward compatibility. The application no longer
-- reads or writes PINs.

begin;

-- PIN is no longer part of authentication. Keep the column for now so
-- existing records/data are not destroyed during the migration.
drop constraint if exists admin_users_pin_check on public.admin_users;
drop constraint if exists admin_users_pin_6_digits on public.admin_users;

alter table public.admin_users
    alter column pin drop not null;

-- Ensure phone is unique for the phone-only login model.
create unique index if not exists idx_admin_users_phone_unique
    on public.admin_users(phone);

commit;

-- Verification:
-- select id, name, phone, school_id, pin from public.admin_users order by created_at;
-- select id, school_name, school_logo_url, is_active from public.schools order by created_at;
