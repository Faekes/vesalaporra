-- Apertura/Clausura 2026/27. Match membership survives postponements.
create schema if not exists vp_competition;
revoke all on schema vp_competition from public, anon, authenticated;
create table vp_competition.phases (
 season_key text not null, phase text not null check(phase in ('apertura','clausura')),
 starts_at timestamptz, ends_at timestamptz, final_match_id uuid references public.vesalaporra_matches(id),
 closed_at timestamptz, standings jsonb, primary key(season_key,phase)
);
create table vp_competition.match_phases (
 match_id uuid primary key references public.vesalaporra_matches(id),
 season_key text not null, phase text not null,
 foreign key(season_key,phase) references vp_competition.phases(season_key,phase)
);
alter table vp_competition.phases enable row level security;
alter table vp_competition.match_phases enable row level security;
insert into vp_competition.phases(season_key,phase,starts_at,ends_at) values
 ('TEMPORADA_2026_27','apertura',null,'2027-01-11 00:00:00 Europe/Madrid'),
 ('TEMPORADA_2026_27','clausura','2027-01-17 00:00:00 Europe/Madrid',null);
create function vp_competition.assign_match() returns trigger language plpgsql security definer
set search_path = pg_catalog, public, vp_competition as $$
declare sk text; ph text;
begin
 select season_key into sk from public.vesalaporra_seasons where id=new.season_id;
 if sk <> 'TEMPORADA_2026_27' or new.scheduled_kickoff_at is null then return new; end if;
 ph := case when new.scheduled_kickoff_at < timestamptz '2027-01-11 00:00:00 Europe/Madrid' then 'apertura' else 'clausura' end;
 -- Never reassign a match when its kickoff is rescheduled.
 insert into vp_competition.match_phases values(new.id,sk,ph) on conflict do nothing;
 if lower(new.opponent_display_name) like '%osasuna%' and ph='apertura'
    and new.scheduled_kickoff_at >= timestamptz '2027-01-01 00:00:00 Europe/Madrid' then
   update vp_competition.phases set final_match_id=new.id where season_key=sk and phase='apertura' and closed_at is null;
 end if;
 return new;
end $$;
revoke all on function vp_competition.assign_match() from public,anon,authenticated;
create trigger vp_competition_assign_match after insert or update of scheduled_kickoff_at,season_id,opponent_display_name on public.vesalaporra_matches
for each row execute function vp_competition.assign_match();
insert into vp_competition.match_phases
select m.id,s.season_key,case when m.scheduled_kickoff_at < timestamptz '2027-01-11 00:00:00 Europe/Madrid' then 'apertura' else 'clausura' end
from public.vesalaporra_matches m join public.vesalaporra_seasons s on s.id=m.season_id
where s.season_key='TEMPORADA_2026_27' and m.scheduled_kickoff_at is not null;

update public.vesalaporra_achievement_definitions set title='Campió de l’Apertura 26/27',
 description='Guanya l’Apertura 2026/27, fins a l’Osasuna–Barça del 10 de gener inclòs.',updated_at=now()
where achievement_key='winter_champion_2026';
insert into public.vesalaporra_achievement_definitions
(achievement_key,title,description,icon_kind,icon_alt,season_key,display_order,is_permanent)
values('clausura_champion_2026_27','Campió del Clausura 26/27','Guanya el Clausura 2026/27, des del Barça–Elche del 17 de gener.','svg','Abellot cromat','TEMPORADA_2026_27',2,false);
update public.vesalaporra_achievement_definitions set display_order=3 where achievement_key='winner';
update public.vesalaporra_achievement_definitions set display_order=4 where achievement_key='preseason_champion_2026';
update public.vesalaporra_achievement_definitions set display_order=display_order+1 where achievement_key in ('nostradamus','flick-reader','yoyalodije','candidat','kamikaze','xop-xop-salinas');

create function public.vesalaporra_public_competition_state() returns jsonb language sql stable security definer
set search_path=pg_catalog,public,vp_competition as $$
select jsonb_build_object('season_key',s.season_key,'phase',case
 when s.season_key<>'TEMPORADA_2026_27' then null
 when exists(select 1 from vp_competition.phases p where p.season_key=s.season_key and p.phase='apertura' and p.closed_at is not null)
   or exists(select 1 from public.vesalaporra_match_flow_state f join vp_competition.match_phases mp on mp.match_id=f.selected_match_id where mp.phase='clausura')
   or now()>=timestamptz '2027-01-17 00:00:00 Europe/Madrid' then 'clausura' else 'apertura' end)
