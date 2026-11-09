-- Apertura ends with the home Real Sociedad fixture; Clausura starts afterwards.
-- Preserve all predictions, scores, award rows and archived standings.
-- General keeps full-season points. Ordinary medals restart per phase.

DO $guard$
BEGIN
 IF EXISTS (SELECT 1 FROM vp_competition.phases WHERE season_key='TEMPORADA_2026_27' AND closed_at IS NOT NULL) THEN
   RAISE EXCEPTION 'Cannot change the boundary of an already archived phase';
 END IF;
END;
$guard$;

UPDATE vp_competition.phases
SET ends_at = timestamptz '2026-12-21 00:00:00 Europe/Madrid',
    final_match_id = (SELECT m.id FROM public.vesalaporra_matches m
      JOIN public.vesalaporra_seasons s ON s.id=m.season_id
      WHERE s.season_key='TEMPORADA_2026_27' AND m.barcelona_first
        AND (m.opponent_team_key='real-sociedad' OR lower(m.opponent_display_name) LIKE '%sociedad%')
        AND m.scheduled_kickoff_at >= timestamptz '2026-11-01 00:00:00 Europe/Madrid'
        AND m.scheduled_kickoff_at < timestamptz '2027-01-01 00:00:00 Europe/Madrid'
      ORDER BY m.scheduled_kickoff_at LIMIT 1)
WHERE season_key='TEMPORADA_2026_27' AND phase='apertura';

UPDATE vp_competition.phases
SET starts_at=timestamptz '2026-12-21 00:00:00 Europe/Madrid'
WHERE season_key='TEMPORADA_2026_27' AND phase='clausura';

-- Reclassify only unplayed fixtures affected by this explicit rule change.
UPDATE vp_competition.match_phases mp
SET phase=CASE WHEN m.id=ap.final_match_id OR m.scheduled_kickoff_at<ap.ends_at THEN 'apertura' ELSE 'clausura' END
FROM public.vesalaporra_matches m, vp_competition.phases ap
WHERE mp.match_id=m.id AND mp.season_key='TEMPORADA_2026_27'
  AND ap.season_key=mp.season_key AND ap.phase='apertura'
  AND m.lifecycle_status<>'scored'
  AND NOT EXISTS (SELECT 1 FROM public.vesalaporra_prediction_scores sc WHERE sc.match_id=m.id);

UPDATE public.vesalaporra_achievement_definitions
SET description='Guanya l’Apertura 2026/27, fins al Barça–Reial Societat previst per al 20 de desembre inclòs.', updated_at=now()
WHERE achievement_key='winter_champion_2026';
UPDATE public.vesalaporra_achievement_definitions
SET description='Guanya el Clausura 2026/27, des del partit posterior al Barça–Reial Societat que tanca l’Apertura.', updated_at=now()
WHERE achievement_key='clausura_champion_2026_27';


CREATE OR REPLACE FUNCTION vp_competition.assign_match()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public,vp_competition AS $function$
DECLARE sk text; ph text; boundary timestamptz; final_id uuid;
BEGIN
 SELECT season_key INTO sk FROM public.vesalaporra_seasons WHERE id=NEW.season_id;
 IF sk IS DISTINCT FROM 'TEMPORADA_2026_27' OR NEW.scheduled_kickoff_at IS NULL THEN RETURN NEW; END IF;
 SELECT ends_at,final_match_id INTO boundary,final_id FROM vp_competition.phases
 WHERE season_key=sk AND phase='apertura';
 IF NEW.id=final_id OR (final_id IS NULL AND NEW.barcelona_first
     AND (NEW.opponent_team_key='real-sociedad' OR lower(NEW.opponent_display_name) LIKE '%sociedad%')
     AND NEW.scheduled_kickoff_at >= timestamptz '2026-11-01 00:00:00 Europe/Madrid'
     AND NEW.scheduled_kickoff_at < timestamptz '2027-01-01 00:00:00 Europe/Madrid') THEN
   final_id:=NEW.id;
   boundary:=((NEW.scheduled_kickoff_at AT TIME ZONE 'Europe/Madrid')::date+1)::timestamp AT TIME ZONE 'Europe/Madrid';
   UPDATE vp_competition.phases SET final_match_id=final_id,ends_at=boundary
   WHERE season_key=sk AND phase='apertura' AND closed_at IS NULL;
   UPDATE vp_competition.phases SET starts_at=boundary
   WHERE season_key=sk AND phase='clausura' AND closed_at IS NULL;
 END IF;
 ph:=CASE WHEN NEW.id=final_id OR NEW.scheduled_kickoff_at<boundary THEN 'apertura' ELSE 'clausura' END;
 -- Once assigned, a rescheduled fixture keeps its phase.
 INSERT INTO vp_competition.match_phases VALUES(NEW.id,sk,ph) ON CONFLICT DO NOTHING;
 RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.vesalaporra_public_competition_state()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER
