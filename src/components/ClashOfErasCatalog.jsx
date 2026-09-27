import { useState } from "react";
import catalog from "../data/coe-catalog.json";

const gameOrigin = "https://lliga-epoques-prova.boltxevic.chatgpt.site/";

export default function ClashOfErasCatalog() {
  const [selectedId, setSelectedId] = useState(null);
  const [showTeams, setShowTeams] = useState(false);
  const openTeams = () => {
    setShowTeams(true);
    requestAnimationFrame(() => document.getElementById("coe-teams")?.scrollIntoView({ behavior: "smooth" }));
  };
  const selected = catalog.teams.find((team) => team.id === selectedId);

  return (
    <section className="coe-page" aria-label="Clash of Eras">
      <div className="coe-content">
        <div className="coe-title-frame">
          <div className="coe-title-topline"><span>CLASH OF ERAS <b>·</b> EDICIÓ DE PROVA</span><span>LA COPA DE LES ÈPOQUES</span></div>
          <div className="coe-title-stage">
            <div className="coe-title-copy">
              <div className="coe-title-kicker">El torneig de les èpoques</div>
              <h1 className="coe-title-logo"><span>CLASH</span><span>OF ERAS</span></h1>
              <p className="coe-title-lead">Vint Barças. Una Copa. Quin equip portaries fins a la final?</p>
              <div className="coe-title-actions">
                <button type="button" className="coe-title-play" onClick={openTeams}>JUGAR <span aria-hidden="true">›</span></button>
                <button type="button" className="coe-title-pick" onClick={openTeams}>ESCULL EQUIP <span aria-hidden="true">↗</span></button>
              </div>
              <p className="coe-title-progress">Tria una època i comença el torneig.</p>
            </div>
            <div className="coe-title-console" aria-hidden="true">
              <div className="coe-title-console-head">La final · Copa de les Èpoques</div>
              <div className="coe-title-console-body"><div className="coe-title-console-score"><span>DREAM TEAM</span><strong>?</strong></div><div className="coe-title-console-vs">VS</div><div className="coe-title-console-score"><span>FLICKWAGEN</span><strong>?</strong></div></div>
            </div>
          </div>
          <div className="coe-title-bottom"><div><b>20</b> ÈPOQUES</div><div><b>16</b> EQUIPS PER COPA</div><div><b>4</b> RONDES</div></div>
        </div>

        {!showTeams ? null : selected ? (
          <div className="coe-detail" id="coe-teams">
            <button className="coe-back" type="button" onClick={() => setSelectedId(null)}>← Tots els equips</button>
            <div className="coe-detail-head">
              <div>
                <p className="coe-detail-meta">{selected.years} · {selected.coach}</p>
                <h2>{selected.name}</h2>
                <p className="coe-systems">Sistemes: {selected.systems.join(" · ")}</p>
              </div>
              <a className="coe-play-button" href={`${gameOrigin}?team=${encodeURIComponent(selected.id)}`} target="_blank" rel="noopener noreferrer">Jugar ↗</a>
            </div>
            <div className="coe-roster" aria-label={`Plantilla de ${selected.name}`}>
              {selected.players.map((player, index) => (
                <div className="coe-player" key={`${selected.id}-${index}`}>
                  <span className="coe-player-position">{player.position}</span>
                  <span className="coe-player-name">{player.name}</span>
                  <strong className="coe-player-rating">{player.rating}</strong>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="coe-catalog" id="coe-teams">
            <h2>Escull el teu Barça</h2>
            <div className="coe-team-grid">
              {catalog.teams.map((team) => (
                <button className="coe-team" type="button" key={team.id} onClick={() => setSelectedId(team.id)}>
                  <span className="coe-team-years">{team.years}</span>
                  <strong>{team.name}</strong>
                  <span>{team.coach}</span>
                  <span className="coe-team-systems">{team.systems.join(" · ")} <span aria-hidden="true">→</span></span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
