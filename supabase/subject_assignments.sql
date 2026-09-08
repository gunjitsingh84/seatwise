-- SeatWise: subject assignments by section and roll number
-- Run this once in Supabase SQL Editor.

create table if not exists public.subject_assignments (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  class_number integer not null check (class_number between 1 and 12),
  section text not null,
  academic_session text not null,
  assignment_type text not null default 'ALL' check (assignment_type in ('ALL','SELECTED')),
  selected_roll_numbers jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subject_assignments_unique unique (subject_id, class_number, section, academic_session)
);

create index if not exists idx_subject_assignments_lookup
  on public.subject_assignments(class_number, section, academic_session);

alter table public.subject_assignments enable row level security;

drop policy if exists "subject assignments select" on public.subject_assignments;
drop policy if exists "subject assignments insert" on public.subject_assignments;
drop policy if exists "subject assignments update" on public.subject_assignments;
drop policy if exists "subject assignments delete" on public.subject_assignments;

create policy "subject assignments select"
  on public.subject_assignments for select to anon, authenticated using (true);

create policy "subject assignments insert"
  on public.subject_assignments for insert to anon, authenticated with check (true);

create policy "subject assignments update"
  on public.subject_assignments for update to anon, authenticated using (true) with check (true);

create policy "subject assignments delete"
  on public.subject_assignments for delete to anon, authenticated using (true);

-- Keep assignment_type consistent with selected_roll_numbers.
