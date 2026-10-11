begin;
alter table public.quiz14_editions add column if not exists published_at timestamptz;
alter table public.quiz14_editions add column if not exists match_id uuid references public.vesalaporra_matches(id) on delete set null;
update public.quiz14_editions set published_at=created_at where id in (1,2) and published_at is null;
update public.quiz14_editions e set match_id=(select m.id from public.vesalaporra_matches m where m.opponent_team_key=case e.id when 1 then 'getafe' else 'galatasaray' end order by m.scheduled_kickoff_at desc limit 1) where e.id in(1,2) and e.match_id is null;
create table if not exists public.quiz14_questions(
 quiz_id bigint not null references public.quiz14_editions(id) on delete cascade,
 position integer not null check(position>=0 and position<30),
 prompt text not null check(length(prompt)<=1000),
 options jsonb not null check(jsonb_typeof(options)='array' and jsonb_array_length(options)=4),
 correct_index integer check(correct_index between 0 and 3),
 explanation text not null default '' check(length(explanation)<=1000),
 primary key(quiz_id,position));
alter table public.quiz14_questions enable row level security;
revoke all on public.quiz14_questions from public,anon,authenticated;
insert into public.quiz14_questions(quiz_id,position,prompt,options,correct_index,explanation) values
(1,0,'Quina ciutat va fer famosa Puyal amb el mític gol maradonià de Messi contra el Getafe?','["Ankara","Istanbul","Sofia","Nàpols"]'::jsonb,0,'«Ankara Messi!»'),
(1,1,'En quina competició va marcar Messi aquell gol el 2007?','["Lliga","Copa del Rei","Champions","Supercopa"]'::jsonb,1,'Semifinal d’anada de la Copa del Rei.'),
(1,2,'Quin dorsal portava Messi quan va marcar aquell gol?','["19","30","10","11"]'::jsonb,0,'Messi portava el dorsal 19.'),
(1,3,'En quin estadi es va marcar el gol maradonià?','["Coliseum","Montjuïc","Camp Nou","Miniestadi"]'::jsonb,2,'Camp Nou, 18 d’abril de 2007.'),
(1,4,'Com va acabar el Barça–Getafe del gol maradonià de Messi?','["4–0","5–2","3–1","6–2"]'::jsonb,1,'El Barça va guanyar 5–2.'),
(1,5,'Com va acabar la tornada de semifinals de Copa del 2007, al camp del Getafe?','["2–1","3–0","4–0","1–1"]'::jsonb,2,'El Getafe va remuntar amb un 4–0.'),
(1,6,'Qui va donar la passada a Messi just abans de la seva cursa maradoniana?','["Iniesta","Deco","Xavi","Eto’o"]'::jsonb,2,'Xavi va passar la pilota a Messi.'),
(1,7,'Quin d’aquests exjugadors del Barça NO ha jugat al Getafe?','["Carles Aleñá","Marc Cucurella","Andrés Iniesta","Munir El Haddadi"]'::jsonb,2,'Iniesta no va jugar al Getafe.'),
(1,8,'Segons la classificació històrica publicada pel Getafe, qui és el seu màxim golejador?','["Jorge Molina","Borja Mayoral","Jaime Mata","Ángel Rodríguez"]'::jsonb,0,'Jorge Molina.'),
(1,9,'Quantes vegades havia derrotat oficialment el Getafe al Barça abans del partit d’octubre de 2026?','["2","4","7","10"]'::jsonb,1,'Quatre victòries abans d’octubre de 2026.'),
(1,10,'Com va acabar l''últim Getafe–Barça, el 25 d''abril de 2026?','["0–2","3–0","1–1","0–0"]'::jsonb,0,'El Barça va guanyar 0–2.'),
(1,11,'Qui va marcar en el Getafe 0–2 Barça d''abril de 2026?','["Fermín López i Marcus Rashford","Lewandowski (2) i Raphinha","Lamine Yamal i Pedri (2)","Raphinha i Ferran Torres (2)"]'::jsonb,0,'Fermín López i Marcus Rashford.'),
(1,12,'Com va acabar l’últim Barça–Getafe jugat al Camp Nou abans d’octubre de 2026?','["2–0","4–0","1–0","3–1"]'::jsonb,2,'Barça 1–0 Getafe.'),
(1,13,'Qui va marcar l’únic gol en aquell últim Barça–Getafe al Camp Nou (2023)?','["Gavi","Pedri","Lewandowski","Dembélé"]'::jsonb,1,'Pedri, al minut 35.'),
(2,0,'Quin d’aquests exjugadors blaugrana no ha jugat mai al Galatasaray?','["Popescu","Hagi","Txigrinski","Iñaki Peña"]'::jsonb,2,'Txigrinski.'),
(2,1,'Quin jugador va marcar amb una finta espectacular dins l’àrea contra el Galatasaray el març de 2022?','["Ferran Torres","Pedri","Dembélé","Memphis Depay"]'::jsonb,1,'Pedri.'),
(2,2,'Qui va marcar el gol de la victòria del Barça al camp del Galatasaray el març de 2022?','["Aubameyang","Frenkie de Jong","Adama Traoré","Luuk de Jong"]'::jsonb,0,'Aubameyang.'),
(2,3,'Quin porter del Galatasaray, cedit pel Barça, va disputar l’eliminatòria de març de 2022?','["Neto","Arnau Tenas","Ter Stegen","Iñaki Peña"]'::jsonb,3,'Iñaki Peña.'),
(2,4,'Qui entrenava el Barça en l’eliminatòria contra el Galatasaray de 2022?','["Ronald Koeman","Luis Enrique","Xavi Hernández","Quique Setién"]'::jsonb,2,'Xavi Hernández.'),
(2,5,'Quin sobrenom animal identifica el Galatasaray?','["Les àguiles","Els lleons","Els tigres","Els llops"]'::jsonb,1,'Els lleons.'),
(2,6,'Contra quin equip va guanyar el Galatasaray la final europea del maig de 2000?','["Arsenal","Liverpool","València","Parma"]'::jsonb,0,'Arsenal.'),
(2,7,'Quin títol europeu va guanyar el Galatasaray el maig de 2000?','["Champions League","Recopa d’Europa","Supercopa d’Europa","Copa de la UEFA"]'::jsonb,3,'Copa de la UEFA.'),
(2,8,'Quin jugador va debutar amb el primer equip del Barça al camp del Galatasaray el 1993?','["Albert Ferrer","Guillermo Amor","Sergi Barjuan","Òscar García"]'::jsonb,2,'Sergi Barjuan.'),
(2,9,'Quin resultat va tenir el Galatasaray-Barça del novembre de 1993?','["1-1","0-0","0-1","2-1"]'::jsonb,1,'0-0.'),
(2,10,'Qui és el màxim golejador del Galatasaray a la història de la lliga turca (Süper Lig)?','["Metin Oktay","Tanju Çolak","Arif Erdem","Hakan Şükür"]'::jsonb,3,'Hakan Şükür.'),
(2,11,'Quants partits oficials ha guanyat el Barça al camp del Galatasaray abans del duel d’octubre de 2026?','["3","1","2","4"]'::jsonb,0,'Tres victòries.'),
(2,12,'Com es diu actualment l’estadi del Galatasaray?','["Şükrü Saracoğlu","Vodafone Park","RAMS Park","Atatürk Olímpic"]'::jsonb,2,'RAMS Park.'),
(2,13,'Qui és l’actual entrenador del Galatasaray?','["Lucescu","Okan Buruk","Fatih Terim","Arda Turan"]'::jsonb,1,'Okan Buruk.')
on conflict(quiz_id,position) do nothing;
alter policy quiz14_editions_read on public.quiz14_editions using(published_at is not null);
select setval(pg_get_serial_sequence('public.quiz14_editions','id'),greatest((select max(id) from public.quiz14_editions),1),true);
create or replace function public.quiz14_catalog() returns jsonb language sql stable security definer set search_path='' as $fn$
select coalesce(jsonb_agg(jsonb_build_object('id',e.id,'title',e.title,'created_at',e.created_at,'published_at',e.published_at,'closed_at',e.closed_at,'champion',e.final_ranking->0,'question_count',14,'match_id',e.match_id,'opponent_team_key',m.opponent_team_key,'opponent_name',m.opponent_display_name,'opponent_colors',jsonb_build_array(m.opponent_color_primary,m.opponent_color_secondary),'opponent_pattern',m.opponent_badge_pattern) order by e.published_at,e.id),'[]'::jsonb)
from public.quiz14_editions e left join public.vesalaporra_matches m on m.id=e.match_id where e.published_at is not null;
$fn$;
create or replace function public.quiz14_admin_list() returns jsonb language plpgsql security definer set search_path='' as $fn$
begin
perform public.vesalaporra_assert_current_admin();
return jsonb_build_object('editions',(select coalesce(jsonb_agg(to_jsonb(x) order by x.id desc),'[]'::jsonb) from(select e.id,e.title,e.match_id,e.published_at,e.closed_at,(select count(*) from public.quiz14_runs r where r.quiz_id=e.id) as participants from public.quiz14_editions e)x),
'matches',(select coalesce(jsonb_agg(to_jsonb(x) order by x.scheduled_kickoff_at desc),'[]'::jsonb) from(select m.id,m.opponent_team_key,m.opponent_display_name,m.opponent_color_primary,m.opponent_color_secondary,m.opponent_badge_pattern,m.barcelona_first,m.scheduled_kickoff_at,m.competition_name from public.vesalaporra_matches m order by m.scheduled_kickoff_at desc limit 100)x));
end $fn$;
create or replace function public.quiz14_admin_get(p_quiz_id bigint) returns jsonb language plpgsql security definer set search_path='' as $fn$
declare e public.quiz14_editions%rowtype;n bigint;
begin
perform public.vesalaporra_assert_current_admin();
select * into e from public.quiz14_editions where id=p_quiz_id;
if not found then raise exception 'Quiz inexistent';end if;
select count(*) into n from public.quiz14_runs where quiz_id=e.id;
return (to_jsonb(e)-'final_ranking')||jsonb_build_object('participants',n,'locked',n>0 or e.closed_at is not null,'questions',(select coalesce(jsonb_agg(jsonb_build_object('prompt',q.prompt,'options',q.options,'correct_index',q.correct_index,'explanation',q.explanation) order by position),'[]'::jsonb) from public.quiz14_questions q where q.quiz_id=e.id));
end $fn$;
create or replace function public.quiz14_admin_save(p_quiz_id bigint,p_title text,p_match_id uuid,p_questions jsonb) returns jsonb language plpgsql security definer set search_path='' as $fn$
declare e public.quiz14_editions%rowtype;item jsonb;opt jsonb;idx int;position int:=0;n int;
begin
perform public.vesalaporra_assert_current_admin();
if length(coalesce(p_title,''))>150 then raise exception 'El títol és massa llarg';end if;
if p_match_id is not null and not exists(select 1 from public.vesalaporra_matches where id=p_match_id) then raise exception 'Partit inexistent';end if;
if jsonb_typeof(p_questions) is distinct from 'array' or jsonb_array_length(p_questions)>30 then raise exception 'Preguntes no vàlides';end if;
for item in select value from jsonb_array_elements(p_questions) loop
if jsonb_typeof(item->'prompt') is distinct from 'string' or length(item->>'prompt')>1000 or jsonb_typeof(item->'options') is distinct from 'array' or jsonb_array_length(item->'options')<>4 then raise exception 'Cada pregunta necessita un text i quatre opcions';end if;
for opt in select value from jsonb_array_elements(item->'options') loop
if jsonb_typeof(opt)<>'string' or length(opt#>>'{}')>500 then raise exception 'Opció no vàlida';end if;
end loop;
if item->>'correct_index' is not null and item->>'correct_index' not in('0','1','2','3') then raise exception 'Resposta correcta no vàlida';end if;
if length(coalesce(item->>'explanation',''))>1000 then raise exception 'Explicació massa llarga';end if;
end loop;
if p_quiz_id is null then
insert into public.quiz14_editions(title,match_id) values(coalesce(p_title,''),p_match_id) returning * into e;
else
select * into e from public.quiz14_editions where id=p_quiz_id for update;
if not found then raise exception 'Quiz inexistent';end if;
if e.closed_at is not null or exists(select 1 from public.quiz14_runs where quiz_id=e.id) then raise exception 'El quiz està bloquejat: ja té participants o està tancat';end if;
end if;
if e.published_at is not null then
if nullif(btrim(p_title),'') is null or p_match_id is null or jsonb_array_length(p_questions)<>14 then raise exception 'Un quiz publicat necessita títol, partit i 14 preguntes completes';end if;
for item in select value from jsonb_array_elements(p_questions) loop
if nullif(btrim(item->>'prompt'),'') is null or item->>'correct_index' is null or exists(select 1 from jsonb_array_elements_text(item->'options') o where nullif(btrim(o),'') is null) then raise exception 'Completa totes les preguntes i respostes';end if;
end loop;
end if;
update public.quiz14_editions set title=coalesce(p_title,''),match_id=p_match_id where id=e.id;
delete from public.quiz14_questions where quiz_id=e.id;
for item in select value from jsonb_array_elements(p_questions) loop
insert into public.quiz14_questions(quiz_id,position,prompt,options,correct_index,explanation) values(e.id,position,btrim(item->>'prompt'),item->'options',(item->>'correct_index')::int,coalesce(item->>'explanation',''));
position:=position+1;
end loop;
return public.quiz14_admin_get(e.id);
end $fn$;
create or replace function public.quiz14_admin_publish(p_quiz_id bigint) returns jsonb language plpgsql security definer set search_path='' as $fn$
declare e public.quiz14_editions%rowtype;
begin
perform public.vesalaporra_assert_current_admin();
perform pg_advisory_xact_lock(141400);
select * into e from public.quiz14_editions where id=p_quiz_id for update;
if not found then raise exception 'Quiz inexistent';end if;
if e.published_at is not null then raise exception 'El quiz ja està publicat';end if;
if exists(select 1 from public.quiz14_editions where published_at is not null and closed_at is null) then raise exception 'Tanca el quiz actual abans de publicar el següent';end if;
if nullif(btrim(e.title),'') is null or e.match_id is null then raise exception 'Afegeix un títol i associa un partit';end if;
if (select count(*) from public.quiz14_questions where quiz_id=e.id)<>14 or exists(select 1 from public.quiz14_questions q where q.quiz_id=e.id and (nullif(btrim(q.prompt),'') is null or q.correct_index is null or exists(select 1 from jsonb_array_elements_text(q.options) o where nullif(btrim(o),'') is null))) then raise exception 'Calen 14 preguntes completes amb quatre opcions i una resposta correcta';end if;
update public.quiz14_editions set published_at=clock_timestamp() where id=e.id;
return public.quiz14_admin_get(e.id);
end $fn$;
create or replace function public.quiz14_begin_edition(p_quiz_id bigint default null) returns jsonb language plpgsql security definer set search_path='' as $fn$
declare v public.quiz14_runs%rowtype;uid uuid:=auth.uid();e public.quiz14_editions%rowtype;
begin
if uid is null then raise exception 'Inicia sessió';end if;
select * into e from public.quiz14_editions where published_at is not null order by published_at desc,id desc limit 1 for share;
if not found or p_quiz_id is distinct from e.id then raise exception 'El quiz ha canviat. Recarrega la pàgina.';end if;
if e.closed_at is not null then raise exception 'Aquest quiz està tancat';end if;
insert into public.quiz14_runs(user_id,quiz_id) values(uid,e.id) on conflict do nothing;
select * into v from public.quiz14_runs where user_id=uid and quiz_id=e.id;
return jsonb_build_object('quiz_id',e.id,'index',v.question_index,'score',v.score,'deadline',v.question_started_at+interval '10 seconds','finished',v.finished_at is not null,'question_count',14,'question',(select jsonb_build_object('prompt',q.prompt,'options',q.options) from public.quiz14_questions q where q.quiz_id=e.id and q.position=v.question_index));
end $fn$;
create or replace function public.quiz14_status() returns jsonb language plpgsql security definer set search_path='' as $fn$
declare v public.quiz14_runs%rowtype;uid uuid:=auth.uid();e public.quiz14_editions%rowtype;
begin
if uid is null then raise exception 'Inicia sessió';end if;
select * into e from public.quiz14_editions where published_at is not null order by published_at desc,id desc limit 1;
select * into v from public.quiz14_runs where user_id=uid and quiz_id=e.id;
if not found then return null;end if;
return jsonb_build_object('quiz_id',e.id,'index',v.question_index,'score',v.score,'deadline',v.question_started_at+interval '10 seconds','finished',v.finished_at is not null,'question_count',14,'question',(select jsonb_build_object('prompt',q.prompt,'options',q.options) from public.quiz14_questions q where q.quiz_id=e.id and q.position=v.question_index));
end $fn$;
create or replace function public.quiz14_submit_edition(p_choice integer,p_quiz_id bigint default null) returns jsonb language plpgsql security definer set search_path='' as $fn$
declare v public.quiz14_runs%rowtype;uid uuid:=auth.uid();e public.quiz14_editions%rowtype;q public.quiz14_questions%rowtype;elapsed numeric;awarded int:=0;nextidx int;done boolean;stamp timestamptz;outcome text;response jsonb;
begin
if uid is null then raise exception 'Inicia sessió';end if;
select * into e from public.quiz14_editions where published_at is not null order by published_at desc,id desc limit 1 for share;
if not found or p_quiz_id is distinct from e.id then raise exception 'El quiz ha canviat. Recarrega la pàgina.';end if;
if e.closed_at is not null then raise exception 'Aquest quiz està tancat';end if;
if p_choice is null or p_choice < -1 or p_choice > 3 then raise exception 'Resposta no vàlida';end if;
select * into v from public.quiz14_runs where user_id=uid and quiz_id=e.id for update;
if not found then raise exception 'Comença el quiz';end if;
if v.finished_at is not null or v.question_index>=14 then raise exception 'Joc acabat';end if;
select * into q from public.quiz14_questions where quiz_id=e.id and position=v.question_index;
if not found or q.correct_index is null then raise exception 'Pregunta no disponible';end if;
stamp:=clock_timestamp();elapsed:=extract(epoch from stamp-v.question_started_at);
if elapsed<0 then raise exception 'Espera que comenci la pregunta següent';end if;
if p_choice=q.correct_index and elapsed<10 then awarded:=greatest(10,100-10*floor(elapsed)::int);end if;
outcome:=case when awarded>0 then 'correct' when elapsed>=10 or p_choice=-1 then 'timeout' else 'wrong' end;
nextidx:=v.question_index+1;done:=nextidx>=14;
update public.quiz14_runs set score=v.score+awarded,question_index=nextidx,question_started_at=stamp+interval '1100 milliseconds',finished_at=case when done then stamp else null end where user_id=uid and quiz_id=e.id returning * into v;
response:=jsonb_build_object('quiz_id',e.id,'index',v.question_index,'score',v.score,'deadline',v.question_started_at+interval '10 seconds','finished',v.finished_at is not null,'question_count',14,'question',(select jsonb_build_object('prompt',q.prompt,'options',q.options) from public.quiz14_questions q where q.quiz_id=e.id and q.position=v.question_index));
return response||jsonb_build_object('awarded',awarded,'correct',q.correct_index,'explanation',coalesce(nullif(q.explanation,''),q.options->>q.correct_index),'outcome',outcome);
end $fn$;
create or replace function public.quiz14_close(p_quiz_id bigint) returns jsonb language plpgsql security definer set search_path='' as $fn$
declare e public.quiz14_editions%rowtype;snapshot jsonb;
begin
perform public.vesalaporra_assert_current_admin();
select * into e from public.quiz14_editions where id=p_quiz_id for update;
if not found or e.published_at is null then raise exception 'Aquest quiz encara no està publicat';end if;
if e.closed_at is null then
select coalesce(jsonb_agg(to_jsonb(x) order by x.score desc,x.finished_at nulls last,x.started_at,x.user_id),'[]'::jsonb) into snapshot
from(select r.user_id,coalesce(nullif(p.display_name,''),'Culer') display_name,p.avatar_url,r.score,r.finished_at is not null finished,r.finished_at,r.started_at from public.quiz14_runs r join public.profiles p on p.id=r.user_id where r.quiz_id=e.id and not coalesce(p.ranking_excluded,false))x;
update public.quiz14_editions set closed_at=clock_timestamp(),final_ranking=snapshot where id=e.id returning * into e;
end if;
return to_jsonb(e)-'final_ranking';
end $fn$;
create or replace function public.quiz14_history_leaderboard(p_quiz_id bigint) returns table(user_id uuid,display_name text,avatar_url text,score integer,finished boolean) language plpgsql stable security definer set search_path='' as $fn$
begin
if not exists(select 1 from public.quiz14_editions where id=p_quiz_id and published_at is not null) then return;end if;
if exists(select 1 from public.quiz14_editions where id=p_quiz_id and closed_at is not null) then
return query select x.user_id,x.display_name,x.avatar_url,x.score,x.finished from public.quiz14_editions e,lateral jsonb_array_elements(e.final_ranking) with ordinality j(value,n),lateral jsonb_to_record(j.value) as x(user_id uuid,display_name text,avatar_url text,score integer,finished boolean) where e.id=p_quiz_id order by j.n;
else
return query select r.user_id,coalesce(nullif(p.display_name,''),'Culer'),p.avatar_url,r.score,r.finished_at is not null from public.quiz14_runs r join public.profiles p on p.id=r.user_id where r.quiz_id=p_quiz_id and not coalesce(p.ranking_excluded,false) order by r.score desc,r.finished_at nulls last,r.started_at,r.user_id;
end if;
end $fn$;
create or replace function public.quiz14_leaderboard() returns table(user_id uuid,display_name text,avatar_url text,score integer,finished boolean) language sql stable security definer set search_path='' as $fn$
select * from public.quiz14_history_leaderboard((select id from public.quiz14_editions where published_at is not null order by published_at desc,id desc limit 1));
$fn$;
revoke all on function public.quiz14_catalog(),public.quiz14_admin_list(),public.quiz14_admin_get(bigint),public.quiz14_admin_save(bigint,text,uuid,jsonb),public.quiz14_admin_publish(bigint) from public,anon,authenticated;
grant execute on function public.quiz14_catalog() to anon,authenticated;
grant execute on function public.quiz14_admin_list(),public.quiz14_admin_get(bigint),public.quiz14_admin_save(bigint,text,uuid,jsonb),public.quiz14_admin_publish(bigint) to authenticated;
notify pgrst,'reload schema';
commit;

