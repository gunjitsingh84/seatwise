-- SeatWise Authentication v2
-- Run once in Supabase SQL Editor.
-- Enforces unique 10-digit phone numbers and unique 6-digit PINs at database level.

alter table public.admin_users
  alter column phone type text using regexp_replace(coalesce(phone,''),'\D','','g');

alter table public.admin_users
  add constraint admin_users_phone_unique unique (phone);

alter table public.admin_users
  add constraint admin_users_pin_unique unique (pin);

alter table public.admin_users
  add constraint admin_users_phone_10_digits check (phone ~ '^[0-9]{10}$');

alter table public.admin_users
  add constraint admin_users_pin_6_digits check (pin ~ '^[0-9]{6}$');

update public.admin_users
set must_change_pin = coalesce(must_change_pin,false);

