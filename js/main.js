'use strict';

const $  = (s, c=document) => c.querySelector(s);
const $$ = (s, c=document) => [...c.querySelectorAll(s)];
const on = (el, ev, fn, opts) => el?.addEventListener(ev, fn, opts);

function initLoader() {
  document.body.style.overflow = 'hidden';
  window.addEventListener('load', () => {
    setTimeout(() => {
      $('#loader')?.classList.add('out');
      document.body.style.overflow = '';
      setTimeout(() => {
        $$('#hero .rv, #hero .rvL, #hero .rvR').forEach((el,i) =>
          setTimeout(() => el.classList.add('in'), i * 100)
        );
        startTyping();
      }, 420);
    }, 2150);
  });
}

function initCursor() {
  if (!window.matchMedia('(hover:hover)').matches) return;
  const dot  = $('#cursor-dot');
  const ring = $('#cursor-ring');
  if (!dot || !ring) return;

  let mx=0, my=0, rx=0, ry=0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx+'px'; dot.style.top = my+'px';
  });
  (function loop() {
    rx += (mx-rx)*.11; ry += (my-ry)*.11;
    ring.style.left = rx+'px'; ring.style.top = ry+'px';
    requestAnimationFrame(loop);
  })();
  const hov = 'a,button,.card,.tb,.trait,.ci-item,.social-btn,.proj-stack span,.tl-chips span';
  on(document,'mouseover', e => { if(e.target.closest(hov)) document.body.classList.add('hov'); });
  on(document,'mouseout',  e => { if(e.target.closest(hov)) document.body.classList.remove('hov'); });
  on(document,'mouseleave',() => { dot.style.opacity='0'; ring.style.opacity='0'; });
  on(document,'mouseenter',() => { dot.style.opacity='1'; ring.style.opacity='1'; });
}

function initCanvas() {
  const canvas = $('#bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts = [], t = 0;

  const resize = () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  };
  const buildPts = () => {
    pts = Array.from({length: 90}, () => ({
      x: Math.random()*W, y: Math.random()*H,
      r: Math.random()*1.3+.3,
      vx:(Math.random()-.5)*.2, vy:(Math.random()-.5)*.2,
      a: Math.random()*.5+.1,
      hue: Math.random()>.6 ? 210 : 196,
    }));
  };

  resize(); buildPts();

  function draw() {
    ctx.clearRect(0,0,W,H);
    t += .004;

    const orbs=[
      {x:W*(.18+.05*Math.sin(t)),       y:H*(.28+.04*Math.cos(t*.7)),  r:380, c:'37,99,235'},
      {x:W*(.82+.04*Math.cos(t*.9)),     y:H*(.72+.05*Math.sin(t)),     r:300, c:'56,189,248'},
      {x:W*(.5 +.06*Math.sin(t*1.3)),    y:H*(.12+.03*Math.cos(t*1.1)),r:220, c:'129,140,248'},
    ];
    orbs.forEach(o => {
      const g=ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,o.r);
      g.addColorStop(0,`rgba(${o.c},.1)`); g.addColorStop(1,`rgba(${o.c},0)`);
      ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    });

    pts.forEach((p,i) => {
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0)p.x=W; if(p.x>W)p.x=0;
      if(p.y<0)p.y=H; if(p.y>H)p.y=0;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`hsla(${p.hue},90%,70%,${p.a*.35})`; ctx.fill();
      for(let j=i+1;j<pts.length;j++){
        const dx=p.x-pts[j].x, dy=p.y-pts[j].y, d=Math.sqrt(dx*dx+dy*dy);
        if(d<85){
          ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(pts[j].x,pts[j].y);
          ctx.strokeStyle=`rgba(56,189,248,${(1-d/85)*.07})`; ctx.lineWidth=.5; ctx.stroke();
        }
      }
    });
    requestAnimationFrame(draw);
  }
  draw();

  let rt;
  window.addEventListener('resize',()=>{ clearTimeout(rt); rt=setTimeout(()=>{resize();buildPts();},220); });
}

