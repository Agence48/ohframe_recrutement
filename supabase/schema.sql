-- Tables
create table if not exists jobs (
  id bigserial primary key,
  title text not null,
  level text not null,
  slug text unique not null,
  link text not null,
  jd text,
  test_json jsonb,
  created_at timestamptz default now()
);

create table if not exists candidates (
  id bigserial primary key,
  job_id bigint references jobs(id) on delete cascade,
  name text,
  email text,
  score int,
  status text,
  video_url text,
  answers_json jsonb,
  created_at timestamptz default now()
);

-- Helper view for counting candidates per job
create view if not exists candidates_count as
select job_id, count(*)::int as count from candidates group by job_id;

-- RLS (example policies; adapt by org ownership later)
alter table jobs enable row level security;
alter table candidates enable row level security;

create policy "jobs read all for MVP" on jobs for select using (true);
create policy "candidates read all for MVP" on candidates for select using (true);
create policy "jobs insert" on jobs for insert with check (true);
create policy "candidates insert" on candidates for insert with check (true);
