-- SeatWise Exam Planner
-- Stores generated / manually adjusted exam plans.
create table if not exists public.exam_planners (
  id uuid primary key default gen_random_uuid(),
  planner_name text not null check (length(trim(planner_name)) between 1 and 150),
  academic_session text not null,
  start_date date not null,
  end_date date not null,
  study_leave_days smallint not null default 1 check (study_leave_days between 0 and 2),
  exclude_sundays boolean not null default true,
  exclude_saturdays boolean not null default false,
  status text not null default 'draft' check (status in ('draft','finalized')),
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exam_planners_date_check check (end_date >= start_date)
);

create table if not exists public.exam_plan_items (
  id uuid primary key default gen_random_uuid(),
  planner_id uuid not null references public.exam_planners(id) on delete cascade,
  class_number smallint not null check (class_number between 1 and 12),
  subject_id uuid references public.subjects(id) on delete set null,
  subject_name text not null,
  exam_date date not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists exam_plan_items_planner_date_idx on public.exam_plan_items(planner_id, exam_date);
create index if not exists exam_plan_items_class_idx on public.exam_plan_items(planner_id, class_number);

alter table public.exam_planners enable row level security;
alter table public.exam_plan_items enable row level security;

drop policy if exists "exam_planners_select" on public.exam_planners;
drop policy if exists "exam_planners_insert" on public.exam_planners;
drop policy if exists "exam_planners_update" on public.exam_planners;
drop policy if exists "exam_planners_delete" on public.exam_planners;
drop policy if exists "exam_plan_items_select" on public.exam_plan_items;
drop policy if exists "exam_plan_items_insert" on public.exam_plan_items;
drop policy if exists "exam_plan_items_update" on public.exam_plan_items;
drop policy if exists "exam_plan_items_delete" on public.exam_plan_items;

create policy "exam_planners_select" on public.exam_planners for select to anon, authenticated using (true);
create policy "exam_planners_insert" on public.exam_planners for insert to anon, authenticated with check (true);
create policy "exam_planners_update" on public.exam_planners for update to anon, authenticated using (true) with check (true);
create policy "exam_planners_delete" on public.exam_planners for delete to anon, authenticated using (true);

create policy "exam_plan_items_select" on public.exam_plan_items for select to anon, authenticated using (true);
create policy "exam_plan_items_insert" on public.exam_plan_items for insert to anon, authenticated with check (true);
create policy "exam_plan_items_update" on public.exam_plan_items for update to anon, authenticated using (true) with check (true);
create policy "exam_plan_items_delete" on public.exam_plan_items for delete to anon, authenticated using (true);
