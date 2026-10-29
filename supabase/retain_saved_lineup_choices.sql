CREATE OR REPLACE FUNCTION public.vesalaporra_revise_prediction(p_match_id uuid, p_barcelona_goals integer, p_opponent_goals integer, p_lineup_player_ids uuid[], p_protagonist_player_id uuid, p_audit_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth', 'pg_temp'
AS $function$
declare
  v_user_id uuid;
  v_match public.vesalaporra_matches%rowtype;
  v_prediction public.vesalaporra_predictions%rowtype;

  v_lineup_player_ids uuid[] :=
    coalesce(p_lineup_player_ids, '{}'::uuid[]);

  v_lineup_count integer;
  v_unique_lineup_count integer;
  v_valid_lineup_count integer;
  v_revision_number integer;
  v_revised_at timestamptz := now();
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception
      'Has d’iniciar sessió abans de rectificar la porra.'
      using errcode = '42501';
  end if;

  if p_match_id is null then
    raise exception
      'match_id és obligatori.'
      using errcode = '22023';
  end if;

  if p_barcelona_goals is null
    or p_opponent_goals is null
  then
    raise exception
      'El resultat és obligatori.'
      using errcode = '22023';
  end if;

  if p_barcelona_goals < 0
    or p_barcelona_goals > 30
    or p_opponent_goals < 0
    or p_opponent_goals > 30
  then
    raise exception
      'Els gols han d’estar entre 0 i 30.'
      using errcode = '22023';
  end if;

  if nullif(trim(coalesce(p_audit_id, '')), '') is null
    or char_length(trim(p_audit_id)) not between 8 and 200
  then
    raise exception
      'audit_id no és vàlid.'
      using errcode = '22023';
  end if;

  select matches.*
  into v_match
  from public.vesalaporra_matches as matches
  where matches.id = p_match_id
  for share;

  if not found then
    raise exception
      'El partit indicat no existeix.'
      using errcode = 'P0002';
  end if;

  if v_match.is_public is not true
    or v_match.lifecycle_status <> 'scheduled'
  then
    raise exception
      'La porra d’aquest partit ja no es pot rectificar.'
      using errcode = '22023';
  end if;

  if v_match.predictions_open_at is not null
    and now() < v_match.predictions_open_at
  then
    raise exception
      'La porra encara no està oberta.'
      using errcode = '22023';
  end if;

  if v_match.predictions_close_at is null then
    raise exception
      'El partit no té configurat el tancament de la porra.'
      using errcode = '22023';
  end if;

  if now() >= v_match.predictions_close_at then
    raise exception
      'La porra ja està tancada i no es pot rectificar.'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.vesalaporra_match_results as results
    where results.match_id = p_match_id
  ) then
    raise exception
      'El partit ja té resultat oficial i no es pot rectificar.'
      using errcode = '22023';
  end if;

  select predictions.*
  into v_prediction
  from public.vesalaporra_predictions as predictions
  where predictions.match_id = p_match_id
    and predictions.user_id = v_user_id
  for update;

  if not found then
    raise exception
      'No existeix cap porra enviada per rectificar.'
      using errcode = 'P0002';
  end if;

  v_lineup_count := cardinality(v_lineup_player_ids);

  if v_lineup_count not in (0, 11) then
    raise exception
      'La Lotto Flick ha d’estar buida o contenir exactament 11 jugadors.'
      using errcode = '22023';
  end if;

  if v_lineup_count = 11 then
    select count(distinct selected_player_id)
    into v_unique_lineup_count
    from unnest(v_lineup_player_ids) as selected_player_id;

    if v_unique_lineup_count <> 11 then
      raise exception
        'Els 11 jugadors de la Lotto Flick han de ser diferents.'
        using errcode = '22023';
    end if;

    select count(*)
    into v_valid_lineup_count
    from public.vesalaporra_match_players as match_players
    where match_players.match_id = p_match_id
      and match_players.player_id = any(v_lineup_player_ids)
      and ((match_players.is_public_visible = true
        and match_players.eligible_for_lineup = true
        and match_players.availability_status = 'available')
        or match_players.player_id = any(coalesce(v_prediction.lineup_player_ids, '{}'::uuid[])));

    if v_valid_lineup_count <> 11 then
      raise exception
        'La Lotto Flick conté un jugador que no és elegible en aquesta jornada.'
        using errcode = '22023';
    end if;
  end if;

  if p_protagonist_player_id is not null
    and not exists (
      select 1
      from public.vesalaporra_match_players as match_players
      where match_players.match_id = p_match_id
        and match_players.player_id = p_protagonist_player_id
        and match_players.is_public_visible = true
        and match_players.eligible_for_protagonist = true
        and match_players.availability_status = 'available'
    )
  then
    raise exception
      'El protagonista escollit no és elegible en aquesta jornada.'
      using errcode = '22023';
  end if;

  if v_prediction.predicted_barcelona_goals = p_barcelona_goals
    and v_prediction.predicted_opponent_goals = p_opponent_goals
    and v_prediction.lineup_player_ids
      is not distinct from v_lineup_player_ids
    and v_prediction.protagonist_player_id
      is not distinct from p_protagonist_player_id
  then
    return jsonb_build_object(
      'status', 'PREDICTION_UNCHANGED',
      'prediction_id', v_prediction.id,
      'match_id', v_prediction.match_id,
      'editable_until', v_match.predictions_close_at
    );
  end if;

  select coalesce(max(revision_number), 0) + 1
  into v_revision_number
  from public.vesalaporra_prediction_revisions
  where prediction_id = v_prediction.id;

  insert into public.vesalaporra_prediction_revisions (
    prediction_id,
    match_id,
    user_id,
    revision_number,

    previous_barcelona_goals,
    previous_opponent_goals,
    previous_lineup_player_ids,
    previous_protagonist_player_id,

    revised_barcelona_goals,
    revised_opponent_goals,
    revised_lineup_player_ids,
    revised_protagonist_player_id,

    audit_id,
    revised_at
  )
  values (
    v_prediction.id,
    v_prediction.match_id,
    v_prediction.user_id,
    v_revision_number,

    v_prediction.predicted_barcelona_goals,
    v_prediction.predicted_opponent_goals,
    v_prediction.lineup_player_ids,
    v_prediction.protagonist_player_id,

    p_barcelona_goals,
    p_opponent_goals,
    v_lineup_player_ids,
    p_protagonist_player_id,

    trim(p_audit_id),
    v_revised_at
  );

  update public.vesalaporra_predictions
  set
    predicted_barcelona_goals = p_barcelona_goals,
    predicted_opponent_goals = p_opponent_goals,
    lineup_player_ids = v_lineup_player_ids,
    protagonist_player_id = p_protagonist_player_id,

    metadata =
      coalesce(metadata, '{}'::jsonb)
      || jsonb_build_object(
        'patch_id',
          'VLP_PREDICTION_REVISION_20260824_001',

        'source',
          'vesalaporra_frontend',

        'immutable_by_section',
          false,

        'result_immutable',
          false,

        'lineup_submitted',
          v_lineup_count = 11,

        'protagonist_submitted',
          p_protagonist_player_id is not null,

        'prediction_complete',
          v_lineup_count = 11
          and p_protagonist_player_id is not null,

        'revision_count',
          v_revision_number,

        'last_revision_audit_id',
          trim(p_audit_id),

        'last_revised_at',
          v_revised_at,

        'editable_until',
          v_match.predictions_close_at
      )

  where id = v_prediction.id

  returning *
  into v_prediction;

  return jsonb_build_object(
    'status', 'PREDICTION_REVISED',
    'audit_id', trim(p_audit_id),
    'revision_number', v_revision_number,
    'prediction_id', v_prediction.id,
    'match_id', v_prediction.match_id,
    'user_id', v_prediction.user_id,
    'predicted_barcelona_goals',
      v_prediction.predicted_barcelona_goals,
    'predicted_opponent_goals',
      v_prediction.predicted_opponent_goals,
    'lineup_player_ids',
      to_jsonb(v_prediction.lineup_player_ids),
    'protagonist_player_id',
      v_prediction.protagonist_player_id,
    'confirmed_at', v_prediction.confirmed_at,
    'last_revised_at', v_revised_at,
    'editable_until', v_match.predictions_close_at
  );