SET search_path=pg_catalog,public,vp_competition AS $function$
 SELECT jsonb_build_object('season_key',s.season_key,'phase',CASE
   WHEN s.season_key<>'TEMPORADA_2026_27' THEN NULL
   WHEN EXISTS (SELECT 1 FROM vp_competition.phases p WHERE p.season_key=s.season_key AND p.phase='apertura' AND p.closed_at IS NOT NULL)
     THEN 'clausura' ELSE 'apertura' END)
 FROM public.vesalaporra_seasons s WHERE s.status='active'
 ORDER BY s.updated_at DESC,s.created_at DESC,s.id LIMIT 1;
$function$;


-- Private counters also expose zero progress; no old award row is removed.
CREATE OR REPLACE FUNCTION vp_competition.medal_counts(p_user_ids uuid[],p_season text,p_phase text)
RETURNS TABLE(user_id uuid,achievement_key text,multiplier bigint,qualifying_count bigint,threshold_count integer)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path=pg_catalog,public,vp_competition AS $function$
 WITH requested AS MATERIALIZED (
   SELECT DISTINCT id FROM unnest(coalesce(p_user_ids,ARRAY[]::uuid[])) u(id) WHERE id IS NOT NULL
 ), matches AS MATERIALIZED (
   SELECT mp.match_id FROM vp_competition.match_phases mp
   WHERE mp.season_key=p_season AND mp.phase=p_phase
 ), scores AS (
   SELECT sc.user_id,
     count(DISTINCT sc.match_id) FILTER(WHERE sc.xi_hits=11) xi_exact,
     count(DISTINCT sc.match_id) FILTER(WHERE pr.predicted_barcelona_goals=r.barcelona_goals AND pr.predicted_opponent_goals=r.opponent_goals) result_exact,
     count(DISTINCT sc.match_id) FILTER(WHERE sc.protagonist_hit IS TRUE) protagonist_hits,
     count(DISTINCT sc.match_id) FILTER(WHERE sc.xi_hits=0 AND cardinality(pr.lineup_player_ids)=11) xi_zero,
     count(DISTINCT sc.match_id) FILTER(WHERE pr.predicted_barcelona_goals=r.barcelona_goals AND pr.predicted_opponent_goals=r.opponent_goals AND r.barcelona_goals<=r.opponent_goals) kamikaze_hits
   FROM matches m JOIN public.vesalaporra_prediction_scores sc ON sc.match_id=m.match_id
   JOIN requested u ON u.id=sc.user_id
   JOIN public.vesalaporra_match_results r ON r.match_id=sc.match_id AND r.version=sc.scoring_version
   LEFT JOIN public.vesalaporra_predictions pr ON pr.id=sc.prediction_id AND pr.match_id=sc.match_id AND pr.user_id=sc.user_id
   GROUP BY sc.user_id
 ), wins AS (
   SELECT w.user_id,count(DISTINCT w.match_id) amount
   FROM matches m JOIN public.vesalaporra_single_match_winners w ON w.match_id=m.match_id
   JOIN requested u ON u.id=w.user_id
   JOIN public.vesalaporra_match_results r ON r.match_id=w.match_id AND r.version=w.scoring_version
   GROUP BY w.user_id
 ), candidates AS (
   SELECT snap.user_id,count(DISTINCT snap.match_id) amount
   FROM matches m JOIN public.vesalaporra_candidate_general_snapshots snap ON snap.match_id=m.match_id
   JOIN requested u ON u.id=snap.user_id
   WHERE snap.season_key=p_season AND snap.general_position BETWEEN 1 AND 10 GROUP BY snap.user_id
 ), counters AS (
   SELECT u.id,v.akey,coalesce(v.hits,0)::bigint hits,v.threshold
   FROM requested u LEFT JOIN scores sc ON sc.user_id=u.id
   LEFT JOIN wins w ON w.user_id=u.id LEFT JOIN candidates c ON c.user_id=u.id
   CROSS JOIN LATERAL (VALUES
     ('flick-reader'::text,sc.xi_exact,3),('nostradamus',sc.result_exact,3),
     ('yoyalodije',sc.protagonist_hits,4),('winner',w.amount,1),('candidat',c.amount,4),
     ('xop-xop-salinas',sc.xi_zero,1),('kamikaze',sc.kamikaze_hits,1)
   ) v(akey,hits,threshold)
 )
 SELECT id,akey,hits/threshold,hits,threshold FROM counters;
