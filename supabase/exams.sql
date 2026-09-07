-- SeatWise Exams
-- Finalized examination records created from Exam Planner.
create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  planner_id uuid not null references public.exam_planners(id) on delete cascade,
  class_number smallint not null check (class_number between 1 and 12),
  subject_id uuid references public.subjects(id) on delete set null,
  subject_name text not null,
  exam_date date not null,
  academic_session text not null,
  status text not null default 'scheduled' check (status in ('scheduled','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists exams_date_idx on public.exams(exam_date);
create index if not exists exams_planner_idx on public.exams(planner_id);
create index if not exists exams_class_idx on public.exams(academic_session,class_number);

alter table public.exams enable row level security;

drop policy if exists "exams_select" on public.exams;
drop policy if exists "exams_insert" on public.exams;
drop policy if exists "exams_update" on public.exams;
drop policy if exists "exams_delete" on public.exams;

create policy "exams_select" on public.exams for select to anon, authenticated using (true);
create policy "exams_insert" on public.exams for insert to anon, authenticated with check (true);
create policy "exams_update" on public.exams for update to anon, authenticated using (true) with check (true);
create policy "exams_delete" on public.exams for delete to anon, authenticated using (true);
