-- Handlungsraum-Sandbox — Datenmodell der anonymen Auswertung
--
-- ANWENDUNG: Diesen Text vollstaendig in den SQL-Editor des Supabase-Dashboards
-- einfuegen und ausfuehren. Kein CLI, keine Migration, keine Installation.
--
-- Es werden ausschliesslich zwei Dinge gespeichert:
--   1. der Regeltext, den jemand freiwillig eingegeben hat,
--   2. eine Kennzahlzeile je Lauf.
-- Keine IP, kein User-Agent, keine Cookies, kein Fingerprint, keine Personendaten.
-- `session_hash` entsteht im Speicher des Browsers und stirbt beim Neuladen.

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------ Tabellen

create table if not exists public.constraint_submissions (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  text_de       text        not null,
  compiled_kind text,
  compiled_ok   boolean     not null default false,
  reject_reason text,
  session_hash  text,
  screen        text
);

create table if not exists public.run_events (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  session_hash     text,
  rules_count      int,
  violations_count int,
  enforcement      text,
  goal_reached     boolean,
  disturbances     text[]
);

comment on table public.constraint_submissions is
  'Freiwillig eingegebene Regeltexte. Aufbewahrung 24 Monate, danach Loeschung.';
comment on table public.run_events is
  'Kennzahlen je Lauf. Aufbewahrung 24 Monate, danach Loeschung.';

-- ---------------------------------------------------------------------- RLS
-- Der anon-Schluessel darf ausschliesslich einfuegen. Lesen, Aendern und
-- Loeschen bleiben ihm verwehrt — auch dann, wenn der Schluessel oeffentlich ist.

alter table public.constraint_submissions enable row level security;
alter table public.run_events            enable row level security;

drop policy if exists "anon darf einfuegen" on public.constraint_submissions;
create policy "anon darf einfuegen"
  on public.constraint_submissions
  for insert
  to anon
  with check (
    length(text_de) <= 400
    and (screen is null or length(screen) <= 32)
  );

drop policy if exists "anon darf einfuegen" on public.run_events;
create policy "anon darf einfuegen"
  on public.run_events
  for insert
  to anon
  with check (
    coalesce(rules_count, 0) between 0 and 100
    and coalesce(array_length(disturbances, 1), 0) <= 10
  );

-- Kein select, kein update, kein delete fuer anon. Auswertung nur ueber das
-- Dashboard oder den service_role-Schluessel, der den Browser nie erreicht.
revoke select, update, delete on public.constraint_submissions from anon;
revoke select, update, delete on public.run_events            from anon;

-- ------------------------------------------------------- Aufbewahrungsgrenze
-- 24 Monate, wie in DATENSCHUTZ.md zugesagt. Ohne Scheduler laesst sich die
-- Funktion im SQL-Editor jederzeit von Hand aufrufen: select public.aufraeumen();

create or replace function public.aufraeumen()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.constraint_submissions where created_at < now() - interval '24 months';
  delete from public.run_events            where created_at < now() - interval '24 months';
$$;
