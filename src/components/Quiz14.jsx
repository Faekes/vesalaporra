import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "./Quiz14.css";
const QUESTIONS = [["Quina ciutat va fer famosa Puyal amb el mític gol maradonià de Messi contra el Getafe?",["Ankara","Istanbul","Sofia","Nàpols"]],["En quina competició va marcar Messi aquell gol el 2007?",["Lliga","Copa del Rei","Champions","Supercopa"]],["Quin dorsal portava Messi quan va marcar aquell gol?",["19","30","10","11"]],["En quin estadi es va marcar el gol maradonià?",["Coliseum","Montjuïc","Camp Nou","Miniestadi"]],["Com va acabar el Barça–Getafe del gol maradonià de Messi?",["4–0","5–2","3–1","6–2"]],["Com va acabar la tornada de semifinals de Copa del 2007, al camp del Getafe?",["2–1","3–0","4–0","1–1"]],["Qui va donar la passada a Messi just abans de la seva cursa maradoniana?",["Iniesta","Deco","Xavi","Eto’o"]],["Quin d’aquests exjugadors del Barça NO ha jugat al Getafe?",["Carles Aleñá","Marc Cucurella","Andrés Iniesta","Munir El Haddadi"]],["Segons la classificació històrica publicada pel Getafe, qui és el seu màxim golejador?",["Jorge Molina","Borja Mayoral","Jaime Mata","Ángel Rodríguez"]],["Quantes vegades havia derrotat oficialment el Getafe al Barça abans del partit d’octubre de 2026?",["2","4","7","10"]],["Com va acabar l'últim Getafe–Barça, el 25 d'abril de 2026?",["0–2","3–0","1–1","0–0"]],["Qui va marcar en el Getafe 0–2 Barça d'abril de 2026?",["Fermín López i Marcus Rashford","Lewandowski (2) i Raphinha","Lamine Yamal i Pedri (2)","Raphinha i Ferran Torres (2)"]],["Com va acabar l’últim Barça–Getafe jugat al Camp Nou abans d’octubre de 2026?",["2–0","4–0","1–0","3–1"]],["Qui va marcar l’únic gol en aquell últim Barça–Getafe al Camp Nou (2023)?",["Gavi","Pedri","Lewandowski","Dembélé"]]];
const GAME_LINK = "https://lliga-epoques-prova.boltxevic.chatgpt.site/";
const CLUES = ["«Ankara Messi!»","Semifinal d’anada de la Copa del Rei.","Messi portava el dorsal 19.","Camp Nou, 18 d’abril de 2007.","El Barça va guanyar 5–2.","El Getafe va remuntar amb un 4–0.","Xavi va passar la pilota a Messi.","Iniesta no va jugar al Getafe.","Jorge Molina.","Quatre victòries abans d’octubre de 2026.","El Barça va guanyar 0–2.","Fermín López i Marcus Rashford.","Barça 1–0 Getafe.","Pedri, al minut 35."];
export default function Quiz14({userId,displayName,avatarUrl}) {
 const [phase,setPhase]=useState("ready"),[data,setData]=useState(null),[ranking,setRanking]=useState([]),[remaining,setRemaining]=useState(10),[reveal,setReveal]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(""),[checking,setChecking]=useState(!!userId);
 const deadlineRef=useRef(0), submitRef=useRef(false), indexRef=useRef(0), phaseRef=useRef("ready");
 const rank=useCallback(async()=>{const {data:r,error:e}=await supabase.rpc("quiz14_leaderboard");if(!e)setRanking(r||[]);},[]);
 useEffect(()=>{rank();const id=setInterval(rank,7000);return()=>clearInterval(id)},[rank]);
 useEffect(()=>{
  let cancelled=false;
  setPhase("ready");setData(null);setReveal(null);setError("");submitRef.current=false;
  if(!userId){setChecking(false);return;}
  setChecking(true);
  supabase.rpc("quiz14_status").then(({data:r,error:e})=>{
   if(cancelled)return;
   if(e){setError("No s’ha pogut comprovar la teva participació. Recarrega la pàgina per tornar-ho a provar.");return;}
   if(r){setData(r);indexRef.current=r.index;deadlineRef.current=new Date(r.deadline).getTime();if(r.finished)setPhase("finished");}
   setChecking(false);
  });
  return()=>{cancelled=true;};
 },[userId]);
 useEffect(()=>{phaseRef.current=phase},[phase]);
 const submit=useCallback(async choice=>{
  if(submitRef.current||phaseRef.current!=="playing")return;
  submitRef.current=true;setBusy(true);
  const oldIndex=indexRef.current;
  const {data:result,error:e}=await supabase.rpc("quiz14_submit",{p_choice:choice});
  setBusy(false);
  if(e){setError("No s’ha pogut enregistrar la resposta. Torna-ho a provar.");submitRef.current=false;return}
  setData(result);setReveal({correct:result.correct,awarded:result.awarded,index:oldIndex});
  await rank();
  if(result.finished){setPhase("finished");phaseRef.current="finished";setReveal(null);}
  else {
   indexRef.current=result.index;
   setTimeout(()=>{setReveal(null);deadlineRef.current=new Date(result.deadline).getTime();submitRef.current=false;},900);
  }
 },[rank]);
 const submitRefFn=useRef(submit);submitRefFn.current=submit;
 useEffect(()=>{if(phase!=="playing"||reveal)return;const tick=()=>{const seconds=Math.max(0,Math.ceil((deadlineRef.current-Date.now())/1000));setRemaining(seconds);if(seconds===0&&!submitRef.current)submitRefFn.current(-1)};tick();const t=setInterval(tick,80);return()=>clearInterval(t)},[phase,reveal,data?.index]);
 async function begin(){if(!userId||checking||busy)return;setBusy(true);setError("");const {data:r,error:e}=await supabase.rpc("quiz14_begin");setBusy(false);if(e){setError(e.message);return}setData(r);indexRef.current=r.index;deadlineRef.current=new Date(r.deadline).getTime();submitRef.current=false;setPhase(r.finished?"finished":"playing");}
 const refresh=()=>rank();
 const participants=ranking.length;
 const finished=ranking.filter(p=>p.finished).length;
 const rankBlock=<aside className="q14-ranking"><div className="q14-leader-heading"><div><span className="q14-eyebrow">LA LLIGA DEL CONEIXEMENT</span><h3>🏆 CLASSIFICACIÓ</h3></div><span className="q14-live"><i/> EN DIRECTE</span></div><div className="q14-statrow"><div><strong>{participants}</strong><span>PARTICIPANTS</span></div><div><strong>{finished}</strong><span>FINALITZATS</span></div></div>{ranking.length===0?<div className="q14-empty"><div className="q14-empty-trophy">🏆</div><strong>El podi t’espera</strong><p>Encara no hi ha partides registrades en aquesta edició. Sigues el primer a deixar-hi la teva marca!</p></div>:ranking.map((p,i)=><div className={`q14-rank ${p.user_id===userId?"q14-self":""}`} key={p.user_id}><b>{i+1}</b><span className="q14-photo">{p.avatar_url?<img src={p.avatar_url} alt=""/>:"⚽"}</span><span className="q14-player">{p.display_name}{p.user_id===userId?" · TU":""}</span><strong>{p.score}</strong></div>)}<p className="q14-autoupdate"><span className="q14-live-dot"/> El rànquing es sincronitza cada 7 segons</p><button className="q14-minibutton" onClick={refresh}>↻ Actualitzar ara</button></aside>;
 return <div className="q14-root"><header className="q14-top"><div className="q14-title-lockup"><span className="q14-brand">QUIZ<span>14</span> <em>⚡</em></span><p>BARÇA × GETAFE · EL REPTE BLAUGRANA</p></div><a className="q14-clash" href={GAME_LINK} target="_blank" rel="noopener noreferrer"><span>🕹️</span><span>CLASH OF ERAS <small>ENTRAR AL JOC ↗</small></span></a></header><div className="q14-layout"><main className="q14-main">
 {phase==="ready"&&<section className="q14-card q14-intro"><div className="q14-hero-symbol" aria-hidden="true">⚡</div><p className="q14-kicker">ET VEUS CAPAÇ D'ARRIBAR AL CIM?</p><h1 className="q14-hero-heading">14 PREGUNTES.<br/><span>UN SOL REPTE.</span></h1><p className="q14-hero-sub">Demostra quant saps del Barça i del Getafe. La velocitat és la teva millor aliada.</p><div className="q14-rules-grid"><div><span>❓</span><strong>14</strong><small>PREGUNTES</small></div><div><span>⏱️</span><strong>10s</strong><small>PER RESPOSTA</small></div><div><span>🔥</span><strong>100</strong><small>PUNTS INICIALS</small></div></div><p className="q14-scoring">Cada segon et resta 10 punts. Si falles o s'acaba el temps, 0 punts.</p>{userId?<><div className="q14-identity">{avatarUrl?<img src={avatarUrl} alt=""/>:"⚽"}<strong>{displayName}</strong><span>Compte de Vesalaporra</span></div><button className="q14-action" disabled={busy||checking} onClick={begin}>{checking?"COMPROVANT PARTICIPACIÓ…":busy?"CARREGANT…":data?"CONTINUAR EL REPTE →":"COMENÇAR EL REPTE →"}</button><p className="q14-note">🔒 Una única participació per compte · Puntuació pública al rànquing de Vesalaporra</p></>:<p className="q14-login">🔒 Entra amb el teu compte de Vesalaporra per participar. No cal crear un usuari nou.</p>}</section>}
 {phase==="playing"&&data&&<section className="q14-card"><div className="q14-info"><span>Pregunta {Math.min(data.index+1,14)} / 14</span><span>{displayName}</span></div><div className="q14-metrics"><div><small>PUNTS EN JOC</small><strong>{remaining*10}</strong></div><div className="q14-clock" style={{"--progress":remaining*10+"%"}}>{remaining}</div><div><small>TOTAL</small><strong>{data.score}</strong></div></div><div className="q14-track"><div style={{width:Math.round(data.index/14*100)+"%"}}/></div><h2 className="q14-question">{QUESTIONS[data.index]?.[0]}</h2><div className="q14-choices">{QUESTIONS[data.index]?.[1].map((a,i)=><button className={reveal&&i===reveal.correct?"q14-correct":""} disabled={busy||!!reveal} key={i} onClick={()=>submit(i)}><b>{"ABCD"[i]}</b>{a}</button>)}</div>{reveal&&<p className="q14-feedback">{reveal.awarded>0?"✅ +"+reveal.awarded+" punts!":"⏱️ 0 punts"} · {CLUES[reveal.index]}</p>}</section>}
 {phase==="finished"&&<section className="q14-card q14-finish"><div className="q14-finish-emblem" aria-hidden="true">🏆</div><p className="q14-kicker">REPTE COMPLETAT</p><h1 className="q14-finish-title">Ja has deixat la teva marca.</h1><p className="q14-finish-subtitle">14 preguntes. Tot el teu coneixement blaugrana.</p><div className="q14-score-panel"><span className="q14-score-label">LA TEVA PUNTUACIÓ</span><div className="q14-zoom">{data?.score??0}</div><span className="q14-score-unit">PUNTS</span></div><div className="q14-identity">{avatarUrl?<img src={avatarUrl} alt=""/>:"⚽"}<strong>{displayName}</strong></div><div className="q14-result-details"><div><span>POSICIÓ ACTUAL</span><strong>{ranking.some(p=>p.user_id===userId)?"#"+(ranking.findIndex(p=>p.user_id===userId)+1):"—"}</strong></div><div><span>ESTAT DEL RESULTAT</span><strong className="q14-saved">✓ Registrat</strong></div></div><p className="q14-finish-caption">El teu resultat ja forma part de la classificació global. La posició pot canviar quan participin altres culers.</p><button className="q14-action" onClick={()=>window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent("⚽ He fet "+(data?.score??0)+" punts al QUIZ14 Barça–Getafe! Supera'm! "+window.location.href),"_blank","noopener,noreferrer")}>Compartir el resultat a X ↗</button><p className="q14-note">🔒 Ja has participat en aquest quiz. No es pot repetir.</p></section>}
 {error&&<p role="alert" className="q14-error">{error}</p>}</main>{rankBlock}</div></div>;
}
