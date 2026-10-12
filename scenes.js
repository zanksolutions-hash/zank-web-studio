'use strict';
(()=>{
 const section=document.getElementById('presence');
 const stage=section.querySelector('.presence-stage');
 const desktop=matchMedia('(min-width: 1000px) and (prefers-reduced-motion: no-preference)');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let pending=false;
 function paint(){pending=false;const distance=Math.max(1,section.offsetHeight-stage.offsetHeight);const t=desktop.matches?Math.max(0,Math.min(1,-section.getBoundingClientRect().top/distance)):0;section.style.setProperty('--presence-word-x',`${-t*innerWidth*.7}px`);section.style.setProperty('--presence-art-x',`${t*innerWidth*.09}px`);section.style.setProperty('--presence-copy-x',`${(1-t)*innerWidth*.035}px`);}
 addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(paint);}},{passive:true});addEventListener('resize',paint);desktop.addEventListener('change',paint);paint();
 const selector=document.querySelector('.service-selector');
 const buttons=[...selector.querySelectorAll('[role=tab]')];
 const panels=[...selector.querySelectorAll('[role=tabpanel]')];
 let active=0;let running=[];
 function select(index,focus=false){
  if(index<0||index>=buttons.length)return;
  const direction=index>=active?1:-1;
  running.forEach(a=>a.cancel());running=[];
  buttons.forEach((button,i)=>{button.setAttribute('aria-selected',String(i===index));button.tabIndex=i===index?0:-1;panels[i].hidden=i!==index;});
  if(index!==active&&!reduced.matches&&panels[index].animate){
   running.push(panels[index].animate([{transform:`translateX(${direction*45}px)`,opacity:0},{transform:'translateX(0)',opacity:1}],{duration:420,easing:'cubic-bezier(.2,.7,.2,1)'}));
   const art=panels[index].querySelector('.service-visual');running.push(art.animate([{translate:`${direction*80}px 0`},{translate:'0 0'}],{duration:650,easing:'cubic-bezier(.2,.7,.2,1)'}));
  }
  active=index;if(focus)buttons[index].focus();
 }
 buttons.forEach((button,i)=>{button.addEventListener('click',()=>select(i));button.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(i+1)%buttons.length;else if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(i+buttons.length-1)%buttons.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=buttons.length-1;else return;event.preventDefault();select(next,true);});});
 reduced.addEventListener('change',()=>{if(reduced.matches){running.forEach(a=>a.cancel());running=[];}});select(0);
})();