$function$;
REVOKE ALL ON FUNCTION vp_competition.medal_counts(uuid[],text,text) FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION vp_competition.phase_medals(p_user_ids uuid[],p_season text,p_phase text)
RETURNS TABLE(user_id uuid,achievement_key text,multiplier bigint,qualifying_count bigint,threshold_count integer)
LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path=pg_catalog,public,vp_competition AS $function$
BEGIN
 -- Keep today's awarded medals and multipliers exactly as before.
 IF p_phase='apertura' AND public.vesalaporra_public_competition_state()->>'phase'='apertura' THEN
   RETURN QUERY SELECT * FROM public.vesalaporra_public_achievement_multipliers(p_user_ids);
   RETURN;
 END IF;
 RETURN QUERY
 SELECT c.* FROM vp_competition.medal_counts(p_user_ids,p_season,p_phase) c
 JOIN public.vesalaporra_achievement_definitions d ON d.achievement_key=c.achievement_key AND d.active
 WHERE c.multiplier>0
 UNION ALL
 SELECT a.user_id,a.achievement_key,1::bigint,1::bigint,1
 FROM public.vesalaporra_user_achievements a
 JOIN public.vesalaporra_achievement_definitions d ON d.achievement_key=a.achievement_key AND d.active
 WHERE a.user_id=ANY(coalesce(p_user_ids,ARRAY[]::uuid[]))
   AND a.achievement_key NOT IN ('flick-reader','nostradamus','yoyalodije','winner','candidat','xop-xop-salinas','kamikaze')
   AND (d.is_permanent OR coalesce(a.season_key,d.season_key)=p_season
     OR (a.achievement_key='preseason_champion_2026' AND p_season='TEMPORADA_2026_27'));
END;
$function$;
REVOKE ALL ON FUNCTION vp_competition.phase_medals(uuid[],text,text) FROM PUBLIC,anon,authenticated;


CREATE OR REPLACE FUNCTION public.vesalaporra_public_achievement_multipliers(p_user_ids uuid[])
 RETURNS TABLE(user_id uuid, achievement_key text, multiplier bigint, qualifying_count bigint, threshold_count integer)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public', 'pg_temp'