function initNavbar() {
  const nav  = $('#navbar');
  const ham  = $('#hamburger');
  const mNav = $('#mobile-nav');

  const onScroll = () => {
    nav?.classList.toggle('sc', window.scrollY > 40);
    $('#scroll-top')?.classList.toggle('vis', window.scrollY > 500);
    let cur='';
    $$('section[id]').forEach(sec => {
      if(sec.getBoundingClientRect().top < 130) cur = sec.id;
    });
    $$('.nav-link').forEach(a => a.classList.toggle('active', a.getAttribute('href')==='#'+cur));
  };
  on(window,'scroll',onScroll,{passive:true}); onScroll();

  on(ham,'click',() => {
    const open = ham.classList.toggle('open');
    mNav?.classList.toggle('open',open);
    ham.setAttribute('aria-expanded',open);
    mNav?.setAttribute('aria-hidden',!open);
  });
  $$('.mob-link,.mob-cta').forEach(a => on(a,'click',()=>{
    ham?.classList.remove('open');
    mNav?.classList.remove('open');
    ham?.setAttribute('aria-expanded','false');
    mNav?.setAttribute('aria-hidden','true');
  }));

  on(document,'click',e=>{
    const lnk = e.target.closest('a[href^="#"]');
    if(!lnk) return;
    const t = $(lnk.getAttribute('href'));
    if(t){ e.preventDefault(); t.scrollIntoView({behavior:'smooth'}); }
  });

  on(document,'keydown',e=>{
    if(e.key==='Escape' && mNav?.classList.contains('open')){
      ham?.classList.remove('open');
      mNav.classList.remove('open');
    }
  });
}

function initTheme() {
  const btn  = $('#theme-btn');
  const html = document.documentElement;
  const saved = localStorage.getItem('sgc-theme');
  if(saved){ html.dataset.theme=saved; if(btn) btn.textContent=saved==='dark'?'🌙':'☀️'; }
  on(btn,'click',()=>{
    const next = html.dataset.theme==='dark'?'light':'dark';
    html.dataset.theme=next;
    if(btn) btn.textContent=next==='dark'?'🌙':'☀️';
    localStorage.setItem('sgc-theme',next);
  });
}

let typingStarted=false;
function startTyping() {
  if(typingStarted) return; typingStarted=true;
  const el=$('#typed-text'); if(!el) return;
  const words=['Java Developer','Web Developer','Problem Solver','BCA Student','Algorithm Enthusiast','Django Developer'];
  let wi=0,ci=0,del=false;
  function tick(){
    const w=words[wi];
    el.textContent = del ? w.slice(0,--ci) : w.slice(0,++ci);
    let dt = del ? 42 : 82;
    if(!del && ci===w.length){ dt=2300; del=true; }
    else if(del && ci===0){ del=false; wi=(wi+1)%words.length; dt=340; }
    setTimeout(tick,dt);
  }
  setTimeout(tick,500);
}

function initReveal() {
  const heroEls = new Set($$('#hero .rv,#hero .rvL,#hero .rvR'));
  const ro = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting || heroEls.has(e.target)) return;
      e.target.classList.add('in');
      triggerBars(e.target);
      triggerCount(e.target);
      ro.unobserve(e.target);
    });
  },{threshold:.1,rootMargin:'0px 0px -40px 0px'});
  $$('.rv,.rvL,.rvR').forEach(el=>ro.observe(el));
}

function triggerBars(el) {
  $$('.sk-fill',el).forEach(b=>{ b.style.width=(b.dataset.w||0)+'%'; });
  $$('.jc-fill',el).forEach(b=>{ b.style.width=(b.dataset.w||0)+'%'; });
}

function triggerCount(el) {
  $$('[data-count]',el).forEach(countUp);
}

