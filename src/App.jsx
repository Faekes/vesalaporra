import { useState } from 'react'
import './App.css'

const playerBadges = [
  'Joan García',
  'Koundé',
  'Cubarsí',
  'Araújo',
  'Balde',
  'Pedri',
  'De Jong',
  'Gavi',
  'Dani Olmo',
  'Raphinha',
  'Lamine Yamal',
  'Fermín',
  'Lewandowski',
]

const fieldSlots = Array.from({ length: 11 }, (_, index) => index + 1)

function App() {
  const [activePage, setActivePage] = useState('play')
  const [barcaScore, setBarcaScore] = useState(0)
  const [rivalScore, setRivalScore] = useState(0)

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">V</span>

          <div className="brand-copy">
            <strong>VESALAPORRA</strong>
            <span>La porra dels culers</span>
          </div>
        </div>

        <nav className="main-nav" aria-label="Navegació principal">
          <button
            type="button"
            className={activePage === 'play' ? 'nav-button active' : 'nav-button'}
            onClick={() => setActivePage('play')}
          >
            JUGA
          </button>

          <button
            type="button"
            className={
              activePage === 'ranking' ? 'nav-button active' : 'nav-button'
            }
            onClick={() => setActivePage('ranking')}
          >
            RÀNQUING
          </button>

          <button
            type="button"
            className={
              activePage === 'profile' ? 'nav-button active' : 'nav-button'
            }
            onClick={() => setActivePage('profile')}
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
                <span className="eyebrow">PROPER PARTIT</span>
                <h1>BARÇA · RIVAL</h1>
              </div>

              <div className="deadline">
                <span>TANCA EN</span>
                <strong>04:32:18</strong>
              </div>
            </header>

            <section className="prediction-card score-card">
              <div className="section-heading">
                <div>
                  <span className="step-number">01</span>
                  <h2>Pronostica el resultat</h2>
                </div>

                <span className="status-pill">PENDENT</span>
              </div>

              <div className="scoreboard">
                <div className="score-team">
                  <strong>BARÇA</strong>

                  <div className="score-control">
                    <button
                      type="button"
                      onClick={() =>
                        setBarcaScore((score) => Math.max(0, score - 1))
                      }
                    >
                      −
                    </button>

                    <span>{barcaScore}</span>

                    <button
                      type="button"
                      onClick={() => setBarcaScore((score) => score + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <span className="score-separator">:</span>

                <div className="score-team">
                  <strong>RIVAL</strong>

                  <div className="score-control">
                    <button
                      type="button"
                      onClick={() =>
                        setRivalScore((score) => Math.max(0, score - 1))
                      }
                    >
                      −
                    </button>

                    <span>{rivalScore}</span>

                    <button
                      type="button"
                      onClick={() => setRivalScore((score) => score + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="prediction-card lineup-card">
              <div className="section-heading">
                <div>
                  <span className="step-number">02</span>
                  <h2>Munta l'onze titular</h2>
                </div>

                <span className="lineup-counter">0 / 11</span>
              </div>

              <p className="section-help">
                Arrossega o toca les xapes per col·locar els jugadors al camp.
              </p>

              <div className="football-field">
                <div className="field-line halfway-line"></div>
                <div className="field-circle"></div>
                <div className="penalty-area penalty-area-top"></div>
                <div className="penalty-area penalty-area-bottom"></div>

                <div className="field-slots">
                  {fieldSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className="field-slot"
                      aria-label={`Posició ${slot}`}
                    >
                      <span>+</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="player-tray">
                <div className="player-tray-header">
                  <strong>XAPES DEL BARÇA</strong>
                  <span>{playerBadges.length} jugadors</span>
                </div>

                <div className="player-badges">
                  {playerBadges.map((player) => (
                    <button
                      key={player}
                      type="button"
                      className="player-badge"
                    >
                      <span className="player-badge-avatar">
                        {player.charAt(0)}
                      </span>

                      <span>{player}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="prediction-card protagonist-card">
              <div className="section-heading">
                <div>
                  <span className="step-number">03</span>
                  <h2>Marca el protagonista</h2>
                </div>

                <span className="status-pill">PENDENT</span>
              </div>

              <p className="section-help">
                Tria un jugador del teu onze i pronostica gol o assistència.
              </p>

              <div className="marker-options">
                <button type="button" className="marker-option">
                  <span className="marker-icon">⚽</span>

                  <span>
                    <strong>GOL</strong>
                    <small>Marcarà</small>
                  </span>
                </button>

                <button type="button" className="marker-option assist-option">
                  <span className="marker-icon assist-marker">A</span>

                  <span>
                    <strong>ASSISTÈNCIA</strong>
                    <small>Donarà l'assistència</small>
                  </span>
                </button>
              </div>
            </section>

            <section className="confirm-section">
              <div className="prediction-summary">
                <span>RESULTAT {barcaScore}-{rivalScore}</span>
                <span>XI 0/11</span>
                <span>PROTAGONISTA —</span>
              </div>

              <button type="button" className="confirm-button">
                CONFIRMAR PORRA
              </button>
            </section>
          </section>
        )}

        {activePage === 'ranking' && (
          <section className="placeholder-page">
            <span className="eyebrow">VESALAPORRA</span>
            <h1>RÀNQUING</h1>
            <p>
              La classificació general viurà aquí, com una pàgina pròpia.
            </p>
          </section>
        )}

        {activePage === 'profile' && (
          <section className="placeholder-page">
            <span className="eyebrow">VESALAPORRA</span>
            <h1>PERFIL</h1>
            <p>
              Estadístiques, historial, assoliments, insígnies i medalles.
            </p>
          </section>
        )}
      </main>
    </div>
  )
}

export default App