AS $function$
BEGIN
  IF coalesce(cardinality(p_user_ids), 0) > 1000 THEN
    RAISE EXCEPTION 'Consulta com a màxim 1000 usuaris per petició.'
      USING ERRCODE = '22023';
  END IF;

  IF public.vesalaporra_public_competition_state()->>'season_key'='TEMPORADA_2026_27'
     AND public.vesalaporra_public_competition_state()->>'phase'='clausura' THEN
    RETURN QUERY SELECT * FROM vp_competition.phase_medals(p_user_ids,'TEMPORADA_2026_27','clausura');
    RETURN;
  END IF;

  RETURN QUERY
  WITH requested AS (
    SELECT DISTINCT u.id
    FROM unnest(coalesce(p_user_ids, ARRAY[]::uuid[])) AS u(id)
    WHERE u.id IS NOT NULL
  ), visible_awards AS MATERIALIZED (
    -- Reutilitza EXACTAMENT la visibilitat pública actual dels premis:
    -- temporada activa, permanents i excepció de pretemporada.
    SELECT DISTINCT r.id AS uid, a.achievement_key AS akey, a.season_key AS skey
    FROM requested AS r
    CROSS JOIN LATERAL public.vesalaporra_public_user_achievements(r.id) AS a
  ), scopes AS (
    SELECT DISTINCT a.uid, a.skey, s.id AS season_id
    FROM visible_awards AS a
    JOIN public.vesalaporra_seasons AS s ON s.season_key = a.skey
    WHERE s.season_type = 'official'
      AND a.akey IN (
        'flick-reader', 'nostradamus', 'yoyalodije', 'winner',
        'candidat', 'xop-xop-salinas', 'kamikaze'
      )
  ), score_counts AS (
    SELECT scope.uid, scope.skey,
      count(DISTINCT score.match_id) FILTER (
        WHERE score.xi_hits = 11
      ) AS xi_exact,
      count(DISTINCT score.match_id) FILTER (
        WHERE prediction.predicted_barcelona_goals = result.barcelona_goals
          AND prediction.predicted_opponent_goals = result.opponent_goals
      ) AS result_exact,
      count(DISTINCT score.match_id) FILTER (
        WHERE score.protagonist_hit IS TRUE
      ) AS protagonist_hits,
      count(DISTINCT score.match_id) FILTER (
        WHERE score.xi_hits = 0
          AND cardinality(prediction.lineup_player_ids) = 11
      ) AS xi_zero,
      count(DISTINCT score.match_id) FILTER (
        WHERE prediction.predicted_barcelona_goals = result.barcelona_goals
          AND prediction.predicted_opponent_goals = result.opponent_goals
          AND (
            (result.barcelona_goals = 0 AND result.opponent_goals = 0)
            OR result.barcelona_goals < result.opponent_goals
          )
      ) AS kamikaze_hits
    FROM scopes AS scope
    JOIN public.vesalaporra_matches AS m ON m.season_id = scope.season_id
    JOIN public.vesalaporra_prediction_scores AS score
      ON score.match_id = m.id AND score.user_id = scope.uid
    JOIN public.vesalaporra_match_results AS result
      ON result.match_id = score.match_id
      AND result.version = score.scoring_version
    LEFT JOIN public.vesalaporra_predictions AS prediction
      ON prediction.id = score.prediction_id
      AND prediction.match_id = score.match_id
      AND prediction.user_id = score.user_id
    GROUP BY scope.uid, scope.skey
  ), winner_counts AS (
    SELECT scope.uid, scope.skey, count(DISTINCT w.match_id) AS wins
    FROM scopes AS scope
    JOIN public.vesalaporra_matches AS m ON m.season_id = scope.season_id
    JOIN public.vesalaporra_single_match_winners AS w
      ON w.match_id = m.id AND w.user_id = scope.uid
    JOIN public.vesalaporra_match_results AS result
      ON result.match_id = w.match_id AND result.version = w.scoring_version
    GROUP BY scope.uid, scope.skey
  ), candidate_counts AS (
    -- Candidat conserva les captures immutables del rànquing general.
    -- No s'exigeixen jornades consecutives ni es recalcula el passat.
    SELECT scope.uid, scope.skey, count(DISTINCT snapshot.match_id) AS top10
    FROM scopes AS scope
    JOIN public.vesalaporra_candidate_general_snapshots AS snapshot
      ON snapshot.user_id = scope.uid AND snapshot.season_key = scope.skey
    WHERE snapshot.general_position BETWEEN 1 AND 10
    GROUP BY scope.uid, scope.skey
  ), counters AS (
    SELECT a.uid, a.akey,
      CASE a.akey
        WHEN 'flick-reader' THEN coalesce(sc.xi_exact, 0)
        WHEN 'nostradamus' THEN coalesce(sc.result_exact, 0)
        WHEN 'yoyalodije' THEN coalesce(sc.protagonist_hits, 0)
        WHEN 'winner' THEN coalesce(wc.wins, 0)
        WHEN 'candidat' THEN coalesce(cc.top10, 0)
        WHEN 'xop-xop-salinas' THEN coalesce(sc.xi_zero, 0)
        WHEN 'kamikaze' THEN coalesce(sc.kamikaze_hits, 0)
        ELSE 1::bigint
      END AS hits,
      CASE a.akey
        WHEN 'flick-reader' THEN 3
        WHEN 'nostradamus' THEN 3
        WHEN 'yoyalodije' THEN 4
        WHEN 'winner' THEN 1
        WHEN 'candidat' THEN 4
        ELSE 1
      END AS threshold
    FROM visible_awards AS a
    LEFT JOIN score_counts AS sc ON sc.uid = a.uid AND sc.skey = a.skey
    LEFT JOIN winner_counts AS wc ON wc.uid = a.uid AND wc.skey = a.skey
    LEFT JOIN candidate_counts AS cc ON cc.uid = a.uid AND cc.skey = a.skey
  )
  SELECT c.uid, c.akey,
    -- Divisió entera: 4..7 encerts = 1, 8..11 = 2, 12..15 = 3.
    -- Una medalla ja concedida mai no desapareix per aquest canvi.
    greatest(1::bigint, max(c.hits / c.threshold)) AS multiplier,
    max(c.hits) AS qualifying_count,
    max(c.threshold) AS threshold_count
  FROM counters AS c
  GROUP BY c.uid, c.akey
  ORDER BY c.uid, c.akey;
