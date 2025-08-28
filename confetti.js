// Kleiner Konfetti-Emitter ohne Abhängigkeiten
export function launchPieces(ctx, W, H, n=80){
  const pieces = Array.from({length:n},()=>({
    x: Math.random()*W,
    y: -20 - Math.random()*H*0.3,
    vx: (Math.random()-.5)*2,
    vy: 2 + Math.random()*3,
    s: 2 + Math.random()*3,
    r: Math.random()*Math.PI
  }));
  let running = true;

  function frame(){
    if(!running) return;
    ctx.clearRect(0,0,W,H);
    for(const p of pieces){
      p.x += p.vx;
      p.y += p.vy;
      p.r += 0.05;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillRect(-p.s/2, -p.s/2, p.s, p.s);
      ctx.restore();
    }
    if(pieces.every(p=>p.y > H+30)) running = false;
    else requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

window.launchConfetti = (canvas, durationMs=600)=>{
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const resize = ()=>{
    canvas.width  = Math.floor(innerWidth * dpr);
    canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width  = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
  };
  resize();
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const start = performance.now();
  function tick(now){
    launchPieces(ctx, innerWidth, innerHeight, 70);
    if(now - start < durationMs){
      setTimeout(()=>requestAnimationFrame(tick), 120);
    }else{
      // Fade out
      setTimeout(()=>{ ctx.clearRect(0,0,canvas.width,canvas.height); }, 800);
    }
  }
  requestAnimationFrame(tick);
};
