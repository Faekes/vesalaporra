import { useEffect, useMemo, useRef, useState } from "react";
import {
  downloadRecapMp4,
  restartRecapForExport,
} from "../lib/recapVideo.js";

const NOTES_SCENE_TIMINGS = [
  { scene: "intro", at: 0 },
  { scene: "ranking", at: 2200 },
  { scene: "podium", at: 8000 },
  { scene: "mvp", at: 12500 },
  { scene: "outro", at: 18000 },
];

const NOTES_CONFETTI = Array.from({ length: 56 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  delay: `${(index % 14) * 0.08}s`,
  duration: `${2.2 + ((index * 11) % 16) / 10}s`,
  color: ["#f7d75c", "#a50044", "#2452c7", "#ffffff"][index % 4],
}));

const formatAverage = (average) =>
  Number(average || 0).toLocaleString("ca-ES", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

function NotesRecapPlayerImage({ row, mvp = false }) {
  const [failed, setFailed] = useState(false);
  const imageUrl = row?.player?.image;
  const playerName =
    row?.player?.shortName || row?.player?.name || "Jugador";

  useEffect(() => {
    setFailed(false);
  }, [imageUrl]);

  return (
    <span
      className={mvp ? "nrecap-player-image mvp" : "nrecap-player-image"}
      aria-hidden="true"
    >
      {!failed && imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <span>{playerName.charAt(0).toUpperCase()}</span>
      )}
    </span>
  );
}

