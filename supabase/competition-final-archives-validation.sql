-- Exercise the real closing function and discard every simulated data change.
BEGIN;
DO $test$
DECLARE
  sk constant text := 'TEMPORADA_2026_27';
  expected jsonb;
  captured jsonb;
  before_points jsonb;
  after_points jsonb;
  final_id uuid;
  winner_id uuid;
  ids uuid[];
BEGIN
  IF public.vesalaporra_public_competition_state()->>'phase'<>'apertura' THEN
    RAISE EXCEPTION 'Run this validation while the Apertura is still open';
  END IF;
  SELECT jsonb_agg(to_jsonb(r) ORDER BY ranking_position) INTO expected
    FROM vp_competition.ranking(sk,'apertura',2147483647) r;
  SELECT array_agg((r->>'user_id')::uuid) INTO ids FROM jsonb_array_elements(expected) r;
  captured := vp_competition.snapshot_standings(sk,'apertura');
  IF jsonb_array_length(captured)<>jsonb_array_length(expected) THEN
    RAISE EXCEPTION 'The archive omitted participants';
  END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(expected) WITH ORDINALITY e(row,idx)
    WHERE ((captured->(idx::integer-1))-'achievement_keys'-'achievement_multipliers'-'achievements')
      IS DISTINCT FROM (e.row-'achievement_keys')
  ) THEN RAISE EXCEPTION 'Positions, identities or exact points differ'; END IF;
  IF EXISTS (
    SELECT 1 FROM vp_competition.phase_medals(ids,sk,'apertura') m
    JOIN jsonb_array_elements(captured) r ON r->>'user_id'=m.user_id::text
    WHERE (r->'achievement_multipliers'->>m.achievement_key)::bigint IS DISTINCT FROM m.multiplier
  ) THEN RAISE EXCEPTION 'A saved medal multiplier differs from its closing value'; END IF;
  IF NOT EXISTS (SELECT 1 FROM jsonb_array_elements(captured) r,
    jsonb_each_text(r->'achievement_multipliers') m WHERE m.value::bigint>1)
  THEN RAISE EXCEPTION 'This dataset must exercise repeated medals'; END IF;
  winner_id := (captured->0->>'user_id')::uuid;
  IF (captured->0->'achievement_multipliers'->>'winter_champion_2026') IS DISTINCT FROM '1' THEN
    RAISE EXCEPTION 'The final champion medal is missing';
  END IF;

  -- The real, incomplete December phase must not close early.
  PERFORM vp_competition.close_phases();
  IF EXISTS (SELECT 1 FROM vp_competition.phases WHERE season_key=sk AND closed_at IS NOT NULL)
  THEN RAISE EXCEPTION 'An incomplete phase was closed'; END IF;
  SELECT jsonb_agg(jsonb_build_array(user_id,result_points,xi_points,protagonist_points,total_points) ORDER BY user_id)
    INTO before_points FROM public.vesalaporra_public_ranking('general',null,1000);

  -- Temporarily treat all published scored fixtures as a finished Apertura.
  -- Future fixtures and the actual final fixture are restored by ROLLBACK.
  UPDATE vp_competition.match_phases mp SET phase='clausura'
    FROM public.vesalaporra_matches m
    WHERE mp.match_id=m.id AND mp.season_key=sk AND mp.phase='apertura' AND m.lifecycle_status<>'scored';
  SELECT m.id INTO final_id FROM public.vesalaporra_matches m
    JOIN vp_competition.match_phases mp ON mp.match_id=m.id
    JOIN public.vesalaporra_match_results r ON r.match_id=m.id AND r.finalized_at IS NOT NULL
    WHERE mp.season_key=sk AND mp.phase='apertura' AND m.lifecycle_status='scored'
    ORDER BY m.scheduled_kickoff_at DESC LIMIT 1;
  UPDATE vp_competition.phases SET final_match_id=final_id WHERE season_key=sk AND phase='apertura';
  captured := vp_competition.snapshot_standings(sk,'apertura');
  winner_id := (captured->0->>'user_id')::uuid;
  PERFORM vp_competition.close_phases();
  IF public.vesalaporra_public_competition_state()->>'phase'<>'clausura' THEN
    RAISE EXCEPTION 'The real closing function did not archive the completed phase';
  END IF;
  IF public.vesalaporra_public_competition_archives()->0->'standings' IS DISTINCT FROM captured THEN
    RAISE EXCEPTION 'The public archive differs from the complete closing snapshot';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.vesalaporra_user_achievements
    WHERE user_id=(captured->0->>'user_id')::uuid AND achievement_key='winter_champion_2026') THEN
    RAISE EXCEPTION 'The champion award was not persisted';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM jsonb_array_elements(captured) r
    WHERE r->'achievement_multipliers' ? 'preseason_champion_2026')
    OR EXISTS (SELECT 1 FROM public.vesalaporra_public_achievement_multipliers(ids)
      WHERE achievement_key='preseason_champion_2026') THEN
    RAISE EXCEPTION 'The historical preseason medal must survive only inside the archive';
  END IF;
  SELECT jsonb_agg(jsonb_build_array(user_id,result_points,xi_points,protagonist_points,total_points) ORDER BY user_id)
    INTO after_points FROM public.vesalaporra_public_ranking('general',null,1000);
  IF before_points IS DISTINCT FROM after_points THEN RAISE EXCEPTION 'Full-season points changed'; END IF;

  -- Later identity changes and repeated closing calls cannot rewrite history.
  UPDATE public.profiles SET display_name='Archive validation',avatar_url=null WHERE id=winner_id;
  PERFORM vp_competition.close_phases();
  IF public.vesalaporra_public_competition_archives()->0->'standings' IS DISTINCT FROM captured THEN
    RAISE EXCEPTION 'The final standings changed after the Clausura started';
  END IF;
  IF has_function_privilege('anon','vp_competition.snapshot_standings(text,text)','EXECUTE')
    OR has_function_privilege('authenticated','vp_competition.snapshot_standings(text,text)','EXECUTE') THEN
    RAISE EXCEPTION 'The internal snapshot helper must remain private';
  END IF;
END $test$;
ROLLBACK;
SELECT jsonb_build_object('archive_validation','passed','simulation_rolled_back',true,
  'current_state',public.vesalaporra_public_competition_state(),
  'real_archives',public.vesalaporra_public_competition_archives());
