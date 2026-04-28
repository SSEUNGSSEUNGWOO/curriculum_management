-- =====================================================
-- 초기 스키마: cohorts, organizations, students
-- =====================================================
-- 보안 주의: 현재는 "틀" 단계로 RLS는 켜되 anon/authenticated 모두 허용한다.
-- Supabase Auth 도입 시 운영자 화이트리스트 기반으로 좁힐 것.
-- 관련 메모: project_security_priority.md, feedback_security_phasing.md

-- =====================================================
-- 1) Tables
-- =====================================================

create table public.cohorts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  started_at date,
  ended_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.cohorts is '교육 기수 (예: 25-1기, 25-2기)';

create unique index cohorts_name_unique_idx on public.cohorts (name);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.organizations is '교육생 소속 기관';

create unique index organizations_name_unique_idx on public.organizations (name);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete restrict,
  organization_id uuid references public.organizations(id) on delete set null,

  -- 기본 정보
  name text not null,
  email text,
  phone text,

  -- 직무
  department text,
  job_title text,
  job_role text,

  -- 부가
  birth_date date,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.students is '교육생 마스터 데이터';

create index students_cohort_idx on public.students (cohort_id);
create index students_organization_idx on public.students (organization_id);

-- =====================================================
-- 2) updated_at 자동 갱신 트리거
-- =====================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger cohorts_set_updated_at
  before update on public.cohorts
  for each row execute function public.set_updated_at();

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

create trigger students_set_updated_at
  before update on public.students
  for each row execute function public.set_updated_at();

-- =====================================================
-- 3) RLS
-- =====================================================

alter table public.cohorts enable row level security;
alter table public.organizations enable row level security;
alter table public.students enable row level security;

-- 개발 단계 임시 정책: anon/authenticated 모두 허용.
-- TODO(보안 강화): Supabase Auth 도입 후 운영자 화이트리스트로 좁힐 것.
-- 그 시점에 이 3개 정책은 drop하고 역할 기반 정책으로 교체.

create policy cohorts_dev_open_all
  on public.cohorts for all
  using (true) with check (true);

create policy organizations_dev_open_all
  on public.organizations for all
  using (true) with check (true);

create policy students_dev_open_all
  on public.students for all
  using (true) with check (true);
