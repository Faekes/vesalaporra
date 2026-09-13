import { useEffect, useMemo, useRef, useState } from "react";

const SCENES = [
  { key: "intro", duration: 1900 },
  { key: "total", duration: 3400 },
  { key: "result", duration: 4800 },
  { key: "lineup", duration: 7200 },
  { key: "protagonist", duration: 4800 },
  { key: "outro", duration: 5000 },
];

const FORMATION_4231 = [
  { id: "striker", slots: [0] },
  { id: "attacking-midfielders", slots: [1, 2, 3] },
  { id: "holding-midfielders", slots: [4, 5] },
  { id: "defenders", slots: [6, 7, 8, 9] },
  { id: "goalkeeper", slots: [10] },
];

const copyTextToClipboard = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";

  document.body.appendChild(textArea);
  textArea.select();

  const copied = document.execCommand("copy");
  textArea.remove();

  if (!copied) {
    throw new Error("No s’ha pogut copiar l’enllaç.");
  }
};

export default function PredictionClosingRecap({
  open,
  summary,
  match,
  homeBadgeBackground,
  awayBadgeBackground,
  onClose,
}) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [replayKey, setReplayKey] = useState(0);
  const [shareStatus, setShareStatus] = useState("idle");
  const stageRef = useRef(null);

  const lineupBySlot = useMemo(
    () =>
      Object.fromEntries(
        (summary?.consensusLineup || []).map((player) => [
          Number(player.slotIndex),
          player,
        ]),
      ),
    [summary?.consensusLineup],
  );

  const barcelonaFirst = match?.barcelonaFirst !== false;
  const mostVotedResult = summary?.mostVotedResult || null;
  const homeScore = barcelonaFirst
    ? mostVotedResult?.barcelonaGoals
    : mostVotedResult?.opponentGoals;
  const awayScore = barcelonaFirst
    ? mostVotedResult?.opponentGoals
    : mostVotedResult?.barcelonaGoals;
  const protagonist = summary?.mostVotedProtagonist || null;
  const scene = SCENES[sceneIndex]?.key || "intro";
  const totalDuration = SCENES.reduce(
    (total, item) => total + item.duration,
    0,
  );
  const elapsedBeforeScene = SCENES.slice(0, sceneIndex).reduce(
    (total, item) => total + item.duration,
    0,
  );
  const progress = Math.min(
    100,
    ((elapsedBeforeScene + SCENES[sceneIndex].duration * 0.5) /
      totalDuration) *
      100,
  );

  useEffect(() => {
    if (!open || !summary) {
      return undefined;
    }

    setSceneIndex(0);
    const timers = [];
    let elapsed = 0;

    SCENES.forEach((item, index) => {
      if (index > 0) {
        timers.push(
          window.setTimeout(() => setSceneIndex(index), elapsed),
        );
      }

      elapsed += item.duration;
    });

    return () => timers.forEach(window.clearTimeout);
  }, [open, replayKey, summary]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }

      if (event.key.toLowerCase() === "r") {
        setReplayKey((current) => current + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !summary) {
    return null;
  }

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await stageRef.current?.requestFullscreen?.();
      return;
    }

       await document.exitFullscreen?.();
  };

  const shareOnX = () => {
    const shareUrl = new URL(
      "/porra",
      "https://vesalaporra.cat",
    );

    shareUrl.searchParams.set("recap", "closing");
    shareUrl.searchParams.set("match", summary.matchId);

    const tweetText =
      `🔒 La porra ha tancat!\n\n` +
      `${summary.totalPredictions} porres confirmades. ` +
      `Descobreix el resultat, l’XI i el protagonista més votats 👇`;

    const twitterUrl =
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}` +
      `&url=${encodeURIComponent(shareUrl.toString())}`;

    window.open(
      twitterUrl,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div className="closing-recap-overlay" role="dialog" aria-modal="true">
      <style>{`
        .closing-recap-overlay{position:fixed;inset:0;z-index:999999;display:grid;place-items:center;padding:14px;background:rgba(2,5,17,.96);backdrop-filter:blur(14px)}
        .closing-recap-shell{display:flex;align-items:center;gap:14px;max-width:100%;max-height:100%}
        .closing-recap-stage{position:relative;width:min(900px,calc(100vw - 110px));height:min(900px,calc(100vh - 28px));overflow:hidden;isolation:isolate;color:#fff;border:1px solid rgba(247,215,92,.44);border-radius:28px;background:radial-gradient(circle at 50% 18%,rgba(247,215,92,.16),transparent 30%),radial-gradient(circle at 12% 82%,rgba(36,82,199,.3),transparent 38%),radial-gradient(circle at 92% 68%,rgba(165,0,68,.3),transparent 36%),linear-gradient(160deg,#171b2e 0%,#080b17 54%,#03050c 100%);box-shadow:0 35px 100px rgba(0,0,0,.76),0 0 55px rgba(247,215,92,.13);font-family:Inter,system-ui,sans-serif}
        .closing-recap-stage:before{content:"";position:absolute;inset:0;z-index:-2;opacity:.14;background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);background-size:36px 36px;mask-image:linear-gradient(to bottom,#000,transparent 94%)}
        .closing-recap-brand{position:absolute;top:22px;left:0;right:0;z-index:30;display:flex;align-items:center;justify-content:center;gap:9px;font-size:11px;font-weight:950;letter-spacing:.14em}
        .closing-recap-logo{display:grid;place-items:center;width:34px;height:34px;color:#ffe66d;border:2px solid #f7d75c;border-radius:50%;background:linear-gradient(135deg,#2147a5 0 50%,#a50044 50%);box-shadow:0 0 22px rgba(247,215,92,.28);font-size:20px;font-weight:1000}
        .closing-recap-scene{position:absolute;inset:0;display:grid;place-items:center;padding:72px 18px 28px;opacity:0;transform:scale(.965);pointer-events:none;transition:opacity .6s ease,transform .6s ease}
        .closing-recap-scene.active{opacity:1;transform:scale(1);pointer-events:auto}
        .closing-recap-center{text-align:center}
        .closing-recap-eyebrow{display:block;margin-bottom:13px;color:#f7d75c;font-size:10px;font-weight:950;letter-spacing:.15em;text-transform:uppercase}
        .closing-recap-title{margin:0;font-size:clamp(38px,10vw,56px);line-height:.92;letter-spacing:-.06em;text-transform:uppercase;text-shadow:0 12px 30px rgba(0,0,0,.42)}
        .closing-recap-subtitle{margin:18px 0 0;color:#abb3ca;font-size:14px;font-weight:750}
        .closing-recap-total-number{display:block;color:#f7d75c;font-size:112px;font-weight:1000;line-height:.88;text-shadow:0 0 42px rgba(247,215,92,.32)}
        .closing-recap-total-label{display:block;margin-top:18px;font-size:25px;font-weight:1000;letter-spacing:.05em;text-transform:uppercase}
        .closing-recap-card-scene{align-items:start;padding:84px 14px 32px}
        .closing-recap-card-wrap{width:100%;transform-origin:top center}
        .closing-recap-stage .prediction-card{width:100%;margin:0;box-sizing:border-box}
        .closing-recap-stage .score-card{padding:18px 14px}
        .closing-recap-stage .score-card .section-heading{margin-bottom:13px}
        .closing-recap-stage .score-match-overview{margin-bottom:13px}
        .closing-recap-stage .scoreboard{margin:0}
        .closing-recap-stage .score-control>button:not(.score-value){visibility:hidden}
        .closing-recap-stage .score-match-label{font-size:8px}
        .closing-recap-vote-pill{display:inline-flex;align-items:center;justify-content:center;margin-top:16px;padding:9px 14px;border:1px solid rgba(247,215,92,.34);border-radius:999px;background:rgba(247,215,92,.08);color:#f7d75c;font-size:10px;font-weight:950;letter-spacing:.08em}
        .closing-recap-stage .lineup-card{padding:13px 12px}
        .closing-recap-stage .lotto-heading{margin-bottom:9px}
        .closing-recap-stage .football-field{height:510px;min-height:0;margin:0}
        .closing-recap-stage .field-slot{cursor:default}
        .closing-recap-stage .field-player-name{max-width:68px}
        .closing-recap-slot-votes{position:absolute;right:-4px;bottom:-4px;z-index:7;display:grid;place-items:center;min-width:23px;height:23px;padding:0 4px;border:2px solid #091020;border-radius:999px;background:#f7d75c;color:#11162a;font-size:8px;font-weight:1000}
        .closing-recap-stage .protagonist-card{padding:20px 15px}
        .closing-recap-stage .protagonist-combined-rule{margin-top:12px}
        .closing-recap-stage .protagonist-selector-button{pointer-events:none}
        .closing-recap-stage .protagonist-combined-copy small{display:block}
        .closing-recap-progress{position:absolute;left:24px;right:24px;bottom:22px;z-index:40;height:3px;overflow:hidden;border-radius:99px;background:rgba(255,255,255,.1)}
        .closing-recap-progress span{display:block;width:var(--progress);height:100%;border-radius:inherit;background:linear-gradient(90deg,#2452c7,#a50044,#f7d75c);transition:width .6s ease}
        .closing-recap-actions{display:grid;gap:9px}
        .closing-recap-actions button{width:46px;height:46px;border:1px solid rgba(247,215,92,.28);border-radius:14px;background:#15192a;color:#fff;cursor:pointer;font-size:18px;box-shadow:0 10px 25px rgba(0,0,0,.3)}
        .closing-recap-actions button:hover{color:#f7d75c;border-color:#f7d75c}
        @media(max-width:600px){.closing-recap-shell{display:block}.closing-recap-actions{position:absolute;top:18px;right:18px;z-index:50;display:flex}.closing-recap-actions button{width:39px;height:39px;background:rgba(7,10,21,.92)}.closing-recap-stage .football-field{height:500px}}
        @media(prefers-reduced-motion:reduce){.closing-recap-scene{transition:none}}
      `}</style>

      <div className="closing-recap-shell">
        <div
          ref={stageRef}
          key={replayKey}
          className="closing-recap-stage"
          aria-label="Resum del tancament de la porra"
        >
          <div className="closing-recap-brand">
            <span className="closing-recap-logo">V</span>
            <span>VESALAPORRA</span>
          </div>

          <section
            className={`closing-recap-scene ${scene === "intro" ? "active" : ""}`}
          >
            <div className="closing-recap-center">
              <span className="closing-recap-eyebrow">PORRA TANCADA</span>
              <h2 className="closing-recap-title">La culerada ha parlat</h2>
              <p className="closing-recap-subtitle">
                Així veu el partit la comunitat de Vesalaporra
              </p>
            </div>
          </section>

          <section
            className={`closing-recap-scene ${scene === "total" ? "active" : ""}`}
          >
            <div className="closing-recap-center">
              <span className="closing-recap-eyebrow">PARTICIPACIÓ FINAL</span>
              <strong className="closing-recap-total-number">
                {summary.totalPredictions}
              </strong>
              <span className="closing-recap-total-label">porres fetes</span>
              <p className="closing-recap-subtitle">
                Gràcies per tornar-hi una jornada més 💙❤️
              </p>
            </div>
          </section>

          <section
            className={`closing-recap-scene closing-recap-card-scene ${scene === "result" ? "active" : ""}`}
          >
            <div className="closing-recap-card-wrap">
              <section className="prediction-card score-card">
                <div className="section-heading score-heading">
                  <div>
                    <h2>Resultat més votat</h2>
                  </div>
                  <span className="status-pill completed">CULERADA</span>
                </div>

                <div className="score-match-overview">
                  <div className="score-match-date">
                    <span>PRONÒSTIC DE LA COMUNITAT</span>
                    <strong>{match?.kickoffLabel || "PARTIT"}</strong>
                  </div>
                </div>

                <div className="scoreboard">
                  <div className="score-team home">
                    <div className="score-team-label">
                      <span
                        className="team-color-dot"
                        style={{ background: homeBadgeBackground }}
                        aria-hidden="true"
                      />
                      <span className="score-team-copy">
                        <strong>{match?.homeName || "Local"}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="score-center-controls">
                    <div className="score-control">
                      <button type="button" disabled aria-hidden="true">−</button>
                      <button type="button" className="score-value" disabled>
                        {homeScore ?? "–"}
                      </button>
                      <button type="button" disabled aria-hidden="true">+</button>
                    </div>
                    <span className="score-separator" aria-hidden="true">vs</span>
                    <div className="score-control">
                      <button type="button" disabled aria-hidden="true">−</button>
                      <button type="button" className="score-value" disabled>
                        {awayScore ?? "–"}
                      </button>
                      <button type="button" disabled aria-hidden="true">+</button>
                    </div>
                  </div>

                  <small className="score-match-label">EL PARTIT</small>

                  <div className="score-team away">
                    <div className="score-team-label">
                      <span
                        className="team-color-dot"
                        style={{ background: awayBadgeBackground }}
                        aria-hidden="true"
                      />
                      <span className="score-team-copy">
                        <strong>{match?.awayName || "Visitant"}</strong>
                        <small>{match?.awayCountry || ""}</small>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="closing-recap-center">
                  <span className="closing-recap-vote-pill">
                    {mostVotedResult?.voteCount || 0} VOTS
                  </span>
                </div>
              </section>
            </div>
          </section>

          <section
            className={`closing-recap-scene closing-recap-card-scene ${scene === "lineup" ? "active" : ""}`}
          >
            <div className="closing-recap-card-wrap">
              <section className="prediction-card lineup-card">
                <div className="section-heading lotto-heading">
                  <div className="lotto-heading-main">
                    <span className="flick-avatar-shell">
                      <img
                        src="/fcb/HANSI_FLICK.png"
                        className="flick-avatar"
                        alt="Hansi Flick"
                      />
                    </span>
                    <div className="lotto-title-copy">
                      <h2>La Lotto Flick</h2>
                      <span className="formation-label">XI MÉS VOTAT</span>
                    </div>
                  </div>
                  <span className="status-pill completed">
                    {summary.lineupPredictionCount} XI
                  </span>
                </div>

                <div className="football-field">
                  <div className="field-line halfway-line" />
                  <div className="field-circle" />
                  <div className="penalty-area penalty-area-top" />
                  <div className="penalty-area penalty-area-bottom" />

                  <div className="field-slots formation-4231">
                    {FORMATION_4231.map((line) => (
                      <div
                        key={line.id}
                        className={`formation-row formation-${line.id}`}
                      >
                        {line.slots.map((slotIndex) => {
                          const player = lineupBySlot[slotIndex];

                          return (
                            <div
                              key={slotIndex}
                              className={player ? "field-slot occupied" : "field-slot"}
                            >
                              {player ? (
                                <>
                                  <img
                                    src={player.image}
                                    className="field-player-image"
                                    alt=""
                                  />
                                  <small className="field-player-name">
                                    {player.shortName}
                                  </small>
                                  <span className="closing-recap-slot-votes">
                                    {player.voteCount}
                                  </span>
                                </>
                              ) : (
                                <span className="field-slot-plus">+</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </section>

          <section
            className={`closing-recap-scene closing-recap-card-scene ${scene === "protagonist" ? "active" : ""}`}
          >
            <div className="closing-recap-card-wrap">
              <section className="prediction-card protagonist-card">
                <div className="section-heading">
                  <div>
                    <h2>El protagonista</h2>
                  </div>
                  <span className="status-pill completed">MÉS VOTAT</span>
                </div>

                <div className="protagonist-combined-rule selector-selected selector-confirmed">
                  <button
                    type="button"
                    className="protagonist-selector-button selected confirmed"
                    disabled
                  >
                    {protagonist ? (
                      <span className="protagonist-selector-player">
                        <img src={protagonist.image} alt="" />
                        <span aria-hidden="true">★</span>
                      </span>
                    ) : (
                      <span className="protagonist-selector-star" aria-hidden="true">★</span>
                    )}
                  </button>

                  <div className="protagonist-combined-copy">
                    <span>LA CULERADA HA ESCOLLIT</span>
                    <strong>{protagonist?.displayName || "Sense protagonista"}</strong>
                    <small>
                      {protagonist
                        ? `${protagonist.voteCount} vots per marcar o assistir`
                        : "No s’ha votat cap protagonista"}
                    </small>
                  </div>

                  <span className="protagonist-binary-pill selected">
                    {protagonist?.voteCount || 0} VOTS
                  </span>
                </div>
              </section>
            </div>
          </section>

          <section
            className={`closing-recap-scene ${scene === "outro" ? "active" : ""}`}
          >
            <div className="closing-recap-center">
              <span className="closing-recap-eyebrow">TOT ESTÀ DECIDIT</span>
              <h2 className="closing-recap-title">Ara que parli la pilota</h2>
              <p className="closing-recap-subtitle">
                Molta sort, porrer@s! 🔥
              </p>
            </div>
          </section>

          <div
            className="closing-recap-progress"
            style={{ "--progress": `${progress}%` }}
            aria-hidden="true"
          >
            <span />
          </div>
        </div>

               <div className="closing-recap-actions">
          <button
            type="button"
            onClick={shareOnX}
            title="Comparteix a X"
            aria-label="Comparteix el resum a X"
          >
            𝕏
          </button>

          <button
            type="button"
            onClick={() => setReplayKey((current) => current + 1)}
            title="Torna a començar"
            aria-label="Torna a començar"
          >
            ↻
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            title="Pantalla completa"
            aria-label="Pantalla completa"
          >
            ⛶
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Tanca"
            aria-label="Tanca"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
