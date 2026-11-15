const hero=document.querySelector('.hero');
if(hero){const hv=hero.querySelector('video'),hi=hero.querySelector(':scope>img');
const photo=now=>{if(now){hi.style.transition='none';hi.offsetWidth}hero.classList.remove('wait')};
const hon=()=>hv.classList.add('on');hv.addEventListener('playing',hon,{once:true});if(!hv.paused&&hv.currentTime>0)hon();
hv.addEventListener('error',()=>photo());setTimeout(()=>{if(!hv.classList.contains('on'))photo()},6000);
hv.addEventListener('timeupdate',()=>{if(hv.duration&&hv.currentTime>hv.duration-1.2&&!hv.paused&&hv.classList.contains('on')){photo(true);hv.classList.remove('on');setTimeout(()=>{hv.pause();hv.remove()},1000)}});}
const hd=document.getElementById('hd'),burger=document.getElementById('burger');
const onScroll=()=>hd.classList.toggle('solid',!hero||scrollY>innerHeight*.7);
addEventListener('scroll',onScroll,{passive:true});onScroll();
burger.onclick=()=>burger.setAttribute('aria-expanded',hd.classList.toggle('open'));
document.querySelectorAll('#nav a').forEach(a=>a.onclick=()=>{hd.classList.remove('open');burger.setAttribute('aria-expanded',false)});

const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.14,rootMargin:'0px 0px -6% 0px'});
document.querySelectorAll('.rv,.ph').forEach(el=>io.observe(el));

const items=[...document.querySelectorAll('#list li')],imgs=[...document.querySelectorAll('#stage img')];
const pick=i=>{items.forEach((l,k)=>l.classList.toggle('on',k===i));imgs.forEach((m,k)=>m.classList.toggle('on',k===i))};
items.forEach((l,i)=>{l.onmouseenter=()=>pick(i);l.onclick=()=>pick(i)});
const mq=matchMedia('(max-width:980px)'),stg=document.getElementById('stage');let cur=0;
new ResizeObserver(()=>document.documentElement.style.setProperty('--hh',hd.offsetHeight+'px')).observe(hd);
if(stg)addEventListener('scroll',()=>{if(!mq.matches)return;const y=stg.getBoundingClientRect().bottom+90;let n=0;items.forEach((l,k)=>{if(l.getBoundingClientRect().top<=y)n=k});if(n!==cur){cur=n;pick(n)}},{passive:true});

const lb=document.getElementById('lb');
document.querySelectorAll('.grid button').forEach(b=>b.onclick=()=>{lb.firstElementChild.src=b.firstElementChild.src;lb.classList.add('on')});
lb.onclick=()=>lb.classList.remove('on');
addEventListener('keydown',e=>{if(e.key==='Escape')lb.classList.remove('on')});

const form=document.getElementById('form');if(form)form.onsubmit=e=>{
  e.preventDefault();const f=new FormData(e.target);
  const corps=`Nom : ${f.get('nom')}\nTéléphone : ${f.get('tel')}\nProjet : ${f.get('projet')}\n\n${f.get('msg')}`;
  location.href='mailto:majorinohome@gmail.com?subject='+encodeURIComponent('Demande de devis : '+f.get('projet'))+'&body='+encodeURIComponent(corps);
};
