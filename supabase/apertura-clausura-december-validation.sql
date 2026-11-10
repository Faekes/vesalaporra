-- Run before the Apertura is archived. All simulated changes are rolled back.
BEGIN;
DO $test$
DECLARE
 sk constant text := 'TEMPORADA_2026_27';
 ids uuid[];
 final_id uuid;
 final_kickoff timestamptz;
 points_before jsonb;
 points_after jsonb;
 snapshot jsonb;
 winner_id uuid;
 test_user uuid;
 exact_matches uuid[];
 preseason_awards_before bigint;
BEGIN
 IF public.vesalaporra_public_competition_state()->>'phase'<>'apertura' THEN
   RAISE EXCEPTION 'Run this simulation before the actual phase transition';
 END IF;
 SELECT array_agg(id) INTO ids FROM public.profiles;
 SELECT count(*) INTO preseason_awards_before FROM public.vesalaporra_user_achievements WHERE achievement_key='preseason_champion_2026';
 SELECT final_match_id INTO final_id FROM vp_competition.phases WHERE season_key=sk AND phase='apertura';
 IF NOT EXISTS (SELECT 1 FROM public.vesalaporra_matches WHERE id=final_id AND barcelona_first AND opponent_team_key='real-sociedad') THEN
   RAISE EXCEPTION 'The final fixture must be the home match against Real Sociedad';
 END IF;

 -- A fixture retains its phase if its official kickoff is subsequently changed.
 SELECT scheduled_kickoff_at INTO final_kickoff FROM public.vesalaporra_matches WHERE id=final_id;
 UPDATE public.vesalaporra_matches SET scheduled_kickoff_at=timestamptz '2026-12-19 21:00 Europe/Madrid' WHERE id=final_id;
 IF NOT EXISTS (SELECT 1 FROM vp_competition.match_phases WHERE match_id=final_id AND phase='apertura')
    OR NOT EXISTS (SELECT 1 FROM vp_competition.phases WHERE season_key=sk AND phase='apertura' AND ends_at=timestamptz '2026-12-20 00:00 Europe/Madrid') THEN
   RAISE EXCEPTION 'Rescheduling must retain fixture identity and update the boundary';
 END IF;
 UPDATE public.vesalaporra_matches SET scheduled_kickoff_at=final_kickoff WHERE id=final_id;

 -- An unscored final match cannot close the Apertura or award its championship.
 PERFORM vp_competition.close_phases();
 IF EXISTS (SELECT 1 FROM vp_competition.phases WHERE season_key=sk AND closed_at IS NOT NULL) THEN
   RAISE EXCEPTION 'An incomplete phase was closed';
 END IF;

 SELECT jsonb_agg(jsonb_build_array(user_id,result_points,xi_points,protagonist_points,total_points) ORDER BY user_id)
 INTO points_before FROM public.vesalaporra_public_ranking('general',null,1000);
 SELECT jsonb_agg(to_jsonb(r) ORDER BY ranking_position) INTO snapshot
 FROM public.vesalaporra_public_ranking('apertura',null,1000) r;
 winner_id := (snapshot->0->>'user_id')::uuid;

 -- Simulate the completed archive and its champion inside this transaction only.
 UPDATE vp_competition.phases SET closed_at=now(),standings=snapshot WHERE season_key=sk AND phase='apertura';
 INSERT INTO public.vesalaporra_user_achievements
 (user_id,achievement_key,season_key,awarded_by,award_reason,source_type,source_reference,metadata)
 VALUES(winner_id,'winter_champion_2026',sk,winner_id,'Temporary validation award','competition_final',sk||':validation',jsonb_build_object('phase','apertura'))
 ON CONFLICT(user_id,achievement_key) DO NOTHING;

 IF public.vesalaporra_public_competition_state()->>'phase'<>'clausura' THEN
   RAISE EXCEPTION 'Archiving the Apertura must activate the Clausura';
 END IF;
 IF EXISTS (SELECT 1 FROM vp_competition.medal_counts(ids,sk,'clausura') WHERE qualifying_count<>0 OR multiplier<>0) THEN
   RAISE EXCEPTION 'Clausura medal progress did not reset to zero';
 END IF;
 IF EXISTS (SELECT 1 FROM public.vesalaporra_public_achievement_multipliers(ids)
   WHERE achievement_key NOT IN ('winter_champion_2026')) THEN
   RAISE EXCEPTION 'An Apertura ordinary medal leaked into the Clausura';
 END IF;
 IF (SELECT count(*) FROM public.vesalaporra_public_achievement_multipliers(ids)
   WHERE achievement_key IN ('winter_champion_2026'))<>1 THEN
   RAISE EXCEPTION 'Only the Apertura championship medal must survive the reset';
 END IF;
 IF EXISTS (SELECT 1 FROM public.profiles p CROSS JOIN LATERAL public.vesalaporra_public_user_achievements(p.id) a
   WHERE a.achievement_key NOT IN ('winter_champion_2026')) THEN
   RAISE EXCEPTION 'Profile medal visibility did not reset';
 END IF;
 IF EXISTS (SELECT 1 FROM public.vesalaporra_public_ranking('general',null,1000) r
   CROSS JOIN LATERAL unnest(r.achievement_keys) a(akey)
   WHERE a.akey NOT IN ('winter_champion_2026')) THEN
   RAISE EXCEPTION 'General ranking still displays old ordinary medals';
 END IF;
 IF EXISTS (SELECT 1 FROM public.vesalaporra_public_ranking('clausura',null,1000) WHERE total_points<>0) THEN
   RAISE EXCEPTION 'Apertura points leaked into the Clausura';
 END IF;
 SELECT jsonb_agg(jsonb_build_array(user_id,result_points,xi_points,protagonist_points,total_points) ORDER BY user_id)
 INTO points_after FROM public.vesalaporra_public_ranking('general',null,1000);
 IF points_after IS DISTINCT FROM points_before THEN RAISE EXCEPTION 'General season points changed during the reset'; END IF;
 IF (SELECT count(*) FROM public.vesalaporra_user_achievements WHERE achievement_key='preseason_champion_2026')<>preseason_awards_before THEN
   RAISE EXCEPTION 'The historical preseason championship award was removed';
 END IF;

 -- Re-earn an ordinary medal using only matches assigned to the new phase.
 SELECT sc.user_id,array_agg(DISTINCT sc.match_id ORDER BY sc.match_id)
 INTO test_user,exact_matches
 FROM public.vesalaporra_prediction_scores sc
 JOIN public.vesalaporra_predictions p ON p.id=sc.prediction_id AND p.user_id=sc.user_id AND p.match_id=sc.match_id
 JOIN public.vesalaporra_match_results r ON r.match_id=sc.match_id AND r.version=sc.scoring_version
 JOIN vp_competition.match_phases mp ON mp.match_id=sc.match_id AND mp.season_key=sk
 JOIN public.vesalaporra_user_achievements a ON a.user_id=sc.user_id AND a.achievement_key='nostradamus' AND a.season_key=sk
 WHERE p.predicted_barcelona_goals=r.barcelona_goals AND p.predicted_opponent_goals=r.opponent_goals
 GROUP BY sc.user_id HAVING count(DISTINCT sc.match_id)>=3 LIMIT 1;
 IF test_user IS NULL THEN RAISE EXCEPTION 'This dataset needs a user with at least three exact results'; END IF;
 UPDATE vp_competition.match_phases SET phase='clausura' WHERE match_id=ANY(exact_matches[1:2]);
 IF NOT EXISTS (SELECT 1 FROM vp_competition.medal_counts(array[test_user],sk,'clausura')
   WHERE achievement_key='nostradamus' AND qualifying_count=2 AND multiplier=0)
   OR public.vesalaporra_standard_achievement_is_qualified(test_user,'nostradamus',sk)
   OR EXISTS (SELECT 1 FROM public.vesalaporra_public_user_achievements(test_user) WHERE achievement_key='nostradamus') THEN
   RAISE EXCEPTION 'Two Clausura results incorrectly inherited Apertura progress';
 END IF;
 UPDATE vp_competition.match_phases SET phase='clausura' WHERE match_id=exact_matches[3];
 IF NOT EXISTS (SELECT 1 FROM public.vesalaporra_public_achievement_multipliers(array[test_user])
   WHERE achievement_key='nostradamus' AND qualifying_count=3 AND multiplier=1)
   OR NOT public.vesalaporra_standard_achievement_is_qualified(test_user,'nostradamus',sk)
   OR NOT EXISTS (SELECT 1 FROM public.vesalaporra_public_user_achievements(test_user) WHERE achievement_key='nostradamus') THEN
   RAISE EXCEPTION 'The ordinary medal could not be re-earned in the Clausura';
 END IF;
 IF (SELECT standings FROM vp_competition.phases WHERE season_key=sk AND phase='apertura') IS DISTINCT FROM snapshot THEN
   RAISE EXCEPTION 'The archived Apertura standings changed';
 END IF;
END $test$;
ROLLBACK;
SELECT jsonb_build_object('simulation','passed','changes_rolled_back',true,'current_state',public.vesalaporra_public_competition_state());
