/* Animations des maquettes, avec Motion 14.9.0 (motion.dev) */
(function(){
  var root=document.documentElement;
  if(!root.classList.contains('anim'))return;
  if(!window.Motion){root.classList.remove('anim');return}
  const {animate,scroll,inView,stagger,hover,press}=Motion;
  const fam=root.dataset.fam;
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const doux=[.22,1,.36,1];
  const souple=delay=>({type:'spring',bounce:.28,duration:.95,delay});
  const ressort={type:'spring',bounce:.45,duration:.6};
  const si=(s,f)=>{if($(s))f(s)};
  const monte=(s,d)=>si(s,()=>{animate(s,{opacity:[0,1]},{duration:.6,delay:d});animate(s,{y:[24,0]},souple(d))});
  const pop=(s,d)=>si(s,()=>animate(s,{scale:[0,1],opacity:[0,1]},{type:'spring',bounce:.5,duration:.9,delay:d}));
  const flotte=(s,dy,t)=>si(s,()=>inView(s,el=>{const a=animate(el,{y:[0,dy,0]},{duration:t,repeat:Infinity,ease:'easeInOut'});return()=>a.stop()}));
  const devoile=(cadre,img)=>si(cadre,()=>{
    animate(cadre,{clipPath:['inset(100% 0 0 0)','inset(0% 0 0 0)']},{duration:1.1,ease:doux,delay:.15});
    si(img,()=>animate(img,{scale:[1.2,1]},{duration:1.5,ease:doux,delay:.15}));
  });

  /* Barre de progression */
  const bar=document.createElement('div');bar.className='scroll-bar';bar.setAttribute('aria-hidden','true');document.body.prepend(bar);
  scroll(animate(bar,{scaleX:[0,1]},{ease:'linear'}));

  /* Titre d'accueil, ligne par ligne */
  const h1=$('.hero h1');
  if(h1){
    h1.innerHTML=h1.innerHTML.split(/<br\s*\/?>/i).map(x=>'<span class="l"><span class="i">'+x.trim()+'</span></span>').join(' ');
    animate('.hero h1 .i',{y:['112%','0%'],rotate:[5,0]},souple(stagger(.11,{startDelay:.1})));
  }

  /* Accueil, selon le gabarit */
  if(fam==='commerce'){
    const img=$('.hero-img'),cap=$('.hero-img .caption');
    if(img){
      const v=document.createElement('div');v.className='hero-visual';img.parentNode.insertBefore(v,img);v.append(img);
      if(cap){
        const ic=$('.service .ic use'),hr=ic?ic.getAttribute('href'):'#i-star';
        const b=document.createElement('div');b.className='badge-rond';b.setAttribute('aria-hidden','true');
        b.innerHTML='<svg class="txt" viewBox="0 0 132 132"><defs><path id="cercle" d="M66 66m-50 0a50 50 0 1 1 100 0a50 50 0 1 1-100 0"/></defs><text><textPath href="#cercle" textLength="306" lengthAdjust="spacing"></textPath></text></svg><svg class="ic"><use href="'+hr+'"/></svg>';
        b.querySelector('textPath').textContent=cap.textContent.trim()+' ·';
        v.append(b);
        pop('.badge-rond',.9);
        animate('.badge-rond .txt',{rotate:360},{duration:24,repeat:Infinity,ease:'linear'});
      }
      flotte('.hero-visual',-12,7);
    }
    monte('.issue',.05);monte('.hero-row',.55);devoile('.hero-img','.hero-img img');
    const band=$('.band');
    if(band){
      const x=band.innerHTML+'<i></i>',set=x+x+x;
      band.classList.add('marquee');
      band.innerHTML='<div class="band-track"><div class="band-set">'+set+'</div><div class="band-set" aria-hidden="true">'+set+'</div></div>';
      animate('.band-track',{x:['0%','-50%']},{duration:32,repeat:Infinity,ease:'linear'});
      animate(band,{opacity:[0,1]},{duration:.6,delay:.7});
    }
  }else if(fam==='beaute'){
    monte('.ctas',.5);monte('.proof',.65);devoile('.arch','.arch img');pop('.thumb',.7);pop('.slot',.95);
    flotte('.visual',-10,7);
  }else if(fam==='resto'){
    monte('.kicker',.05);monte('.hero-lead',.5);monte('.hero-ctas',.65);monte('.info',.8);
    si('.hero > img',s=>scroll(animate(s,{y:['0%','14%']},{ease:'linear'}),{target:$('.hero'),offset:['start start','end start']}));
  }else if(fam==='artisan'){
    monte('.ctas',.5);monte('.stats',.65);devoile('.visual .img','.visual .img img');pop('.badge-card',.9);
    flotte('.visual',-10,7);
  }

  /* Apparitions au défilement, groupe par groupe */
  const entre=(els,pas,rot)=>{
    animate(els,{opacity:[0,1]},{duration:.5,delay:stagger(pas)});
    animate(els,{y:[38,0],rotate:[rot,0]},souple(stagger(pas)));
  };
  [['.head > *',.1,0],['.gal-head > *',.1,0],['.place-head > *',.1,0],['.reviews-head > *',.1,0],
   ['.cards > div',.13,-3],['.gallery figure',.1,-3],['.service',.12,2],['.svc',.1,2],['.works > *',.1,-2],['.why-item',.08,0],
   ['.events .eyebrow, .events h2, .ev',.09,0],['.menu > div:last-child > *',.06,0],['.hours > div, .lines a',.06,0],['.contact-lines > *',.06,0],['.rdv-info > *',.06,0]
  ].forEach(([sel,pas,rot])=>{
    const par=new Map();
    $$(sel).forEach(e=>{const p=sel.includes('.events')?e.closest('.events'):e.parentElement;if(!par.has(p))par.set(p,[]);par.get(p).push(e)});
    par.forEach((els,p)=>{els.forEach(e=>e.style.opacity=0);inView(p,()=>entre(els,pas,rot),{amount:.05})});
  });
  $$('form[data-web3], section:not([id]) > .wrap, .menu-photo, .towns').forEach(el=>{el.style.opacity=0;inView(el,()=>entre([el],0,0),{amount:.05})});

  /* Parallaxe */
  const evi=$('.ev-img img');
  if(evi)scroll(animate(evi,{y:['-15%','0%']},{ease:'linear'}),{target:$('.ev-img'),offset:['start end','end start']});

  /* Gestes : tout répond avec un ressort */
  hover('.btn',el=>{animate(el,{scale:1.05},ressort);return()=>animate(el,{scale:1},ressort)});
  press('.btn',el=>{animate(el,{scale:.95},ressort);return()=>animate(el,{scale:1},ressort)});
  hover('.cards > div',el=>{
    const c=el.querySelector('.cover'),i=el.querySelector('img');if(!c)return;
    animate(c,{y:-10,rotate:1.2},ressort);if(i)animate(i,{scale:1.07},{duration:.8,ease:doux});
    return()=>{animate(c,{y:0,rotate:0},ressort);if(i)animate(i,{scale:1},{duration:.8,ease:doux})};
  });
  hover('.gallery figure',el=>{animate(el,{y:-8},ressort);return()=>animate(el,{y:0},ressort)});
  hover('.service, .svc',el=>{const ic=el.querySelector('.ic');animate(el,{y:-6},ressort);if(ic)animate(ic,{rotate:-12,scale:1.12},ressort);return()=>{animate(el,{y:0},ressort);if(ic)animate(ic,{rotate:0,scale:1},ressort)}});

  root.classList.add('pret');
})();
