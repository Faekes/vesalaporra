import { useEffect, useMemo, useRef, useState } from "react";
import {
  downloadRecapMp4,
  restartRecapForExport,
} from "../lib/recapVideo.js";

const SCENE_TIMINGS = [
  { scene: "intro", at: 0 },
  { scene: "ranking", at: 2200 },
  { scene: "podium", at: 8000 },
  { scene: "winner", at: 12500 },
  { scene: "outro", at: 18000 },
];

const CONFETTI = Array.from({ length: 54 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  delay: `${(index % 12) * 0.09}s`,
  duration: `${2.2 + ((index * 13) % 18) / 10}s`,
  color: ["#f7d75c", "#a50044", "#2452c7", "#ffffff"][index % 4],
  rotate: `${(index * 47) % 360}deg`,
}));

const getInitials = (name) =>
  String(name || "VP")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

function RecapAvatar({ user, winner = false }) {
  const [failed, setFailed] = useState(false);
  const imageUrl = user?.twitterAvatarUrl;

  useEffect(() => {
    setFailed(false);
  }, [imageUrl]);

  return (
    <span className={winner ? "jrecap-avatar winner" : "jrecap-avatar"}>
      {!failed && imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <span>{getInitials(user?.displayName)}</span>
      )}
    </span>
  );
}

