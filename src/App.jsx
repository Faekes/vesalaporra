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
  },
]

const playersById = Object.fromEntries(
  players.map((player) => [player.id, player]),
)

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

  const [lineup, setLineup] = useState(
    Array.from({ length: 11 }, () => null),
  )

  const [selectedSlotIndex, setSelectedSlotIndex] =
    useState(null)

  const [selectedPlayerId, setSelectedPlayerId] =
    useState(null)

  const [protagonistType, setProtagonistType] =
    useState(null)

  const [protagonistId, setProtagonistId] =
    useState(null)

  const lineupCount = lineup.filter(Boolean).length

  const lineupPlayers = lineup
    .filter(Boolean)
    .map((playerId) => playersById[playerId])
    .filter(Boolean)

  const protagonist = protagonistId
    ? playersById[protagonistId]
    : null

  const protagonistIsComplete =
    Boolean(protagonistType) &&
    Boolean(protagonist)

  useEffect(() => {
    if (
      protagonistId &&
      !lineup.includes(protagonistId)
    ) {
      setProtagonistId(null)
    }
  }, [lineup, protagonistId])

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

  const handleSlotClick = (slotIndex) => {
    if (selectedPlayerId) {
      placePlayerInSlot(
        selectedPlayerId,
        slotIndex,
      )

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

  const selectProtagonistType = (type) => {
    setProtagonistType(
      (currentType) =>
        currentType === type
          ? null
          : type,
    )
  }

  const protagonistTypeLabel =
    protagonistType === 'goal'
      ? 'GOLEJADOR'
      : protagonistType === 'assist'
        ? 'ASSISTENT'
        : null

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
              <div>
                <span className="eyebrow">
                  PROPER PARTIT
                </span>

                <h1>
                  BARÇA · RIVAL
                </h1>
              </div>

              <div className="deadline">
                <span>
                  TANCA EN
                </span>

                <strong>
                  04:32:18
                </strong>
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
                </div>

                <span className="status-pill">
                  PENDENT
                </span>
              </div>

              <div className="scoreboard">
                <div className="score-team">
                  <strong>
                    BARÇA
                  </strong>

                  <div className="score-control">
                    <button
                      type="button"
                      onClick={() =>
                        setBarcaScore(
                          (score) =>
                            Math.max(
                              0,
                              score - 1,
                            ),
                        )
                      }
                    >
                      −
                    </button>

                    <span>
                      {barcaScore}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setBarcaScore(
                          (score) =>
                            score + 1,
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                <span className="score-separator">
                  :
                </span>

                <div className="score-team">
                  <strong>
                    RIVAL
                  </strong>

                  <div className="score-control">
                    <button
                      type="button"
                      onClick={() =>
                        setRivalScore(
                          (score) =>
                            Math.max(
                              0,
                              score - 1,
                            ),
                        )
                      }
                    >
                      −
                    </button>

                    <span>
                      {rivalScore}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setRivalScore(
                          (score) =>
                            score + 1,
                        )
                      }
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
                  <span className="step-number">
                    02
                  </span>

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
                </div>

                <span className="lineup-counter">
                  {lineupCount} / 11
                </span>
              </div>

              <p className="section-help">
                Selecciona primer una posició o una
                xapa. Després completa la parella
                amb l'altre clic. També pots
                arrossegar directament.
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

                          const fieldSlotClassName =
                            [
                              'field-slot',
                              player
                                ? 'occupied'
                                : '',
                              isTargetSelected
                                ? 'target-selected'
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
                                isTargetSelected
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
                    : 'PENDENT'}
                </span>
              </div>

              <p className="section-help">
                Decideix si pronostiques un
                golejador o un assistent i tria
                un dels jugadors que tens al camp.
              </p>

              <div className="protagonist-type-tabs">
                <button
                  type="button"
                  className={
                    protagonistType ===
                    'goal'
                      ? 'protagonist-type-button active'
                      : 'protagonist-type-button'
                  }
                  onClick={() =>
                    selectProtagonistType(
                      'goal',
                    )
                  }
                >
                  <span className="protagonist-type-icon">
                    ⚽
                  </span>

                  <span>
                    <strong>
                      GOLEJADOR
                    </strong>

                    <small>
                      Qui marcarà?
                    </small>
                  </span>
                </button>

                <button
                  type="button"
                  className={
                    protagonistType ===
                    'assist'
                      ? 'protagonist-type-button active assist'
                      : 'protagonist-type-button assist'
                  }
                  onClick={() =>
                    selectProtagonistType(
                      'assist',
                    )
                  }
                >
                  <span className="protagonist-type-icon assist-icon">
                    A
                  </span>

                  <span>
                    <strong>
                      ASSISTENT
                    </strong>

                    <small>
                      Qui assistirà?
                    </small>
                  </span>
                </button>
              </div>

              {protagonistType && (
                <div className="protagonist-picker">
                  <div className="protagonist-picker-copy">
                    <span>
                      {
                        protagonistTypeLabel
                      }
                    </span>

                    <strong>
                      Tria un jugador del teu XI
                    </strong>
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
                    disabled={
                      lineupPlayers.length ===
                      0
                    }
                    aria-label={`Selecciona ${protagonistTypeLabel?.toLowerCase()}`}
                  >
                    <option value="">
                      {lineupPlayers.length ===
                      0
                        ? 'Primer completa jugadors al camp'
                        : 'Selecciona jugador'}
                    </option>

                    {lineupPlayers.map(
                      (player) => (
                        <option
                          key={
                            player.id
                          }
                          value={
                            player.id
                          }
                        >
                          {
                            player.name
                          }
                        </option>
                      ),
                    )}
                  </select>
                </div>
              )}

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
                        src={
                          protagonist.image
                        }
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
                        {
                          protagonistTypeLabel
                        }{' '}
                        ESCOLLIT
                      </span>

                      <strong>
                        {
                          protagonist.name
                        }
                      </strong>

                      <span className="protagonist-rule">
                        {protagonistType ===
                        'goal'
                          ? '⚽ HA DE MARCAR'
                          : '🎯 HA DE DONAR UNA ASSISTÈNCIA'}
                      </span>

                      <small>
                        Aquest pronòstic sortirà
                        també al resum final de la
                        teva porra.
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
                        Obre GOLEJADOR o ASSISTENT
                        i escull un jugador dels
                        que tens al camp.
                      </small>
                    </div>
                  </>
                )}
              </div>
            </section>

            <section className="confirm-section">
              <div className="prediction-summary">
                <span>
                  RESULTAT {barcaScore}-
                  {rivalScore}
                </span>

                <span>
                  XI {lineupCount}/11
                </span>

                <span>
                  {protagonistIsComplete
                    ? `${protagonistTypeLabel} ${protagonist.shortName.toUpperCase()}`
                    : 'PROTAGONISTA —'}
                </span>
              </div>

              <button
                type="button"
                className="confirm-button"
              >
                CONFIRMAR PORRA
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