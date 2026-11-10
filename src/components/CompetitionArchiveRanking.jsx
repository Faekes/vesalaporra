import { useEffect, useId, useRef, useState } from "react";
import "./CompetitionArchiveRanking.css";

// Archived medals never use the current phase or the live multiplier cache.
function getArchivedAchievements(row, catalog) {
  const saved = Array.isArray(row.achievements)
    ? row.achievements
    : (row.achievement_keys || []).map((id) => ({
        id,
        multiplier: row.achievement_multipliers?.[id] || 1,
      }));
  return saved.map((achievement) => ({
    ...(catalog.find((definition) => definition.id === achievement.id) || { icon: "🏅" }),
    ...achievement,
    unlocked: true,
    multiplier: achievement.multiplier || 1,
  }));
}

export default function CompetitionArchiveRanking({
  archive, currentUserId, catalog, Avatar, AchievementIcons,
}) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();
  const phaseLabel = archive.phase === "apertura" ? "Apertura" : "Clausura";
  const seasonLabel = archive.season_key.replace("TEMPORADA_", "").replace("_", "/");
  const rows = Array.isArray(archive.standings) ? archive.standings : [];

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="competition-archive-link"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <span><strong>{phaseLabel} · {seasonLabel}</strong><small>Veure la classificació final</small></span>
        <span aria-hidden="true">↗</span>
      </button>
      <dialog
        ref={dialogRef}
        className="competition-archive-dialog"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onCancel={() => setOpen(false)}
        onClose={() => setOpen(false)}
        onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }}
      >
        <section className="competition-archive-content ranking-page">
          <header className="competition-archive-heading">
            <div>
              <span className="ranking-kicker">CLASSIFICACIÓ FINAL · {seasonLabel}</span>
              <h2 id={titleId}>{phaseLabel}</h2>
              <p id={descriptionId}>Punts i medalles tal com van quedar en tancar el torneig.</p>
            </div>
            <button type="button" className="competition-archive-close" onClick={() => setOpen(false)} autoFocus>
              ← TORNA A L’HISTORIAL
            </button>
          </header>
          <section className="ranking-board" aria-label={`Classificació final de l’${phaseLabel}`}>
            <header className="ranking-board-heading">
              <div><span>{phaseLabel.toUpperCase()} · {seasonLabel}</span></div>
              <small>{rows.length} PARTICIPANTS · FINAL</small>
            </header>
            <div role="table" aria-label={`Resultats finals ${phaseLabel} ${seasonLabel}`}>
              <div className="ranking-table-head" role="row">
                {["POS", "CULER", "RESULTAT", "XI", "PROTAGONISTA", "PTS"].map((label) => (
                  <span role="columnheader" key={label}>{label}</span>
                ))}
              </div>
              <div className="ranking-list" role="rowgroup">
                {rows.map((row) => {
                  const position = row.ranking_position;
                  const isCurrentUser = row.user_id === currentUserId;
                  const user = { displayName: row.display_name, twitterAvatarUrl: row.avatar_url };
                  const achievements = getArchivedAchievements(row, catalog);
                  const podiumMedal = { 1: "🥇", 2: "🥈", 3: "🥉" }[position];
                  return (
                    <article
                      key={row.user_id}
                      role="row"
                      aria-label={`Posició ${position}: ${row.display_name}`}
                      className={["ranking-row", position <= 3 ? "podium" : "", isCurrentUser ? "current-user" : ""].filter(Boolean).join(" ")}
                    >
                      <span role="cell" className="ranking-position" aria-label={`Posició ${position}`}>
                        {podiumMedal ? <span className="ranking-medal" aria-hidden="true">{podiumMedal}</span> : position}
                      </span>
                      <div role="cell" className="ranking-identity">
                        <Avatar user={user} />
                        <span className="ranking-identity-copy">
                          <strong>
                            <span className="ranking-name-text">{row.display_name}</span>
                            <AchievementIcons achievements={achievements} className="ranking-row-medals" />
                            {isCurrentUser && <span className="ranking-you-badge">TU</span>}
                          </strong>
                        </span>
                      </div>
                      <span role="cell" className="ranking-breakdown result" data-label="RESULTAT">{row.result_points}</span>
                      <span role="cell" className="ranking-breakdown xi" data-label="XI">{row.xi_points}</span>
                      <span role="cell" className="ranking-breakdown protagonist" data-label="PROTAGONISTA">{row.protagonist_points}</span>
                      <strong role="cell" className="ranking-total" data-label="PTS">{row.total_points}</strong>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        </section>
      </dialog>
    </>
  );
}
