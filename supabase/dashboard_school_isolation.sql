-- SeatWise Dashboard — school isolation for exams, planners and seating plans
-- Run this once in Supabase SQL Editor.

begin;

alter table public.exam_planners
  add column if not exists school_id uuid references public.schools(id) on delete restrict;

update public.exam_planners p
set school_id = a.school_id
from public.admin_users a
where p.school_id is null
  and p.created_by = a.id;

create index if not exists exam_planners_school_session_idx
  on public.exam_planners(school_id, academic_session);

alter table public.exams
  add column if not exists school_id uuid references public.schools(id) on delete restrict;

update public.exams e
set school_id = p.school_id
from public.exam_planners p
where e.school_id is null
  and e.planner_id = p.id;

create index if not exists exams_school_session_date_idx
  on public.exams(school_id, academic_session, exam_date);

alter table public.seating_plans
  add column if not exists school_id uuid references public.schools(id) on delete restrict;

update public.seating_plans sp
set school_id = e.school_id
from public.exams e
where sp.exam_id = e.id
  and sp.school_id is null;

create index if not exists seating_plans_school_idx
  on public.seating_plans(school_id);

create unique index if not exists seating_plans_exam_uidx
  on public.seating_plans(exam_id);

commit;

-- Verify before using the dashboard:
-- select school_id, count(*) from public.exam_planners group by school_id;
-- select school_id, count(*) from public.exams group by school_id;
-- select school_id, count(*) from public.seating_plans group by school_id;
-- Any NULL school_id needs to be assigned before that record is used.
