-- SeatWise Subjects
-- One subject can exist in multiple classes, but not twice in the same class/session.
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  class_number smallint not null check (class_number between 1 and 12),
  subject_name text not null check (length(trim(subject_name)) between 1 and 100),
  academic_session text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subjects_class_subject_session_unique unique (class_number, subject_name, academic_session)
);

create index if not exists subjects_class_session_idx on public.subjects(class_number, academic_session);

alter table public.subjects enable row level security;

drop policy if exists "subjects_select" on public.subjects;
drop policy if exists "subjects_insert" on public.subjects;
drop policy if exists "subjects_update" on public.subjects;
drop policy if exists "subjects_delete" on public.subjects;

create policy "subjects_select" on public.subjects for select to anon, authenticated using (true);
create policy "subjects_insert" on public.subjects for insert to anon, authenticated with check (true);
create policy "subjects_update" on public.subjects for update to anon, authenticated using (true) with check (true);
create policy "subjects_delete" on public.subjects for delete to anon, authenticated using (true);
