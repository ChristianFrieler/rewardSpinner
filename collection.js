import {
  SYMBOLS,
  loadCollection,
  saveCollection,
  byRarityThenCount,
  byCountDesc,
  byName
} from './utils.js';

const grid = document.getElementById('collectionGrid');
const sortSelect = document.getElementById('sortSelect');
const clearBtn = document.getElementById('clearBtn');
const emptyHint = document.getElementById('emptyHint');

document.getElementById('year').textContent = new Date().getFullYear();

function entryToDOM(key, count){
  const s = SYMBOLS.find(x=>x.key===key);
  const card = document.createElement('div');
  card.className = 'card-item';

  const badge = document.createElement('div');
  badge.className = 'badge';

  const thumb = document.createElement('div');
  thumb.className = 'thumb';

  let content = s.label[0].toUpperCase();
  if(s.key === 'CAT') content = '🐱';
  if(s.key === 'ZONK') content = '✖';
  if(s.key === 'VIADEE'){
    const img = new Image();
    img.src = './assets/viadee-logo.png';
    img.alt = 'viadee Logo';
    img.style.width = '20px';
    img.style.height = '20px';
    img.style.objectFit = 'contain';
    thumb.appendChild(img);
  }else{
    thumb.textContent = content;
  }

  const label = document.createElement('span');
  label.textContent = s.label;

  badge.appendChild(thumb);
  badge.appendChild(label);

  const cnt = document.createElement('div');
  cnt.className = 'count';
  cnt.textContent = `×${count}`;

  card.appendChild(badge);
  card.appendChild(cnt);
  return card;
}

function render(){
  const col = loadCollection();
  const entries = Object.entries(col);

  if(entries.length === 0){
    grid.innerHTML = '';
    emptyHint.hidden = false;
    return;
  }
  emptyHint.hidden = true;

  let sorted = entries.slice();
  const mode = sortSelect.value;
  if(mode === 'rarity') sorted.sort(byRarityThenCount);
  else if(mode === 'count') sorted.sort(byCountDesc);
  else sorted.sort(byName);

  grid.innerHTML = '';
  for(const [key, count] of sorted){
    grid.appendChild(entryToDOM(key, count));
  }
}

sortSelect.addEventListener('change', render);
clearBtn.addEventListener('click', ()=>{
  saveCollection({});
  render();
});

render();
