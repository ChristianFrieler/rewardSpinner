import {
  SYMBOLS,
  spinReels,
  isWin,
  addToCollection,
  symbolDisplay,
  getReward
} from './utils.js';

/**
 * Reel-Scroll-Animation:
 * - Jedes Reel besitzt eine "strip" Liste aus .cell-Elementen (DISPLAY_ORDER).
 * - Beim Spin wird die strip per CSS-Transition nach oben gescrollt.
 * - Wir berechnen eine absolute Ziel-Indexposition, sodass die sichtbare Zelle
 *   am Ende dem gewünschten Symbol entspricht. Anschließend snappen wir zurück
 *   auf die modulare Position, um die Transform-Matrix klein zu halten.
 */

const DISPLAY_ORDER = ['VOLKER','MARKUS','CAT','ZONK','VIADEE']; // sichtbare Reihenfolge
const REEL_IDS = [1,2,3];

const $ = (s)=>document.querySelector(s);
const spinBtn  = $('#spinBtn');
const resetBtn = $('#resetBtn');
const leverBtn = $('#lever');
const marquee  = $('#marquee');
const resultEl = $('#result');
const toastEl  = $('#toast');
const confettiCanvas = $('#confetti');
document.getElementById('year').textContent = new Date().getFullYear();

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const baseDuration = prefersReduced ? 450 : 900;  // ms
const easing = 'cubic-bezier(.18,.9,.22,1)';

let spinning = false;
const reels = []; // { winEl, stripEl, cellH, baseLen, currentIndex }

function getSymbolByKey(key){ return SYMBOLS.find(s=>s.key===key); }
function setAria(winEl, sym){ winEl.setAttribute('aria-label', sym ? sym.label : '—'); }

function buildStrip(stripEl){
  stripEl.innerHTML = '';
  for(const key of DISPLAY_ORDER){
    const sym = getSymbolByKey(key);
    const cell = document.createElement('div');
    cell.className = 'cell';
    if(key === 'ZONK') cell.classList.add('bad');
    if(key === 'VIADEE') cell.classList.add('logo');
    cell.dataset.key = key;
    cell.textContent = symbolDisplay(sym);
    stripEl.appendChild(cell);
  }
  // Dupliziere für weicheres Scrollen (genug Länge)
  for(let i=0;i<20;i++){
    for(const key of DISPLAY_ORDER){
      const sym = getSymbolByKey(key);
      const cell = document.createElement('div');
      cell.className = 'cell';
      if(key === 'ZONK') cell.classList.add('bad');
      if(key === 'VIADEE') cell.classList.add('logo');
      cell.dataset.key = key;
      cell.textContent = symbolDisplay(sym);
      stripEl.appendChild(cell);
    }
  }
}

function snapToIndex(strip, index){
  const cellH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell-h'));
  strip.style.transition = 'none';
  strip.style.transform = `translateY(${-index * cellH}px)`;
  // force reflow
  void strip.offsetWidth;
}

function animateToIndex(strip, fromIndex, toAbsIndex, duration){
  const cellH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell-h'));
  strip.style.transition = `transform ${duration}ms ${easing}`;
  strip.style.transform = `translateY(${-toAbsIndex * cellH}px)`;
  return new Promise(resolve=>{
    const onEnd = (e)=>{
      if(e.propertyName !== 'transform') return;
      strip.removeEventListener('transitionend', onEnd);
      resolve();
    };
    strip.addEventListener('transitionend', onEnd);
  });
}

function setup(){
  for(const id of REEL_IDS){
    const winEl = document.getElementById(`reel-${id}`);
    const stripEl = document.getElementById(`reel-${id}-strip`);
    buildStrip(stripEl);
    // Anfangsposition: Index 0
    snapToIndex(stripEl, 0);
    setAria(winEl, null);
    reels.push({ winEl, stripEl, baseLen: DISPLAY_ORDER.length, currentIndex: 0 });
  }
}
setup();

function setUIBusy(b){
  spinning = b;
  spinBtn.disabled = b;
  leverBtn.disabled = b;
  spinBtn.setAttribute('aria-disabled', String(b));
  leverBtn.setAttribute('aria-disabled', String(b));
  leverBtn.classList.toggle('active', b);
}

function showToast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(()=> toastEl.classList.remove('show'), 1800);
}

function playWinFX(){
  marquee.classList.add('lit');
  if(window.launchConfetti){ window.launchConfetti(confettiCanvas, 700); }
  setTimeout(()=> marquee.classList.remove('lit'), 900);
}

async function doSpin(){
  if(spinning) return;
  setUIBusy(true);
  resultEl.textContent = '';

  const results = spinReels(); // 3 Symbole (weighted)
  const durations = [baseDuration, baseDuration+150, baseDuration+300];

  // Für jedes Reel das Ziel berechnen
  const promises = reels.map(async (r, idx)=>{
    const targetKey = results[idx].key;
    const targetIndexInCycle = DISPLAY_ORDER.indexOf(targetKey);
    // Zufällige Anzahl kompletter Zyklen für "Gewicht"
    const cycles = prefersReduced ? 4 : (8 + Math.floor(Math.random()*5)); // 8..12
    const toAbsIndex = r.currentIndex + cycles * r.baseLen + targetIndexInCycle;

    // Start bei aktueller Position
    snapToIndex(r.stripEl, r.currentIndex);
    await new Promise(requestAnimationFrame); // next frame
    await animateToIndex(r.stripEl, r.currentIndex, toAbsIndex, durations[idx]);

    // Snap zurück auf modulare Zielposition
    const finalIndex = toAbsIndex % r.baseLen;
    snapToIndex(r.stripEl, finalIndex);
    r.currentIndex = finalIndex;

    // A11y Label aktualisieren
    setAria(r.winEl, getSymbolByKey(targetKey));
  });

  await Promise.all(promises);

  // Gewinnlogik
  if(isWin(results)){
    const won = results[0];
    const reward = getReward(won.key);
    playWinFX();
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
  reels.forEach(r=>{
    r.currentIndex = 0;
    snapToIndex(r.stripEl, 0);
    setAria(r.winEl, null);
  });
  resultEl.textContent = '';
});

// Responsiveness: bei Resize cell-height neu anwenden (Snap hält Bild stabil)
let resizeTO;
window.addEventListener('resize', ()=>{
  clearTimeout(resizeTO);
  resizeTO = setTimeout(()=>{
    reels.forEach(r=> snapToIndex(r.stripEl, r.currentIndex));
  }, 120);
});
