import { useEffect, useState } from 'react'
import './App.css'

const players = [
  {
    id: 'karim-adeyemi',
    name: 'Karim Adeyemi',
    shortName: 'Adeyemi',
    image: '/fcb/KARIM_ADEYEMI.png',
  },
  {
    id: 'alejandro-balde',
    name: 'Alejandro Balde',
    shortName: 'Balde',
    image: '/fcb/ALEJANDRO_BALDE.png',
  },
  {
    id: 'andreas-christensen',
    name: 'Andreas Christensen',
    shortName: 'Christensen',
    image: '/fcb/ANDREAS_CHRISTENSEN.png',
  },
  {
    id: 'anthony-gordon',
    name: 'Anthony Gordon',
    shortName: 'Gordon',
    image: '/fcb/ANTHONY_GORDON.png',
  },
  {
    id: 'dani-olmo',
    name: 'Dani Olmo',
    shortName: 'Dani Olmo',
    image: '/fcb/DANI_OLMO.png',
  },
  {
    id: 'eric-garcia',
    name: 'Eric Garcia',
    shortName: 'Eric',
    image: '/fcb/ERIC_GARCIA.png',
  },
  {
    id: 'fermin-lopez',
    name: 'Fermín López',
    shortName: 'Fermín',
    image: '/fcb/FERMIN_LOPEZ.png',
  },
  {
    id: 'ferran-torres',
    name: 'Ferran Torres',
    shortName: 'Ferran',
    image: '/fcb/FERRAN_TORRES.png',
  },
  {
    id: 'frenkie-de-jong',
    name: 'Frenkie de Jong',
    shortName: 'De Jong',
    image: '/fcb/FRENKIE_DE_JONG.png',
  },
  {
    id: 'gavi',
    name: 'Gavi',
    shortName: 'Gavi',
    image: '/fcb/GAVI.png',
  },
  {
    id: 'gerard-martin',
    name: 'Gerard Martín',
    shortName: 'Gerard',
    image: '/fcb/GERARD_MARTIN.png',
  },
  {
    id: 'joan-garcia',
    name: 'Joan García',
    shortName: 'Joan García',
    image: '/fcb/JOAN_GARCIA.png',
    isGoalkeeper: true,
  },
  {
    id: 'joao-cancelo',
    name: 'João Cancelo',
    shortName: 'Cancelo',
    image: '/fcb/JOAO_CANCELO.png',
  },
  {
    id: 'jofre-torrents',
    name: 'Jofre Torrents',
    shortName: 'Jofre',
    image: '/fcb/JOFRE_TORRENTS.png',
  },
  {
    id: 'jules-kounde',
    name: 'Jules Koundé',
    shortName: 'Koundé',
    image: '/fcb/JULES_KOUNDE.png',
  },
  {
    id: 'lamine-yamal',
    name: 'Lamine Yamal',
    shortName: 'Lamine',
    image: '/fcb/LAMINE_YAMAL.png',
  },
  {
    id: 'marc-bernal',
    name: 'Marc Bernal',
    shortName: 'Bernal',
    image: '/fcb/MARC_BERNAL.png',
  },
  {
    id: 'marc-casado',
    name: 'Marc Casadó',
    shortName: 'Casadó',
    image: '/fcb/MARC_CASADO.png',
  },
  {
    id: 'pau-cubarsi',
    name: 'Pau Cubarsí',
    shortName: 'Cubarsí',
    image: '/fcb/PAU_CUBARSI.png',
  },
  {
    id: 'pedri',
    name: 'Pedri',
    shortName: 'Pedri',
    image: '/fcb/PEDRI.png',
  },
  {
    id: 'raphinha',
    name: 'Raphinha',
    shortName: 'Raphinha',
    image: '/fcb/RAPHINHA.png',
  },
  {
    id: 'ronald-araujo',
    name: 'Ronald Araújo',
    shortName: 'Araújo',
    image: '/fcb/RONALD_ARAUJO.png',
  },
  {
    id: 'wojciech-szczesny',
    name: 'Wojciech Szczęsny',
    shortName: 'Szczęsny',
    image: '/fcb/WOJCIECH_SZCZESNY.png',
    isGoalkeeper: true,
  },
]

const playersById = Object.fromEntries(
  players.map((player) => [player.id, player]),
)

