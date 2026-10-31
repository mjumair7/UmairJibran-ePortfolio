(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.querySelector('.signal-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let frame = 0, visible = true, w = 0, h = 0;
  function size() { const r=canvas.getBoundingClientRect(); w=r.width;h=r.height;canvas.width=w*devicePixelRatio;canvas.height=h*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0); }
  function draw(t=0) {
    ctx.clearRect(0,0,w,h);
    for(let row=0;row<7;row++) {
      const y=30+row*(h-60)/6;
      ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w*.3,y);ctx.lineTo(w*.45,y+22);ctx.lineTo(w*.75,y+22);ctx.lineTo(w,y-10);ctx.strokeStyle='rgba(176,210,187,.15)';ctx.lineWidth=1;ctx.stroke();
      const x=motion.matches?w*.5:((t*.06+row*80)%(w+20))-10;
      const dy=x<w*.3?y:x<w*.45?y+(x-w*.3)/(w*.15)*22:x<w*.75?y+22:y+22-(x-w*.75)/(w*.25)*32;
      ctx.beginPath();ctx.arc(x,dy,3,0,Math.PI*2);ctx.fillStyle=row%2?'#e46242':'#b9d5b9';ctx.shadowBlur=12;ctx.shadowColor=ctx.fillStyle;ctx.fill();ctx.shadowBlur=0;
    }
    frame=0;if(!motion.matches&&visible&&!document.hidden)frame=requestAnimationFrame(draw);
  }
  function start(){if(!frame)frame=requestAnimationFrame(draw);}
  new ResizeObserver(()=>{size();start();}).observe(canvas);
  new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)start();else {cancelAnimationFrame(frame);frame=0;}}).observe(canvas);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)start();});motion.addEventListener('change',()=>{cancelAnimationFrame(frame);frame=0;start();});
  document.querySelectorAll('.case-study').forEach(el=>{
    el.addEventListener('pointermove',e=>{if(motion.matches||e.pointerType!=='mouse')return;const r=el.getBoundingClientRect();el.style.setProperty('--glow-x',`${e.clientX-r.left}px`);el.style.setProperty('--glow-y',`${e.clientY-r.top}px`);});
  });
})();
