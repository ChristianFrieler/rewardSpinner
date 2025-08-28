// ----- Symbols & Rarity -------------------------------------------------------
export const SYMBOLS = [
  { key: 'VOLKER',  label: 'Volker',    type: 'figure',  weight: 24 },
  { key: 'MARKUS',  label: 'Markus',    type: 'figure',  weight: 24 },
  { key: 'CAT',     label: 'Katze 🐱',  type: 'animal',  weight: 24 },
  { key: 'ZONK',    label: 'ZONK',      type: 'lose',    weight: 26 },
  { key: 'VIADEE',  label: 'viadee',    type: 'logo',    weight: 2  }, // selten
];

export const RARITY_ORDER = ['logo', 'figure', 'animal', 'lose'];
const STORAGE_KEY = 'rewardCollection';

// Für die visuelle Rotation
export const SYMBOL_DISPLAY_LOOP = [
  { key: 'VOLKER',  text: 'Volker' },
  { key: 'MARKUS',  text: 'Markus' },
  { key: 'CAT',     text: '🐱' },
  { key: 'ZONK',    text: '✖' },
  { key: 'VIADEE',  text: 'viadee' },
];

// ----- Rewards Mapping --------------------------------------------------------
export const REWARDS = {
  VIADEE: '1 Urlaubstag',
  VOLKER: '50 € Gutschein',
  MARKUS: 'Home-Office-Upgrade (100 €)',
  CAT:    'Kaffee-Flat (1 Woche)',
  ZONK:   'kein Gewinn',
};
export const getReward = (key)=> REWARDS[key] || '';

// ----- RNG & Helpers ----------------------------------------------------------
export function weightedPick(items){
  const total = items.reduce((s,i)=>s+i.weight,0);
  const r = Math.random()*total;
  let acc=0;
  for(const it of items){
    acc += it.weight;
    if(r <= acc) return it;
  }
  return items[items.length-1];
}

export function spinReels(){
  return [weightedPick(SYMBOLS), weightedPick(SYMBOLS), weightedPick(SYMBOLS)];
}

export function isWin([a,b,c]){
  return a.key === b.key && b.key === c.key && a.key !== 'ZONK';
}

// ----- Storage (localStorage) ------------------------------------------------
export function loadCollection(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}'); }
  catch(_){ return {}; }
}
export function saveCollection(obj){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
}
export function addToCollection(symbolKey){
  const col = loadCollection();
  col[symbolKey] = (col[symbolKey]||0) + 1;
  saveCollection(col);
  return col;
}

// ----- UI helpers -------------------------------------------------------------
export function symbolDisplay(symbol){
  if(symbol.key === 'CAT') return '🐱';
  if(symbol.key === 'ZONK') return '✖';
  if(symbol.key === 'VIADEE') return 'viadee';
  return symbol.label;
}

export function byRarityThenCount([keyA,countA],[keyB,countB]){
  const a = SYMBOLS.find(s=>s.key===keyA);
  const b = SYMBOLS.find(s=>s.key===keyB);
  const rA = RARITY_ORDER.indexOf(a.type);
  const rB = RARITY_ORDER.indexOf(b.type);
  if(rA !== rB) return rA - rB;
  if(countA !== countB) return countB - countA;
  return a.label.localeCompare(b.label,'de');
}
export function byCountDesc([keyA,countA],[keyB,countB]){
  if(countA !== countB) return countB - countA;
  const a = SYMBOLS.find(s=>s.key===keyA);
  const b = SYMBOLS.find(s=>s.key===keyB);
  return a.label.localeCompare(b.label,'de');
}
export function byName([keyA],[keyB]){
  const a = SYMBOLS.find(s=>s.key===keyA);
  const b = SYMBOLS.find(s=>s.key===keyB);
  return a.label.localeCompare(b.label,'de');
}
