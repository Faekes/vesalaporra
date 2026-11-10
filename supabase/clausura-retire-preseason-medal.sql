-- Retire the preseason championship medal from active Clausura displays and tiebreaks.
-- Keep the original award and archived Apertura standings intact.

CREATE OR REPLACE FUNCTION vp_competition.phase_medals(p_user_ids uuid[], p_season text, p_phase text)
 RETURNS TABLE(user_id uuid, achievement_key text, multiplier bigint, qualifying_count bigint, threshold_count integer)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'pg_catalog', 'public', 'vp_competition'
AS $function$
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
   AND NOT (p_phase='clausura' AND a.achievement_key='preseason_champion_2026')
   AND (d.is_permanent OR coalesce(a.season_key,d.season_key)=p_season
     OR (a.achievement_key='preseason_champion_2026' AND p_season='TEMPORADA_2026_27'));
END;
$function$;

CREATE OR REPLACE FUNCTION public.vesalaporra_public_user_achievements(p_user_id uuid)
 RETURNS TABLE(award_id uuid, user_id uuid, achievement_key text, title text, description text, icon_kind text, icon_asset_path text, icon_alt text, season_key text, display_order integer, is_permanent boolean, awarded_at timestamp with time zone, award_reason text, metadata jsonb)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$

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
    or definitions.achievement_key not in ('flick-reader','nostradamus','yoyalodije','winner','candidat','xop-xop-salinas','kamikaze','preseason_champion_2026')
    or exists (select 1 from vp_competition.medal_counts(array[p_user_id],active_season.season_key,'clausura') c
      where c.achievement_key=definitions.achievement_key and c.multiplier>0)
  )

  order by
    definitions.display_order,
    awards.awarded_at;

$function$;

