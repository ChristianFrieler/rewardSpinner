import { SYMBOLS, spinReels, isWin, addToCollection, symbolDisplay } from './utils.js';

const $ = sel => document.querySelector(sel);

const reelEls = [$('#reel-1'), $('#reel-2'), $('#reel-3')];
const spinBtn  = $('#spinBtn');
const resetBtn = $('#resetBtn');
const resultEl = $('#result');
const toastEl  = $('#toast');
const confettiCanvas = $('#confetti');

let spinning = false;
document.getElementById('year').textContent = new Date().getFullYear();

function setReelsContent(symbols){
  symbols.forEach((s, i)=>{
    reelEls[i].textContent = symbolDisplay(s);
    reelEls[i].setAttribute('aria-label', `${s.label}`);
  });
}

function animateReels(){
  reelEls.forEach(el=>{
    el.classList.remove('win');
    // Reflow trick
    void el.offsetWidth;
    el.classList.add('spin');
    setTimeout(()=>el.classList.remove('spin'), 1000);
  });
}

function showToast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(()=> toastEl.classList.remove('show'), 1500);
}

function playWinEffects(){
  reelEls.forEach(el=>el.classList.add('win'));
  // Mini Konfetti
  if(window.launchConfetti){
    window.launchConfetti(confettiCanvas, 450);
  }
}

spinBtn.addEventListener('click', async ()=>{
  if(spinning) return;
  spinning = true;
  resultEl.textContent = '';
  animateReels();

  // "Rollzeit"
  await new Promise(r=>setTimeout(r, 1000));

  const symbols = spinReels();
  setReelsContent(symbols);

  if(isWin(symbols)){
    playWinEffects();
    const won = symbols[0];
    addToCollection(won.key);
    showToast(`${won.label} hinzugefügt ✅`);
    resultEl.textContent = `Gewinn! ${won.label} gesammelt.`;
  }else{
    resultEl.textContent = 'Leider kein Gewinn.';
  }

  spinning = false;
});

resetBtn.addEventListener('click', ()=>{
  setReelsContent([{label:'—'},{label:'—'},{label:'—'}]);
  resultEl.textContent = '';
});