from public.vesalaporra_seasons s where s.status='active' order by s.updated_at desc,s.created_at desc,s.id limit 1;
$$;
revoke all on function public.vesalaporra_public_competition_state() from public;
grant execute on function public.vesalaporra_public_competition_state() to anon,authenticated,service_role;

-- Same public identity and award information as the existing ranking RPC.
-- Private worker can also read a completed phase while the next season is active.
create function vp_competition.ranking(p_season text,p_phase text,p_limit integer default 1000)
returns table(ranking_position bigint,user_id uuid,display_name text,avatar_url text,provider text,x_handle text,joined_year integer,result_points bigint,xi_points bigint,protagonist_points bigint,total_points bigint,achievement_keys text[],previous_position bigint,movement bigint)
language sql stable security definer set search_path=pg_catalog,public,vp_competition as $$
with matches as materialized (
 select m.id from public.vesalaporra_matches m join vp_competition.match_phases mp on mp.match_id=m.id
 where mp.season_key=p_season and mp.phase=p_phase
), totals as (
 select sc.user_id,sum(sc.result_points)::bigint result_points,sum(sc.xi_points)::bigint xi_points,
 sum(sc.protagonist_points)::bigint protagonist_points,sum(sc.total_points)::bigint total_points
 from public.vesalaporra_prediction_scores sc join matches m on m.id=sc.match_id
 join public.vesalaporra_match_results r on r.match_id=sc.match_id and r.version=sc.scoring_version
 where r.finalized_at is not null group by sc.user_id
), participants as (
 select p.user_id,count(distinct p.match_id) participation_count from public.vesalaporra_predictions p
 join matches m on m.id=p.match_id where p.confirmed_at is not null group by p.user_id
), medals as materialized (
 select a.* from public.vesalaporra_public_achievement_multipliers(
 coalesce((select array_agg(user_id) from participants),array[]::uuid[])) a
), medal_stats as (
 select user_id,sum(multiplier) medal_total,
 sum(multiplier) filter(where achievement_key like 'season_champion_%') champion,
 sum(multiplier) filter(where achievement_key in ('winter_champion_2026','clausura_champion_2026_27')) phase_champion,
 sum(multiplier) filter(where achievement_key='winner') winner,
 sum(multiplier) filter(where achievement_key='preseason_champion_2026') preseason,
 sum(multiplier) filter(where achievement_key='nostradamus') nostradamus,
 sum(multiplier) filter(where achievement_key='flick-reader') flick_reader,
 sum(multiplier) filter(where achievement_key='yoyalodije') yoyalodije,
 sum(multiplier) filter(where achievement_key='candidat') candidat,
 sum(multiplier) filter(where achievement_key='kamikaze') kamikaze,
 sum(multiplier) filter(where achievement_key='xop-xop-salinas') pop
 from medals group by user_id
), rows as (
 select p.id user_id,coalesce(nullif(trim(p.display_name),''),'Culer') display_name,p.avatar_url,
 coalesce(p.provider,'vesalaporra') provider,p.x_handle,extract(year from u.created_at)::integer joined_year,u.created_at,
 coalesce(t.result_points,0)::bigint result_points,coalesce(t.xi_points,0)::bigint xi_points,
 coalesce(t.protagonist_points,0)::bigint protagonist_points,coalesce(t.total_points,0)::bigint total_points,
 pa.participation_count,
 coalesce((select array_agg(a.achievement_key order by a.display_order,a.awarded_at) from public.vesalaporra_public_user_achievements(p.id) a),array[]::text[]) achievement_keys
 from participants pa join public.profiles p on p.id=pa.user_id join auth.users u on u.id=p.id
 left join totals t on t.user_id=p.id where not coalesce(p.ranking_excluded,false)
), ranked as (
 select row_number() over(order by r.total_points desc,coalesce(ms.medal_total,0) desc,
 coalesce(ms.champion,0) desc,coalesce(ms.phase_champion,0) desc,coalesce(ms.winner,0) desc,
 coalesce(ms.preseason,0) desc,coalesce(ms.nostradamus,0) desc,coalesce(ms.flick_reader,0) desc,
 coalesce(ms.yoyalodije,0) desc,coalesce(ms.candidat,0) desc,coalesce(ms.kamikaze,0) desc,coalesce(ms.pop,0) desc,
 r.result_points desc,r.xi_points desc,r.protagonist_points desc,r.participation_count desc,r.created_at,r.user_id) pos,r.*
 from rows r left join medal_stats ms on ms.user_id=r.user_id
)
select pos,user_id,display_name,avatar_url,provider,x_handle,joined_year,result_points,xi_points,protagonist_points,total_points,achievement_keys,null::bigint,null::bigint
from ranked order by pos limit greatest(1,least(coalesce(p_limit,1000),1000));
$$;
revoke all on function vp_competition.ranking(text,text,integer) from public,anon,authenticated;