const protagonistScoringByPlayerId = {
  'lamine-yamal': {
    groupLabel: 'YAMAL SPECIAL',
    groupKey: 'special',
    goalContributions: 41,
    hitPoints: 5,
    missPoints: -15,
    order: 1,
  },
  'fermin-lopez': {
    groupLabel: 'GRUP A',
    groupKey: 'a',
    goalContributions: 30,
    hitPoints: 10,
    missPoints: -10,
    order: 2,
  },
  raphinha: {
    groupLabel: 'GRUP A',
    groupKey: 'a',
    goalContributions: 26,
    hitPoints: 10,
    missPoints: -10,
    order: 3,
  },
  'ferran-torres': {
    groupLabel: 'GRUP A',
    groupKey: 'a',
    goalContributions: 23,
    hitPoints: 10,
    missPoints: -10,
    order: 4,
  },
  'anthony-gordon': {
    groupLabel: 'GRUP A',
    groupKey: 'a',
    goalContributions: 22,
    hitPoints: 10,
    missPoints: -10,
    order: 5,
  },
  'dani-olmo': {
    groupLabel: 'GRUP B',
    groupKey: 'b',
    goalContributions: 17,
    hitPoints: 20,
    missPoints: -10,
    order: 6,
  },
  'karim-adeyemi': {
    groupLabel: 'GRUP B',
    groupKey: 'b',
    goalContributions: 16,
    hitPoints: 20,
    missPoints: -10,
    order: 7,
  },
  pedri: {
    groupLabel: 'GRUP B',
    groupKey: 'b',
    goalContributions: 13,
    hitPoints: 20,
    missPoints: -10,
    order: 8,
  },
  'frenkie-de-jong': {
    groupLabel: 'GRUP C',
    groupKey: 'c',
    goalContributions: 9,
    hitPoints: 30,
    missPoints: -10,
    order: 9,
  },
  'jules-kounde': {
    groupLabel: 'GRUP C',
    groupKey: 'c',
    goalContributions: 7,
    hitPoints: 30,
    missPoints: -10,
    order: 10,
  },
  'marc-bernal': {
    groupLabel: 'GRUP C',
    groupKey: 'c',
    goalContributions: 6,
    hitPoints: 30,
    missPoints: -10,
    order: 11,
  },
  'joao-cancelo': {
    groupLabel: 'GRUP D',
    groupKey: 'd',
    goalContributions: 4,
    hitPoints: 40,
    missPoints: -5,
    order: 12,
  },
  'ronald-araujo': {
    groupLabel: 'GRUP D',
    groupKey: 'd',
    goalContributions: 4,
    hitPoints: 40,
    missPoints: -5,
    order: 13,
  },
  'eric-garcia': {
    groupLabel: 'GRUP D',
    groupKey: 'd',
    goalContributions: 3,
    hitPoints: 40,
    missPoints: -5,
    order: 14,
  },
  'alejandro-balde': {
    groupLabel: 'GRUP D',
    groupKey: 'd',
    goalContributions: 3,
    hitPoints: 40,
    missPoints: -5,
    order: 15,
  },
  gavi: {
    groupLabel: 'GRUP E',
    groupKey: 'e',
    goalContributions: 1,
    hitPoints: 50,
    missPoints: -5,
    order: 16,
  },
  'gerard-martin': {
    groupLabel: 'GRUP E',
    groupKey: 'e',
    goalContributions: 1,
    hitPoints: 50,
    missPoints: -5,
    order: 17,
  },
  'marc-casado': {
    groupLabel: 'GRUP E',
    groupKey: 'e',
    goalContributions: 1,
    hitPoints: 50,
    missPoints: -5,
    order: 18,
  },
  'pau-cubarsi': {
    groupLabel: 'GRUP E',
    groupKey: 'e',
    goalContributions: 1,
    hitPoints: 50,
    missPoints: -5,
    order: 19,
  },
  'andreas-christensen': {
    groupLabel: 'GRUP E',
    groupKey: 'e',
    goalContributions: 0,
    hitPoints: 50,
    missPoints: -5,
    order: 20,
  },
  'jofre-torrents': {
    groupLabel: 'GRUP E',
    groupKey: 'e',
    goalContributions: 0,
    hitPoints: 50,
    missPoints: -5,
    order: 21,
  },
}

const matchData = {
  homeName: 'Barça',
  homeShortName: 'BARÇA',
  homeCrest:
    'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg',
  awayName: 'Al-Ahly',
  awayShortName: 'AL-AHLY',
  awayCountry: 'Egipte',
  awayCrest:
    'https://upload.wikimedia.org/wikipedia/ar/2/21/Al_Ahly_SC_logo_23.svg',
  kickoffLabel: 'DIMECRES · 19 AGOST 2026 · 21:00',
  kickoffAt: '2026-08-19T21:00:00+02:00',
}

const getCountdown = () => {
  const remainingMilliseconds = Math.max(
    0,
    new Date(matchData.kickoffAt).getTime() -
      Date.now(),
  )

  const totalSeconds = Math.floor(
    remainingMilliseconds / 1000,
  )

  const days = Math.floor(
    totalSeconds / 86400,
  )

  const hours = Math.floor(
    (totalSeconds % 86400) / 3600,
  )

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60,
  )

  const seconds = totalSeconds % 60

  return {
    days,
    hours,
    minutes,
    seconds,
    isClosed: remainingMilliseconds <= 0,
  }
}