end;
$function$;

CREATE OR REPLACE FUNCTION public.vesalaporra_public_match_players(p_match_id uuid)
 RETURNS TABLE(match_id uuid, player_id uuid, roster_order integer, display_name text, short_name text, shirt_number integer, avatar_bucket text, avatar_path text, avatar_version integer, availability_status text, eligible_for_lineup boolean, eligible_for_protagonist boolean, eligible_for_ratings boolean, protagonist_group_key text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  select
    mp.match_id,
    mp.player_id,
    mp.roster_order,
    mp.display_name_snapshot,
    coalesce(mp.short_name_snapshot, mp.display_name_snapshot),
    mp.shirt_number_snapshot,
    mp.avatar_bucket_snapshot,
    mp.avatar_path_snapshot,
    mp.avatar_version_snapshot,
    mp.availability_status,
    (mp.eligible_for_lineup and mp.is_public_visible and mp.availability_status = 'available'),
    (mp.eligible_for_protagonist and mp.is_public_visible and mp.availability_status = 'available'),
    mp.eligible_for_ratings,
    public.vesalaporra_group_key_from_note(mp.admin_note)
  from public.vesalaporra_match_players mp
  join public.vesalaporra_matches m on m.id = mp.match_id
  where mp.match_id = p_match_id
    and m.is_public = true
    and ((mp.is_public_visible = true and mp.availability_status = 'available')
      or exists (select 1 from public.vesalaporra_predictions saved
        where saved.match_id = mp.match_id and saved.user_id = auth.uid()
          and mp.player_id = any(saved.lineup_player_ids)))
    and mp.avatar_bucket_snapshot is not null
    and mp.avatar_path_snapshot is not null
  order by mp.roster_order, mp.display_name_snapshot;
$function$;
