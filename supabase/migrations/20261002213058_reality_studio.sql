-- Additive Reality Architect storage; shared Starlight tenancy remains untouched.
create table public.ra_records (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  payload jsonb not null,
  constraint ra_record_size check (octet_length(payload::text) <= 18000),
  constraint ra_record_fields check (
    jsonb_typeof(payload) = 'object'
    and payload ?& array['kind','domain','statement','sourceUrl','method','uncertainty','nextTest']
    and jsonb_typeof(payload->'kind') = 'string'
    and jsonb_typeof(payload->'domain') = 'string'
    and payload->>'kind' in ('Observation','Hypothesis','Simulation','Decision','Outcome','Fiction')
    and payload->>'domain' in ('AI systems','Cities & infrastructure','Physics & energy','Chemistry & materials','Biology & ecology','Learning & companionship','Creative worlds')
    and jsonb_typeof(payload->'statement') = 'string'
    and char_length(btrim(payload->>'statement')) between 1 and 2000
    and jsonb_typeof(payload->'uncertainty') = 'string'
    and char_length(btrim(payload->>'uncertainty')) between 1 and 2000
    and jsonb_typeof(payload->'nextTest') = 'string'
    and char_length(btrim(payload->>'nextTest')) between 1 and 2000
    and jsonb_typeof(payload->'method') = 'string'
    and char_length(payload->>'method') <= 2000
    and (payload->>'kind' not in ('Observation','Simulation','Outcome') or char_length(btrim(payload->>'method')) > 0)
    and jsonb_typeof(payload->'sourceUrl') = 'string'
    and char_length(payload->>'sourceUrl') <= 2000
    and (payload->>'sourceUrl' = '' or payload->>'sourceUrl' ~ '^https?://[^/@[:space:]]+([/?#][^[:space:]]*)?$')
  )
);
create index ra_records_owner_created on public.ra_records(owner_id,created_at desc);
alter table public.ra_records enable row level security;
revoke all on public.ra_records from anon,authenticated;
grant select,insert,update,delete on public.ra_records to authenticated;
create policy ra_record_select on public.ra_records for select to authenticated using ((select auth.uid()) = owner_id);
create policy ra_record_insert on public.ra_records for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy ra_record_update on public.ra_records for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy ra_record_delete on public.ra_records for delete to authenticated using ((select auth.uid()) = owner_id);

create table public.ra_runs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  record_id uuid references public.ra_records(id) on delete set null,
  kind text not null check (kind in ('review','guardian')),
  model text not null,
  status text not null default 'reserved' check (status in ('reserved','succeeded','failed')),
  result jsonb,
  usage jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index ra_runs_owner_created on public.ra_runs(owner_id,created_at desc);
create index ra_runs_created on public.ra_runs(created_at);
create index ra_runs_record on public.ra_runs(record_id);
alter table public.ra_runs enable row level security;
revoke all on public.ra_runs from anon,authenticated;
grant select on public.ra_runs to authenticated;
create policy ra_run_select on public.ra_runs for select to authenticated using ((select auth.uid()) = owner_id);

create table public.ra_guardian_sessions (
  id text primary key check (char_length(id) between 8 and 160),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index ra_sessions_owner on public.ra_guardian_sessions(owner_id,created_at desc);
alter table public.ra_guardian_sessions enable row level security;
revoke all on public.ra_guardian_sessions from anon,authenticated;
grant select,insert on public.ra_guardian_sessions to authenticated;
create policy ra_session_select on public.ra_guardian_sessions for select to authenticated using ((select auth.uid()) = owner_id);
create policy ra_session_insert on public.ra_guardian_sessions for insert to authenticated with check ((select auth.uid()) = owner_id);

-- Narrow definer routines: no caller-supplied owner, fixed search path, no PUBLIC execute.
create function public.ra_limit_records() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or new.owner_id <> auth.uid() then raise exception 'Unauthorized record'; end if;
  perform pg_advisory_xact_lock(hashtextextended('ra/records/' || auth.uid()::text,0));
  if (select count(*) from public.ra_records where owner_id = auth.uid()) >= 200 then raise exception 'Record limit reached'; end if;
  return new;
end;
$$;
revoke all on function public.ra_limit_records() from public,anon,authenticated;
create trigger ra_limit_records before insert on public.ra_records for each row execute function public.ra_limit_records();

create function public.ra_reserve_run(p_kind text,p_record_id uuid,p_model text) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_start timestamptz := date_trunc('day',now() at time zone 'UTC') at time zone 'UTC';
begin
  if auth.uid() is null or not exists (select 1 from auth.users where id = auth.uid() and email_confirmed_at is not null and not is_anonymous) then raise exception 'Verified account required'; end if;
  if p_kind not in ('review','guardian') or p_model not in ('openai/gpt-6.1-sol','anthropic/claude-sonnet-5.5','openai/gpt-6-luna') then raise exception 'Unsupported run'; end if;
  if p_kind = 'review' and (p_record_id is null or not exists (select 1 from public.ra_records where id=p_record_id and owner_id=auth.uid())) then raise exception 'Record unavailable'; end if;
  if p_kind = 'guardian' and p_record_id is not null then raise exception 'Invalid guardian run'; end if;
  perform pg_advisory_xact_lock(hashtextextended('ra/global/' || v_start::text,0));
  if (select count(*) from public.ra_runs where created_at >= v_start) >= 50 then raise exception 'Platform daily limit reached'; end if;
  if (select count(*) from public.ra_runs where owner_id=auth.uid() and created_at >= v_start) >= 5 then raise exception 'User daily limit reached'; end if;
  if exists (select 1 from public.ra_runs where owner_id=auth.uid() and status='reserved' and created_at > now()-interval '2 minutes') then raise exception 'Run already in progress'; end if;
  insert into public.ra_runs(owner_id,record_id,kind,model) values(auth.uid(),p_record_id,p_kind,p_model) returning id into v_id;
  return v_id;
end;
$$;
revoke all on function public.ra_reserve_run(text,uuid,text) from public,anon;
grant execute on function public.ra_reserve_run(text,uuid,text) to authenticated;

create function public.ra_finish_run(p_id uuid,p_status text,p_result jsonb,p_usage jsonb) returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or p_status not in ('succeeded','failed') then raise exception 'Invalid completion'; end if;
  if coalesce(octet_length(p_result::text),0)>20000 or coalesce(octet_length(p_usage::text),0)>2000 then raise exception 'Receipt too large'; end if;
  update public.ra_runs set status=p_status,result=p_result,usage=p_usage,completed_at=now() where id=p_id and owner_id=auth.uid() and status='reserved';
  if not found then raise exception 'Run unavailable'; end if;
end;
$$;
revoke all on function public.ra_finish_run(uuid,text,jsonb,jsonb) from public,anon;
grant execute on function public.ra_finish_run(uuid,text,jsonb,jsonb) to authenticated;
comment on table public.ra_runs is 'Unreviewed user-owned run artifacts. Not a cryptographic proof of provider execution. Attempts, including failures, consume quota.';
;