export default function NotesRecap({
  open,
  rows = [],
  jornadaNumber = null,
  match = null,
  onClose,
}) {
  const [scene, setScene] = useState("intro");
  const [replayKey, setReplayKey] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState("idle");
  const stageRef = useRef(null);

  const ranking = useMemo(
    () =>
      [...rows]
        .filter(
          (row) =>
            row?.player?.id &&
            Number(row?.voteCount || 0) > 0,
        )
        .sort(
          (firstRow, secondRow) =>
            Number(secondRow.average || 0) -
              Number(firstRow.average || 0) ||
            Number(secondRow.voteCount || 0) -
              Number(firstRow.voteCount || 0) ||
            String(firstRow.player.name || "").localeCompare(
              String(secondRow.player.name || ""),
              "ca",
            ),
        )
        .slice(0, 10)
        .map((row, index) => ({
          ...row,
          recapPosition: index + 1,
        })),
    [rows],
  );

  const mvp = ranking[0] || null;
  const second = ranking[1] || null;
  const third = ranking[2] || null;
  const chasingGroup = ranking.slice(3, 10);

  const homeName = match?.homeName || "BARÇA";
  const awayName = match?.awayName || "RIVAL";

  const homeScore =
    match?.officialHomeScore ??
    mvp?.homeScore ??
    0;

  const awayScore =
    match?.officialAwayScore ??
    mvp?.awayScore ??
    0;

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    setScene("intro");

    const timers = NOTES_SCENE_TIMINGS.slice(1).map(
      ({ scene: nextScene, at }) =>
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

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

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
      document.body.style.overflow = previousOverflow;
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
      await downloadRecapMp4({
        stage: stageRef.current,
        durationMs: 23_000,
        fileName: `vesalaporra-notes-jornada-${
          jornadaNumber || "actual"
        }.mp4`,
        onCaptureReady: () =>
          restartRecapForExport(() =>
            setReplayKey((currentKey) => currentKey + 1),
          ),
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

  if (!open || !mvp) {
    return null;
  }

  return (
    <div className="nrecap-overlay" role="dialog" aria-modal="true">
      <style>{`
        .nrecap-overlay {
          position: fixed;
          inset: 0;
          z-index: 999999;
          display: grid;
          place-items: center;
          padding: 14px;
          background: rgba(2, 5, 17, 0.95);
          backdrop-filter: blur(14px);
        }

        .nrecap-shell {
          display: flex;
          align-items: center;
          gap: 14px;
          max-width: 100%;
          max-height: 100%;
        }

        .nrecap-stage {
          position: relative;
          width: min(420px, calc(100vw - 28px));
          height: min(746px, calc(100vh - 28px));
          aspect-ratio: 9 / 16;
          overflow: hidden;
          isolation: isolate;
          color: #ffffff;
          border: 1px solid rgba(247, 215, 92, 0.42);
          border-radius: 28px;
          background:
            radial-gradient(
              circle at 50% 25%,
              rgba(247, 215, 92, 0.17),
              transparent 32%
            ),
            radial-gradient(
              circle at 18% 78%,
              rgba(36, 82, 199, 0.3),
              transparent 38%
            ),
            radial-gradient(
              circle at 88% 65%,
              rgba(165, 0, 68, 0.25),
              transparent 35%
            ),
            linear-gradient(
              160deg,
              #171b2e 0%,
              #080b17 54%,
              #03050c 100%
            );
          box-shadow:
            0 35px 100px rgba(0, 0, 0, 0.76),
            0 0 55px rgba(247, 215, 92, 0.13);
          font-family: Inter, system-ui, sans-serif;
        }

        .nrecap-stage::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -2;
          opacity: 0.15;
          background-image:
            linear-gradient(
              rgba(255, 255, 255, 0.05) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.05) 1px,
              transparent 1px
            );
          background-size: 36px 36px;
          mask-image: linear-gradient(to bottom, #000000, transparent 92%);
        }

        .nrecap-brand {
          position: absolute;
          top: 27px;
          left: 0;
          right: 0;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 0.14em;
        }

        .nrecap-logo {
          display: grid;
          place-items: center;
          width: 35px;
          height: 35px;
          color: #ffe66d;
          -webkit-text-fill-color: #ffe66d;
          border: 2px solid #f7d75c;
          border-radius: 50%;
          background:
            linear-gradient(
              135deg,
              #2147a5 0 50%,
              #a50044 50%
            );
          box-shadow: 0 0 22px rgba(247, 215, 92, 0.28);
          font-size: 21px;
          font-weight: 1000;
        }

        .nrecap-scene {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          padding: 78px 27px 30px;
          color: #ffffff;
          text-align: center;
          opacity: 0;
          transform: scale(0.96);
          pointer-events: none;
          transition:
            opacity 0.65s ease,
            transform 0.65s ease;
        }

        .nrecap-scene.active {
          opacity: 1;
          transform: scale(1);
        }

        .nrecap-eyebrow {
          display: block;
          margin-bottom: 13px;
          color: #f7d75c;
          -webkit-text-fill-color: #f7d75c;
          font-size: 11px;
          font-weight: 950;
          letter-spacing: 0.16em;
        }

        .nrecap-intro h2,
        .nrecap-outro h2 {
          margin: 0;
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          font-size: clamp(39px, 11vw, 57px);
          line-height: 0.92;
          letter-spacing: -0.065em;
          text-transform: uppercase;
          text-shadow: 0 12px 30px rgba(0, 0, 0, 0.42);
        }

        .nrecap-score {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 15px;
          margin-top: 30px;
          padding: 17px;
          border: 1px solid rgba(255, 255, 255, 0.11);
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.055);
        }

        .nrecap-score-team {
          min-width: 0;
          overflow: hidden;
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          font-size: 11px;
          font-weight: 950;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .nrecap-score-result {
          color: #f7d75c;
          -webkit-text-fill-color: #f7d75c;
          font-size: 32px;
          font-weight: 1000;
          letter-spacing: -0.05em;
        }

        .nrecap-ranking-scene {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .nrecap-ranking-title {
          margin-bottom: 18px;
        }

        .nrecap-ranking-title strong {
          display: block;
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          font-size: 28px;
          line-height: 1;
          letter-spacing: -0.04em;
        }

        .nrecap-list {
          width: 100%;
          display: grid;
          gap: 7px;
        }

        .nrecap-row {
          display: grid;
          grid-template-columns: 29px 45px 1fr auto;
          align-items: center;
          gap: 9px;
          min-height: 55px;
          padding: 6px 12px 6px 7px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 15px;
          background: rgba(20, 24, 41, 0.82);
          box-shadow: 0 8px 22px rgba(0, 0, 0, 0.18);
          opacity: 0;
          transform: translateX(-35px);
          animation:
            nrecapRowIn 0.48s cubic-bezier(0.2, 0.8, 0.2, 1)
            forwards;
          animation-delay: var(--delay);
        }

        .nrecap-row-position {
          color: #8290b3;
          -webkit-text-fill-color: #8290b3;
          font-size: 13px;
          font-weight: 950;
        }

        .nrecap-row-name {
          min-width: 0;
          overflow: hidden;
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          text-align: left;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-size: 12px;
          font-weight: 900;
        }

        .nrecap-row-average {
          min-width: 43px;
          color: #f7d75c;
          -webkit-text-fill-color: #f7d75c;
          text-align: right;
          font-size: 18px;
          font-weight: 1000;
        }

        .nrecap-row-average small {
          display: block;
          color: #8f98b2;
          -webkit-text-fill-color: #8f98b2;
          font-size: 8px;
          font-weight: 850;
        }

        .nrecap-player-image {
          display: grid;
          place-items: center;
          width: 41px;
          height: 41px;
          overflow: hidden;
          border: 2px solid #a50044;
          border-radius: 50%;
          background: linear-gradient(145deg, #26366e, #a50044);
          color: #ffffff;
          -webkit-text-fill-color: #ffffff;
          font-size: 15px;
          font-weight: 950;
        }

        .nrecap-player-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .nrecap-podium {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          width: 100%;
          gap: 9px;
          padding-bottom: 45px;
        }

        .nrecap-podium-player {
          width: 31%;
          opacity: 0;
          animation:
            nrecapPodiumIn 0.7s cubic-bezier(0.17, 0.84, 0.3, 1.2)
            forwards;
        }

        .nrecap-podium-player.first {
          order: 2;
          animation-delay: 1.25s;
        }

        .nrecap-podium-player.second {
          order: 1;
          animation-delay: 0.25s;
        }

        .nrecap-podium-player.third {
          order: 3;
          animation-delay: 0.72s;
        }

        .nrecap-podium-player .nrecap-player-image {
          width: 65px;
          height: 65px;
          margin: 0 auto 10px;
          border-width: 3px;
        }

        .nrecap-podium-player.first .nrecap-player-image {
          width: 84px;
          height: 84px;
          border-color: #f7d75c;
          box-shadow: 0 0 30px rgba(247, 215, 92, 0.3);
        }

        .nrecap-podium-player strong {
          display: block;
          min-height: 32px;
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          font-size: 11px;
          line-height: 1.15;
        }

        .nrecap-podium-average {
          display: block;
          margin: 5px 0 10px;
          color: #f7d75c;
          -webkit-text-fill-color: #f7d75c;
          font-size: 18px;
          font-weight: 1000;
        }

        .nrecap-podium-average small {
          display: block;
          margin-top: 2px;
          color: #8f98b2;
          -webkit-text-fill-color: #8f98b2;
          font-size: 8px;
        }

        .nrecap-podium-block {
          display: grid;
          place-items: center;
          height: 108px;
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 15px 15px 5px 5px;
          background: linear-gradient(180deg, #29304b, #131726);
          font-size: 26px;
          font-weight: 1000;
        }

        .nrecap-podium-player.first .nrecap-podium-block {
          height: 160px;
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          border-color: #f7d75c;
          background: linear-gradient(180deg, #ffe26a, #ba8520);
        }

        .nrecap-podium-player.second .nrecap-podium-block {
          height: 125px;
        }

        .nrecap-podium-player.third .nrecap-podium-block {
          height: 92px;
        }

        .nrecap-mvp-content {
          position: relative;
          z-index: 5;
          width: 100%;
        }

        .nrecap-star {
          display: block;
          margin-bottom: -13px;
          color: #f7d75c;
          -webkit-text-fill-color: #f7d75c;
          font-size: 72px;
          line-height: 1;
          filter: drop-shadow(0 10px 18px rgba(247, 215, 92, 0.4));
          animation:
            nrecapStarIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1.3)
            both;
        }

        .nrecap-player-image.mvp {
          width: 144px;
          height: 144px;
          margin: 0 auto 22px;
          border: 5px solid #f7d75c;
          box-shadow:
            0 0 0 8px rgba(165, 0, 68, 0.72),
            0 0 60px rgba(247, 215, 92, 0.46);
          font-size: 36px;
          animation:
            nrecapMvpImage 0.8s cubic-bezier(0.2, 0.9, 0.2, 1.2)
            both;
        }

        .nrecap-mvp-content h2 {
          margin: 0 auto;
          max-width: 350px;
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          font-size: 36px;
          line-height: 0.98;
          letter-spacing: -0.045em;
          text-transform: uppercase;
        }

        .nrecap-mvp-average {
          display: block;
          margin: 14px 0;
          color: #f7d75c;
          -webkit-text-fill-color: #f7d75c;
          font-size: 58px;
          font-weight: 1000;
          line-height: 1;
          text-shadow: 0 0 30px rgba(247, 215, 92, 0.3);
        }

        .nrecap-mvp-average small {
          display: block;
          margin-top: 6px;
          color: #ffffff;
          -webkit-text-fill-color: #ffffff;
          font-size: 11px;
          letter-spacing: 0.17em;
        }

        .nrecap-mvp-data {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 20px;
        }

        .nrecap-mvp-data span {
          min-width: 82px;
          padding: 10px 8px;
          border: 1px solid rgba(255, 255, 255, 0.11);
          border-radius: 13px;
          background: rgba(255, 255, 255, 0.055);
          color: #aeb6ce;
          -webkit-text-fill-color: #aeb6ce;
          font-size: 9px;
          font-weight: 900;
        }

        .nrecap-mvp-data strong {
          display: block;
          margin-top: 4px;
          color: #ffffff;
          -webkit-text-fill-color: #ffffff;
          font-size: 17px;
        }

        .nrecap-confetti-piece {
          position: absolute;
          top: -30px;
          left: var(--left);
          z-index: 3;
          width: 8px;
          height: 14px;
          border-radius: 2px;
          background: var(--color);
          opacity: 0;
          animation:
            nrecapConfetti var(--duration) linear var(--delay)
            infinite;
        }

        .nrecap-outro p {
          margin: 20px 0 0;
          color: #abb3ca;
          -webkit-text-fill-color: #abb3ca;
          font-size: 15px;
          font-weight: 750;
        }

        .nrecap-actions {
          display: grid;
          gap: 9px;
        }

        .nrecap-actions button {
          width: 46px;
          height: 46px;
          border: 1px solid rgba(247, 215, 92, 0.28);
          border-radius: 14px;
          background: #15192a;
          color: #ffffff;
          cursor: pointer;
          font-size: 18px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }

        .nrecap-actions button:hover {
          color: #f7d75c;
          border-color: #f7d75c;
        }

        .nrecap-actions button:disabled {
          cursor: wait;
          opacity: 0.7;
        }

        @keyframes nrecapRowIn {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes nrecapPodiumIn {
          from {
            opacity: 0;
            transform: translateY(100px) scale(0.86);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes nrecapStarIn {
          from {
            opacity: 0;
            transform: translateY(-60px) rotate(-30deg) scale(0.3);
          }

          to {
            opacity: 1;
            transform: translateY(0) rotate(0) scale(1);
          }
        }

        @keyframes nrecapMvpImage {
          from {
            opacity: 0;
            transform: scale(0.25) rotate(-12deg);
          }

          to {
            opacity: 1;
            transform: scale(1) rotate(0);
          }
        }

        @keyframes nrecapConfetti {
          0% {
            opacity: 0;
            transform: translateY(-20px) rotate(0);
          }

          12% {
            opacity: 1;
          }

          100% {
            opacity: 0.8;
            transform: translateY(800px) rotate(720deg);
          }
        }

        @media (max-width: 600px) {
          .nrecap-shell {
            display: block;
          }

          .nrecap-actions {
            position: absolute;
            top: 20px;
            right: 20px;
            z-index: 30;
            display: flex;
          }

          .nrecap-actions button {
            width: 39px;
            height: 39px;
            background: rgba(7, 10, 21, 0.88);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .nrecap-row,
          .nrecap-podium-player,
          .nrecap-star,
          .nrecap-player-image.mvp {
            animation-duration: 0.01ms !important;
          }

          .nrecap-confetti-piece {
            display: none;
          }
        }
      `}</style>

      <div className="nrecap-shell">
        <div
          ref={stageRef}
          key={replayKey}
          className="nrecap-stage"
          aria-label={`Resum de les notes de la jornada ${
            jornadaNumber || ""
          }`}
        >
          <div className="nrecap-brand">
            <span className="nrecap-logo">V</span>
            <span>VESALAPORRA</span>
          </div>

          <section
            className={`nrecap-scene nrecap-intro ${
              scene === "intro" ? "active" : ""
            }`}
          >
            <div>
              <span className="nrecap-eyebrow">
                {jornadaNumber
                  ? `LES NOTES · JORNADA ${jornadaNumber}`
                  : "LES NOTES"}
              </span>

              <h2>La culerada ha parlat</h2>

              <div className="nrecap-score">
                <span className="nrecap-score-team">{homeName}</span>

                <strong className="nrecap-score-result">
                  {homeScore}–{awayScore}
                </strong>

                <span className="nrecap-score-team">{awayName}</span>
              </div>
            </div>
          </section>

          <section
            className={`nrecap-scene nrecap-ranking-scene ${
              scene === "ranking" ? "active" : ""
            }`}
          >
            <div className="nrecap-ranking-title">
              <span className="nrecap-eyebrow">
                DEL TOP 10 AL PODI
              </span>

              <strong>LES MILLORS NOTES</strong>
            </div>

            <div className="nrecap-list">
              {chasingGroup.map((row, index) => (
                <div
                  key={row.player.id}
                  className="nrecap-row"
                  style={{
                    "--delay": `${index * 0.25}s`,
                  }}
                >
                  <span className="nrecap-row-position">
                    #{row.recapPosition}
                  </span>

                  <NotesRecapPlayerImage row={row} />

                  <span className="nrecap-row-name">
                    {row.player.shortName || row.player.name}
                  </span>

                  <strong className="nrecap-row-average">
                    {formatAverage(row.average)}
                    <small>{row.voteCount} VOTS</small>
                  </strong>
                </div>
              ))}
            </div>
          </section>

          <section
            className={`nrecap-scene ${
              scene === "podium" ? "active" : ""
            }`}
          >
            <div className="nrecap-podium">
              {mvp && (
                <div className="nrecap-podium-player first">
                  <NotesRecapPlayerImage row={mvp} />

                  <strong>
                    {mvp.player.shortName || mvp.player.name}
                  </strong>

                  <span className="nrecap-podium-average">
                    {formatAverage(mvp.average)}
                    <small>{mvp.voteCount} VOTS</small>
                  </span>

                  <div className="nrecap-podium-block">1</div>
                </div>
              )}

              {second && (
                <div className="nrecap-podium-player second">
                  <NotesRecapPlayerImage row={second} />

                  <strong>
                    {second.player.shortName || second.player.name}
                  </strong>

                  <span className="nrecap-podium-average">
                    {formatAverage(second.average)}
                    <small>{second.voteCount} VOTS</small>
                  </span>

                  <div className="nrecap-podium-block">2</div>
                </div>
              )}

              {third && (
                <div className="nrecap-podium-player third">
                  <NotesRecapPlayerImage row={third} />

                  <strong>
                    {third.player.shortName || third.player.name}
                  </strong>

                  <span className="nrecap-podium-average">
                    {formatAverage(third.average)}
                    <small>{third.voteCount} VOTS</small>
                  </span>

                  <div className="nrecap-podium-block">3</div>
                </div>
              )}
            </div>
          </section>

          <section
            className={`nrecap-scene ${
              scene === "mvp" ? "active" : ""
            }`}
          >
            {NOTES_CONFETTI.map((piece) => (
              <span
                key={piece.id}
                className="nrecap-confetti-piece"
                style={{
                  "--left": piece.left,
                  "--delay": piece.delay,
                  "--duration": piece.duration,
                  "--color": piece.color,
                }}
              />
            ))}

            <div className="nrecap-mvp-content">
              <span className="nrecap-star">★</span>

              <NotesRecapPlayerImage row={mvp} mvp />

              <span className="nrecap-eyebrow">
                MVP DE LA CULERADA
              </span>

              <h2>{mvp.player.name}</h2>

              <strong className="nrecap-mvp-average">
                {formatAverage(mvp.average)}
                <small>NOTA MITJANA</small>
              </strong>

              <div className="nrecap-mvp-data">
                <span>
                  VOTACIONS
                  <strong>{mvp.voteCount}</strong>
                </span>

                {Number(mvp.stats?.goals || 0) > 0 && (
                  <span>
                    GOLS
                    <strong>{mvp.stats.goals}</strong>
                  </span>
                )}

                {Number(mvp.stats?.assists || 0) > 0 && (
                  <span>
                    ASSISTÈNCIES
                    <strong>{mvp.stats.assists}</strong>
                  </span>
                )}
              </div>
            </div>
          </section>

          <section
            className={`nrecap-scene nrecap-outro ${
              scene === "outro" ? "active" : ""
            }`}
          >
            <div>
              <span
                className="nrecap-logo"
                style={{ margin: "0 auto 24px" }}
              >
                V
              </span>

              <span className="nrecap-eyebrow">
                VESALAPORRA
              </span>

              <h2>La nota la poseu vosaltres</h2>

              <p>Ens veiem després del pròxim partit ⭐</p>
            </div>
          </section>
        </div>

        <div className="nrecap-actions">
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
            aria-label="Descarrega el resum de Les Notes en MP4"
          >
            {downloadStatus === "working"
              ? "…"
              : downloadStatus === "done"
                ? "✓"
                : downloadStatus === "error"
                  ? "!"
                  : "⬇"}
          </button>

          <button
            type="button"
            onClick={restart}
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