function countUp(el) {
  const target=parseInt(el.dataset.count,10);
  const suffix=el.dataset.suffix||'';
  const steps=120, inc=target/steps;
  let cur=0;
  const id=setInterval(()=>{
    cur=Math.min(cur+inc,target);
    el.textContent=Math.floor(cur)+suffix;
    if(cur>=target) clearInterval(id);
  },1000/60);
}

function initSectionBars() {
  ['#skills','#journey','#stats'].forEach(sel=>{
    const sec=$(sel); if(!sec) return;
    const ro=new IntersectionObserver(entries=>{
      if(!entries[0].isIntersecting) return;
      $$('.sk-fill',sec).forEach(b=>{ b.style.width=(b.dataset.w||0)+'%'; });
      $$('.jc-fill',sec).forEach(b=>{ b.style.width=(b.dataset.w||0)+'%'; });
      $$('[data-count]',sec).forEach(countUp);
      ro.disconnect();
    },{threshold:.12});
    ro.observe(sec);
  });
}

function initTilt() {
  if(!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  $$('.card,.proj-card').forEach(card=>{
    on(card,'mousemove',e=>{
      const r=card.getBoundingClientRect();
      const x=((e.clientX-r.left)/r.width -.5)*8;
      const y=((e.clientY-r.top) /r.height-.5)*-8;
      card.style.transform=`perspective(700px) rotateX(${y}deg) rotateY(${x}deg) translateY(-6px)`;
    });
    on(card,'mouseleave',()=>{
      card.style.transform='';
      card.style.transition='transform .5s cubic-bezier(0.34,1.56,0.64,1)';
      setTimeout(()=>card.style.transition='',500);
    });
  });
}

function initStagger() {
  ['.about-right','.tech-bubbles','.journey-grid'].forEach(sel=>{
    const g=$(sel); if(!g) return;
    const ro=new IntersectionObserver(entries=>{
      if(!entries[0].isIntersecting) return;
      [...g.children].forEach((c,i)=>setTimeout(()=>c.classList.add('in'),i*75));
      ro.disconnect();
    },{threshold:.1});
    ro.observe(g);
  });
}

function initProjSpotlight() {
  $$('.proj-card').forEach(card=>{
    on(card,'mousemove',e=>{
      const r=card.getBoundingClientRect();
      const x=((e.clientX-r.left)/r.width*100).toFixed(1)+'%';
      const y=((e.clientY-r.top) /r.height*100).toFixed(1)+'%';
      card.style.background=`radial-gradient(circle at ${x} ${y},rgba(56,189,248,.05) 0%,var(--surface) 60%)`;
    });
    on(card,'mouseleave',()=>{ card.style.background=''; });
  });
}

function initParallax() {
  if(!window.matchMedia('(hover:hover)').matches) return;
  const vis=$('.hero-visual'); if(!vis) return;
  on(document,'mousemove',e=>{
    const dx=(e.clientX-window.innerWidth/2)/window.innerWidth;
    const dy=(e.clientY-window.innerHeight/2)/window.innerHeight;
    vis.style.transform=`translate(${dx*-12}px,${dy*-7}px)`;
  });
}

function initForm() {
  const btn=$('#send-btn'); if(!btn) return;
  on(btn,'click',sendMessage);
  $$('#contact-form input').forEach(i=>on(i,'keydown',e=>{ if(e.key==='Enter') sendMessage(); }));
}

function sendMessage() {
  const nm  = $('#f-name')?.value.trim()||'';
  const em  = $('#f-email')?.value.trim()||'';
  const sub = $('#f-subject')?.value.trim()||'';
  const msg = $('#f-msg')?.value.trim()||'';
  if(!nm)  { toast('Please enter your name.','err'); $('#f-name')?.focus(); return; }
  if(!em||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { toast('Please enter a valid email.','err'); $('#f-email')?.focus(); return; }
  if(!msg) { toast('Please write a message.','err'); $('#f-msg')?.focus(); return; }

  const btn=$('#send-btn');
  if(btn){ btn.disabled=true; btn.textContent='Sending…'; }
  setTimeout(()=>{
    const messages = JSON.parse(localStorage.getItem('sgc_messages')||'[]');
    messages.push({ id: Date.now(), name: nm, email: em, subject: sub, message: msg, date: new Date().toISOString(), read: false });
    localStorage.setItem('sgc_messages', JSON.stringify(messages));
    toast('Message sent! I\'ll reply within 24 hours 🚀','ok');
    ['f-name','f-email','f-subject','f-msg'].forEach(id=>{ const el=$('#'+id); if(el) el.value=''; });
    if(btn){ btn.disabled=false; btn.textContent='Send Message ✈️'; }
  },900);
}
window.sendMessage = sendMessage;

let toastTimer;
function toast(msg,type='ok'){
  const el=$('#toast'); if(!el) return;
  clearTimeout(toastTimer);
  el.textContent = ({ok:'✅',err:'❌',inf:'ℹ️'}[type]||'ℹ️')+' '+msg;
  el.className   = `show t-${type}`;
  toastTimer=setTimeout(()=>el.className='',4500);
}
window.showToast=toast;

function initScrollTop() {
  const btn=$('#scroll-top'); if(!btn) return;
  on(btn,'click',()=>window.scrollTo({top:0,behavior:'smooth'}));
}

window.downloadCV=function(){
  // Replace with: window.open('assets/Siddhartha_GC_CV.pdf','_blank');
  toast('Resume PDF coming soon! 📄','inf');
};

function initProjVisuals() {
  const algoCard = $('.pv-bars');
  if(!algoCard) return;
  const ro=new IntersectionObserver(entries=>{
    if(!entries[0].isIntersecting) return;
    $$('.pv-bar').forEach((b,i)=>{
      setTimeout(()=>{
        const rndH = (Math.random()*50+35).toFixed(0)+'%';
        b.style.height=rndH;
      },i*120);
    });
    ro.disconnect();
  },{threshold:.3});
  ro.observe(algoCard);
}

function initNavIndicator() {
  const ul=$('.nav-links ul'); if(!ul) return;
  const bar=document.createElement('div');
  bar.style.cssText='position:absolute;bottom:0;height:1.5px;background:linear-gradient(90deg,#2563eb,#38bdf8);border-radius:2px;pointer-events:none;opacity:0;transition:left .35s cubic-bezier(0.4,0,0.2,1),width .35s cubic-bezier(0.4,0,0.2,1),opacity .25s';
  ul.style.position='relative'; ul.appendChild(bar);
  $$('.nav-link').forEach(lnk=>{
    on(lnk,'mouseenter',()=>{
      const r=lnk.getBoundingClientRect(), p=ul.getBoundingClientRect();
      bar.style.opacity='1'; bar.style.left=(r.left-p.left)+'px'; bar.style.width=r.width+'px';
    });
  });
  on(ul,'mouseleave',()=>bar.style.opacity='0');
}

function initA11y() {
  on(document,'keydown',e=>{ if(e.key==='Tab') document.body.classList.add('kb-nav'); });
  on(document,'mousedown',()=>document.body.classList.remove('kb-nav'));
}

document.addEventListener('DOMContentLoaded',()=>{
  initLoader();
  initCursor();
  initCanvas();
  initNavbar();
  initTheme();
  initReveal();
  initSectionBars();
  initTilt();
  initStagger();
  initProjSpotlight();
  initParallax();
  initForm();
  initScrollTop();
  initProjVisuals();
  initNavIndicator();
  initA11y();
});

if(window.matchMedia('(prefers-reduced-motion:reduce)').matches){
  document.querySelectorAll('.rv,.rvL,.rvR').forEach(el=>el.classList.add('in'));
}
