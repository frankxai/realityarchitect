begin;
select set_config('ra.test_a',gen_random_uuid()::text,true),set_config('ra.test_b',gen_random_uuid()::text,true);
insert into auth.users(id,email,email_confirmed_at,is_anonymous) values
(current_setting('ra.test_a')::uuid,'ra-fixture-a@example.invalid',now(),false),
(current_setting('ra.test_b')::uuid,'ra-fixture-b@example.invalid',now(),false);
set local role anon;
do $$ begin
  begin perform * from public.ra_records; raise exception 'Anonymous data exposed'; exception when insufficient_privilege then null; end;
  begin perform public.ra_reserve_run('guardian',null,'openai/gpt-6-luna'); raise exception 'Anonymous run allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
select set_config('request.jwt.claim.sub',current_setting('ra.test_a'),true);
set local role authenticated;
with r as (insert into public.ra_records(payload) values('{"kind":"Hypothesis","domain":"Cities & infrastructure","statement":"Shade may reduce heat exposure.","sourceUrl":"","method":"","uncertainty":"Weather.","nextTest":"Measure matched routes."}') returning id) select set_config('ra.test_record',id::text,true) from r;
select set_config('ra.test_run',public.ra_reserve_run('review',current_setting('ra.test_record')::uuid,'openai/gpt-6.1-sol')::text,true);
do $$ begin
  begin perform public.ra_reserve_run('guardian',null,'openai/gpt-6-luna'); raise exception 'Concurrent run allowed'; exception when raise_exception then if sqlerrm <> 'Run already in progress' then raise; end if; end;
  begin update public.ra_records set owner_id=current_setting('ra.test_b')::uuid; raise exception 'Ownership transfer allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
select set_config('request.jwt.claim.sub',current_setting('ra.test_b'),true);
set local role authenticated;
do $$ begin
  if exists(select 1 from public.ra_records where id=current_setting('ra.test_record')::uuid) then raise exception 'Foreign record exposed'; end if;
  if exists(select 1 from public.ra_runs where id=current_setting('ra.test_run')::uuid) then raise exception 'Foreign receipt exposed'; end if;
  begin perform public.ra_reserve_run('review',current_setting('ra.test_record')::uuid,'openai/gpt-6.1-sol'); raise exception 'Foreign review allowed'; exception when raise_exception then if sqlerrm <> 'Record unavailable' then raise; end if; end;
  begin perform public.ra_finish_run(current_setting('ra.test_run')::uuid,'succeeded','{}','{}'); raise exception 'Foreign completion allowed'; exception when raise_exception then if sqlerrm <> 'Run unavailable' then raise; end if; end;
end $$;
reset role;
select set_config('request.jwt.claim.sub',current_setting('ra.test_a'),true);
set local role authenticated;
select public.ra_finish_run(current_setting('ra.test_run')::uuid,'failed','{}','{}');
do $$ declare r uuid; begin
  for i in 1..4 loop r:=public.ra_reserve_run('guardian',null,'openai/gpt-6-luna'); perform public.ra_finish_run(r,'failed','{}','{}'); end loop;
  begin perform public.ra_reserve_run('guardian',null,'openai/gpt-6-luna'); raise exception 'Daily limit bypassed'; exception when raise_exception then if sqlerrm <> 'User daily limit reached' then raise; end if; end;
  begin delete from public.ra_runs; raise exception 'Quota history deletable'; exception when insufficient_privilege then null; end;
end $$;
reset role;
select 'PASS: anonymous denial, owner isolation, transfer denial, foreign review and completion denial, concurrent reservation denial, failed-attempt quota' as verification;
rollback;
