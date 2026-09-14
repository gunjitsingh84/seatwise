-- SeatWise Seating Plans
-- One seating plan belongs to one finalized exam.
create table if not exists public.seating_plans (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null unique references public.exams(id) on delete cascade,
  school_id uuid references public.schools(id) on delete restrict,
  academic_session text not null,
  status text not null default 'draft' check (status in ('draft','finalized')),
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists seating_plans_school_session_idx
  on public.seating_plans(school_id, academic_session);
create index if not exists seating_plans_exam_idx
  on public.seating_plans(exam_id);

alter table public.seating_plans enable row level security;

drop policy if exists "seating_plans_select" on public.seating_plans;
drop policy if exists "seating_plans_insert" on public.seating_plans;
drop policy if exists "seating_plans_update" on public.seating_plans;
drop policy if exists "seating_plans_delete" on public.seating_plans;

create policy "seating_plans_select" on public.seating_plans
  for select to anon, authenticated using (true);
create policy "seating_plans_insert" on public.seating_plans
  for insert to anon, authenticated with check (true);
create policy "seating_plans_update" on public.seating_plans
  for update to anon, authenticated using (true) with check (true);
create policy "seating_plans_delete" on public.seating_plans
  for delete to anon, authenticated using (true);
