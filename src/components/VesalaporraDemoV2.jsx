import { useState } from "react";
import "./VesalaporraDemoV2.css";

const DEMO_STEPS = [
  {
    id: "porra",
    number: "01",
    label: "LA PORRA",
    path: "/porra",
    title: "El partit comença abans del xiulet.",
    description: "Resultat, Lotto Flick i protagonista dins una experiència ràpida, visual i pensada perquè la comunitat torni cada jornada.",
    proof: "251 participants de mitjana per partit oficial",
  },
  {
    id: "ranking",
    number: "02",
    label: "RÀNQUING",
    path: "/ranquing/general",
    title: "La rivalitat converteix una visita en un hàbit.",
    description: "Classificació general i de jornada, perfils, medalles i moviment de posicions. Cada partit deixa una història oberta per al següent.",
    proof: "70,1% juga dos partits oficials o més",
  },
  {
    id: "notes",
    number: "03",
    label: "LES NOTES",
    path: "/notes/partit",
    title: "La conversa continua després del partit.",
    description: "La comunitat valora els jugadors, compara criteris i torna a entrar quan la porra ja s’ha tancat.",
    proof: "Una experiència abans, durant i després del partit",
  },
  {
    id: "community",
    number: "04",
    label: "COMUNITAT",
    path: "/com-jugar#lligues",
    title: "Cada grup pot tenir la seva competició.",
    description: "Les lligues privades converteixen amics, penyes, podcasts i redaccions en comunitats actives dins del mateix joc.",
    proof: "25 lligues creades · fins a 39 membres",
  },
  {
    id: "results",
    number: "05",
    label: "RESULTATS",
    path: "/porra",
    title: "No és una idea: ja està validat.",
    description: "Vesalaporra aporta recurrència, identitat de comunitat i espais per a patrocinadors sense obligar el mitjà a desenvolupar tecnologia pròpia.",
    proof: "435 comptes · 954 porres confirmades",
  },
];

const RESULT_METRICS = [
  { value: "435", label: "COMPTES REGISTRATS" },
  { value: "251", label: "PARTICIPANTS / PARTIT" },
  { value: "85%", label: "RETENCIÓ ENTRE JORNADES" },
  { value: "25", label: "LLIGUES PRIVADES" },
];

export default function VesalaporraDemo() {
  const [activeStepId, setActiveStepId] = useState("porra");
  const [framePath, setFramePath] = useState("/porra");
  const [guideOpen, setGuideOpen] = useState(true);
  const [frameLoading, setFrameLoading] = useState(true);

  const activeStep = DEMO_STEPS.find((step) => step.id === activeStepId) || DEMO_STEPS[0];
  const activeIndex = DEMO_STEPS.findIndex((step) => step.id === activeStep.id);

  const openStep = (step) => {
    setActiveStepId(step.id);
    if (step.path !== framePath) {
      setFrameLoading(true);
      setFramePath(step.path);
    }
    setGuideOpen(true);
  };

  const nextStep = () => {
    openStep(DEMO_STEPS[Math.min(activeIndex + 1, DEMO_STEPS.length - 1)]);
  };

  return (
    <main className="vlp-tour-shell">
      <header className="vlp-tour-header">
        <a className="vlp-tour-brand" href="/demo">
          <span className="vlp-tour-mark">V</span>
          <span><strong>VESALAPORRA</strong><small>DEMO COMERCIAL GUIADA</small></span>
        </a>

        <nav className="vlp-tour-nav" aria-label="Recorregut de la demo">
          {DEMO_STEPS.map((step) => (
            <button type="button" key={step.id} className={activeStep.id === step.id ? "active" : ""} onClick={() => openStep(step)}>
              <span>{step.number}</span>{step.label}
            </button>
          ))}
        </nav>

        <a className="vlp-tour-open-app" href={framePath} target="_blank" rel="noreferrer">OBRIR SENSE GUIA ↗</a>
      </header>

      <section className="vlp-tour-product" aria-label="Vesalaporra en funcionament">
        {frameLoading && <div className="vlp-tour-loading"><span />CARREGANT EL PRODUCTE REAL</div>}

        <iframe key={framePath} className="vlp-tour-frame" src={framePath} title={`Vesalaporra · ${activeStep.label}`} onLoad={() => setFrameLoading(false)} />

        <div className="vlp-tour-live"><i /> PRODUCTE REAL · DADES EN DIRECTE</div>

        {!guideOpen && (
          <button type="button" className="vlp-tour-reopen" onClick={() => setGuideOpen(true)}>
            <span>{activeStep.number}</span> OBRIR GUIA
          </button>
        )}

        {guideOpen && (
          <aside className="vlp-tour-guide">
            <div className="vlp-tour-guide-head">
              <span className="vlp-tour-step-number">{activeStep.number}</span>
              <button type="button" onClick={() => setGuideOpen(false)} aria-label="Tancar la guia">×</button>
            </div>

            <span className="vlp-tour-kicker">{activeStep.label}</span>
            <h1>{activeStep.title}</h1>
            <p>{activeStep.description}</p>

            {activeStep.id === "results" ? (
              <div className="vlp-tour-metrics">
                {RESULT_METRICS.map((metric) => <div key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span></div>)}
              </div>
            ) : (
              <div className="vlp-tour-proof"><i /><span>{activeStep.proof}</span></div>
            )}

            <div className="vlp-tour-actions">
              {activeIndex < DEMO_STEPS.length - 1 ? (
                <button type="button" className="vlp-tour-next" onClick={nextStep}>SEGÜENT · {DEMO_STEPS[activeIndex + 1].label} →</button>
              ) : (
                <a className="vlp-tour-next" href="/porra" target="_blank" rel="noreferrer">ENTRAR A VESALAPORRA ↗</a>
              )}
              <span>{activeIndex + 1} / {DEMO_STEPS.length}</span>
            </div>
          </aside>
        )}
      </section>
    </main>
  );
}
