import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "./Quiz14.css";
const GAME_LINK = "https://lliga-epoques-prova.boltxevic.chatgpt.site/";

function playAnswerSound(context, outcome) {
 if (!context || context.state !== "running") return;
 const notes = outcome === "tick" ? [[700,0,.035]] : outcome === "correct"
  ? [[523.25,0,.13],[659.25,.11,.14],[783.99,.23,.24]]
  : outcome === "timeout"
   ? [[320,0,.1],[240,.13,.12],[160,.28,.2]]
   : [[220,0,.19],[146.83,.17,.27]];
 const start=context.currentTime;
 notes.forEach(([frequency,delay,duration])=>{
  const tone=context.createOscillator(), gain=context.createGain();
  tone.type=outcome==="correct"?"sine":"triangle";
  tone.frequency.setValueAtTime(frequency,start+delay);
  gain.gain.setValueAtTime(0,start+delay);
  gain.gain.linearRampToValueAtTime(outcome==="tick"?.025:.13,start+delay+.015);
  gain.gain.exponentialRampToValueAtTime(.001,start+delay+duration);
  tone.connect(gain);gain.connect(context.destination);
  tone.start(start+delay);tone.stop(start+delay+duration+.02);
  tone.onended=()=>{tone.disconnect();gain.disconnect();};
 });
}
export default function Quiz14({userId,displayName,avatarUrl,isAdmin=false,renderOpponentBadge}) {
 const [phase,setPhase]=useState("ready"),[data,setData]=useState(null),[ranking,setRanking]=useState([]),[remaining,setRemaining]=useState(10),[reveal,setReveal]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(""),[checking,setChecking]=useState(!!userId);
 const [editions,setEditions]=useState([]),[selectedId,setSelectedId]=useState(null),[closing,setClosing]=useState(false),[confirmClose,setConfirmClose]=useState(false);
 const current=editions[editions.length-1], selected=editions.find(e=>e.id===selectedId)||current;
 const quizTitle=current?.title||"CARREGANT QUIZ…";
 const editionReady=!!current;
 const closed=!!current?.closed_at, historical=!!selected&&selected.id!==current?.id;
 const deadlineRef=useRef(0), submitRef=useRef(false), indexRef=useRef(0), phaseRef=useRef("ready");
 const audioRef=useRef(null), transitionRef=useRef(null), generationRef=useRef(0);
 function unlockAudio(){
  try{
   if(!audioRef.current){const Audio=window.AudioContext||window.webkitAudioContext;if(Audio)audioRef.current=new Audio();}
   if(audioRef.current?.state==="suspended")audioRef.current.resume().catch(()=>{});
  }catch{/* Visual feedback remains available if audio is unsupported. */}
 }
 useEffect(()=>()=>{clearTimeout(transitionRef.current);audioRef.current?.close().catch(()=>{});audioRef.current=null;},[]);
 const rank=useCallback(async()=>{const {data:list,error:le}=await supabase.rpc("quiz14_catalog");if(le){setError("No s’ha pogut carregar l’historial del quiz.");return;}setEditions(list||[]);const id=selectedId??list?.[list.length-1]?.id;if(!id)return;const {data:r,error:e}=await supabase.rpc("quiz14_history_leaderboard",{p_quiz_id:id});if(!e)setRanking(r||[]);},[selectedId]);
 useEffect(()=>{rank();const id=setInterval(rank,7000);return()=>clearInterval(id)},[rank]);
 useEffect(()=>{
  let cancelled=false;
  generationRef.current+=1;clearTimeout(transitionRef.current);phaseRef.current="ready";
  setPhase("ready");setData(null);setReveal(null);setError("");submitRef.current=false;
  if(!userId){setChecking(false);return;}
  setChecking(true);
  supabase.rpc("quiz14_status").then(({data:r,error:e})=>{
   if(cancelled)return;
   if(e){setError("No s’ha pogut comprovar la teva participació. Recarrega la pàgina per tornar-ho a provar.");return;}
   if(r){setData(r);indexRef.current=r.index;deadlineRef.current=new Date(r.deadline).getTime();if(r.finished)setPhase("finished");}
   setChecking(false);
  });
  return()=>{cancelled=true;generationRef.current+=1;clearTimeout(transitionRef.current);};
 },[userId,current?.id]);
 useEffect(()=>{phaseRef.current=phase},[phase]);
 useEffect(()=>{if(closed&&phase==="playing"){setPhase("finished");phaseRef.current="finished";setReveal(null);}},[closed,phase]);
 async function closeQuiz(){if(!isAdmin||!selected||closing)return;setClosing(true);const {error:e}=await supabase.rpc("quiz14_close",{p_quiz_id:selected.id});setClosing(false);setConfirmClose(false);if(e){setError(e.message);return;}await rank();}
 const editionIndex=editions.findIndex(e=>e.id===selected?.id);
 const historyNav=<div className="q14-history"><button aria-label="Quiz anterior" disabled={editionIndex<=0} onClick={()=>{setRanking([]);setSelectedId(editions[editionIndex-1].id);}}>‹</button><div><strong className="q14-history-title">{renderOpponentBadge?.(selected)}<span>{selected?.title||"Barça-Getafe Quiz"}</span></strong><small>{editionIndex+1} / {editions.length||1} · {selected?.closed_at?"CLASSIFICACIÓ FINAL":"QUIZ OBERT"}</small></div><button aria-label="Quiz següent" disabled={editionIndex<0||editionIndex>=editions.length-1} onClick={()=>{setRanking([]);setSelectedId(editions[editionIndex+1].id);}}>›</button></div>;
 const submit=useCallback(async choice=>{
  if(submitRef.current||phaseRef.current!=="playing")return;
  submitRef.current=true;setBusy(true);
  const oldIndex=indexRef.current, generation=generationRef.current;
  const {data:result,error:e}=await supabase.rpc("quiz14_submit_edition",{p_choice:choice,p_quiz_id:current?.id});
  if(generation!==generationRef.current)return;
  setBusy(false);
  if(e){setError("No s’ha pogut enregistrar la resposta. Torna-ho a provar.");submitRef.current=false;return}
  const outcome=result.outcome|| (result.awarded>0?"correct":choice===-1||choice===result.correct?"timeout":"wrong");
  setReveal({correct:result.correct,awarded:result.awarded,index:oldIndex,choice,outcome,score:result.score,explanation:result.explanation});
  playAnswerSound(audioRef.current,outcome);
  clearTimeout(transitionRef.current);
  transitionRef.current=setTimeout(()=>{
   if(generation!==generationRef.current)return;
   indexRef.current=result.index;
   deadlineRef.current=new Date(result.deadline).getTime();
   setRemaining(Math.max(0,Math.ceil((deadlineRef.current-Date.now())/1000)));
   setData(result);
   setReveal(null);
   submitRef.current=false;
   if(result.finished){setPhase("finished");phaseRef.current="finished";}
  },1100);
  rank().catch(()=>{});
 },[rank,current?.id]);
 const submitRefFn=useRef(submit);submitRefFn.current=submit;
 useEffect(()=>{if(phase!=="playing"||reveal)return;let lastSecond=11;const tick=()=>{const seconds=Math.max(0,Math.ceil((deadlineRef.current-Date.now())/1000));setRemaining(seconds);if(seconds>0&&seconds<lastSecond&&!submitRef.current){playAnswerSound(audioRef.current,"tick");lastSecond=seconds;}if(seconds===0&&!submitRef.current)submitRefFn.current(-1)};tick();const t=setInterval(tick,80);return()=>clearInterval(t)},[phase,reveal,data?.index]);
 async function begin(){unlockAudio();if(!userId||checking||busy||closed||!editionReady)return;setBusy(true);setError("");const {data:r,error:e}=await supabase.rpc("quiz14_begin_edition",{p_quiz_id:current.id});setBusy(false);if(e){setError(e.message);return}setData(r);indexRef.current=r.index;deadlineRef.current=new Date(r.deadline).getTime();submitRef.current=false;phaseRef.current=r.finished?"finished":"playing";setPhase(phaseRef.current);setRemaining(Math.max(0,Math.ceil((deadlineRef.current-Date.now())/1000)));}
 const champions=editions.filter(e=>e.closed_at&&e.champion).slice().reverse();
 const championsGallery=<section className="q14-champions" aria-label="Galeria de campions dels quiz"><div className="q14-champions-heading"><span>👑</span><div><h3>GALERIA DE CAMPIONS</h3><p>Els culers que han arribat al cim</p></div></div>{champions.length?<div className="q14-champions-grid">{champions.map(e=><button className="q14-champion-frame" key={e.id} onClick={()=>{setRanking([]);setSelectedId(e.id);}} aria-label={"Veure classificació de "+e.title}><div className="q14-champion-portrait"><span className="q14-champion-crown" aria-label="Campió">👑</span>{e.champion.avatar_url?<img src={e.champion.avatar_url} alt={e.champion.display_name}/>:<span className="q14-champion-placeholder">⚽</span>}</div><strong>{e.champion.display_name}</strong><span className="q14-champion-quiz">{e.title}</span><small>{e.champion.score} punts</small></button>)}</div>:<p className="q14-champions-empty">El primer quadre s’omplirà quan es tanqui el primer quiz.</p>}</section>;
 const refresh=()=>rank();
 const participants=ranking.length;
 const finished=ranking.filter(p=>p.finished).length;
 const rankBlock=<aside className="q14-ranking">{historyNav}<div className="q14-leader-heading"><div><span className="q14-eyebrow">LA LLIGA DEL CONEIXEMENT</span><h3>🏆 CLASSIFICACIÓ</h3></div><span className="q14-live">{selected?.closed_at?"👑 FINAL":<><i/> EN DIRECTE</>}</span></div><div className="q14-statrow"><div><strong>{participants}</strong><span>PARTICIPANTS</span></div><div><strong>{finished}</strong><span>FINALITZATS</span></div></div>{ranking.length===0?<div className="q14-empty"><div className="q14-empty-trophy">🏆</div><strong>El podi t’espera</strong><p>Encara no hi ha partides registrades en aquesta edició. Sigues el primer a deixar-hi la teva marca!</p></div>:ranking.map((p,i)=><div className={`q14-rank ${p.user_id===userId?"q14-self":""} ${selected?.closed_at&&i===0?"q14-winner":""}`} key={p.user_id}><b>{selected?.closed_at&&i===0?<span aria-label="Campió">👑</span>:i+1}</b><span className="q14-photo">{p.avatar_url?<img src={p.avatar_url} alt=""/>:"⚽"}</span><span className="q14-player">{p.display_name}{p.user_id===userId?" · TU":""}</span><strong>{p.score}</strong></div>)}<p className="q14-autoupdate"><span className="q14-live-dot"/> {selected?.closed_at?"Resultats definitius guardats":"El rànquing es sincronitza cada 7 segons"}</p><button className="q14-minibutton" onClick={refresh}>↻ Actualitzar ara</button>{isAdmin&&!selected?.closed_at&&selected&&<div className="q14-admin">{confirmClose?<><p>Tancar el quiz i fixar la classificació final?</p><button disabled={closing} onClick={closeQuiz}>{closing?"TANCANT…":"Sí, tancar quiz"}</button><button disabled={closing} onClick={()=>setConfirmClose(false)}>Cancel·lar</button></>:<button onClick={()=>setConfirmClose(true)}>🔒 Tancar quiz</button>}</div>}</aside>;
 return <div className="q14-root"><header className="q14-top"><div className="q14-title-lockup"><span className="q14-brand">QUIZ<span>14</span> <em>⚡</em></span><p className="q14-edition-title">{renderOpponentBadge?.(current)}<span>{quizTitle}</span></p></div></header><div className="q14-layout"><main className="q14-main">
 {phase==="ready"&&closed&&<section className="q14-card q14-finish"><div className="q14-finish-emblem">👑</div><h1 className="q14-finish-title">Quiz tancat</h1><p>Consulta la classificació final i el campió.</p></section>}
 {phase==="ready"&&!closed&&<section className="q14-card q14-intro"><div className="q14-hero-symbol" aria-hidden="true">⚡</div><p className="q14-kicker">ET VEUS CAPAÇ D'ARRIBAR AL CIM?</p><h1 className="q14-hero-heading">14 PREGUNTES.<br/><span>UN SOL REPTE.</span></h1><p className="q14-hero-sub">Demostra quant saps del Barça i del {current?.opponent_name||"rival"}. La velocitat és la teva millor aliada.</p><div className="q14-rules-grid"><div><span>❓</span><strong>14</strong><small>PREGUNTES</small></div><div><span>⏱️</span><strong>10s</strong><small>PER RESPOSTA</small></div><div><span>🔥</span><strong>100</strong><small>PUNTS INICIALS</small></div></div><p className="q14-scoring">Cada segon et resta 10 punts. Si falles o s'acaba el temps, 0 punts.</p>{userId?<><div className="q14-identity">{avatarUrl?<img src={avatarUrl} alt=""/>:"⚽"}<strong>{displayName}</strong><span>Compte de Vesalaporra</span></div><button className="q14-action" disabled={busy||checking||closed||!editionReady} onClick={begin}>{checking?"COMPROVANT PARTICIPACIÓ…":busy?"CARREGANT…":data?"CONTINUAR EL REPTE →":"COMENÇAR EL REPTE →"}</button><p className="q14-note">🔒 Una única participació per compte · Puntuació pública al rànquing de Vesalaporra</p></>:<p className="q14-login">🔒 Entra amb el teu compte de Vesalaporra per participar. No cal crear un usuari nou.</p>}</section>}
 {phase==="playing"&&data&&<section key={`${current?.id}-${data.index}`} className={`q14-card q14-question-card ${reveal?"q14-outcome-"+reveal.outcome:""}`}><div className="q14-info"><span>Pregunta {Math.min(data.index+1,14)} / 14</span><span>{displayName}</span></div><div className="q14-metrics"><div><small>PUNTS EN JOC</small><strong>{reveal?reveal.awarded:remaining*10}</strong></div><div className="q14-clock" style={{"--progress":remaining*10+"%"}}>{remaining}</div><div><small>TOTAL</small><strong>{reveal?.score??data.score}</strong></div></div><div className="q14-track"><div style={{width:Math.round(data.index/14*100)+"%"}}/></div><h2 className="q14-question">{data.question?.prompt}</h2><div className="q14-choices">{data.question?.options?.map((a,i)=><button className={reveal?.index===data.index?(i===reveal.correct?"q14-correct":i===reveal.choice?"q14-wrong":"q14-unselected"):""} disabled={busy||!!reveal} key={`${data.index}-${i}`} onClick={()=>{unlockAudio();submit(i);}}><b>{"ABCD"[i]}</b>{a}</button>)}</div>{reveal&&<div key={reveal.index} className={"q14-answer-feedback q14-feedback-"+reveal.outcome} role="status" aria-live="polite"><span className="q14-feedback-icon" aria-hidden="true">{reveal.outcome==="correct"?"✓":reveal.outcome==="timeout"?"⌛":"✕"}</span><div><strong>{reveal.outcome==="correct"?"ENCERT! +"+reveal.awarded+" PUNTS":reveal.outcome==="timeout"?"TEMPS ESGOTAT · 0 PUNTS":"ERROR · 0 PUNTS"}</strong><p>{reveal.explanation}</p></div></div>}</section>}
 {phase==="finished"&&<section className="q14-card q14-finish"><div className="q14-finish-emblem" aria-hidden="true">🏆</div><p className="q14-kicker">REPTE COMPLETAT</p><h1 className="q14-finish-title">Ja has deixat la teva marca.</h1><p className="q14-finish-subtitle">14 preguntes. Tot el teu coneixement blaugrana.</p><div className="q14-score-panel"><span className="q14-score-label">LA TEVA PUNTUACIÓ</span><div className="q14-zoom">{data?.score??0}</div><span className="q14-score-unit">PUNTS</span></div><div className="q14-identity">{avatarUrl?<img src={avatarUrl} alt=""/>:"⚽"}<strong>{displayName}</strong></div><div className="q14-result-details"><div><span>POSICIÓ ACTUAL</span><strong>{!historical&&ranking.some(p=>p.user_id===userId)?"#"+(ranking.findIndex(p=>p.user_id===userId)+1):"—"}</strong></div><div><span>ESTAT DEL RESULTAT</span><strong className="q14-saved">✓ Registrat</strong></div></div><p className="q14-finish-caption">El teu resultat ja forma part de la classificació global. {closed?"La classificació ja és definitiva.":"La posició pot canviar quan participin altres culers."}</p><button className="q14-action" onClick={()=>window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent("⚽ He fet "+(data?.score??0)+" punts al "+quizTitle+"! Supera'm! "+window.location.href),"_blank","noopener,noreferrer")}>Compartir el resultat a X ↗</button><p className="q14-note">🔒 Ja has participat en aquest quiz. No es pot repetir.</p></section>}
 {error&&<p role="alert" className="q14-error">{error}</p>}{phase!=="playing"&&<footer className="q14-footer"><a className="q14-other-games-tab" href={GAME_LINK} target="_blank" rel="noopener noreferrer" aria-label="Altres jocs: obre Clash of Eras en una pestanya nova"><span className="q14-other-games-label">Altres jocs:</span><span className="q14-other-games-name"><span aria-hidden="true">🎮</span> Clash of Eras <span aria-hidden="true">↗</span></span></a>{championsGallery}</footer>}</main>{rankBlock}</div></div>;
}

