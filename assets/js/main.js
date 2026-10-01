// StreamingAssist - dynamic interactions
(function(){
  const $ = (s,c=document)=>c.querySelector(s);
  const $$ = (s,c=document)=>[...c.querySelectorAll(s)];

  // year
  $$('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());

  // header scroll + progress
  const header = $('#siteHeader');
  const progress = $('#progress');
  const onScroll = ()=>{
    const y = window.scrollY;
    if(header) header.classList.toggle('scrolled', y>24);
    if(progress){
      const h = document.documentElement.scrollHeight - innerHeight;
      progress.style.width = (h>0 ? (y/h*100):0)+'%';
    }
  };
  addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // mobile menu
  const burger = $('#hamburger'), mmenu = $('#mobileMenu');
  if(burger && mmenu) burger.addEventListener('click', ()=> mmenu.classList.toggle('open'));

  // starfield canvas
  const canvas = $('#stars');
  if(canvas){
    const ctx = canvas.getContext('2d');
    let W,H,stars=[];
    const resize=()=>{
      W=canvas.width=innerWidth; H=canvas.height=innerHeight;
      stars = Array.from({length: Math.min(160, Math.floor(W/9))}, ()=>({
        x:Math.random()*W, y:Math.random()*H,
        r:Math.random()*1.6+.3, s:Math.random()*.35+.05,
        tw:Math.random()*Math.PI*2, c: Math.random()>.82 ? '255,46,166' : Math.random()>.6 ? '139,92,246' : '255,255,255'
      }));
    };
    resize(); addEventListener('resize', resize);
    (function loop(){
      ctx.clearRect(0,0,W,H);
      const t = Date.now()/1000;
      for(const st of stars){
        st.y -= st.s; if(st.y<-4){st.y=H+4; st.x=Math.random()*W;}
        const a = .35 + Math.abs(Math.sin(t*1.2+st.tw))*.55;
        ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, 7);
        ctx.fillStyle = `rgba(${st.c},${a})`; ctx.fill();
      }
      requestAnimationFrame(loop);
    })();
  }

  // cursor glow
  const glow = $('#cursorGlow');
  if(glow && matchMedia('(pointer:fine)').matches){
    addEventListener('mousemove', e=>{
      glow.style.left=e.clientX+'px'; glow.style.top=e.clientY+'px';
    }, {passive:true});
  }

  // reveal on scroll
  const io = new IntersectionObserver(entries=>{
    entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('visible'); io.unobserve(en.target);} });
  },{threshold:.12});
  $$('.reveal').forEach(el=>io.observe(el));

  // counters
  const cio = new IntersectionObserver(entries=>{
    entries.forEach(en=>{
      if(!en.isIntersecting) return;
      const el=en.target, end=parseFloat(el.dataset.count||'0'), dec=parseInt(el.dataset.dec||'0');
      const suf=el.dataset.suffix||''; const dur=1400; const t0=performance.now();
      (function tick(t){
        const p=Math.min(1,(t-t0)/dur), e=1-Math.pow(1-p,3);
        el.textContent=(end*e).toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g,',')+suf;
        if(p<1) requestAnimationFrame(tick);
      })(t0);
      cio.unobserve(el);
    });
  },{threshold:.5});
  $$('[data-count]').forEach(el=>cio.observe(el));

  // FAQ
  $$('.faq-item').forEach(item=>{
    $('.faq-q',item)?.addEventListener('click',()=>{
      const open=item.classList.contains('open');
      $$('.faq-item.open').forEach(o=>o.classList.remove('open'));
      if(!open) item.classList.add('open');
    });
  });

  // testimonials slider
  const slides=$$('.testi'), dotsWrap=$('#testiDots');
  if(slides.length && dotsWrap){
    let idx=0, timer;
    slides.forEach((_,i)=>{
      const b=document.createElement('button');
      b.setAttribute('aria-label','Show testimonial '+(i+1));
      if(i===0)b.classList.add('active');
      b.addEventListener('click',()=>go(i,true));
      dotsWrap.appendChild(b);
    });
    const dots=[...dotsWrap.children];
    function go(i,manual){
      idx=(i+slides.length)%slides.length;
      slides.forEach((s,k)=>s.classList.toggle('active',k===idx));
      dots.forEach((d,k)=>d.classList.toggle('active',k===idx));
      if(manual) restart();
    }
    function restart(){ clearInterval(timer); timer=setInterval(()=>go(idx+1),5200); }
    restart();
  }

  // tilt on cards (desktop)
  if(matchMedia('(pointer:fine)').matches){
    $$('[data-tilt]').forEach(card=>{
      card.addEventListener('mousemove', e=>{
        const r=card.getBoundingClientRect();
        const rx=((e.clientY-r.top)/r.height-.5)*-7;
        const ry=((e.clientX-r.left)/r.width-.5)*7;
        card.style.transform=`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', ()=>{card.style.transform='';});
    });
  }

  // smooth anchor offset for fixed header
  $$('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
      const id=a.getAttribute('href');
      if(id.length>1){
        const t=$(id);
        if(t){ e.preventDefault(); mmenu?.classList.remove('open');
          window.scrollTo({top:t.getBoundingClientRect().top+scrollY-90,behavior:'smooth'});
        }
      }
    });
  });

  // call intent logging (for future ads conversion hook)
  $$('a[href^="tel:"]').forEach(a=>{
    a.addEventListener('click', ()=>{
      try{
        if(typeof gtag!=='undefined') gtag('event','conversion',{event_category:'call',event_label:a.href});
        if(typeof dataLayer!=='undefined') dataLayer.push({event:'call_click'});
      }catch(e){}
    });
  });

  // dynamic "experts online" + wait time simulation
  const onlineEl=$('#onlineCount'), waitEl=$('#waitTime');
  if(onlineEl){
    let n=14+Math.floor(Math.random()*6);
    setInterval(()=>{ n=Math.max(9,Math.min(23,n+(Math.random()>.5?1:-1))); onlineEl.textContent=n; },4000);
  }
  if(waitEl){
    setInterval(()=>{ waitEl.textContent=(Math.random()*1.4+.4).toFixed(1)+' min'; },5000);
  }

  // session call pop-up for each session, shortly after site opens
  const modal=$('#callModal');
  if(modal){
    const closeModal=()=>{ modal.classList.remove('open'); document.body.style.overflow=''; try{sessionStorage.setItem('sa_call_seen','1');}catch(e){} };
    let seen=false; try{seen=!!sessionStorage.getItem('sa_call_seen');}catch(e){}
    if(!seen) setTimeout(()=>{ if(!sessionStorage.getItem('sa_call_seen')){ modal.classList.add('open'); document.body.style.overflow='hidden'; } },2500);
    modal.querySelector('[data-close]')?.addEventListener('click', closeModal);
    modal.addEventListener('click', e=>{ if(e.target===modal) closeModal(); });
    modal.querySelector('a[href^="tel:"]')?.addEventListener('click', closeModal);
    addEventListener('keydown', e=>{ if(e.key==='Escape'&&modal.classList.contains('open')) closeModal(); });
  }

  // current time greeting for support badge
  const badge=$('#supportBadge');
  if(badge){
    const h=new Date().getHours();
    const label=(h>=22||h<6)?'Night crew online now':(h>=17?'Evening experts online':'Live experts online now');
    badge.innerHTML='<span class="live"></span> '+label+' • Avg pickup <b id="waitTime">1.2 min</b>';
  }
})();
