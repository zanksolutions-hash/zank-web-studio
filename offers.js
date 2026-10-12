'use strict';
(()=>{
 if(document.body.classList.contains('offer-page')){
  const menu=document.getElementById('navigation'),toggle=document.querySelector('.menu-toggle');
  toggle.addEventListener('click',()=>{menu.showModal();toggle.setAttribute('aria-expanded','true');document.body.classList.add('dialog-open');});
  menu.querySelector('.close-dialog').addEventListener('click',()=>menu.close());
  menu.addEventListener('close',()=>{toggle.setAttribute('aria-expanded','false');document.body.classList.remove('dialog-open');});
 }
 const form=document.getElementById('project-form');if(!form)return;
 const selection=new URLSearchParams(location.search).get('offre');
 const choices={'one-page':{label:'One Page — à partir de 450 € HT',need:'Site vitrine'},'site-vitrine':{label:'Site vitrine — 850 € HT',need:'Site vitrine'},'sur-mesure':{label:'Sur mesure — sur devis',need:'À définir ensemble'}};
 const choice=choices[selection];if(!choice)return;
 form.elements.need.value=choice.need;form.elements.message.value=`Je souhaite discuter de la formule ${choice.label}.\n\nMon activité :\nMes objectifs :`;
 const note=document.createElement('p');note.className='selected-offer-note';note.textContent='Votre sélection : '+choice.label;form.prepend(note);
})();