export default function JornadaRecap({
  open,
  users = [],
  jornadaNumber = null,
  onClose,
}) {
  const [scene, setScene] = useState("intro");
  const [replayKey, setReplayKey] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState("idle");
  const stageRef = useRef(null);

  const ranking = useMemo(
    () =>
      [...users]
        .filter((user) => user?.id)
        .sort(
          (firstUser, secondUser) =>
            Number(firstUser?.jornadaPosition || 999999) -
              Number(secondUser?.jornadaPosition || 999999) ||
            Number(secondUser?.jornada?.totalPoints || 0) -
              Number(firstUser?.jornada?.totalPoints || 0),
        )
        .slice(0, 10),
    [users],
  );

  const winner = ranking[0] || null;
  const second = ranking[1] || null;
  const third = ranking[2] || null;
  const chasingGroup = ranking.slice(3, 10);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    setScene("intro");

    const timers = SCENE_TIMINGS.slice(1).map(({ scene: nextScene, at }) =>
      window.setTimeout(() => setScene(nextScene), at),
    );

    return () => {
      timers.forEach(window.clearTimeout);
    };
  }, [open, replayKey]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }

      if (event.key.toLowerCase() === "r") {
        setReplayKey((currentKey) => currentKey + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const restart = () => {
    setReplayKey((currentKey) => currentKey + 1);
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await stageRef.current?.requestFullscreen?.();
      return;
    }

    await document.exitFullscreen?.();
  };

  const downloadVideo = async () => {
    if (downloadStatus === "working") {
      return;
    }

    setDownloadStatus("working");

    try {
      await restartRecapForExport(() =>
        setReplayKey((currentKey) => currentKey + 1),
      );
      await downloadRecapMp4({
        stage: stageRef.current,
        durationMs: 23_000,
        fileName: `vesalaporra-classificacio-jornada-${jornadaNumber || "actual"}.mp4`,
        soundCues: [
          { at: 0, type: "intro" },
          { at: 2200, type: "whoosh" },
          { at: 8000, type: "impact" },
          { at: 12500, type: "celebration" },
          { at: 18000, type: "reveal" },
        ],
      });
      setDownloadStatus("done");
    } catch (error) {
      console.error("No s’ha pogut descarregar el vídeo:", error);
      setDownloadStatus("error");
    }

    window.setTimeout(() => setDownloadStatus("idle"), 2600);
  };

  if (!open || !winner) {
    return null;
  }

  return (
    <div className="jrecap-overlay" role="dialog" aria-modal="true">
      <style>{`
        .jrecap-overlay {
          position: fixed;
          inset: 0;
          z-index: 999999;
          display: grid;
          place-items: center;
          padding: 14px;
          background: rgba(2, 5, 17, .94);
          backdrop-filter: blur(14px);
        }

        .jrecap-shell {
          display: flex;
          align-items: center;
          gap: 14px;
          max-width: 100%;
          max-height: 100%;
        }

        .jrecap-stage {
          position: relative;
          width: min(420px, calc(100vw - 28px));
          height: min(746px, calc(100vh - 28px));
          aspect-ratio: 9 / 16;
          overflow: hidden;
          isolation: isolate;
          color: #fff;
          border: 1px solid rgba(247, 215, 92, .4);
          border-radius: 28px;
          background:
            radial-gradient(circle at 50% 28%, rgba(165, 0, 68, .33), transparent 35%),
            radial-gradient(circle at 15% 85%, rgba(36, 82, 199, .28), transparent 38%),
            linear-gradient(160deg, #15192b 0%, #070a15 50%, #03050c 100%);
          box-shadow:
            0 35px 100px rgba(0, 0, 0, .75),
            0 0 50px rgba(247, 215, 92, .15);
          font-family: Inter, system-ui, sans-serif;
        }

        .jrecap-stage::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -2;
          opacity: .16;
          background-image:
            linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
          background-size: 36px 36px;
          mask-image: linear-gradient(to bottom, #000, transparent 90%);
        }

        .jrecap-glow {
          position: absolute;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          filter: blur(75px);
          opacity: .24;
          animation: jrecapFloat 6s ease-in-out infinite alternate;
        }

        .jrecap-glow.one {
          top: -90px;
          right: -100px;
          background: #f7d75c;
        }

        .jrecap-glow.two {
          bottom: -100px;
          left: -120px;
          background: #2452c7;
          animation-delay: -2s;
        }

        .jrecap-brand {
          position: absolute;
          top: 28px;
          left: 0;
          right: 0;
          z-index: 20;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: .14em;
        }

        .jrecap-logo {
          display: grid;
          place-items: center;
          width: 35px;
          height: 35px;
          color: #ffe66d;
          border: 2px solid #f7d75c;
          border-radius: 50%;
          background: linear-gradient(135deg, #2147a5 0 50%, #a50044 50%);
          box-shadow: 0 0 22px rgba(247, 215, 92, .28);
          font-size: 21px;
          font-weight: 1000;
        }

        .jrecap-scene {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          padding: 78px 27px 30px;
          text-align: center;
          opacity: 0;
          transform: scale(.96);
          pointer-events: none;
          transition: opacity .65s ease, transform .65s ease;
        }

        .jrecap-scene.active {
          opacity: 1;
          transform: scale(1);
        }

        .jrecap-eyebrow {
          display: block;
          margin-bottom: 13px;
          color: #f7d75c;
          font-size: 11px;
          font-weight: 950;
          letter-spacing: .16em;
        }

        .jrecap-intro h2,
        .jrecap-outro h2 {
          margin: 0;
          font-size: clamp(39px, 11vw, 58px);
          line-height: .92;
          letter-spacing: -.065em;
          text-transform: uppercase;
          text-shadow: 0 12px 30px rgba(0, 0, 0, .42);
        }

        .jrecap-intro p,
        .jrecap-outro p {
          margin: 20px 0 0;
          color: #abb3ca;
          font-size: 15px;
          font-weight: 750;
        }

        .jrecap-ranking-scene {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .jrecap-ranking-title {
          margin-bottom: 18px;
        }

        .jrecap-ranking-title strong {
          display: block;
          font-size: 29px;
          line-height: 1;
          letter-spacing: -.04em;
        }

        .jrecap-list {
          width: 100%;
          display: grid;
          gap: 7px;
        }

        .jrecap-row {
          display: grid;
          grid-template-columns: 29px 39px 1fr auto;
          align-items: center;
          gap: 9px;
          min-height: 54px;
          padding: 7px 12px 7px 8px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 15px;
          background: rgba(20, 24, 41, .8);
          box-shadow: 0 8px 22px rgba(0,0,0,.18);
          opacity: 0;
          transform: translateX(-35px);
          animation: jrecapRowIn .48s cubic-bezier(.2,.8,.2,1) forwards;
          animation-delay: var(--delay);
        }

        .jrecap-row-position {
          color: #8290b3;
          font-size: 13px;
          font-weight: 950;
        }

        .jrecap-row-name {
          min-width: 0;
          overflow: hidden;
          text-align: left;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-size: 12px;
          font-weight: 900;
        }

        .jrecap-row-points {
          color: #f7d75c;
          font-size: 16px;
          font-weight: 1000;
        }

        .jrecap-avatar {
          display: grid;
          place-items: center;
          width: 37px;
          height: 37px;
          overflow: hidden;
          flex: 0 0 auto;
          border: 2px solid #a50044;
          border-radius: 50%;
          background: linear-gradient(135deg, #2147a5, #a50044);
          color: white;
          font-size: 11px;
          font-weight: 950;
        }

        .jrecap-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .jrecap-podium {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          width: 100%;
          gap: 9px;
          padding-bottom: 50px;
        }

        .jrecap-podium-user {
          width: 31%;
          opacity: 0;
          animation: jrecapPodiumIn .7s cubic-bezier(.17,.84,.3,1.2) forwards;
        }

        .jrecap-podium-user.first {
          order: 2;
          animation-delay: 1.3s;
        }

        .jrecap-podium-user.second {
          order: 1;
          animation-delay: .25s;
        }

        .jrecap-podium-user.third {
          order: 3;
          animation-delay: .75s;
        }

        .jrecap-podium-user .jrecap-avatar {
          width: 64px;
          height: 64px;
          margin: 0 auto 10px;
          border-width: 3px;
        }

        .jrecap-podium-user.first .jrecap-avatar {
          width: 83px;
          height: 83px;
          border-color: #f7d75c;
          box-shadow: 0 0 30px rgba(247, 215, 92, .3);
        }

        .jrecap-podium-user strong {
          display: block;
          min-height: 32px;
          font-size: 11px;
          line-height: 1.15;
        }

        .jrecap-podium-points {
          display: block;
          margin: 5px 0 10px;
          color: #f7d75c;
          font-size: 16px;
          font-weight: 1000;
        }

        .jrecap-block {
          display: grid;
          place-items: center;
          height: 110px;
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 15px 15px 5px 5px;
          background: linear-gradient(180deg, #29304b, #131726);
          font-size: 26px;
          font-weight: 1000;
        }

        .jrecap-podium-user.first .jrecap-block {
          height: 160px;
          color: #ffffff;
          border-color: #f7d75c;
          background: linear-gradient(180deg, #ffe26a, #ba8520);
        }

        .jrecap-podium-user.second .jrecap-block {
          height: 125px;
        }

        .jrecap-podium-user.third .jrecap-block {
          height: 92px;
        }

        .jrecap-winner-content {
          position: relative;
          z-index: 5;
          width: 100%;
        }

        .jrecap-crown {
          display: block;
          margin-bottom: -12px;
          font-size: 70px;
          filter: drop-shadow(0 10px 18px rgba(247,215,92,.35));
          animation: jrecapCrown .8s cubic-bezier(.2,.8,.2,1.3) both;
        }

        .jrecap-avatar.winner {
          width: 132px;
          height: 132px;
          margin: 0 auto 22px;
          border: 5px solid #f7d75c;
          box-shadow:
            0 0 0 8px rgba(165,0,68,.7),
            0 0 55px rgba(247,215,92,.45);
          font-size: 30px;
          animation: jrecapWinnerAvatar .8s cubic-bezier(.2,.9,.2,1.2) both;
        }

        .jrecap-winner-content h2 {
          margin: 0 auto;
          max-width: 340px;
          font-size: 34px;
          line-height: .98;
          letter-spacing: -.045em;
          text-transform: uppercase;
        }

        .jrecap-winner-total {
          display: block;
          margin: 14px 0;
          color: #f7d75c;
          font-size: 54px;
          font-weight: 1000;
          line-height: 1;
          text-shadow: 0 0 30px rgba(247,215,92,.28);
        }

        .jrecap-winner-total small {
          display: block;
          margin-top: 5px;
          color: #fff;
          font-size: 11px;
          letter-spacing: .18em;
        }

        .jrecap-breakdown {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 7px;
          margin-top: 22px;
        }

        .jrecap-breakdown span {
          padding: 10px 5px;
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 13px;
          background: rgba(255,255,255,.055);
          color: #aeb6ce;
          font-size: 9px;
          font-weight: 900;
        }

        .jrecap-breakdown strong {
          display: block;
          margin-top: 4px;
          color: #fff;
          font-size: 18px;
        }

        .jrecap-confetti-piece {
          position: absolute;
          top: -30px;
          left: var(--left);
          z-index: 3;
          width: 8px;
          height: 14px;
          border-radius: 2px;
          background: var(--color);
          opacity: 0;
          transform: rotate(var(--rotate));
          animation: jrecapConfetti var(--duration) linear var(--delay) infinite;
        }

        .jrecap-actions {
          display: grid;
          gap: 9px;
        }

        .jrecap-actions button {
          width: 46px;
          height: 46px;
          border: 1px solid rgba(247,215,92,.28);
          border-radius: 14px;
          background: #15192a;
          color: #fff;
          cursor: pointer;
          font-size: 18px;
          box-shadow: 0 10px 25px rgba(0,0,0,.3);
        }

        .jrecap-actions button:hover {
          color: #f7d75c;
          border-color: #f7d75c;
        }

        @keyframes jrecapFloat {
          to { transform: translate3d(25px, 35px, 0) scale(1.18); }
        }

        @keyframes jrecapRowIn {
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes jrecapPodiumIn {
          from { opacity: 0; transform: translateY(100px) scale(.86); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes jrecapCrown {
          from { opacity: 0; transform: translateY(-60px) rotate(-12deg); }
          to { opacity: 1; transform: translateY(0) rotate(0); }
        }

        @keyframes jrecapWinnerAvatar {
          from { opacity: 0; transform: scale(.25) rotate(-15deg); }
          to { opacity: 1; transform: scale(1) rotate(0); }
        }

        @keyframes jrecapConfetti {
          0% { opacity: 0; transform: translateY(-20px) rotate(0); }
          12% { opacity: 1; }
          100% {
            opacity: .8;
            transform: translateY(800px) rotate(720deg);
          }
        }

        @media (max-width: 600px) {
          .jrecap-shell {
            display: block;
          }

          .jrecap-actions {
            position: absolute;
            top: 20px;
            right: 20px;
            z-index: 30;
            display: flex;
          }

          .jrecap-actions button {
            width: 39px;
            height: 39px;
            background: rgba(7,10,21,.88);
          }
        }
      `}</style>

      <div className="jrecap-shell">
        <div
          ref={stageRef}
          key={replayKey}
          className="jrecap-stage"
          aria-label={`Resum de la jornada ${jornadaNumber || ""}`}
        >
          <div className="jrecap-glow one" />
          <div className="jrecap-glow two" />

          <div className="jrecap-brand">
            <span className="jrecap-logo">V</span>
            <span>VESALAPORRA</span>
          </div>

          <section
            className={`jrecap-scene jrecap-intro ${
              scene === "intro" ? "active" : ""
            }`}
          >
            <div>
              <span className="jrecap-eyebrow">
                {jornadaNumber ? `JORNADA ${jornadaNumber}` : "VESALAPORRA"}
              </span>
              <h2>Jornada finalitzada</h2>
              <p>Així ha quedat la porra dels culers</p>
            </div>
          </section>

          <section
            className={`jrecap-scene jrecap-ranking-scene ${
              scene === "ranking" ? "active" : ""
            }`}
          >
            <div className="jrecap-ranking-title">
              <span className="jrecap-eyebrow">DEL TOP 10 AL PODI</span>
              <strong>LA CLASSIFICACIÓ</strong>
            </div>

            <div className="jrecap-list">
              {chasingGroup.map((user, index) => (
                <div
                  key={user.id}
                  className="jrecap-row"
                  style={{ "--delay": `${index * 0.25}s` }}
                >
                  <span className="jrecap-row-position">
                    #{user.jornadaPosition}
                  </span>

                  <RecapAvatar user={user} />

                  <span className="jrecap-row-name">{user.displayName}</span>

                  <strong className="jrecap-row-points">
                    {user.jornada.totalPoints}
                  </strong>
                </div>
              ))}
            </div>
          </section>

          <section
            className={`jrecap-scene ${
              scene === "podium" ? "active" : ""
            }`}
          >
            <div className="jrecap-podium">
              {winner && (
                <div className="jrecap-podium-user first">
                  <RecapAvatar user={winner} />
                  <strong>{winner.displayName}</strong>
                  <span className="jrecap-podium-points">
                    {winner.jornada.totalPoints} PTS
                  </span>
                  <div className="jrecap-block">1</div>
                </div>
              )}

              {second && (
                <div className="jrecap-podium-user second">
                  <RecapAvatar user={second} />
                  <strong>{second.displayName}</strong>
                  <span className="jrecap-podium-points">
                    {second.jornada.totalPoints} PTS
                  </span>
                  <div className="jrecap-block">2</div>
                </div>
              )}

              {third && (
                <div className="jrecap-podium-user third">
                  <RecapAvatar user={third} />
                  <strong>{third.displayName}</strong>
                  <span className="jrecap-podium-points">
                    {third.jornada.totalPoints} PTS
                  </span>
                  <div className="jrecap-block">3</div>
                </div>
              )}
            </div>
          </section>

          <section
            className={`jrecap-scene ${
              scene === "winner" ? "active" : ""
            }`}
          >
            {CONFETTI.map((piece) => (
              <span
                key={piece.id}
                className="jrecap-confetti-piece"
                style={{
                  "--left": piece.left,
                  "--delay": piece.delay,
                  "--duration": piece.duration,
                  "--color": piece.color,
                  "--rotate": piece.rotate,
                }}
              />
            ))}

            <div className="jrecap-winner-content">
              <span className="jrecap-crown">👑</span>
              <RecapAvatar user={winner} winner />

              <span className="jrecap-eyebrow">GUANYADOR/A DE LA JORNADA</span>
              <h2>{winner.displayName}</h2>

              <strong className="jrecap-winner-total">
                {winner.jornada.totalPoints}
                <small>PUNTS</small>
              </strong>

              <div className="jrecap-breakdown">
                <span>
                  RESULTAT
                  <strong>{winner.jornada.resultPoints}</strong>
                </span>

                <span>
                  LOTTO FLICK
                  <strong>{winner.jornada.xiPoints}</strong>
                </span>

                <span>
                  PROTAGONISTA
                  <strong>{winner.jornada.protagonistPoints}</strong>
                </span>
              </div>
            </div>
          </section>

          <section
            className={`jrecap-scene jrecap-outro ${
              scene === "outro" ? "active" : ""
            }`}
          >
            <div>
              <span className="jrecap-logo" style={{ margin: "0 auto 24px" }}>
                V
              </span>
              <span className="jrecap-eyebrow">VESALAPORRA</span>
              <h2>Ens veiem a la pròxima</h2>
              <p>La porra dels culers 🔥</p>
            </div>
          </section>
        </div>

        <div className="jrecap-actions">
          <button
            type="button"
            onClick={downloadVideo}
            disabled={downloadStatus === "working"}
            title={
              downloadStatus === "working"
                ? "Creant l’MP4…"
                : downloadStatus === "done"
                  ? "MP4 descarregat"
                  : downloadStatus === "error"
                    ? "No s’ha pogut crear l’MP4"
                    : "Descarrega el vídeo en MP4"
            }
            aria-label="Descarrega el resum de la jornada en MP4"
          >
            {downloadStatus === "working"
              ? "…"
              : downloadStatus === "done"
                ? "✓"
                : downloadStatus === "error"
                  ? "!"
                  : "⬇"}
          </button>

          <button type="button" onClick={restart} title="Torna a començar">
            ↻
          </button>

          <button type="button" onClick={toggleFullscreen} title="Pantalla completa">
            ⛶
          </button>

          <button type="button" onClick={onClose} title="Tanca">
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
