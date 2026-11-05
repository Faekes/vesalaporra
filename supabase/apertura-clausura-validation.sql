-- Applied follow-up: preserve the existing closing function and restrict the live phase to the same active users as General.
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
