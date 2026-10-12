import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "./QuizAdmin.css";

export default function QuizAdmin() {
  const [catalog, setCatalog] = useState({ editions: [], matches: [] });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const { data, error: requestError } = await supabase.rpc("quiz14_admin_list");
    if (requestError) throw requestError;
    setCatalog({
      editions: Array.isArray(data?.editions) ? data.editions : [],
      matches: Array.isArray(data?.matches) ? data.matches : [],
    });
  }, []);

  useEffect(() => {
    let active = true;
    supabase.rpc("quiz14_admin_list").then(({ data, error: requestError }) => {
      if (!active) return;
      if (requestError) {
        setError("No s'ha pogut carregar la gestió dels quizzes.");
      } else {
        setCatalog({
          editions: Array.isArray(data?.editions) ? data.editions : [],
          matches: Array.isArray(data?.matches) ? data.matches : [],
        });
      }
    });
    return () => { active = false; };
  }, []);

  async function run(action) {
    if (busy) return;
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await action();
      await refresh();
    } catch (requestError) {
      setError(requestError?.message || "No s'ha pogut completar l'operació.");
    } finally {
      setBusy(false);
    }
  }

  async function publish(quiz) {
    if (!window.confirm(`Vols publicar «${quiz.title || "Quiz sense títol"}»? A partir d'aquest moment els participants podran jugar-hi.`)) return;
    await run(async () => {
      const { error: requestError } = await supabase.rpc("quiz14_admin_publish", { p_quiz_id: quiz.id });
      if (requestError) throw requestError;
      setMessage("Quiz publicat correctament. Ja és visible a la pàgina Quiz.");
    });
  }

  async function close(quiz) {
    if (!window.confirm(`Vols tancar «${quiz.title || "Quiz"}» i fixar-ne la classificació final?`)) return;
    await run(async () => {
      const { error: requestError } = await supabase.rpc("quiz14_close", { p_quiz_id: quiz.id });
      if (requestError) throw requestError;
      setMessage("Edició tancada i classificació final guardada.");
    });
  }

  const editions = catalog.editions;
  const openQuiz = editions.find((quiz) => quiz.published_at && !quiz.closed_at);
  const drafts = editions.filter((quiz) => !quiz.published_at && !quiz.closed_at);
  const published = editions.filter((quiz) => quiz.published_at && !quiz.closed_at);
  const archived = editions.filter((quiz) => quiz.closed_at);

  function matchName(quiz) {
    const match = catalog.matches.find((item) => item.id === quiz.match_id);
    if (!match) return "Partit no vinculat o no disponible";
    const opponent = match.opponent_display_name || "Rival";
    return match.barcelona_first ? `Barça – ${opponent}` : `${opponent} – Barça`;
  }

  function renderEdition(quiz) {
    const isDraft = !quiz.published_at && !quiz.closed_at;
    const isLive = !!quiz.published_at && !quiz.closed_at;
    const hasMatch = !!quiz.match_id;
    const participants = Number(quiz.participants || 0);
    return (
      <article className="qa-question" key={quiz.id} style={{ marginBottom: 14 }}>
        <header>
          <h3>{quiz.title || "Quiz sense títol"}</h3>
          <span aria-label="Estat del quiz" style={{ fontWeight: 700 }}>
            {quiz.closed_at ? "🏆 Finalitzat" : isLive ? "🟢 Publicat" : "🔒 Esborrany privat"}
          </span>
        </header>
        <p>{matchName(quiz)} · {participants} participants</p>
        {isDraft && <p>Les preguntes i les respostes estan ocultes en aquesta pantalla.</p>}
        <div className="qa-actions">
          {isDraft && (
            <button
              type="button"
              disabled={busy || !!openQuiz || !hasMatch || !quiz.title?.trim()}
              onClick={() => publish(quiz)}
            >
              🚀 Publicar quiz
            </button>
          )}
          {isLive && (
            <button type="button" disabled={busy} onClick={() => close(quiz)}>
              🔒 Tancar edició
            </button>
          )}
        </div>
        {isDraft && openQuiz && <p>Primer cal tancar el quiz actual per publicar aquest esborrany.</p>}
        {isDraft && !hasMatch && <p>Falta vincular aquesta edició a un partit abans de publicar-la.</p>}
      </article>
    );
  }

  return (
    <section className="qa-root" role="tabpanel">
      <header>
        <h2>Gestió dels quizzes</h2>
        <p>Consulta els quizzes preparats i publica'ls quan vulguis, sense veure les respostes.</p>
      </header>
      <div className="qa-actions">
        <button type="button" disabled={busy} onClick={() => run(async () => { setMessage("Llista actualitzada."); })}>
          ↻ Actualitzar llista
        </button>
      </div>
      {message && <p role="status" className="qa-message">{message}</p>}
      {error && <p role="alert" className="qa-message">{error}</p>}

      <h3>🔒 Preparats per publicar ({drafts.length})</h3>
      {drafts.length ? drafts.map(renderEdition) : <p>Encara no hi ha cap esborrany guardat.</p>}

      <h3>🟢 Quiz actius ({published.length})</h3>
      {published.length ? published.map(renderEdition) : <p>No hi ha cap quiz actiu.</p>}

      <h3>🏆 Historial ({archived.length})</h3>
      {archived.length ? archived.map(renderEdition) : <p>Encara no hi ha quizzes finalitzats.</p>}
    </section>
  );
}
