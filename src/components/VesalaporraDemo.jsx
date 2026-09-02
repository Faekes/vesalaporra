import { useMemo, useState } from "react";
import "./VesalaporraDemo.css";

const DEMO_CONFIG = {
  brand: "TRIBUNA BLAUGRANA",
  claim: "El partit també es juga abans que comenci.",
  competition: "LLIGA · JORNADA 04",
  homeTeam: "BARCELONA",
  awayTeam: "VALÈNCIA",
  kickoff: "DIUMENGE · 21:00",
  sponsor: "LA TEVA MARCA",
};

const ranking = [
  { position: 1, name: "Marina Culer", handle: "@marinaculer", points: 128, trend: "+2" },
  { position: 2, name: "Pep de Gràcia", handle: "@pepcule", points: 121, trend: "−1" },
  { position: 3, name: "Laia 1899", handle: "@laia1899", points: 117, trend: "+1" },
  { position: 4, name: "Marc Nord", handle: "@marcnord", points: 111, trend: "=" },
];

const impact = [
  { value: "251", label: "participants per partit" },
  { value: "70%", label: "recurrència en 2 o més partits" },
  { value: "85%", label: "retenció entre jornades" },
  { value: "25", label: "lligues privades creades" },
];

function ScoreControl({ label, value, onChange, accent = false }) {
  return (
    <div className={`vlp-demo-score-team${accent ? " accent" : ""}`}>
      <span className="vlp-demo-score-label">{label}</span>
      <div className="vlp-demo-score-controls">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))} aria-label={`Restar un gol a ${label}`}>
          −
        </button>
        <strong>{value}</strong>
        <button type="button" onClick={() => onChange(Math.min(9, value + 1))} aria-label={`Afegir un gol a ${label}`}>
          +
        </button>
      </div>
    </div>
  );
}