create function public.vesalaporra_public_competition_archives() returns jsonb language sql stable security definer
set search_path=pg_catalog,vp_competition as $$
 select coalesce(jsonb_agg(jsonb_build_object('season_key',season_key,'phase',phase,'closed_at',closed_at,'standings',standings) order by closed_at desc),'[]'::jsonb)
 from vp_competition.phases where closed_at is not null;
$$;
revoke all on function public.vesalaporra_public_competition_archives() from public;
grant execute on function public.vesalaporra_public_competition_archives() to anon,authenticated,service_role;

-- Called hourly; no public mutation endpoint. Never closes incomplete scoring.
create function vp_competition.close_phases() returns void language plpgsql security definer
set search_path=pg_catalog,public,vp_competition as $$
declare ph record; snapshot jsonb; winner_id uuid; medal text;
begin
 for ph in select * from vp_competition.phases where closed_at is null for update loop
   -- Bind the explicitly agreed final Apertura fixture when added to the calendar.
   if ph.phase='apertura' and ph.final_match_id is null then
     select m.id into ph.final_match_id from public.vesalaporra_matches m join vp_competition.match_phases mp on mp.match_id=m.id
     where mp.season_key=ph.season_key and mp.phase='apertura' and lower(m.opponent_display_name) like '%osasuna%'
       and m.scheduled_kickoff_at >= timestamptz '2027-01-01 00:00:00 Europe/Madrid' order by m.scheduled_kickoff_at desc limit 1;
     update vp_competition.phases set final_match_id=ph.final_match_id where season_key=ph.season_key and phase=ph.phase;
   end if;
   if ph.phase='apertura' then
     if now()<timestamptz '2027-01-11 00:00:00 Europe/Madrid' or ph.final_match_id is null then continue; end if;
   else
     -- Season end must be explicitly set by the existing season administration.
     if not exists(select 1 from public.vesalaporra_seasons s where s.season_key=ph.season_key and s.ends_at is not null and s.ends_at<=now()) then continue; end if;
   end if;
   if not exists(select 1 from vp_competition.match_phases mp where mp.season_key=ph.season_key and mp.phase=ph.phase) then continue; end if;
   if exists(select 1 from vp_competition.match_phases mp join public.vesalaporra_matches m on m.id=mp.match_id
     left join public.vesalaporra_match_results r on r.match_id=m.id
     where mp.season_key=ph.season_key and mp.phase=ph.phase and
       (r.finalized_at is null or m.lifecycle_status<>'scored' or exists(
         select 1 from public.vesalaporra_predictions p where p.match_id=m.id and p.confirmed_at is not null and not exists(
          select 1 from public.vesalaporra_prediction_scores sc where sc.prediction_id=p.id and sc.scoring_version=r.version)))) then continue; end if;
   select coalesce(jsonb_agg(to_jsonb(r) order by r.ranking_position),'[]'::jsonb) into snapshot from vp_competition.ranking(ph.season_key,ph.phase,1000) r;
   winner_id := (snapshot->0->>'user_id')::uuid;
   if winner_id is null then continue; end if;
   update vp_competition.phases set closed_at=now(),standings=snapshot where season_key=ph.season_key and phase=ph.phase;
   medal := case ph.phase when 'apertura' then 'winter_champion_2026' else 'clausura_champion_2026_27' end;
   insert into public.vesalaporra_user_achievements(user_id,achievement_key,season_key,awarded_by,award_reason,source_type,source_reference,metadata)
   values(winner_id,medal,ph.season_key,winner_id,'Guanya la classificació definitiva del torneig '||ph.phase||'.','competition_final',ph.season_key||':'||ph.phase,jsonb_build_object('phase',ph.phase,'ranking_position',1,'total_points',snapshot->0->'total_points')) on conflict(user_id,achievement_key) do nothing;
 end loop;
