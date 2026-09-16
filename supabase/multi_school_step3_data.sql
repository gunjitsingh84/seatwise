-- SeatWise Multi-School Data Foundation - Step 3
-- Adds school ownership to the remaining school-scoped data tables.
--
-- IMPORTANT:
-- SeatWise currently uses a browser session in sessionStorage rather than
-- Supabase Auth/JWT. Therefore these policies remain permissive for now;
-- the application must always include school_id in its queries and writes.
-- This migration establishes the data model needed for that application scope.

-- ---------------------------------------------------------------------------
-- Rooms
-- ---------------------------------------------------------------------------
alter table public.rooms
  add column if not exists school_id uuid references public.schools(id) on delete restrict;

-- Legacy rooms can only be assigned automatically when the database has one school.
do $$
declare
  school_count integer;
  legacy_school uuid;
begin
  select count(*), min(id) into school_count, legacy_school from public.schools;
  if school_count = 1 then
    update public.rooms set school_id = legacy_school where school_id is null;
  elsif exists (select 1 from public.rooms where school_id is null) then
    raise exception 'SeatWise migration stopped: rooms contain legacy rows and more than one school exists. Assign room school_id values before rerunning this migration.';
  end if;
end $$;

alter table public.rooms drop constraint if exists rooms_room_number_key;
create unique index if not exists rooms_school_room_number_uidx
  on public.rooms(school_id, room_number);
create index if not exists rooms_school_idx on public.rooms(school_id);

-- ---------------------------------------------------------------------------
-- Subjects
-- ---------------------------------------------------------------------------
alter table public.subjects
  add column if not exists school_id uuid references public.schools(id) on delete restrict;

do $$
declare
  school_count integer;
  legacy_school uuid;
begin
  select count(*), min(id) into school_count, legacy_school from public.schools;
  if school_count = 1 then
    update public.subjects set school_id = legacy_school where school_id is null;
  elsif exists (select 1 from public.subjects where school_id is null) then
    raise exception 'SeatWise migration stopped: subjects contain legacy rows and more than one school exists. Assign subject school_id values before rerunning this migration.';
  end if;
end $$;

alter table public.subjects drop constraint if exists subjects_class_subject_session_unique;
create unique index if not exists subjects_school_class_subject_session_uidx
  on public.subjects(school_id, class_number, subject_name, academic_session);
create index if not exists subjects_school_class_session_idx
  on public.subjects(school_id, class_number, academic_session);

-- ---------------------------------------------------------------------------
-- Exam planners
-- ---------------------------------------------------------------------------
alter table public.exam_planners
  add column if not exists school_id uuid references public.schools(id) on delete restrict;

update public.exam_planners p
set school_id = a.school_id
from public.admin_users a
where p.school_id is null
  and p.created_by = a.id
  and a.school_id is not null;

alter table public.exam_planners
  alter column school_id set not null;
create index if not exists exam_planners_school_session_idx
  on public.exam_planners(school_id, academic_session);

-- ---------------------------------------------------------------------------
-- Exam plan items
-- ---------------------------------------------------------------------------
alter table public.exam_plan_items
  add column if not exists school_id uuid references public.schools(id) on delete restrict;

update public.exam_plan_items i
set school_id = p.school_id
from public.exam_planners p
where i.school_id is null
  and i.planner_id = p.id;

alter table public.exam_plan_items
  alter column school_id set not null;
create index if not exists exam_plan_items_school_date_idx
  on public.exam_plan_items(school_id, exam_date);

-- ---------------------------------------------------------------------------
-- Exams
-- ---------------------------------------------------------------------------
alter table public.exams
  add column if not exists school_id uuid references public.schools(id) on delete restrict;

update public.exams e
set school_id = p.school_id
from public.exam_planners p
where e.school_id is null
  and e.planner_id = p.id;

alter table public.exams
  alter column school_id set not null;
create index if not exists exams_school_date_idx
  on public.exams(school_id, exam_date);
create index if not exists exams_school_planner_idx
  on public.exams(school_id, planner_id);

-- ---------------------------------------------------------------------------
-- Seating plans
-- seating_plans already has school_id; backfill it from its exam owner.
-- ---------------------------------------------------------------------------
update public.seating_plans sp
set school_id = e.school_id
from public.exams e
where sp.school_id is null
  and sp.exam_id = e.id;

alter table public.seating_plans
  alter column school_id set not null;

-- ---------------------------------------------------------------------------
-- Subject assignments
-- ---------------------------------------------------------------------------
alter table public.subject_assignments
  add column if not exists school_id uuid references public.schools(id) on delete restrict;

update public.subject_assignments sa
set school_id = s.school_id
from public.subjects s
where sa.school_id is null
  and sa.subject_id = s.id;

alter table public.subject_assignments
  alter column school_id set not null;

alter table public.subject_assignments
  drop constraint if exists subject_assignments_unique;
create unique index if not exists subject_assignments_school_unique_idx
  on public.subject_assignments(school_id, subject_id, class_number, section, academic_session);
create index if not exists subject_assignments_school_lookup_idx
  on public.subject_assignments(school_id, class_number, section, academic_session);

-- ---------------------------------------------------------------------------
-- RLS remains intentionally permissive until SeatWise moves its session into
-- Supabase Auth/JWT. The application layer must use school_id consistently.
-- ---------------------------------------------------------------------------
