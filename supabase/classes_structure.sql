-- SeatWise: Classes & Sections
-- Run this in Supabase SQL Editor.
-- This script is intended for a fresh/empty classes table.

DROP TABLE IF EXISTS public.classes;

CREATE TABLE public.classes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    class_number integer NOT NULL CHECK (class_number BETWEEN 1 AND 12),
    section text NOT NULL CHECK (section ~ '^[A-L]$'),
    student_count integer NOT NULL DEFAULT 0 CHECK (student_count >= 0),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT classes_class_section_unique UNIQUE (class_number, section)
);

CREATE OR REPLACE FUNCTION public.set_classes_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER classes_set_updated_at
BEFORE UPDATE ON public.classes
FOR EACH ROW
EXECUTE FUNCTION public.set_classes_updated_at();

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Prototype policies. Replace with authenticated-admin policies before production.
CREATE POLICY "Allow public read classes"
ON public.classes FOR SELECT TO anon USING (true);

CREATE POLICY "Allow public insert classes"
ON public.classes FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow public update classes"
ON public.classes FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete classes"
ON public.classes FOR DELETE TO anon USING (true);
