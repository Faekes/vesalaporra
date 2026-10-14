create or replace function public.vesalaporra_public_profile_history_v2(p_user_id uuid)
returns jsonb language sql stable security definer set search_path = public, pg_temp
as $$
select coalesce(jsonb_agg(
  to_jsonb(h) || jsonb_build_object(
    'barcelona_first', m.barcelona_first,
    'barcelona_display_name', m.barcelona_display_name,
    'predicted_home_goals', case when m.barcelona_first then h.predicted_home_goals else h.predicted_away_goals end,
    'predicted_away_goals', case when m.barcelona_first then h.predicted_away_goals else h.predicted_home_goals end,
    'official_home_goals', case when m.barcelona_first then h.official_home_goals else h.official_away_goals end,
    'official_away_goals', case when m.barcelona_first then h.official_away_goals else h.official_home_goals end
  ) order by h.scored_at desc, h.match_id desc
), '[]'::jsonb)
from public.vesalaporra_public_profile_history(p_user_id) h
join public.vesalaporra_matches m on m.id = h.match_id;
$$;
revoke all on function public.vesalaporra_public_profile_history_v2(uuid) from public;
grant execute on function public.vesalaporra_public_profile_history_v2(uuid) to anon, authenticated;