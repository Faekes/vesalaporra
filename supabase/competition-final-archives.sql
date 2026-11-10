-- Freeze the complete final ranking, including point breakdowns, identities,
-- medal counts and the newly awarded championship medal before the phase reset.
-- Existing closed archives are immutable and are never rebuilt from live data.
CREATE OR REPLACE FUNCTION vp_competition.ranking(p_season text, p_phase text, p_limit integer DEFAULT 1000)
 RETURNS TABLE(ranking_position bigint, user_id uuid, display_name text, avatar_url text, provider text, x_handle text, joined_year integer, result_points bigint, xi_points bigint, protagonist_points bigint, total_points bigint, achievement_keys text[], previous_position bigint, movement bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public', 'vp_competition'
AS $function$
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
 select a.* from vp_competition.phase_medals(
 coalesce((select array_agg(user_id) from participants),array[]::uuid[]),p_season,p_phase) a
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
 coalesce((select array_agg(a.achievement_key order by d.display_order) from medals a join public.vesalaporra_achievement_definitions d on d.achievement_key=a.achievement_key where a.user_id=p.id),array[]::text[]) achievement_keys
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
from ranked order by pos limit greatest(1,coalesce(p_limit,1000));
$function$
;

CREATE OR REPLACE FUNCTION vp_competition.snapshot_standings(p_season text, p_phase text)
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER
SET search_path=pg_catalog,public,vp_competition AS $function$
 WITH ranked AS MATERIALIZED (
   SELECT * FROM vp_competition.ranking(p_season,p_phase,2147483647)
 ), earned AS MATERIALIZED (
   SELECT * FROM vp_competition.phase_medals(
     coalesce((SELECT array_agg(user_id) FROM ranked),ARRAY[]::uuid[]),p_season,p_phase)
 ), champion AS (
   SELECT user_id,CASE p_phase WHEN 'apertura' THEN 'winter_champion_2026'
     ELSE 'clausura_champion_2026_27' END AS achievement_key
   FROM ranked WHERE ranking_position=1
 ), awards AS (
   SELECT user_id,achievement_key,multiplier,qualifying_count,threshold_count FROM earned
   UNION ALL
   SELECT c.user_id,c.achievement_key,1::bigint,1::bigint,1 FROM champion c
   WHERE NOT EXISTS (SELECT 1 FROM earned e WHERE e.user_id=c.user_id AND e.achievement_key=c.achievement_key)
 ), medal_lists AS (
   SELECT a.user_id,
     array_agg(a.achievement_key ORDER BY d.display_order,a.achievement_key) AS achievement_keys,
     jsonb_object_agg(a.achievement_key,a.multiplier) AS achievement_multipliers,
     jsonb_agg(jsonb_build_object('id',a.achievement_key,'title',d.title,
       'multiplier',a.multiplier,'qualifying_count',a.qualifying_count,
       'threshold_count',a.threshold_count) ORDER BY d.display_order,a.achievement_key) AS achievements
   FROM awards a JOIN public.vesalaporra_achievement_definitions d ON d.achievement_key=a.achievement_key
   GROUP BY a.user_id
 )
 SELECT coalesce(jsonb_agg(to_jsonb(r)||jsonb_build_object(
   'achievement_keys',coalesce(to_jsonb(m.achievement_keys),'[]'::jsonb),
   'achievement_multipliers',coalesce(m.achievement_multipliers,'{}'::jsonb),
   'achievements',coalesce(m.achievements,'[]'::jsonb))
   ORDER BY r.ranking_position),'[]'::jsonb)
 FROM ranked r LEFT JOIN medal_lists m ON m.user_id=r.user_id;
$function$;

CREATE OR REPLACE FUNCTION vp_competition.close_phases()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public', 'vp_competition'
AS $function$
declare ph record; snapshot jsonb; winner_id uuid; medal text;
begin
 for ph in select * from vp_competition.phases where closed_at is null for update loop
   -- Bind the explicitly agreed final Apertura fixture when added to the calendar.
   if ph.phase='apertura' and ph.final_match_id is null then
     select m.id into ph.final_match_id from public.vesalaporra_matches m join vp_competition.match_phases mp on mp.match_id=m.id
     where mp.season_key=ph.season_key and mp.phase='apertura' and m.barcelona_first and (m.opponent_team_key='real-sociedad' or lower(m.opponent_display_name) like '%sociedad%')
       and m.scheduled_kickoff_at >= timestamptz '2026-11-01 00:00:00 Europe/Madrid' and m.scheduled_kickoff_at < timestamptz '2027-01-01 00:00:00 Europe/Madrid' order by m.scheduled_kickoff_at desc limit 1;
     update vp_competition.phases set final_match_id=ph.final_match_id where season_key=ph.season_key and phase=ph.phase;
   end if;
   if ph.phase='apertura' then
     if ph.final_match_id is null or not exists(select 1 from public.vesalaporra_match_results r where r.match_id=ph.final_match_id and r.finalized_at is not null) then continue; end if;
   else
     -- Season end must be explicitly set by the existing season administration.
     if not exists(select 1 from public.vesalaporra_seasons s where s.season_key=ph.season_key and s.ends_at is not null and s.ends_at<=now()) then continue; end if;
   end if;
   if not exists(select 1 from vp_competition.match_phases mp where mp.season_key=ph.season_key and mp.phase=ph.phase) then continue; end if;
   -- Finalization publishes scores and lifecycle_status='scored' atomically.
   -- Historical imported predictions without scores must not block the archive
   -- of the exact totals already published in the final ranking.
   if exists(select 1 from vp_competition.match_phases mp join public.vesalaporra_matches m on m.id=mp.match_id
     left join public.vesalaporra_match_results r on r.match_id=m.id
     where mp.season_key=ph.season_key and mp.phase=ph.phase and
       (r.finalized_at is null or m.lifecycle_status<>'scored')) then continue; end if;
   select vp_competition.snapshot_standings(ph.season_key,ph.phase) into snapshot;
   winner_id := (snapshot->0->>'user_id')::uuid;
   if winner_id is null then continue; end if;
   update vp_competition.phases set closed_at=now(),standings=snapshot where season_key=ph.season_key and phase=ph.phase;
   medal := case ph.phase when 'apertura' then 'winter_champion_2026' else 'clausura_champion_2026_27' end;
   insert into public.vesalaporra_user_achievements(user_id,achievement_key,season_key,awarded_by,award_reason,source_type,source_reference,metadata)
   values(winner_id,medal,ph.season_key,winner_id,'Guanya la classificació definitiva del torneig '||ph.phase||'.','competition_final',ph.season_key||':'||ph.phase,jsonb_build_object('phase',ph.phase,'ranking_position',1,'total_points',snapshot->0->'total_points')) on conflict(user_id,achievement_key) do nothing;
 end loop;
end $function$
;

REVOKE ALL ON FUNCTION vp_competition.snapshot_standings(text,text) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION vp_competition.ranking(text,text,integer),vp_competition.close_phases() FROM PUBLIC,anon,authenticated;