END;
$function$;



CREATE OR REPLACE FUNCTION public.vesalaporra_public_user_achievements(p_user_id uuid)
 RETURNS TABLE(award_id uuid, user_id uuid, achievement_key text, title text, description text, icon_kind text, icon_asset_path text, icon_alt text, season_key text, display_order integer, is_permanent boolean, awarded_at timestamp with time zone, award_reason text, metadata jsonb)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$;

  with active_season as (
    select
      seasons.season_key

    from public.vesalaporra_seasons
      as seasons

    where seasons.status =
          'active'

    order by
      seasons.updated_at desc,
      seasons.created_at desc,
      seasons.id

    limit 1
  )

  select
    awards.id
      as award_id,

    awards.user_id,

    definitions.achievement_key,

    definitions.title,

    definitions.description,

    definitions.icon_kind,

    definitions.icon_asset_path,

    definitions.icon_alt,

    coalesce(
      awards.season_key,
      definitions.season_key
    )
      as season_key,

    definitions.display_order,

    definitions.is_permanent,

    awards.awarded_at,

    awards.award_reason,

    awards.metadata

  from public.vesalaporra_user_achievements
    as awards

  join public.vesalaporra_achievement_definitions
    as definitions

    on definitions.achievement_key =
       awards.achievement_key

  cross join active_season

  where awards.user_id =
        p_user_id

    and definitions.active =
        true

    and (
      definitions.is_permanent =
      true

      or coalesce(
        awards.season_key,
        definitions.season_key
      ) =
      active_season.season_key

      or (
        definitions.achievement_key =
        'preseason_champion_2026'

        and active_season.season_key =
            'TEMPORADA_2026_27'
      )
    )

  and (
    active_season.season_key<>'TEMPORADA_2026_27'
    or public.vesalaporra_public_competition_state()->>'phase'<>'clausura'
    or definitions.achievement_key not in ('flick-reader','nostradamus','yoyalodije','winner','candidat','xop-xop-salinas','kamikaze')
    or exists (select 1 from vp_competition.medal_counts(array[p_user_id],active_season.season_key,'clausura') c
      where c.achievement_key=definitions.achievement_key and c.multiplier>0)
  )

  order by
    definitions.display_order,
    awards.awarded_at;