export default function VesalaporraDemo() {
  const [activeView, setActiveView] = useState("prediction");
  const [homeScore, setHomeScore] = useState(2);
  const [awayScore, setAwayScore] = useState(1);
  const [predictionSent, setPredictionSent] = useState(false);

  const predictionLabel = useMemo(
    () => `${DEMO_CONFIG.homeTeam} ${homeScore} · ${awayScore} ${DEMO_CONFIG.awayTeam}`,
    [homeScore, awayScore],
  );

  const sendPrediction = () => {
    setPredictionSent(true);
    window.setTimeout(() => setActiveView("community"), 900);
  };

  return (
    <main className="vlp-demo-shell">
      <header className="vlp-demo-header">
        <a className="vlp-demo-brand" href="/demo" aria-label="Inici de la demo">
          <span className="vlp-demo-brand-mark">TB</span>
          <span>
            <strong>{DEMO_CONFIG.brand}</strong>
            <small>POWERED BY VESALAPORRA</small>
          </span>
        </a>

        <div className="vlp-demo-header-actions">
          <span className="vlp-demo-badge">DEMO COMERCIAL</span>
          <a className="vlp-demo-exit" href="/porra">VESALAPORRA ↗</a>
        </div>
      </header>

      <section className="vlp-demo-hero">
        <div className="vlp-demo-hero-copy">
          <span className="vlp-demo-eyebrow">UNA EXPERIÈNCIA PRÒPIA PER A LA TEVA COMUNITAT</span>
          <h1>{DEMO_CONFIG.claim}</h1>
          <p>
            Pronòstics, rànquing i patrocinadors dins una experiència amb la identitat del mitjà,
            podcast o comunitat.
          </p>
        </div>

        <div className="vlp-demo-live-pill">
          <i />
          PROPER PARTIT
        </div>
      </section>

      <nav className="vlp-demo-tabs" aria-label="Seccions de la demo">
        <button className={activeView === "prediction" ? "active" : ""} onClick={() => setActiveView("prediction")}>
          01 · LA PORRA
        </button>
        <button className={activeView === "community" ? "active" : ""} onClick={() => setActiveView("community")}>
          02 · COMUNITAT
        </button>
        <button className={activeView === "impact" ? "active" : ""} onClick={() => setActiveView("impact")}>
          03 · IMPACTE
        </button>
      </nav>

      {activeView === "prediction" && (
        <section className="vlp-demo-stage vlp-demo-prediction-stage">
          <article className="vlp-demo-match-card">
            <div className="vlp-demo-match-meta">
              <span>{DEMO_CONFIG.competition}</span>
              <strong>{DEMO_CONFIG.kickoff}</strong>
            </div>

            <div className="vlp-demo-scoreboard">
              <ScoreControl label={DEMO_CONFIG.homeTeam} value={homeScore} onChange={setHomeScore} accent />
              <span className="vlp-demo-score-divider">:</span>
              <ScoreControl label={DEMO_CONFIG.awayTeam} value={awayScore} onChange={setAwayScore} />
            </div>

            <div className="vlp-demo-prediction-extra">
              <div>
                <span>PROTAGONISTA</span>
                <strong>PEDRI</strong>
              </div>
              <div>
                <span>LOTTO FLICK</span>
                <strong>XI COMPLET</strong>
              </div>
            </div>

            <button className={`vlp-demo-primary${predictionSent ? " sent" : ""}`} type="button" onClick={sendPrediction}>
              {predictionSent ? "✓ PRONÒSTIC ENREGISTRAT" : "CONFIRMA EL PRONÒSTIC"}
            </button>
          </article>

          <aside className="vlp-demo-story-card">
            <span className="vlp-demo-card-index">01</span>
            <p className="vlp-demo-card-kicker">ABANS DEL PARTIT</p>
            <h2>Converteix cada jornada en una cita amb la teva marca.</h2>
            <p>
              La comunitat torna per jugar, comparar-se i compartir. Tu guanyes recurrència,
              dades pròpies i un nou espai comercial.
            </p>
            <div className="vlp-demo-mini-proof">
              <strong>2 minuts</strong>
              <span>per completar una porra</span>
            </div>
          </aside>
        </section>
      )}

      {activeView === "community" && (
        <section className="vlp-demo-stage vlp-demo-community-stage">
          <article className="vlp-demo-ranking-card">
            <div className="vlp-demo-section-heading">
              <div>
                <span>CLASSIFICACIÓ GENERAL</span>
                <h2>La rivalitat que fa tornar</h2>
              </div>
              <span className="vlp-demo-round">J04</span>
            </div>

            <div className="vlp-demo-ranking-list">
              {ranking.map((row) => (
                <div className="vlp-demo-ranking-row" key={row.position}>
                  <strong className="vlp-demo-position">{String(row.position).padStart(2, "0")}</strong>
                  <span className="vlp-demo-avatar">{row.name.slice(0, 1)}</span>
                  <span className="vlp-demo-person">
                    <strong>{row.name}</strong>
                    <small>{row.handle}</small>
                  </span>
                  <span className={`vlp-demo-trend${row.trend.startsWith("+") ? " up" : ""}`}>{row.trend}</span>
                  <strong className="vlp-demo-points">{row.points} <small>PTS</small></strong>
                </div>
              ))}
            </div>
          </article>

          <aside className="vlp-demo-community-copy">
            <span className="vlp-demo-card-index">02</span>
            <p className="vlp-demo-card-kicker">DESPRÉS DEL PARTIT</p>
            <h2>Una conversa que no s’acaba amb el xiulet final.</h2>
            <p>
              Rànquing general, jornada i lligues privades perquè cada grup tingui la seva pròpia batalla.
            </p>
            <div className="vlp-demo-confirmed-prediction">
              <span>EL TEU PRONÒSTIC</span>
              <strong>{predictionLabel}</strong>
            </div>
          </aside>
        </section>
      )}

      {activeView === "impact" && (
        <section className="vlp-demo-stage vlp-demo-impact-stage">
          <div className="vlp-demo-impact-copy">
            <span className="vlp-demo-card-index">03</span>
            <p className="vlp-demo-card-kicker">RESULTAT MESURABLE</p>
            <h2>Una activació que es pot explicar amb dades.</h2>
            <p>Dades reals de validació de Vesalaporra. La marca i el contingut d’aquesta pantalla són demostratius.</p>
          </div>

          <div className="vlp-demo-metrics">
            {impact.map((metric) => (
              <article key={metric.label}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </article>
            ))}
          </div>

          <article className="vlp-demo-sponsor-card">
            <span>PRESENTAT PER</span>
            <strong>{DEMO_CONFIG.sponsor}</strong>
            <p>Presència integrada abans, durant i després de cada jornada.</p>
            <button type="button" onClick={() => window.location.href = "/porra"}>
              VEURE VESALAPORRA EN DIRECTE
            </button>
          </article>
        </section>
      )}

      <footer className="vlp-demo-footer">
        <span>VESALAPORRA · PRODUCTE DIGITAL INDEPENDENT</span>
        <span>DADES FICTÍCIES EXCEPTE ELS INDICADORS DE VALIDACIÓ</span>
      </footer>
    </main>
  );
}
