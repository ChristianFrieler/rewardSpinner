import {
  SYMBOLS,
  SYMBOL_DISPLAY_LOOP,
  spinReels,
  isWin,
  addToCollection,
  symbolDisplay,
  getReward
} from './utils.js';

const $ = sel => document.querySelector(sel);

const reelEls = [$('#reel-1'), $('#reel-2'), $('#reel-3')];
const spinBtn  = $('#spinBtn');
const resetBtn = $('#resetBtn');
const resultEl = $('#result');
const toastEl  = $('#toast');
const confettiCanvas = $('#confetti');
const leverBtn = $('#lever');

let spinning = false;
document.getElementById('year').textContent = new Date().getFullYear();

function setReelsContent(symbols){
  symbols.forEach((s, i)=>{
    reelEls[i].textContent = symbolDisplay(s);
    reelEls[i].setAttribute('aria-label', `${s.label}`);
  });
}

function showToast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(()=> toastEl.classList.remove('show'), 1800);
}

function playWinEffects(){
  reelEls.forEach(el=>{
    el.classList.remove('win-pulse'); void el.offsetWidth; el.classList.add('win-pulse');
  });
  if(window.launchConfetti){ window.launchConfetti(confettiCanvas, 600); }
}

/**
 * Visuelle Rotation eines Reels: wir iterieren schnell über SYMBOL_DISPLAY_LOOP,
 * um den Effekt von "drehen" zu simulieren. Nach `durationMs` stoppen wir
 * auf dem finalen Symbol.
 */
function animateSingleReel(reelEl, durationMs, finalSymbol, startOffset=0){
  const loop = SYMBOL_DISPLAY_LOOP;
  let idx = startOffset % loop.length;
  const stepMs = 60;                 // Umschaltgeschwindigkeit
  const start = performance.now();

  let timeoutId;

  function tick(now){
    const elapsed = now - start;
    reelEl.textContent = loop[idx].text;
    idx = (idx + 1) % loop.length;
    reelEl.style.transform = `translateY(${Math.sin(now/120)*2}px)`;

    if(elapsed < durationMs){
      timeoutId = setTimeout(()=>requestAnimationFrame(tick), stepMs);
    }else{
      reelEl.style.transform = 'translateY(0)';
      reelEl.textContent = symbolDisplay(finalSymbol);
      reelEl.setAttribute('aria-label', finalSymbol.label);
    }
  }
  requestAnimationFrame(tick);
  return ()=>{ try{ clearTimeout(timeoutId); }catch(_){ } };
}

function setUIBusy(busy){
  spinning = busy;
  spinBtn.disabled = busy;
  leverBtn.disabled = busy;
  spinBtn.setAttribute('aria-disabled', String(busy));
  leverBtn.setAttribute('aria-disabled', String(busy));
  if(busy){ leverBtn.classList.add('active'); } else { leverBtn.classList.remove('active'); }
}

async function doSpin(){
  if(spinning) return;
  setUIBusy(true);
  resultEl.textContent = '';

  // Spin-Ergebnisse ziehen
  const symbols = spinReels();

  // Dauer je Reel (staggered)
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const base = prefersReduced ? 600 : 900;
  const durations = [base, base+150, base+300];

  // Start-Offsets, damit Reels nicht synchron laufen
  const offsets = [Math.floor(Math.random()*5), Math.floor(Math.random()*5), Math.floor(Math.random()*5)];

  // Animationen starten
  const cancels = [
    animateSingleReel(reelEls[0], durations[0], symbols[0], offsets[0]),
    animateSingleReel(reelEls[1], durations[1], symbols[1], offsets[1]),
    animateSingleReel(reelEls[2], durations[2], symbols[2], offsets[2]),
  ];

  // „Ende“ abwarten
  await new Promise(r=>setTimeout(r, Math.max(...durations)+60));

  // Gewinnlogik
  if(isWin(symbols)){
    const won = symbols[0];
    const reward = getReward(won.key);
    playWinEffects();
    addToCollection(won.key);
    showToast(`${won.label} hinzugefügt ✅ ${reward ? '• ' + reward : ''}`);
    resultEl.textContent = `Gewinn! ${won.label} gesammelt${reward ? ' – Reward: ' + reward : ''}.`;
  }else{
    resultEl.textContent = 'Leider kein Gewinn.';
  }

  setUIBusy(false);
}

spinBtn.addEventListener('click', doSpin);
leverBtn.addEventListener('click', doSpin);

resetBtn.addEventListener('click', ()=>{
  setReelsContent([{label:'—',key:'-'},{label:'—',key:'-'},{label:'—',key:'-'}]);
  resultEl.textContent = '';
});