$function$;



CREATE OR REPLACE FUNCTION public.vesalaporra_standard_achievement_is_qualified(p_user_id uuid, p_achievement_key text, p_season_key text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_count bigint := 0;
begin
  if p_season_key='TEMPORADA_2026_27'
     and public.vesalaporra_public_competition_state()->>'phase'='clausura' then
    return exists (select 1 from vp_competition.medal_counts(array[p_user_id],p_season_key,'clausura') c
      where c.achievement_key=p_achievement_key and c.multiplier>0);
  end if;
  if p_user_id is null
     or p_season_key is null
     or not exists (
       select 1
       from public.vesalaporra_seasons as season
       where season.season_key = p_season_key
         and season.season_type = 'official'
     ) then
    return false;
  end if;

  if p_achievement_key = 'candidat' then
    return public.vesalaporra_candidate_top10_general_is_qualified(
      p_user_id,
      p_season_key
    );
  end if;

  if p_achievement_key = 'flick-reader' then
    select count(distinct score.match_id)
    into v_count
    from public.vesalaporra_prediction_scores as score
    join public.vesalaporra_match_results as result
      on result.match_id = score.match_id
     and result.version = score.scoring_version
    join public.vesalaporra_matches as match_row
      on match_row.id = score.match_id
    join public.vesalaporra_seasons as season
      on season.id = match_row.season_id
    where score.user_id = p_user_id
      and season.season_key = p_season_key
      and season.season_type = 'official'
      and score.xi_hits = 11;
    return v_count >= 3;
  end if;

  if p_achievement_key = 'nostradamus' then
    select count(distinct score.match_id)
    into v_count
    from public.vesalaporra_prediction_scores as score
    join public.vesalaporra_predictions as prediction
      on prediction.id = score.prediction_id
     and prediction.match_id = score.match_id
     and prediction.user_id = score.user_id
    join public.vesalaporra_match_results as result
      on result.match_id = score.match_id
     and result.version = score.scoring_version
    join public.vesalaporra_matches as match_row
      on match_row.id = score.match_id
    join public.vesalaporra_seasons as season
      on season.id = match_row.season_id
    where score.user_id = p_user_id
      and season.season_key = p_season_key
      and season.season_type = 'official'
      and prediction.predicted_barcelona_goals = result.barcelona_goals
      and prediction.predicted_opponent_goals = result.opponent_goals;
    return v_count >= 3;
  end if;

  if p_achievement_key = 'yoyalodije' then
    select count(distinct score.match_id)
    into v_count
    from public.vesalaporra_prediction_scores as score
    join public.vesalaporra_match_results as result
      on result.match_id = score.match_id
     and result.version = score.scoring_version
    join public.vesalaporra_matches as match_row
      on match_row.id = score.match_id
    join public.vesalaporra_seasons as season
      on season.id = match_row.season_id
    where score.user_id = p_user_id
      and season.season_key = p_season_key
      and season.season_type = 'official'
      and score.protagonist_hit is true;
    return v_count >= 4;
  end if;

  if p_achievement_key = 'winner' then
    select count(distinct winner.match_id)
    into v_count
    from public.vesalaporra_single_match_winners as winner
    join public.vesalaporra_match_results as result
      on result.match_id = winner.match_id
     and result.version = winner.scoring_version
    join public.vesalaporra_matches as match_row
      on match_row.id = winner.match_id
    join public.vesalaporra_seasons as season
      on season.id = match_row.season_id
    where winner.user_id = p_user_id
      and season.season_key = p_season_key
      and season.season_type = 'official';
    return v_count >= 1;
  end if;

  if p_achievement_key = 'xop-xop-salinas' then
    select count(distinct score.match_id)
    into v_count
    from public.vesalaporra_prediction_scores as score
    join public.vesalaporra_predictions as prediction
      on prediction.id = score.prediction_id
     and prediction.match_id = score.match_id
     and prediction.user_id = score.user_id
    join public.vesalaporra_match_results as result
      on result.match_id = score.match_id
     and result.version = score.scoring_version
    join public.vesalaporra_matches as match_row
      on match_row.id = score.match_id
    join public.vesalaporra_seasons as season
      on season.id = match_row.season_id
    where score.user_id = p_user_id
      and season.season_key = p_season_key
      and season.season_type = 'official'
      and score.xi_hits = 0
      and cardinality(prediction.lineup_player_ids) = 11;
    return v_count >= 1;
  end if;

  return false;
end;
$function$;



CREATE OR REPLACE FUNCTION public.vesalaporra_candidate_top10_general_is_qualified(p_user_id uuid, p_season_key text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
SELECT CASE WHEN p_season_key='TEMPORADA_2026_27'
 AND public.vesalaporra_public_competition_state()->>'phase'='clausura'
 THEN EXISTS (SELECT 1 FROM vp_competition.medal_counts(array[p_user_id],p_season_key,'clausura') c WHERE c.achievement_key='candidat' AND c.multiplier>0)
 ELSE (select count(distinct snapshot.match_id) >= 4
  from public.vesalaporra_candidate_general_snapshots as snapshot
  where snapshot.user_id = p_user_id
    and snapshot.season_key = p_season_key
    and snapshot.general_position between 1 and 10) END;
$function$;


CREATE OR REPLACE FUNCTION public.vesalaporra_kamikaze_is_qualified(p_user_id uuid, p_season_key text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
SELECT CASE WHEN p_season_key='TEMPORADA_2026_27'
 AND public.vesalaporra_public_competition_state()->>'phase'='clausura'
 THEN EXISTS (SELECT 1 FROM vp_competition.medal_counts(array[p_user_id],p_season_key,'clausura') c WHERE c.achievement_key='kamikaze' AND c.multiplier>0)
 ELSE (SELECT EXISTS (
 SELECT 1 FROM public.vesalaporra_predictions prediction
 JOIN public.vesalaporra_prediction_scores score ON score.prediction_id=prediction.id AND score.match_id=prediction.match_id AND score.user_id=prediction.user_id
 JOIN public.vesalaporra_match_results result ON result.match_id=prediction.match_id AND result.version=score.scoring_version
 JOIN public.vesalaporra_matches match_row ON match_row.id=prediction.match_id
 JOIN public.vesalaporra_seasons season ON season.id=match_row.season_id
 WHERE prediction.user_id=p_user_id AND season.season_type='official' AND p_season_key IS NOT NULL AND season.season_key=p_season_key
 AND prediction.predicted_barcelona_goals=result.barcelona_goals AND prediction.predicted_opponent_goals=result.opponent_goals
 AND (result.barcelona_goals=result.opponent_goals OR result.barcelona_goals<result.opponent_goals)
)) END;
$function$;


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
from ranked order by pos limit greatest(1,least(coalesce(p_limit,1000),1000));
$function$;



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
    case when public.vesalaporra_public_competition_state()->>'phase'='clausura'
      then coalesce((select array_agg(a.achievement_key order by a.display_order,a.awarded_at)
        from public.vesalaporra_public_user_achievements(reranked.user_id) a),array[]::text[])
      else reranked.achievement_keys end,
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
end $function$;



REVOKE ALL ON FUNCTION vp_competition.assign_match(),vp_competition.close_phases(),vp_competition.ranking(text,text,integer) FROM PUBLIC,anon,authenticated;
-- Existing public functions retain their grants. No new public mutation API.
