create or replace function public.quiz14_history_leaderboard(p_quiz_id bigint)
returns table(user_id uuid,display_name text,avatar_url text,score integer,finished boolean)
language plpgsql stable security definer set search_path='' as $$
begin
if exists(select 1 from public.quiz14_editions where id=p_quiz_id and closed_at is not null) then
return query select x.user_id,x.display_name,x.avatar_url,x.score,x.finished
from public.quiz14_editions e,lateral jsonb_array_elements(e.final_ranking) with ordinality j(value,n),
lateral jsonb_to_record(j.value) as x(user_id uuid,display_name text,avatar_url text,score integer,finished boolean)
where e.id=p_quiz_id order by j.n;
else
return query select r.user_id,coalesce(nullif(p.display_name,''),'Culer'),p.avatar_url,r.score,r.finished_at is not null
from public.quiz14_runs r join public.profiles p on p.id=r.user_id
where r.quiz_id=p_quiz_id and not coalesce(p.ranking_excluded,false)
order by r.score desc,r.finished_at nulls last,r.started_at,r.user_id;
end if;
end $$;