end $$;
revoke all on function vp_competition.close_phases() from public,anon,authenticated;
-- Retire the old December cutoff; retain the old function for compatibility, safely as a private wrapper.
create or replace function public.vesalaporra_system_award_winter_champion_2026(p_audit_id text)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,vp_competition as $$
begin
 perform vp_competition.close_phases();
 return jsonb_build_object('status','COMPETITION_PHASES_CHECKED');
end $$;
revoke all on function public.vesalaporra_system_award_winter_champion_2026(text) from public,anon,authenticated;
grant execute on function public.vesalaporra_system_award_winter_champion_2026(text) to service_role;
select cron.unschedule(jobid) from cron.job where jobname='vesalaporra-winter-champion-2026';
select cron.schedule('vesalaporra-competition-phases','7 * * * *','select vp_competition.close_phases()');

CREATE OR REPLACE FUNCTION public.vesalaporra_public_full_ranking(p_scope text DEFAULT 'general'::text, p_match_id uuid DEFAULT NULL::uuid, p_limit integer DEFAULT 500)
 RETURNS TABLE(ranking_position bigint, user_id uuid, display_name text, avatar_url text, provider text, x_handle text, joined_year integer, result_points bigint, xi_points bigint, protagonist_points bigint, total_points bigint, achievement_keys text[], previous_position bigint, movement bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  with
  active_season as (
    select s.id
    from public.vesalaporra_seasons s
    where s.status = 'active'
    order by s.updated_at desc, s.created_at desc, s.id
    limit 1
  ),
  parameters as (
    select case
      when lower(trim(coalesce(p_scope, 'general'))) = 'jornada' then 'jornada'
      else 'general'
    end as scope
  ),
  selected_match as (
    select coalesce(
      p_match_id,
      (
        select r.match_id
        from public.vesalaporra_match_results r
        join public.vesalaporra_matches m on m.id = r.match_id
        join active_season s on s.id = m.season_id
        where r.finalized_at is not null
        order by r.finalized_at desc, r.match_id
        limit 1
      )
    ) as match_id
  ),
  latest_five_finalized as (
    select m.id as match_id
    from public.vesalaporra_matches m
    join active_season s on s.id = m.season_id
    join public.vesalaporra_match_results r on r.match_id = m.id
    where r.finalized_at is not null
    order by r.finalized_at desc, m.id desc
    limit 5
  ),
  finalized_count as (
    select count(*)::integer as amount from latest_five_finalized
  ),
  legacy_rows as (
    select *
    from public.vesalaporra_public_ranking_legacy_20260922(
      (select scope from parameters),
      (select match_id from selected_match),
      1000
    )
  ),
  eligible_rows as (
    select
      legacy_rows.*,
      coalesce(
        (
          select max(revisions.revised_at)
          from public.vesalaporra_prediction_revisions revisions
          join selected_match on selected_match.match_id = revisions.match_id
          where revisions.user_id = legacy_rows.user_id
        ),
        (
          select predictions.confirmed_at
          from public.vesalaporra_predictions predictions
          join selected_match on selected_match.match_id = predictions.match_id
          where predictions.user_id = legacy_rows.user_id
          limit 1
        )
      ) as selected_last_action_at,
      auth_users.created_at as registered_at,
      (
        select count(distinct predictions.match_id)::bigint
        from public.vesalaporra_predictions predictions
        join public.vesalaporra_matches matches on matches.id = predictions.match_id
        join active_season on active_season.id = matches.season_id
        where predictions.user_id = legacy_rows.user_id
      ) as participation_count,
      (
        select count(distinct winners.match_id)::bigint
        from public.vesalaporra_single_match_winners winners
        join public.vesalaporra_matches matches on matches.id = winners.match_id
        join active_season on active_season.id = matches.season_id
        join public.vesalaporra_match_results results
          on results.match_id = winners.match_id
         and results.version = winners.scoring_version
        where winners.user_id = legacy_rows.user_id
      ) as jornada_wins
    from legacy_rows
    join auth.users auth_users on auth_users.id = legacy_rows.user_id
    cross join parameters
    cross join selected_match
    cross join finalized_count
    where (
      parameters.scope = 'general'
      and exists (
        select 1
        from public.vesalaporra_predictions predictions
        join public.vesalaporra_matches matches on matches.id = predictions.match_id
        join active_season on active_season.id = matches.season_id
        where predictions.user_id = legacy_rows.user_id
      )
      and not (
        finalized_count.amount = 5
        and not exists (
          select 1
          from public.vesalaporra_predictions predictions
          join latest_five_finalized recent on recent.match_id = predictions.match_id
          where predictions.user_id = legacy_rows.user_id
        )
        and not exists (
          select 1
          from public.vesalaporra_predictions predictions
          join public.vesalaporra_matches matches on matches.id = predictions.match_id
          join active_season on active_season.id = matches.season_id
          where predictions.user_id = legacy_rows.user_id
            and not exists (
              select 1
              from public.vesalaporra_match_results results
              where results.match_id = matches.id
                and results.finalized_at is not null
            )
        )
      )
    ) or (
      parameters.scope = 'jornada'
      and exists (
        select 1
        from public.vesalaporra_predictions predictions
        where predictions.match_id = selected_match.match_id
          and predictions.user_id = legacy_rows.user_id
      )
    )
  ),
  multiplier_rows as materialized (
    select multiplier.*
    from public.vesalaporra_public_achievement_multipliers(
      coalesce((select array_agg(user_id) from eligible_rows), array[]::uuid[])
    ) as multiplier
  ),
  medal_stats as (
    select
      user_id,
      coalesce(sum(multiplier), 0)::bigint as medal_total,
      coalesce(sum(multiplier) filter (where achievement_key like 'season_champion_%'), 0)::bigint as season_champion,
      coalesce(sum(multiplier) filter (where achievement_key in ('winter_champion_2026', 'clausura_champion_2026_27')), 0)::bigint as winter_champion,
      coalesce(sum(multiplier) filter (where achievement_key = 'preseason_champion_2026'), 0)::bigint as preseason_champion,
      coalesce(sum(multiplier) filter (where achievement_key = 'winner'), 0)::bigint as winner,
      coalesce(sum(multiplier) filter (where achievement_key = 'nostradamus'), 0)::bigint as nostradamus,
      coalesce(sum(multiplier) filter (where achievement_key = 'flick-reader'), 0)::bigint as flick_reader,
      coalesce(sum(multiplier) filter (where achievement_key = 'yoyalodije'), 0)::bigint as yoyalodije,
      coalesce(sum(multiplier) filter (where achievement_key = 'candidat'), 0)::bigint as candidat,
      coalesce(sum(multiplier) filter (where achievement_key = 'kamikaze'), 0)::bigint as kamikaze,
      coalesce(sum(multiplier) filter (where achievement_key = 'xop-xop-salinas'), 0)::bigint as xop_xop_salinas
    from multiplier_rows
    group by user_id
  ),
  reranked as (
    select
      row_number() over (
        order by
          case when parameters.scope = 'general' then eligible_rows.total_points end desc,
          case when parameters.scope = 'general' then coalesce(medal_stats.medal_total, 0) end desc,
          case when parameters.scope = 'general' then coalesce(medal_stats.season_champion, 0) end desc,
          case when parameters.scope = 'general' then coalesce(medal_stats.winter_champion, 0) end desc,
          case when parameters.scope = 'general' then coalesce(medal_stats.winner, 0) end desc,
          case when parameters.scope = 'general' then coalesce(medal_stats.preseason_champion, 0) end desc,
          case when parameters.scope = 'general' then coalesce(medal_stats.nostradamus, 0) end desc,
          case when parameters.scope = 'general' then coalesce(medal_stats.flick_reader, 0) end desc,
          case when parameters.scope = 'general' then coalesce(medal_stats.yoyalodije, 0) end desc,
          case when parameters.scope = 'general' then coalesce(medal_stats.candidat, 0) end desc,
          case when parameters.scope = 'general' then coalesce(medal_stats.kamikaze, 0) end desc,
          case when parameters.scope = 'general' then coalesce(medal_stats.xop_xop_salinas, 0) end desc,
          case when parameters.scope = 'general' then eligible_rows.result_points end desc,
          case when parameters.scope = 'general' then eligible_rows.xi_points end desc,
          case when parameters.scope = 'general' then eligible_rows.protagonist_points end desc,
          case when parameters.scope = 'general' then eligible_rows.participation_count end desc,
          case when parameters.scope = 'general' then eligible_rows.registered_at end asc nulls last,
          case when parameters.scope = 'jornada' then eligible_rows.total_points end desc,
          case when parameters.scope = 'jornada' then eligible_rows.result_points end desc,
          case when parameters.scope = 'jornada' then eligible_rows.xi_points end desc,
          case when parameters.scope = 'jornada' then eligible_rows.protagonist_points end desc,
          case when parameters.scope = 'jornada' then eligible_rows.selected_last_action_at end asc nulls last,
          case when parameters.scope = 'jornada' then eligible_rows.registered_at end asc nulls last,
          eligible_rows.user_id
      ) as canonical_position,
      eligible_rows.*
    from eligible_rows
    left join medal_stats on medal_stats.user_id = eligible_rows.user_id
    cross join parameters
  )
  select
    reranked.canonical_position,
    reranked.user_id,
    reranked.display_name,
    reranked.avatar_url,
    reranked.provider,
    reranked.x_handle,
    reranked.joined_year,
    reranked.result_points,
    reranked.xi_points,
    reranked.protagonist_points,
    reranked.total_points,
    reranked.achievement_keys,
    case when parameters.scope = 'general' then reranked.previous_position else null end,
    case
      when parameters.scope = 'general' and reranked.previous_position is not null
        then reranked.previous_position - reranked.canonical_position
      else null
    end
  from reranked
  cross join parameters
  order by reranked.canonical_position
  limit greatest(1, least(coalesce(p_limit, 500), 1000));
$function$;


revoke all on function public.vesalaporra_public_full_ranking(text,uuid,integer) from public,anon,authenticated;
create or replace function public.vesalaporra_public_ranking(p_scope text default 'general',p_match_id uuid default null,p_limit integer default 500)
returns table(ranking_position bigint,user_id uuid,display_name text,avatar_url text,provider text,x_handle text,joined_year integer,result_points bigint,xi_points bigint,protagonist_points bigint,total_points bigint,achievement_keys text[],previous_position bigint,movement bigint)
language plpgsql stable security definer set search_path=pg_catalog,public,vp_competition as $$
declare sk text; ph text; saved jsonb;
begin
 if p_scope in ('phase','apertura','clausura') then
   select st->>'season_key',case when p_scope='phase' then st->>'phase' else p_scope end into sk,ph from (select public.vesalaporra_public_competition_state() st)x;
   select standings into saved from vp_competition.phases where season_key=sk and phase=ph and closed_at is not null;
   if saved is not null then
     return query select r.* from jsonb_to_recordset(saved) as r(ranking_position bigint,user_id uuid,display_name text,avatar_url text,provider text,x_handle text,joined_year integer,result_points bigint,xi_points bigint,protagonist_points bigint,total_points bigint,achievement_keys text[],previous_position bigint,movement bigint) order by r.ranking_position limit greatest(1,least(coalesce(p_limit,500),1000));
   else
     return query
     select row_number() over(order by r.ranking_position),r.user_id,r.display_name,r.avatar_url,r.provider,r.x_handle,r.joined_year,
       r.result_points,r.xi_points,r.protagonist_points,r.total_points,r.achievement_keys,r.previous_position,r.movement
     from vp_competition.ranking(sk,ph,1000) r
     where exists(select 1 from public.vesalaporra_public_full_ranking('general',null,1000) g where g.user_id=r.user_id)
     order by r.ranking_position limit greatest(1,least(coalesce(p_limit,500),1000));
   end if;
 else
   return query select * from public.vesalaporra_public_full_ranking(p_scope,p_match_id,p_limit);
 end if;
end $$;
revoke all on function public.vesalaporra_public_ranking(text,uuid,integer) from public;
grant execute on function public.vesalaporra_public_ranking(text,uuid,integer) to anon,authenticated,service_role;
