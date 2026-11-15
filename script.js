'use strict';
// Cambia aquí los enunciados y las opciones. correct es el índice original (0, 1 o 2).
const QUESTIONS = [
  {text:'¿Cuál era el verdadero nombre de Camarón de la Isla?',options:['José Monje Cruz','José Mercé','Manuel de Falla'],correct:0},
  {text:'En el flamenco, ¿qué es un «palo»?',options:['Un instrumento musical','Un estilo musical flamenco','Un paso de baile'],correct:1},
  {text:'¿En qué arte destacó especialmente Camarón?',options:['La guitarra','El baile','El cante'],correct:2},
  {text:'¿En qué ciudad nació Camarón?',options:['La Línea de la Concepción','San Fernando','Jerez de la Frontera'],correct:1},
  {text:'¿Con qué gran guitarrista grabó sus primeros discos?',options:['Tomatito','Vicente Amigo','Paco de Lucía'],correct:2},
  {text:'¿Qué álbum de Camarón revolucionó el flamenco en 1979?',options:['Como el agua','La leyenda del tiempo','Soy gitano'],correct:1},
  {text:'¿En el tráiler de qué película de 2026 suena una nueva versión de «La leyenda del tiempo»?',options:['La bola negra','Sirât','Los domingos'],correct:0}
];
const KEY='la-chispa-camaron-2026-v1';
const app=document.getElementById('app');
const escapeHTML=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function shuffle(){const a=[0,1,2];for(let i=2;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function score(answers){return QUESTIONS.reduce((n,q,i)=>n+Number(answers[i]===q.correct),0);}
function valid(s){return s&&s.version===1&&Number.isInteger(s.current)&&s.current>=0&&s.current<7&&Array.isArray(s.answers)&&s.answers.length===7&&s.answers.every(a=>a===null||[0,1,2].includes(a))&&Array.isArray(s.order)&&s.order.length===7&&s.order.every(a=>Array.isArray(a)&&a.length===3&&[...a].sort().join('')==='012')&&typeof s.finished==='boolean'&&(!s.finished||s.answers.every(a=>a!==null));}
let state=null;
let storageAvailable=true;
try{const raw=localStorage.getItem(KEY);if(raw){state=JSON.parse(raw);if(!valid(state))throw new Error('invalid');}localStorage.setItem(KEY+'-check','1');localStorage.removeItem(KEY+'-check');}catch(e){storageAvailable=false;}
function warning(){const el=document.getElementById('notice');el.hidden=false;el.textContent='No se puede guardar la partida en este navegador. Permite el almacenamiento local y vuelve a cargar la página para jugar.';}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));return true;}catch(e){storageAvailable=false;warning();return false;}}
function focusTitle(){const el=app.querySelector('h1,h2');el.tabIndex=-1;el.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
function render(){
 if(state?.finished){if(state.resultView==='farewell')farewell();else result();return;}
 if(state){quiz();return;}
 app.innerHTML=`<figure class="hero"><img src="./assets/ilustracion.webp" width="1000" height="365" alt="Ilustración del cartel: Camarón y La Chispa en tonos carmín y tinta"></figure><section class="intro"><h1><span>La Chispa de</span>Camarón</h1><p class="subtitle">Juega y llévate una sorpresa</p><div class="ornament" aria-hidden="true">❦</div><p>La Chispa de Camarón era Dolores Montoya, de La Línea de la Concepción, compañera de vida de Camarón.</p><p>Hoy te proponemos un pequeño juego con sabor flamenco.</p><p class="invitation">¡Pon a prueba tu chispa flamenca!</p><p class="conditions">7 preguntas · 1 premio por persona · Hasta agotar existencias</p><button id="start" ${storageAvailable?'':'disabled'}>¡QUIERO JUGAR!</button></section>`;
 document.getElementById('start').onclick=()=>{state={version:1,current:0,answers:Array(7).fill(null),order:QUESTIONS.map(shuffle),finished:false};if(save()){render();focusTitle();}};
}
function quiz(){
 const i=state.current,q=QUESTIONS[i];
 app.innerHTML=`<section class="quiz"><p class="brand">La Chispa de Camarón</p><p class="progress-label">Pregunta ${i+1} de 7</p><div class="marks" aria-hidden="true">${QUESTIONS.map((_,j)=>`<span class="mark ${state.answers[j]!==null?'done':''} ${j===i?'current':''}"></span>`).join('')}</div><form><fieldset><legend><h2>${escapeHTML(q.text)}</h2></legend><div class="options">${state.order[i].map((a,j)=>`<label class="option"><input type="radio" name="answer" value="${a}" ${state.answers[i]===a?'checked':''}><span><b aria-hidden="true">${'ABC'[j]}</b>${escapeHTML(q.options[a])}</span></label>`).join('')}</div></fieldset><div class="actions">${i?'<button type="button" class="secondary" id="back">Anterior</button>':''}<button type="submit" id="next" ${state.answers[i]===null?'disabled':''}>${i===6?'¡DESCUBRE TU CHISPA!':'Siguiente →'}</button></div></form><p class="hint">Puedes revisar tus respuestas antes de terminar.</p></section>`;
 app.querySelectorAll('input').forEach(el=>el.onchange=()=>{state.answers[i]=Number(el.value);if(save())document.getElementById('next').disabled=false;});
 const back=document.getElementById('back');if(back)back.onclick=()=>{state.current--;if(save()){render();focusTitle();}};
 app.querySelector('form').onsubmit=e=>{e.preventDefault();if(!storageAvailable||state.answers[i]===null)return;if(i===6){if(state.answers.some(a=>a===null))return;state.finished=true;}else state.current++;if(save()){render();focusTitle();}};
}
function result(){const n=score(state.answers),won=n>=5;
 app.innerHTML=`<section class="result"><p class="brand">La Chispa de Camarón</p><div class="bloom" aria-hidden="true">❦</div><h2>${won?'¡TIENES DUENDE!':'¡QUE NO SE PIERDA EL COMPÁS!'}</h2><div class="${won?'voucher':''}"><p class="score">${n}<small> / 7</small></p><p class="score-label">${won?`HAS ACERTADO ${n} DE 7 PREGUNTAS`:`Has acertado ${n} de 7 preguntas.`}</p>${won?'<p class="prize">¡Enhorabuena! Has ganado una sorpresa.</p><p>Haz una captura de esta pantalla y muéstrala para elegir un regalo del cesto.</p><p class="conditions">Un regalo por persona · Hasta agotar existencias</p>':'<p>Hoy no te llevas un regalo, pero te llevas un poquito más de flamenco. ¡Gracias por participar!</p>'}</div><div class="ornament" aria-hidden="true">❦</div><figure class="photo"><img src="./assets/camaron-y-la-chispa.jpg" width="504" height="600" alt="Fotografía de Camarón junto a Dolores Montoya, La Chispa"><figcaption>Camarón y La Chispa, año 1976, en fotografía de Pepe Lamarca</figcaption></figure><p><button type="button" id="finish">TERMINAR</button></p></section>`;
 document.getElementById('finish').onclick=()=>showResultView('farewell');
}
// Esta navegación solo cambia la vista; la partida finalizada permanece intacta.
function showResultView(view){
 if(!state?.finished)return;
 state.resultView=view;
 save();
 render();
 focusTitle();
}
function farewell(){
 app.innerHTML=`<section class="result"><p class="brand">La Chispa de Camarón</p><div class="bloom" aria-hidden="true">❦</div><h2>¡Gracias por participar!</h2><p class="subtitle">¡Que no se apague nunca la chispa del flamenco!</p><div class="ornament" aria-hidden="true">❦</div><button type="button" class="secondary" id="view-result">Ver mi resultado</button></section>`;
 document.getElementById('view-result').onclick=()=>showResultView('result');
}
if(storageAvailable){render();}else{app.innerHTML='<section class="intro"><h1><span>La Chispa de</span>Camarón</h1></section>';warning();}