const formation433 = [
  {
    id: 'forwards',
    label: 'Davanters',
    slots: [0, 1, 2],
  },
  {
    id: 'midfielders',
    label: 'Migcampistes',
    slots: [3, 4, 5],
  },
  {
    id: 'defenders',
    label: 'Defenses',
    slots: [6, 7, 8, 9],
  },
  {
    id: 'goalkeeper',
    label: 'Porter',
    slots: [10],
  },
]

function App() {
  const [activePage, setActivePage] = useState('play')
  const [barcaScore, setBarcaScore] = useState(0)
  const [rivalScore, setRivalScore] = useState(0)
  const [scoreTouched, setScoreTouched] =
    useState(false)

  const [lineup, setLineup] = useState(
    Array.from({ length: 11 }, () => null),
  )

  const [selectedSlotIndex, setSelectedSlotIndex] =
    useState(null)

  const [selectedPlayerId, setSelectedPlayerId] =
    useState(null)

  const [protagonistId, setProtagonistId] =
    useState(null)

  const [openInfoSection, setOpenInfoSection] =
    useState(null)

  const [countdown, setCountdown] =
    useState(getCountdown)

  const lineupCount = lineup.filter(Boolean).length
  const lineupIsComplete = lineupCount === 11

  const eligibleProtagonistPlayers = players
    .filter(
      (player) =>
        !player.isGoalkeeper &&
        protagonistScoringByPlayerId[player.id],
    )
    .sort(
      (firstPlayer, secondPlayer) =>
        protagonistScoringByPlayerId[firstPlayer.id]
          .order -
        protagonistScoringByPlayerId[secondPlayer.id]
          .order,
    )

  const protagonist = protagonistId
    ? playersById[protagonistId]
    : null

  const protagonistScoring = protagonistId
    ? protagonistScoringByPlayerId[protagonistId]
    : null

  const protagonistIsComplete = Boolean(
    protagonist && protagonistScoring,
  )

  const confirmButtonLabel = countdown.isClosed
    ? 'PORRA TANCADA'
    : !scoreTouched
      ? 'PRONOSTICA EL RESULTAT'
      : lineupIsComplete &&
          protagonistIsComplete
        ? 'CONFIRMAR PORRA COMPLETA'
        : lineupIsComplete
          ? 'CONFIRMAR RESULTAT + XI'
          : protagonistIsComplete
            ? 'CONFIRMAR RESULTAT + PROTAGONISTA'
            : 'CONFIRMAR RESULTAT'

  const toggleInfoSection = (sectionId) => {
    setOpenInfoSection(
      (currentSectionId) =>
        currentSectionId === sectionId
          ? null
          : sectionId,
    )
  }

  useEffect(() => {
    const countdownInterval = window.setInterval(
      () => {
        setCountdown(getCountdown())
      },
      1000,
    )

    return () =>
      window.clearInterval(countdownInterval)
  }, [])

  useEffect(() => {
    if (!protagonistId) {
      return
    }

    const protagonistPlayer =
      playersById[protagonistId]

    const isStillEligible =
      protagonistPlayer &&
      !protagonistPlayer.isGoalkeeper &&
      Boolean(
        protagonistScoringByPlayerId[
          protagonistId
        ],
      )

    if (!isStillEligible) {
      setProtagonistId(null)
    }
  }, [protagonistId])

  const placePlayerInSlot = (
    playerId,
    targetSlotIndex,
  ) => {
    if (!playersById[playerId]) {
      return
    }

    setLineup((currentLineup) => {
      const nextLineup = [...currentLineup]

      const sourceSlotIndex =
        nextLineup.indexOf(playerId)

      const displacedPlayerId =
        nextLineup[targetSlotIndex]

      if (sourceSlotIndex === targetSlotIndex) {
        return currentLineup
      }

      if (sourceSlotIndex !== -1) {
        nextLineup[sourceSlotIndex] =
          displacedPlayerId
      }

      nextLineup[targetSlotIndex] = playerId

      return nextLineup
    })

    setSelectedSlotIndex(null)
    setSelectedPlayerId(null)
  }

  const removePlayerFromLineup = (playerId) => {
    if (!playersById[playerId]) {
      return
    }

    setLineup((currentLineup) =>
      currentLineup.map(
        (currentPlayerId) =>
          currentPlayerId === playerId
            ? null
            : currentPlayerId,
      ),
    )

    setSelectedSlotIndex(null)
    setSelectedPlayerId(null)
  }

  const handleSlotClick = (slotIndex) => {
    const fieldPlayerId = lineup[slotIndex]

    if (selectedPlayerId) {
      if (
        fieldPlayerId &&
        selectedPlayerId ===
          fieldPlayerId
      ) {
        removePlayerFromLineup(
          fieldPlayerId,
        )

        return
      }

      placePlayerInSlot(
        selectedPlayerId,
        slotIndex,
      )

      return
    }

    if (fieldPlayerId) {
      setSelectedPlayerId(
        fieldPlayerId,
      )
      setSelectedSlotIndex(null)

      return
    }

    setSelectedSlotIndex(
      (currentSlotIndex) =>
        currentSlotIndex === slotIndex
          ? null
          : slotIndex,
    )
  }

  const handlePlayerClick = (playerId) => {
    const isInLineup =
      lineup.includes(playerId)

    if (
      isInLineup &&
      selectedPlayerId ===
        playerId
    ) {
      removePlayerFromLineup(
        playerId,
      )

      return
    }

    if (selectedSlotIndex !== null) {
      placePlayerInSlot(
        playerId,
        selectedSlotIndex,
      )

      return
    }

    setSelectedPlayerId(
      (currentPlayerId) =>
        currentPlayerId === playerId
          ? null
          : playerId,
    )
  }

  const handlePlayerBadgeDrop = (
    event,
    targetPlayerId,
  ) => {
    event.preventDefault()

    const draggedPlayerId =
      event.dataTransfer.getData(
        'text/plain',
      )

    if (
      draggedPlayerId ===
        targetPlayerId &&
      lineup.includes(
        draggedPlayerId,
      )
    ) {
      removePlayerFromLineup(
        draggedPlayerId,
      )
    }
  }

  const handleDragStart = (
    event,
    playerId,
  ) => {
    event.dataTransfer.setData(
      'text/plain',
      playerId,
    )

    event.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = (
    event,
    targetSlotIndex,
  ) => {
    event.preventDefault()

    const playerId =
      event.dataTransfer.getData(
        'text/plain',
      )

    if (!playersById[playerId]) {
      return
    }

    placePlayerInSlot(
      playerId,
      targetSlotIndex,
    )
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">
            V
          </span>

          <div className="brand-copy">
            <strong>
              VESALAPORRA
            </strong>

            <span>
              La porra dels culers
            </span>
          </div>
        </div>

        <nav
          className="main-nav"
          aria-label="Navegació principal"
        >
          <button
            type="button"
            className={
              activePage === 'play'
                ? 'nav-button active'
                : 'nav-button'
            }
            onClick={() =>
              setActivePage('play')
            }
          >
            JUGA
          </button>

          <button
            type="button"
            className={
              activePage === 'ranking'
                ? 'nav-button active'
                : 'nav-button'
            }
            onClick={() =>
              setActivePage('ranking')
            }
          >
            RÀNQUING
          </button>

          <button
            type="button"
            className={
              activePage === 'profile'
                ? 'nav-button active'
                : 'nav-button'
            }
            onClick={() =>
              setActivePage('profile')
            }
          >
            PERFIL
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activePage === 'play' && (
          <section className="play-page">
            <header className="match-header">
              <div className="match-main">
                <span className="eyebrow">
                  PROPER PARTIT
                </span>

                <div className="match-clubs">
                  <div className="match-club home">
                    <img
                      src={matchData.homeCrest}
                      className="match-club-crest"
                      alt={`Escut del ${matchData.homeName}`}
                    />

                    <div className="match-club-copy">
                      <strong>
                        {matchData.homeName}
                      </strong>

                      <span>
                        Barcelona
                      </span>
                    </div>
                  </div>

                  <span className="match-versus">
                    VS
                  </span>

                  <div className="match-club away">
                    <img
                      src={matchData.awayCrest}
                      className="match-club-crest"
                      alt={`Escut de ${matchData.awayName}`}
                    />

                    <div className="match-club-copy">
                      <strong>
                        {matchData.awayName}
                      </strong>

                      <span>
                        {matchData.awayCountry}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="match-kickoff">
                  <span className="match-kickoff-icon">
                    ◷
                  </span>

                  <strong>
                    {matchData.kickoffLabel}
                  </strong>

                  <span>
                    Hora de Barcelona
                  </span>
                </div>
              </div>

              <div
                className={
                  countdown.isClosed
                    ? 'deadline closed'
                    : 'deadline'
                }
              >
                <span className="deadline-title">
                  {countdown.isClosed
                    ? 'ESTAT'
                    : 'TANCA EN'}
                </span>

                {countdown.isClosed ? (
                  <strong className="deadline-closed">
                    PORRA TANCADA
                  </strong>
                ) : (
                  <div className="countdown-grid">
                    <div className="countdown-unit">
                      <strong>
                        {String(
                          countdown.days,
                        ).padStart(2, '0')}
                      </strong>

                      <span>
                        DIES
                      </span>
                    </div>

                    <div className="countdown-unit">
                      <strong>
                        {String(
                          countdown.hours,
                        ).padStart(2, '0')}
                      </strong>

                      <span>
                        HORES
                      </span>
                    </div>

                    <div className="countdown-unit">
                      <strong>
                        {String(
                          countdown.minutes,
                        ).padStart(2, '0')}
                      </strong>

                      <span>
                        MIN
                      </span>
                    </div>

                    <div className="countdown-unit">
                      <strong>
                        {String(
                          countdown.seconds,
                        ).padStart(2, '0')}
                      </strong>

                      <span>
                        SEG
                      </span>
                    </div>
                  </div>
                )}

                <small>
                  19 AGOST · 21:00
                </small>
              </div>
            </header>

            <section className="prediction-card score-card">
              <div className="section-heading">
                <div>
                  <span className="step-number">
                    01
                  </span>

                  <h2>
                    Pronostica el resultat
                  </h2>

                  <button
                    type="button"
                    className="section-info-button"
                    onClick={() =>
                      toggleInfoSection('score')
                    }
                    aria-label="Informació sobre el pronòstic del resultat"
                    aria-expanded={
                      openInfoSection === 'score'
                    }
                    title="Com funciona aquesta secció?"
                  >
                    i
                  </button>
                </div>

                <span
                  className={
                    scoreTouched
                      ? 'status-pill completed'
                      : 'status-pill'
                  }
                >
                  {scoreTouched
                    ? 'FET'
                    : 'PENDENT'}
                </span>
              </div>

              {openInfoSection === 'score' && (
                <div
                  className="section-info-panel"
                  role="note"
                >
                  <strong className="section-info-title">
                    PUNTS DEL RESULTAT
                  </strong>

                  <div className="section-info-points-list">
                    <div className="section-info-points-row featured">
                      <span>
                        Marcador exacte
                      </span>

                      <strong>
                        +50
                      </strong>
                    </div>

                    <div className="section-info-points-row">
                      <span>
                        Encertar el signe del partit
                      </span>

                      <strong>
                        +10
                      </strong>
                    </div>

                    <div className="section-info-points-row">
                      <span>
                        Encertar els gols del Barça
                      </span>

                      <strong>
                        +15
                      </strong>
                    </div>

                    <div className="section-info-points-row">
                      <span>
                        Encertar un número del marcador
                      </span>

                      <strong>
                        +10
                      </strong>
                    </div>
                  </div>

                  <small className="section-info-note">
                    Si claves el marcador exacte, obtens +50.
                    Si no, pots sumar els parcials. El número
                    dels gols del Barça no es duplica si ja
                    està cobert pel bonus de +15.
                  </small>
                </div>
              )}

              <div className="scoreboard">
                <div className="score-team">
                  <div className="score-team-label">
                    <img
                      src={matchData.homeCrest}
                      alt=""
                    />

                    <strong>
                      {matchData.homeShortName}
                    </strong>
                  </div>

                  <div className="score-control">
                    <button
                      type="button"
                      onClick={() => {
                        setScoreTouched(true)
                        setBarcaScore(
                          (score) =>
                            Math.max(
                              0,
                              score - 1,
                            ),
                        )
                      }}
                    >
                      −
                    </button>

                    <button
                      type="button"
                      className="score-value"
                      onClick={() =>
                        setScoreTouched(true)
                      }
                      aria-label={`Confirmar ${barcaScore} gols del Barça`}
                    >
                      {barcaScore}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setScoreTouched(true)
                        setBarcaScore(
                          (score) =>
                            score + 1,
                        )
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <span className="score-separator">
                  :
                </span>

                <div className="score-team">
                  <div className="score-team-label">
                    <img
                      src={matchData.awayCrest}
                      alt=""
                    />

                    <strong>
                      {matchData.awayShortName}
                    </strong>
                  </div>

                  <div className="score-control">
                    <button
                      type="button"
                      onClick={() => {
                        setScoreTouched(true)
                        setRivalScore(
                          (score) =>
                            Math.max(
                              0,
                              score - 1,
                            ),
                        )
                      }}
                    >
                      −
                    </button>

                    <button
                      type="button"
                      className="score-value"
                      onClick={() =>
                        setScoreTouched(true)
                      }
                      aria-label={`Confirmar ${rivalScore} gols de l'Al-Ahly`}
                    >
                      {rivalScore}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setScoreTouched(true)
                        setRivalScore(
                          (score) =>
                            score + 1,
                        )
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="prediction-card lineup-card">
              <div className="section-heading lotto-heading">
                <div className="lotto-heading-main">
                  <img
                    src="/fcb/HANSI_FLICK.png"
                    className="flick-avatar"
                    alt="Hansi Flick"
                  />

                  <div className="lotto-title-copy">
                    <h2>
                      La Lotto Flick
                    </h2>

                    <span className="formation-label">
                      4-3-3 FIX
                    </span>
                  </div>

                  <button
                    type="button"
                    className="section-info-button"
                    onClick={() =>
                      toggleInfoSection('lineup')
                    }
                    aria-label="Informació sobre la Lotto Flick"
                    aria-expanded={
                      openInfoSection === 'lineup'
                    }
                    title="Com funciona aquesta secció?"
                  >
                    i
                  </button>
                </div>

                <span
                  className={
                    lineupIsComplete
                      ? 'lineup-counter completed'
                      : 'lineup-counter'
                  }
                >
                  {lineupIsComplete
                    ? 'FET · 11 / 11'
                    : `OPCIONAL · ${lineupCount} / 11`}
                </span>
              </div>

              {openInfoSection === 'lineup' && (
                <div
                  className="section-info-panel"
                  role="note"
                >
                  <strong className="section-info-title">
                    PUNTS DE LA LOTTO FLICK
                  </strong>

                  <div className="section-info-xi-grid">
                    <div className="section-info-points-row featured">
                      <span>11/11 encerts</span>
                      <strong>+50</strong>
                    </div>

                    <div className="section-info-points-row">
                      <span>10/11 encerts</span>
                      <strong>+25</strong>
                    </div>

                    <div className="section-info-points-row">
                      <span>9/11 encerts</span>
                      <strong>+10</strong>
                    </div>

                    <div className="section-info-points-row">
                      <span>8/11 encerts</span>
                      <strong>+5</strong>
                    </div>

                    <div className="section-info-points-row neutral">
                      <span>7/11 encerts</span>
                      <strong>0</strong>
                    </div>

                    <div className="section-info-points-row negative">
                      <span>6/11 encerts</span>
                      <strong>−5</strong>
                    </div>

                    <div className="section-info-points-row negative">
                      <span>5/11 encerts</span>
                      <strong>−10</strong>
                    </div>

                    <div className="section-info-points-row negative">
                      <span>4/11 encerts</span>
                      <strong>−15</strong>
                    </div>

                    <div className="section-info-points-row negative">
                      <span>3/11 encerts</span>
                      <strong>−20</strong>
                    </div>

                    <div className="section-info-points-row negative">
                      <span>2/11 encerts</span>
                      <strong>−25</strong>
                    </div>

                    <div className="section-info-points-row negative">
                      <span>1/11 encerts</span>
                      <strong>−30</strong>
                    </div>

                    <div className="section-info-points-row troll">
                      <span>0/11 encerts 😈</span>
                      <strong>+30</strong>
                    </div>
                  </div>

                  <small className="section-info-note">
                    Compten els jugadors encertats, no la
                    posició on els col·loques al camp.
                  </small>
                </div>
              )}

              <p className="section-help">
                Selecciona una posició i una xapa en
                l’ordre que vulguis. Per desfer, selecciona
                el jugador del camp i després torna a clicar
                la seva mateixa xapa de la safata, o fes-ho
                a l’inrevés. També pots arrossegar-lo sobre
                la seva xapa.
              </p>

              <div className="football-field">
                <div className="field-line halfway-line"></div>

                <div className="field-circle"></div>

                <div className="penalty-area penalty-area-top"></div>

                <div className="penalty-area penalty-area-bottom"></div>

                <div className="field-slots formation-433">
                  {formation433.map((line) => (
                    <div
                      key={line.id}
                      className={`formation-row formation-${line.id}`}
                      aria-label={line.label}
                    >
                      {line.slots.map(
                        (slotIndex) => {
                          const playerId =
                            lineup[slotIndex]

                          const player =
                            playerId
                              ? playersById[
                                  playerId
                                ]
                              : null

                          const isTargetSelected =
                            selectedSlotIndex ===
                            slotIndex

                          const isProtagonist =
                            Boolean(player) &&
                            protagonistId ===
                              player.id

                          const isPlayerSelected =
                            Boolean(player) &&
                            selectedPlayerId ===
                              player.id

                          const fieldSlotClassName =
                            [
                              'field-slot',
                              player
                                ? 'occupied'
                                : '',
                              isTargetSelected
                                ? 'target-selected'
                                : '',
                              isPlayerSelected
                                ? 'player-selected'
                                : '',
                              isProtagonist
                                ? 'protagonist'
                                : '',
                            ]
                              .filter(Boolean)
                              .join(' ')

                          return (
                            <button
                              key={slotIndex}
                              type="button"
                              className={
                                fieldSlotClassName
                              }
                              draggable={
                                Boolean(player)
                              }
                              onDragStart={(
                                event,
                              ) => {
                                if (
                                  player
                                ) {
                                  handleDragStart(
                                    event,
                                    player.id,
                                  )
                                }
                              }}
                              onDragOver={(
                                event,
                              ) =>
                                event.preventDefault()
                              }
                              onDrop={(
                                event,
                              ) =>
                                handleDrop(
                                  event,
                                  slotIndex,
                                )
                              }
                              onClick={() =>
                                handleSlotClick(
                                  slotIndex,
                                )
                              }
                              aria-pressed={
                                isTargetSelected ||
                                isPlayerSelected
                              }
                              aria-label={
                                player
                                  ? `Posició de ${player.name}`
                                  : `Posició lliure ${slotIndex + 1}`
                              }
                            >
                              {player ? (
                                <>
                                  <img
                                    src={
                                      player.image
                                    }
                                    className="field-player-image"
                                    alt=""
                                  />

                                  {isProtagonist && (
                                    <span
                                      className="protagonist-crown"
                                      aria-hidden="true"
                                    >
                                      ★
                                    </span>
                                  )}

                                  <small className="field-player-name">
                                    {
                                      player.shortName
                                    }
                                  </small>
                                </>
                              ) : (
                                <span className="field-slot-plus">
                                  +
                                </span>
                              )}
                            </button>
                          )
                        },
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="player-tray">
                <div className="player-tray-header">
                  <strong>
                    23 XAPES DEL BARÇA
                  </strong>

                  <span>
                    {players.length} jugadors
                  </span>
                </div>

                <div className="player-badges">
                  {players.map((player) => {
                    const isInLineup =
                      lineup.includes(
                        player.id,
                      )

                    const isPendingSelection =
                      selectedPlayerId ===
                      player.id

                    const playerBadgeClassName =
                      [
                        'player-badge',
                        isInLineup
                          ? 'selected'
                          : '',
                        isPendingSelection
                          ? 'pending-selection'
                          : '',
                      ]
                        .filter(Boolean)
                        .join(' ')

                    return (
                      <button
                        key={player.id}
                        type="button"
                        className={
                          playerBadgeClassName
                        }
                        draggable
                        onDragStart={(
                          event,
                        ) =>
                          handleDragStart(
                            event,
                            player.id,
                          )
                        }
                        onDragOver={(
                          event,
                        ) =>
                          event.preventDefault()
                        }
                        onDrop={(
                          event,
                        ) =>
                          handlePlayerBadgeDrop(
                            event,
                            player.id,
                          )
                        }
                        onClick={() =>
                          handlePlayerClick(
                            player.id,
                          )
                        }
                        aria-pressed={
                          isPendingSelection
                        }
                      >
                        <img
                          src={player.image}
                          className="player-badge-avatar"
                          alt=""
                        />

                        <span>
                          {player.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </section>

            <section className="prediction-card protagonist-card">
              <div className="section-heading">
                <div>
                  <span className="step-number">
                    03
                  </span>

                  <h2>
                    Marca el protagonista
                  </h2>

                  <button
                    type="button"
                    className="section-info-button"
                    onClick={() =>
                      toggleInfoSection('protagonist')
                    }
                    aria-label="Informació sobre el protagonista"
                    aria-expanded={
                      openInfoSection ===
                      'protagonist'
                    }
                    title="Com funciona aquesta secció?"
                  >
                    i
                  </button>
                </div>

                <span
                  className={
                    protagonistIsComplete
                      ? 'status-pill completed'
                      : 'status-pill'
                  }
                >
                  {protagonistIsComplete
                    ? 'FET'
                    : 'OPCIONAL'}
                </span>
              </div>

              {openInfoSection === 'protagonist' && (
                <div
                  className="section-info-panel"
                  role="note"
                >
                  <strong className="section-info-title">
                    PUNTS DEL PROTAGONISTA
                  </strong>

                  <div className="section-info-protagonist-grid">
                    <div className="section-info-points-row special">
                      <span>
                        Lamine Yamal
                      </span>

                      <strong>
                        +5 / −15
                      </strong>
                    </div>

                    <div className="section-info-points-row">
                      <span>
                        Fermín López · Raphinha · Ferran
                        Torres · Anthony Gordon
                      </span>

                      <strong>
                        +10 / −10
                      </strong>
                    </div>

                    <div className="section-info-points-row">
                      <span>
                        Dani Olmo · Karim Adeyemi · Pedri
                      </span>

                      <strong>
                        +20 / −10
                      </strong>
                    </div>

                    <div className="section-info-points-row">
                      <span>
                        Frenkie de Jong · Jules Koundé ·
                        Marc Bernal
                      </span>

                      <strong>
                        +30 / −10
                      </strong>
                    </div>

                    <div className="section-info-points-row">
                      <span>
                        João Cancelo · Ronald Araújo · Eric
                        Garcia · Alejandro Balde
                      </span>

                      <strong>
                        +40 / −5
                      </strong>
                    </div>

                    <div className="section-info-points-row">
                      <span>
                        Gavi · Gerard Martín · Marc Casadó ·
                        Pau Cubarsí · Andreas Christensen ·
                        Jofre Torrents
                      </span>

                      <strong>
                        +50 / −5
                      </strong>
                    </div>
                  </div>

                  <small className="section-info-note">
                    El primer número són els punts si marca
                    o assisteix. El segon és la penalització
                    si no participa en cap gol. Gol i
                    assistència no acumulen.
                  </small>
                </div>
              )}

              <p className="section-help">
                Tria qualsevol jugador de camp.
                Encertes si marca o dona una assistència.
                Cada jugador té un premi i un risc segons
                el seu grup.
              </p>

              <div className="protagonist-combined-rule">
                <div className="protagonist-combined-icons">
                  <span className="protagonist-combined-icon goal">
                    ⚽
                  </span>

                  <span className="protagonist-combined-or">
                    O
                  </span>

                  <span className="protagonist-combined-icon assist">
                    A
                  </span>
                </div>

                <div className="protagonist-combined-copy">
                  <span>
                    UNA ÚNICA APOSTA
                  </span>

                  <strong>
                    MARCA O ASSISTEIX
                  </strong>

                  <small>
                    Gol o assistència donen el mateix
                    encert. Si fa totes dues coses,
                    només puntua una vegada.
                  </small>
                </div>

                <span className="protagonist-binary-pill">
                  RESULTAT BINARI
                </span>
              </div>

              <div className="protagonist-picker">
                <div className="protagonist-picker-copy">
                  <span>
                    PROTAGONISTA
                  </span>

                  <strong>
                    Tria un dels 21 jugadors de camp
                  </strong>

                  <small>
                    Cada opció mostra premi i penalització
                  </small>
                </div>

                <select
                  value={
                    protagonistId ?? ''
                  }
                  onChange={(event) =>
                    setProtagonistId(
                      event.target.value ||
                        null,
                    )
                  }
                  aria-label="Selecciona el protagonista"
                >
                  <option value="">
                    Selecciona un dels 21 jugadors de camp
                  </option>

                  {eligibleProtagonistPlayers.map(
                    (player) => {
                      const scoring =
                        protagonistScoringByPlayerId[
                          player.id
                        ]

                      return (
                        <option
                          key={player.id}
                          value={player.id}
                        >
                          {`${player.name} · +${scoring.hitPoints} si encerta · ${scoring.missPoints} si falla`}
                        </option>
                      )
                    },
                  )}
                </select>
              </div>

              <div
                className={
                  protagonistIsComplete
                    ? 'protagonist-showcase selected'
                    : 'protagonist-showcase'
                }
              >
                {protagonistIsComplete ? (
                  <>
                    <div className="protagonist-image-wrap">
                      <img
                        src={protagonist.image}
                        className="protagonist-showcase-image"
                        alt=""
                      />

                      <span
                        className="protagonist-showcase-star"
                        aria-hidden="true"
                      >
                        ★
                      </span>
                    </div>

                    <div className="protagonist-showcase-copy">
                      <span className="protagonist-kicker">
                        PROTAGONISTA ESCOLLIT
                      </span>

                      <strong>
                        {protagonist.name}
                      </strong>

                      <div className="protagonist-score-grid">
                        <div className="protagonist-score-box hit">
                          <span>
                            SI MARCA O ASSISTEIX
                          </span>

                          <strong>
                            +
                            {
                              protagonistScoring.hitPoints
                            }
                          </strong>
                        </div>

                        <div className="protagonist-score-box miss">
                          <span>
                            SI NO PARTICIPA EN GOL
                          </span>

                          <strong>
                            {
                              protagonistScoring.missPoints
                            }
                          </strong>
                        </div>
                      </div>

                      <small className="protagonist-single-score-note">
                        L’aposta no es multiplica: encara que
                        faci més d’un gol, més d’una assistència
                        o totes dues coses, només genera un
                        encert.
                      </small>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="protagonist-empty-icon">
                      ★
                    </div>

                    <div className="protagonist-showcase-copy">
                      <span className="protagonist-kicker">
                        FALTA UN ÚLTIM PAS
                      </span>

                      <strong>
                        Tria el teu protagonista
                      </strong>

                      <small>
                        Escull qualsevol dels 21 jugadors de
                        camp. Veuràs el seu grup, els punts
                        positius i la penalització abans de
                        confirmar.
                      </small>
                    </div>
                  </>
                )}
              </div>
            </section>

            <section className="confirm-section">
              <div className="prediction-summary">
                <span>
                  {scoreTouched
                    ? `RESULTAT ${barcaScore}-${rivalScore}`
                    : 'RESULTAT PENDENT'}
                </span>

                <span>
                  {lineupIsComplete
                    ? 'XI 11/11'
                    : `XI ${lineupCount}/11 · OPCIONAL`}
                </span>

                <span>
                  {protagonistIsComplete
                    ? `PROTAGONISTA ${protagonist.shortName.toUpperCase()} · +${protagonistScoring.hitPoints}/${protagonistScoring.missPoints}`
                    : 'PROTAGONISTA OPCIONAL'}
                </span>
              </div>

              <button
                type="button"
                className="confirm-button"
                disabled={
                  !scoreTouched ||
                  countdown.isClosed
                }
              >
                {confirmButtonLabel}
              </button>
            </section>
          </section>
        )}

        {activePage === 'ranking' && (
          <section className="placeholder-page">
            <span className="eyebrow">
              VESALAPORRA
            </span>

            <h1>
              RÀNQUING
            </h1>

            <p>
              La classificació general viurà
              aquí, com una pàgina pròpia.
            </p>
          </section>
        )}

        {activePage === 'profile' && (
          <section className="placeholder-page">
            <span className="eyebrow">
              VESALAPORRA
            </span>

            <h1>
              PERFIL
            </h1>

            <p>
              Estadístiques, historial,
              assoliments, insígnies i
              medalles.
            </p>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
