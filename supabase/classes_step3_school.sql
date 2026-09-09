-- SeatWise Multi-School — Step 3A: Classes & Sections
-- Adds school ownership to the existing classes table.
-- Run this AFTER the Step 2 signup migration and AFTER the development data reset.

begin;

-- Classes are now tenant-owned.
alter table public.classes
  add column if not exists school_id uuid references public.schools(id) on delete restrict;

-- This project was reset before starting multi-school data isolation.
-- Refuse to continue silently if old class records are present without a school.
do $$
begin
  if exists (select 1 from public.classes where school_id is null) then
    raise exception 'Classes table contains records without school_id. Stop and assign those records to a school before running Step 3A.';
  end if;
end $$;

-- school_id is mandatory for every class.
alter table public.classes
  alter column school_id set not null;

-- A class/section can be repeated by different schools, but not within
-- the same school and academic session.
create unique index if not exists classes_school_session_class_section_uidx
  on public.classes (school_id, academic_session, class_number, section);

create index if not exists classes_school_id_idx
  on public.classes (school_id);

-- Remove the old tenant-blind uniqueness rule if it exists.
alter table public.classes
  drop constraint if exists classes_class_section_unique;

commit;

-- Verification:
-- select id, school_id, class_number, section, student_count, academic_session
-- from public.classes
-- order by class_number, section;
